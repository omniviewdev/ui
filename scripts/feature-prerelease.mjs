import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const dryRun = args[0] === '--dry-run';
const channel = args[dryRun ? 1 : 0];
if (args.length !== (dryRun ? 2 : 1) || !/^feature-[a-z][a-z0-9-]{0,30}[a-z0-9]$/.test(channel ?? '')) {
  throw new Error('usage: feature-prerelease.mjs [--dry-run] feature-<slug>');
}
const runNumber = process.env.GITHUB_RUN_NUMBER ?? (dryRun ? '1' : '');
const runAttempt = process.env.GITHUB_RUN_ATTEMPT ?? (dryRun ? '1' : '');
if (!/^(0|[1-9]\d*)$/.test(runNumber) || !/^(0|[1-9]\d*)$/.test(runAttempt)) {
  throw new Error('GITHUB_RUN_NUMBER and GITHUB_RUN_ATTEMPT must be non-negative integers');
}

const packages = [];
for (const entry of await readdir(path.join(root, 'packages'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const directory = path.join(root, 'packages', entry.name);
  const manifestPath = path.join(directory, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.private) continue;
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(manifest.version);
  if (!match) throw new Error(`invalid stable version for ${manifest.name}: ${manifest.version}`);
  const version = `${match[1]}.${match[2]}.${BigInt(match[3]) + 1n}-${channel}.${runNumber}.${runAttempt}`;
  packages.push({ directory, manifestPath, manifest, version });
}

const destination = path.join(root, '.feature-packs');
for (const pkg of packages) {
  console.log(`${pkg.manifest.name}@${pkg.version}: pnpm pack --pack-destination ${destination}`);
}
if (!dryRun) {
  await mkdir(destination, { recursive: true });
  for (const pkg of packages) {
    pkg.manifest.version = pkg.version;
    await writeFile(pkg.manifestPath, `${JSON.stringify(pkg.manifest, null, 2)}\n`);
  }
  for (const pkg of packages) {
    const published = spawnSync('npm', ['view', `${pkg.manifest.name}@${pkg.version}`, 'version'], { encoding: 'utf8' });
    if (published.status === 0) {
      console.log(`Skipping already published ${pkg.manifest.name}@${pkg.version}`);
      continue;
    }
    if (!published.stderr.includes('E404')) {
      throw new Error(`npm view failed for ${pkg.manifest.name}: ${published.stderr}`);
    }
    const packed = spawnSync('pnpm', ['pack', '--pack-destination', destination], { cwd: pkg.directory, encoding: 'utf8' });
    if (packed.status !== 0) throw new Error(`pnpm pack failed for ${pkg.manifest.name}: ${packed.stderr}`);
    const filename = `${pkg.manifest.name.replace(/^@/, '').replace('/', '-')}-${pkg.version}.tgz`;
    const publish = spawnSync('npm', ['publish', path.join(destination, filename), '--tag', channel, '--access', 'public'], { stdio: 'inherit' });
    if (publish.status !== 0) throw new Error(`npm publish failed for ${pkg.manifest.name}`);
  }
}
