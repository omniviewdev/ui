import type { FileChangeKind, FileKind, FileNode } from '@omniviewdev/base-ui';
import type { FixtureEntry, FixtureMetadata, FixtureOptions } from './types';

export const imageEndpoint = 'nginx:1.27-alpine · sha256:7c9a8e41 · linux/arm64';
export const runtimeEndpoint = 'checkout-api · pod uid 8ab2 · container generation 4';
export const layers = [
  'FROM alpine:3.21',
  'RUN apk add nginx',
  'COPY ./app /app',
  'COPY config /etc/nginx',
] as const;
export const initialExpanded = [
  'etc',
  'nginx',
  'conf-d',
  'app',
  'config',
  'var',
  'log',
  'usr',
  'lib',
] as const;
export const baselineNginx =
  'user nginx;\nworker_processes auto;\n\nevents {\n    worker_connections 1024;\n}\n\nhttp {\n    include /etc/nginx/mime.types;\n    sendfile on;\n    keepalive_timeout 65;\n    include /etc/nginx/conf.d/*.conf;\n}\n';
export const currentNginx = baselineNginx
  .replace('1024', '4096')
  .replace('65;', '30;\n    server_tokens off;');
const timestamp = Date.UTC(2026, 10, 1, 10, 42, 8);

interface Version {
  readonly layer: number;
  readonly text?: string;
  readonly binary?: boolean;
  readonly deleted?: boolean;
}
interface Seed {
  readonly id: string;
  readonly path: string;
  readonly kind?: FileKind;
  readonly linkTarget?: string;
  readonly mount?: string;
  readonly runtimeOnly?: boolean;
  readonly versions: readonly Version[];
}
const base = (text?: string): readonly Version[] => [{ layer: 0, text }];
const seeds: readonly Seed[] = [
  { id: 'app', path: '/app', kind: 'directory', versions: [{ layer: 2 }] },
  { id: 'config', path: '/app/config', kind: 'directory', versions: [{ layer: 2 }] },
  {
    id: 'production',
    path: '/app/config/production.yaml',
    versions: [
      { layer: 2, text: 'server:\n  port: 8080\nlogging:\n  level: warn\n' },
      {
        layer: 3,
        text: 'server:\n  port: 8080\n  gracefulShutdown: 30\nlogging:\n  level: info\n',
      },
    ],
  },
  {
    id: 'server',
    path: '/app/server.js',
    versions: [
      {
        layer: 2,
        text: "import http from 'node:http';\nconst port = process.env.PORT || 8080;\nhttp.createServer((_, res) => res.end('ok')).listen(port);\n",
      },
    ],
  },
  {
    id: 'package',
    path: '/app/package.json',
    versions: [
      {
        layer: 2,
        text: '{\n  "name": "checkout-api",\n  "version": "2.8.1",\n  "type": "module"\n}\n',
      },
    ],
  },
  {
    id: 'env',
    path: '/app/.env',
    versions: [{ layer: 2, text: 'NODE_ENV=production\nPORT=8080\n' }],
  },
  { id: 'bin', path: '/bin', kind: 'directory', versions: base() },
  { id: 'sh', path: '/bin/sh', kind: 'symlink', linkTarget: '/bin/busybox', versions: base() },
  { id: 'busybox', path: '/bin/busybox', versions: [{ layer: 0, binary: true }] },
  { id: 'dev', path: '/dev', kind: 'directory', versions: base() },
  { id: 'null', path: '/dev/null', kind: 'device', versions: base() },
  { id: 'etc', path: '/etc', kind: 'directory', versions: base() },
  { id: 'hostname', path: '/etc/hostname', versions: base('checkout-api\n') },
  { id: 'hosts', path: '/etc/hosts', versions: base('127.0.0.1 localhost\n::1 localhost\n') },
  { id: 'nginx', path: '/etc/nginx', kind: 'directory', versions: [{ layer: 1 }] },
  { id: 'conf-d', path: '/etc/nginx/conf.d', kind: 'directory', versions: [{ layer: 1 }] },
  {
    id: 'default-conf',
    path: '/etc/nginx/conf.d/default.conf',
    versions: [
      {
        layer: 3,
        text: 'server {\n    listen 8080;\n    location /health { return 200 "ok"; }\n}\n',
      },
    ],
  },
  {
    id: 'nginx-conf',
    path: '/etc/nginx/nginx.conf',
    versions: [
      { layer: 1, text: baselineNginx },
      { layer: 3, text: currentNginx },
    ],
  },
  {
    id: 'legacy',
    path: '/etc/nginx/legacy.conf',
    versions: [
      { layer: 1, text: 'server {\n    listen 8081;\n    server_name legacy.internal;\n}\n' },
      { layer: 3, deleted: true },
    ],
  },
  {
    id: 'passwd',
    path: '/etc/passwd',
    versions: base(
      'root:x:0:0:root:/root:/bin/sh\nnginx:x:101:101:nginx:/var/lib/nginx:/sbin/nologin\n',
    ),
  },
  { id: 'root', path: '/root', kind: 'directory', versions: base() },
  { id: 'run', path: '/run', kind: 'directory', versions: base() },
  {
    id: 'socket',
    path: '/run/nginx.sock',
    kind: 'socket',
    runtimeOnly: true,
    versions: [{ layer: 3 }],
  },
  { id: 'tmp', path: '/tmp', kind: 'directory', versions: base() },
  {
    id: 'health',
    path: '/tmp/healthcheck.log',
    runtimeOnly: true,
    versions: [{ layer: 3, text: '2026-11-01T10:42:08Z GET /health 200 2ms\n' }],
  },
  { id: 'usr', path: '/usr', kind: 'directory', versions: base() },
  { id: 'lib', path: '/usr/lib', kind: 'directory', versions: base() },
  { id: 'ssl', path: '/usr/lib/libssl.so.3', versions: [{ layer: 0, binary: true }] },
  { id: 'share', path: '/usr/share', kind: 'directory', versions: [{ layer: 1 }] },
  {
    id: 'html',
    path: '/usr/share/index.html',
    versions: [
      { layer: 1, text: '<!doctype html>\n<html><body><h1>Welcome to nginx</h1></body></html>\n' },
    ],
  },
  { id: 'var', path: '/var', kind: 'directory', versions: base() },
  { id: 'log', path: '/var/log', kind: 'directory', versions: base() },
  {
    id: 'access',
    path: '/var/log/access.log',
    runtimeOnly: true,
    versions: [
      {
        layer: 3,
        text: Array.from(
          { length: 6000 },
          (_, i) => `2026-11-01T10:42:08Z request=${i} GET /api/checkout 200 34ms`,
        ).join('\n'),
      },
    ],
  },
  {
    id: 'mount',
    path: '/var/run-config',
    kind: 'directory',
    mount: 'configMap checkout-config (excluded)',
    versions: [{ layer: 3 }],
  },
  {
    id: 'mounted-config',
    path: '/var/run-config/runtime.yaml',
    mount: 'configMap checkout-config (excluded)',
    versions: [{ layer: 3, text: 'featureFlags:\n  checkoutV2: true\n' }],
  },
  ...Array.from({ length: 28 }, (_, index): Seed => ({
    id: `module-${index}`,
    path: `/usr/lib/module-${String(index).padStart(2, '0')}.so`,
    versions: [{ layer: 1, binary: true }],
  })),
];
const paths = new Map(seeds.map((seed) => [seed.path, seed.id]));

function bytes(version: Version | undefined): Uint8Array | undefined {
  if (!version || version.deleted) return undefined;
  if (version.binary) return new Uint8Array([0x7f, 0x45, 0x4c, 0x46, 0, 2, 1, 0, 0xff, 0x80]);
  return version.text === undefined ? undefined : new TextEncoder().encode(version.text);
}

export function createEntries(options: FixtureOptions): readonly FixtureEntry[] {
  if (options.scenario === 'States' && options.state === 'empty') return [];
  const image = options.scenario === 'Image layers';
  const compare = options.scenario === 'Compare';
  const layer = image ? options.layer : 3;
  return seeds.flatMap((seed): FixtureEntry[] => {
    if (image && (seed.mount || seed.runtimeOnly)) return [];
    const version = seed.versions.filter((entry) => entry.layer <= layer).at(-1);
    if (!version) return [];
    const baseline = seed.versions
      .filter((entry) => entry.layer <= (image ? version.layer - 1 : 2))
      .at(-1);
    if (version.deleted && !(compare || (image && !options.cumulative))) return [];
    const contentVersion = version.deleted ? baseline : version;
    const fileBytes = bytes(contentVersion);
    const beforeBytes = bytes(baseline);
    let change: FileChangeKind = version.deleted
      ? 'deleted'
      : !baseline
        ? 'added'
        : version !== baseline
          ? 'modified'
          : 'unchanged';
    if (image && version.layer === layer && !version.deleted)
      change = seed.versions[0] === version ? 'added' : 'modified';
    if (compare && seed.mount) change = 'unknown';
    const path = seed.path;
    const parentPath = path.slice(0, path.lastIndexOf('/'));
    const node: FileNode<FixtureMetadata> = {
      id: seed.id,
      parentId: paths.get(parentPath) ?? null,
      name: path.slice(path.lastIndexOf('/') + 1),
      path,
      kind: seed.kind ?? 'file',
      hidden: path.split('/').some((part) => part.startsWith('.')),
      size: fileBytes?.byteLength,
      modifiedAt: timestamp + (contentVersion?.layer ?? version.layer) * 60_000,
      mode:
        seed.id === 'root'
          ? 0o700
          : seed.kind === 'directory'
            ? 0o755
            : seed.kind === 'symlink'
              ? 0o777
              : 0o644,
      owner:
        path.startsWith('/app') || path.startsWith('/var/log')
          ? { uid: 101, gid: 101, user: 'nginx', group: 'nginx' }
          : { uid: 0, gid: 0, user: 'root', group: 'root' },
      linkTarget: seed.linkTarget,
      change,
      metadata: {
        layer: version.layer,
        baseline: seed.mount ? 'unknown' : baseline && !baseline.deleted ? 'present' : 'absent',
        current: version.deleted ? 'absent' : 'present',
        readFrom: version.deleted ? 'baseline' : 'current',
        mount: seed.mount,
      },
    };
    return [
      {
        node,
        bytes: fileBytes,
        mimeType: contentVersion?.binary ? 'application/octet-stream' : 'text/plain',
        baselineBytes: beforeBytes,
        baselineMimeType: baseline?.binary ? 'application/octet-stream' : 'text/plain',
      },
    ];
  });
}

export function initialSelection(options: FixtureOptions): string | null {
  if (options.scenario === 'States') {
    return {
      permission: 'root',
      loading: 'nginx-conf',
      empty: null,
      offline: null,
      binary: 'ssl',
      large: 'access',
      'missing-tar': 'nginx-conf',
    }[options.state];
  }
  if (options.scenario === 'Tree only') return null;
  if (options.scenario === 'Image layers')
    return options.layer === 0
      ? 'hosts'
      : options.layer === 1
        ? 'nginx-conf'
        : options.layer === 2
          ? 'server'
          : 'nginx-conf';
  return 'nginx-conf';
}
