#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resultsDir = join(__dirname, '..', 'results', 'competitive');

function loadJSON(filepath) {
  if (!existsSync(filepath)) return null;
  try {
    return JSON.parse(readFileSync(filepath, 'utf-8'));
  } catch (err) {
    throw new Error(`Failed to parse JSON in ${filepath}: ${err.message}`);
  }
}

function formatHz(hz) {
  if (!Number.isFinite(hz)) return 'N/A';
  if (hz >= 1000) return `${(hz / 1000).toFixed(1)}k`;
  return hz.toFixed(0);
}

function formatOverhead(raw, lib) {
  if (!Number.isFinite(raw) || !Number.isFinite(lib) || lib === 0) return 'N/A';
  return `${(raw / lib).toFixed(1)}x`;
}

/**
 * Extract benchmarks from Vitest 4.x JSON, parsing the [label] suffix
 * to separate implementation name from benchmark name.
 *
 * Bench names look like: "mount [raw]", "mount [@omniview/base-ui]", "mount [@mui/material]"
 */
function extractCompetitiveBenchmarks(data) {
  const results = [];
  for (const file of data.files ?? []) {
    for (const group of file.groups ?? []) {
      const parts = (group.fullName ?? '').split(' > ');
      const suite = parts[parts.length - 1] || 'unknown';

      for (const bench of group.benchmarks ?? []) {
        // Parse "mount [raw]" → benchName="mount", impl="raw"
        const match = bench.name.match(/^(.+?)\s+\[(.+)]$/);
        if (!match) continue;

        results.push({
          suite: suite.replace(' competitive', ''),
          benchName: match[1],
          impl: match[2],
          hz: bench.hz,
        });
      }
    }
  }
  return results;
}

function generateReport(data) {
  const benchmarks = extractCompetitiveBenchmarks(data);

  // Group by suite + benchName
  const groups = new Map();
  for (const b of benchmarks) {
    const key = `${b.suite}::${b.benchName}`;
    if (!groups.has(key)) groups.set(key, { suite: b.suite, benchName: b.benchName, impls: {} });
    groups.get(key).impls[b.impl] = b.hz;
  }

  const lines = [
    '# Competitive Benchmark Report\n',
    `**Date:** ${new Date().toISOString()}`,
    `**Environment:** JSDOM, Vitest ${data.version || 'unknown'}\n`,
    '| Component | Metric | Raw (ops/s) | @omniview | overhead | @mui | overhead |',
    '|-----------|--------|-------------|-----------|----------|------|----------|',
  ];

  const overheadValues = { ov: [], mui: [] };

  for (const [, g] of groups) {
    const rawHz = g.impls['raw'] ?? 0;
    const ovHz = g.impls['@omniview/base-ui'] ?? 0;
    const muiHz = g.impls['@mui/material'] ?? 0;

    const ovOverhead = rawHz / ovHz;
    const muiOverhead = rawHz / muiHz;

    if (Number.isFinite(ovOverhead)) overheadValues.ov.push(ovOverhead);
    if (Number.isFinite(muiOverhead)) overheadValues.mui.push(muiOverhead);

    lines.push(
      `| ${g.suite} | ${g.benchName} | ${formatHz(rawHz)} | ${formatHz(ovHz)} | ${formatOverhead(rawHz, ovHz)} | ${formatHz(muiHz)} | ${formatOverhead(rawHz, muiHz)} |`,
    );
  }

  // Geometric mean
  function geoMean(values) {
    if (values.length === 0) return NaN;
    const logSum = values.reduce((sum, v) => sum + Math.log(v), 0);
    return Math.exp(logSum / values.length);
  }

  const ovGeo = geoMean(overheadValues.ov);
  const muiGeo = geoMean(overheadValues.mui);

  lines.push(
    `| **Geo. mean** | | | | **${Number.isFinite(ovGeo) ? ovGeo.toFixed(1) + 'x' : 'N/A'}** | | **${Number.isFinite(muiGeo) ? muiGeo.toFixed(1) + 'x' : 'N/A'}** |`,
  );

  lines.push('');
  lines.push('> Overhead = raw ops/s / library ops/s. Lower is better (1.0x = no overhead).');

  return lines.join('\n');
}

// Main
if (!existsSync(resultsDir)) {
  mkdirSync(resultsDir, { recursive: true });
}

const latest = loadJSON(join(resultsDir, 'latest.json'));

if (!latest) {
  console.error('No results/competitive/latest.json found. Run `pnpm bench:competitive:json` first.');
  process.exit(1);
}

const report = generateReport(latest);
writeFileSync(join(resultsDir, 'report.md'), report);
console.log('Wrote results/competitive/report.md');
