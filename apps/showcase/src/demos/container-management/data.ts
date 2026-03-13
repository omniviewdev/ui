import type { Container, ContainerDetail, ContainerStats, FileSystemNode } from './types';
import type { StatusDotStatus } from '@omniview/base-ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function seeded(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const frac = x - Math.floor(x);
  return Math.floor(frac * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Log generation
// ---------------------------------------------------------------------------

const LOG_LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG'] as const;
const LOG_MESSAGES = [
  'Connection established to upstream service',
  'Request processed successfully in 12ms',
  'Health check passed: all systems operational',
  'Cache hit ratio: 94.2%',
  'Starting periodic cleanup task',
  'Worker goroutine pool resized to 16',
  'TLS handshake completed with peer',
  'Metric scrape completed: 847 samples',
  'Config reload triggered by SIGHUP',
  'Slow query detected: 543ms (threshold: 200ms)',
  'Rate limit reached for client 10.0.0.5',
  'Retrying failed request (attempt 2/3)',
  'Database connection pool exhausted',
  'Memory pressure detected: triggering GC',
  'Loaded 1,247 routing rules from config',
];

function generateLogs(containerName: string): string {
  const lines: string[] = [];
  const now = new Date();

  for (let i = 100; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 3000);
    const timestamp = ts.toISOString();
    const level = LOG_LEVELS[seeded(i + containerName.length, 0, LOG_LEVELS.length - 1)]!;
    const msg = LOG_MESSAGES[seeded(i * 7 + containerName.charCodeAt(0), 0, LOG_MESSAGES.length - 1)]!;
    const prefix = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : level === 'INFO' ? '\x1b[32m' : '\x1b[36m';
    lines.push(`${prefix}${timestamp}  ${level.padEnd(5)}\x1b[0m  ${containerName}  ${msg}`);
  }

  return lines.join('\r\n');
}

// ---------------------------------------------------------------------------
// Config generation
// ---------------------------------------------------------------------------

function generateConfig(container: Container): Record<string, unknown> {
  return {
    Id: container.id,
    Name: `/${container.name}`,
    Created: container.created,
    State: {
      Status: container.status,
      Running: container.status === 'running',
      Paused: container.status === 'paused',
      Restarting: container.status === 'restarting',
      OOMKilled: false,
      Dead: false,
      Pid: container.status === 'running' ? rand(1000, 9999) : 0,
      ExitCode: container.status === 'exited' ? 1 : 0,
      StartedAt: container.created,
      FinishedAt: container.status === 'exited' ? new Date().toISOString() : '0001-01-01T00:00:00Z',
    },
    Config: {
      Hostname: container.name,
      Image: container.image,
      Labels: {
        'com.docker.compose.service': container.name,
        'org.opencontainers.image.title': container.name,
        'maintainer': 'platform-team@example.com',
      },
      Env: [
        'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        `APP_ENV=production`,
        `LOG_LEVEL=info`,
        `METRICS_PORT=9090`,
      ],
      ExposedPorts: container.ports.reduce<Record<string, unknown>>((acc, p) => {
        acc[`${p.container}/${p.protocol}`] = {};
        return acc;
      }, {}),
    },
    HostConfig: {
      NetworkMode: container.network,
      RestartPolicy: {
        Name: 'unless-stopped',
        MaximumRetryCount: 0,
      },
      Memory: container.memoryLimit * 1024 * 1024,
      CpuQuota: 100000,
      PortBindings: container.ports.reduce<Record<string, unknown>>((acc, p) => {
        acc[`${p.container}/${p.protocol}`] = [{ HostPort: String(p.host) }];
        return acc;
      }, {}),
    },
    NetworkSettings: {
      Networks: {
        [container.network]: {
          IPAddress: `172.17.0.${rand(2, 254)}`,
          Gateway: '172.17.0.1',
          MacAddress: `02:42:ac:11:00:${rand(10, 99).toString(16)}`,
        },
      },
    },
    Mounts: [],
  };
}

// ---------------------------------------------------------------------------
// Filesystem generation
// ---------------------------------------------------------------------------

export function containerFilesystem(name: string): FileSystemNode[] {
  const seed = name.charCodeAt(0);
  return [
    {
      id: `${name}-root`,
      name: '/',
      type: 'directory',
      children: [
        {
          id: `${name}-etc`,
          name: 'etc',
          type: 'directory',
          children: [
            { id: `${name}-hosts`, name: 'hosts', type: 'file', size: 174 },
            { id: `${name}-hostname`, name: 'hostname', type: 'file', size: 12 },
            { id: `${name}-resolv`, name: 'resolv.conf', type: 'file', size: 96 },
            { id: `${name}-config-dir`, name: 'app', type: 'directory', children: [
              { id: `${name}-app-conf`, name: 'config.yaml', type: 'file', size: seeded(seed, 512, 4096) },
              { id: `${name}-app-secret`, name: 'secrets.env', type: 'file', size: seeded(seed + 1, 64, 256) },
            ]},
          ],
        },
        {
          id: `${name}-app`,
          name: 'app',
          type: 'directory',
          children: [
            { id: `${name}-main`, name: 'main', type: 'file', size: seeded(seed + 2, 1024 * 5, 1024 * 20) },
            { id: `${name}-static`, name: 'static', type: 'directory', children: [
              { id: `${name}-index`, name: 'index.html', type: 'file', size: seeded(seed + 3, 2048, 8192) },
              { id: `${name}-bundle`, name: 'bundle.js', type: 'file', size: seeded(seed + 4, 102400, 512000) },
              { id: `${name}-style`, name: 'style.css', type: 'file', size: seeded(seed + 5, 4096, 32768) },
            ]},
          ],
        },
        {
          id: `${name}-var`,
          name: 'var',
          type: 'directory',
          children: [
            { id: `${name}-log`, name: 'log', type: 'directory', children: [
              { id: `${name}-app-log`, name: 'app.log', type: 'file', size: seeded(seed + 6, 1024 * 100, 1024 * 1024) },
              { id: `${name}-err-log`, name: 'error.log', type: 'file', size: seeded(seed + 7, 1024, 1024 * 50) },
            ]},
          ],
        },
        {
          id: `${name}-tmp`,
          name: 'tmp',
          type: 'directory',
          children: [],
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Stats generation
// ---------------------------------------------------------------------------

function generateStats(seed: number): ContainerStats {
  const cpuHistory = Array.from({ length: 20 }, (_, i) => seeded(seed + i * 3, 5, 85));
  const memoryHistory = Array.from({ length: 20 }, (_, i) => seeded(seed + i * 7 + 100, 20, 95));
  return {
    cpuHistory,
    memoryHistory,
    networkRx: `${seeded(seed, 100, 9999)} MB`,
    networkTx: `${seeded(seed + 1, 50, 4999)} MB`,
    diskRead: `${seeded(seed + 2, 200, 5000)} MB`,
    diskWrite: `${seeded(seed + 3, 100, 3000)} MB`,
    pids: seeded(seed + 4, 1, 64),
  };
}

// ---------------------------------------------------------------------------
// containerStatusColor — maps all 5 container statuses to StatusDot statuses
// ---------------------------------------------------------------------------

export function containerStatusColor(status: string): StatusDotStatus {
  switch (status) {
    case 'running':    return 'success';
    case 'stopped':    return 'neutral';
    case 'paused':     return 'warning';
    case 'restarting': return 'pending';
    case 'exited':     return 'danger';
    default:           return 'neutral';
  }
}

// ---------------------------------------------------------------------------
// Static named containers (~20)
// ---------------------------------------------------------------------------

const NAMED_CONTAINERS: Container[] = [
  {
    id: 'c1a2b3d4',
    name: 'api-server',
    image: 'myapp/api-server:v2.4.1',
    status: 'running',
    cpu: 34.2,
    memory: 512,
    memoryLimit: 1024,
    ports: [{ host: 8080, container: 8080, protocol: 'tcp' }, { host: 9090, container: 9090, protocol: 'tcp' }],
    created: '2026-03-10T08:00:00Z',
    uptime: '2d 4h 12m',
    network: 'app-net',
    disk: '1.2 GB',
  },
  {
    id: 'c2b3c4d5',
    name: 'postgres-db',
    image: 'postgres:16.2',
    status: 'running',
    cpu: 12.5,
    memory: 768,
    memoryLimit: 2048,
    ports: [{ host: 5432, container: 5432, protocol: 'tcp' }],
    created: '2026-03-10T07:45:00Z',
    uptime: '2d 4h 27m',
    network: 'app-net',
    disk: '8.4 GB',
  },
  {
    id: 'c3d4e5f6',
    name: 'redis-cache',
    image: 'redis:7.2-alpine',
    status: 'running',
    cpu: 5.1,
    memory: 128,
    memoryLimit: 512,
    ports: [{ host: 6379, container: 6379, protocol: 'tcp' }],
    created: '2026-03-10T07:45:00Z',
    uptime: '2d 4h 27m',
    network: 'app-net',
    disk: '256 MB',
  },
  {
    id: 'c4e5f6a7',
    name: 'nginx-proxy',
    image: 'nginx:1.25-alpine',
    status: 'running',
    cpu: 8.7,
    memory: 64,
    memoryLimit: 256,
    ports: [{ host: 80, container: 80, protocol: 'tcp' }, { host: 443, container: 443, protocol: 'tcp' }],
    created: '2026-03-10T07:50:00Z',
    uptime: '2d 4h 22m',
    network: 'app-net',
    disk: '512 MB',
  },
  {
    id: 'c5f6a7b8',
    name: 'grafana',
    image: 'grafana/grafana:10.3.1',
    status: 'running',
    cpu: 18.3,
    memory: 256,
    memoryLimit: 512,
    ports: [{ host: 3000, container: 3000, protocol: 'tcp' }],
    created: '2026-03-11T09:00:00Z',
    uptime: '1d 3h 12m',
    network: 'monitoring',
    disk: '2.1 GB',
  },
  {
    id: 'c6a7b8c9',
    name: 'prometheus',
    image: 'prom/prometheus:v2.50.0',
    status: 'running',
    cpu: 22.1,
    memory: 384,
    memoryLimit: 1024,
    ports: [{ host: 9090, container: 9090, protocol: 'tcp' }],
    created: '2026-03-11T09:00:00Z',
    uptime: '1d 3h 12m',
    network: 'monitoring',
    disk: '15.7 GB',
  },
  {
    id: 'c7b8c9d0',
    name: 'elasticsearch',
    image: 'elasticsearch:8.12.1',
    status: 'running',
    cpu: 45.6,
    memory: 1536,
    memoryLimit: 4096,
    ports: [{ host: 9200, container: 9200, protocol: 'tcp' }, { host: 9300, container: 9300, protocol: 'tcp' }],
    created: '2026-03-09T12:00:00Z',
    uptime: '3d 0h 12m',
    network: 'logging',
    disk: '42.3 GB',
  },
  {
    id: 'c8c9d0e1',
    name: 'kibana',
    image: 'kibana:8.12.1',
    status: 'running',
    cpu: 28.4,
    memory: 512,
    memoryLimit: 2048,
    ports: [{ host: 5601, container: 5601, protocol: 'tcp' }],
    created: '2026-03-09T12:15:00Z',
    uptime: '2d 23h 57m',
    network: 'logging',
    disk: '1.8 GB',
  },
  {
    id: 'c9d0e1f2',
    name: 'rabbitmq',
    image: 'rabbitmq:3.13-management',
    status: 'running',
    cpu: 9.3,
    memory: 256,
    memoryLimit: 512,
    ports: [{ host: 5672, container: 5672, protocol: 'tcp' }, { host: 15672, container: 15672, protocol: 'tcp' }],
    created: '2026-03-10T10:00:00Z',
    uptime: '2d 2h 12m',
    network: 'app-net',
    disk: '1.1 GB',
  },
  {
    id: 'cad1e2f3',
    name: 'celery-worker',
    image: 'myapp/celery:v2.4.1',
    status: 'running',
    cpu: 67.8,
    memory: 384,
    memoryLimit: 1024,
    ports: [],
    created: '2026-03-10T08:05:00Z',
    uptime: '2d 4h 7m',
    network: 'app-net',
    disk: '800 MB',
  },
  {
    id: 'cbe2f3a4',
    name: 'caddy-lb',
    image: 'caddy:2.7-alpine',
    status: 'running',
    cpu: 6.2,
    memory: 96,
    memoryLimit: 256,
    ports: [{ host: 80, container: 80, protocol: 'tcp' }, { host: 443, container: 443, protocol: 'tcp' }],
    created: '2026-03-11T14:00:00Z',
    uptime: '22h 12m',
    network: 'edge',
    disk: '320 MB',
  },
  {
    id: 'ccf3a4b5',
    name: 'minio',
    image: 'minio/minio:RELEASE.2024-02-24',
    status: 'running',
    cpu: 14.9,
    memory: 512,
    memoryLimit: 2048,
    ports: [{ host: 9000, container: 9000, protocol: 'tcp' }, { host: 9001, container: 9001, protocol: 'tcp' }],
    created: '2026-03-10T07:30:00Z',
    uptime: '2d 4h 42m',
    network: 'storage',
    disk: '234.7 GB',
  },
  {
    id: 'cda4b5c6',
    name: 'jaeger',
    image: 'jaegertracing/all-in-one:1.55',
    status: 'paused',
    cpu: 0.0,
    memory: 128,
    memoryLimit: 512,
    ports: [{ host: 16686, container: 16686, protocol: 'tcp' }],
    created: '2026-03-11T10:00:00Z',
    uptime: '1d 2h 12m',
    network: 'monitoring',
    disk: '450 MB',
  },
  {
    id: 'ceb5c6d7',
    name: 'vault',
    image: 'hashicorp/vault:1.15',
    status: 'stopped',
    cpu: 0.0,
    memory: 0,
    memoryLimit: 512,
    ports: [{ host: 8200, container: 8200, protocol: 'tcp' }],
    created: '2026-03-08T15:00:00Z',
    uptime: '0s',
    network: 'security',
    disk: '275 MB',
  },
  {
    id: 'cfc6d7e8',
    name: 'consul',
    image: 'hashicorp/consul:1.18',
    status: 'restarting',
    cpu: 2.1,
    memory: 64,
    memoryLimit: 256,
    ports: [{ host: 8500, container: 8500, protocol: 'tcp' }],
    created: '2026-03-12T06:00:00Z',
    uptime: '6h 12m',
    network: 'service-mesh',
    disk: '180 MB',
  },
  {
    id: 'cad7e8f9',
    name: 'loki',
    image: 'grafana/loki:2.9.4',
    status: 'running',
    cpu: 11.2,
    memory: 256,
    memoryLimit: 1024,
    ports: [{ host: 3100, container: 3100, protocol: 'tcp' }],
    created: '2026-03-11T09:05:00Z',
    uptime: '1d 3h 7m',
    network: 'monitoring',
    disk: '22.3 GB',
  },
  {
    id: 'cbe8f9a0',
    name: 'tempo',
    image: 'grafana/tempo:2.4.0',
    status: 'running',
    cpu: 8.5,
    memory: 192,
    memoryLimit: 512,
    ports: [{ host: 3200, container: 3200, protocol: 'tcp' }],
    created: '2026-03-11T09:10:00Z',
    uptime: '1d 3h 2m',
    network: 'monitoring',
    disk: '7.8 GB',
  },
  {
    id: 'ccf9a0b1',
    name: 'traefik',
    image: 'traefik:v3.0',
    status: 'running',
    cpu: 7.3,
    memory: 128,
    memoryLimit: 512,
    ports: [{ host: 80, container: 80, protocol: 'tcp' }, { host: 8080, container: 8080, protocol: 'tcp' }],
    created: '2026-03-10T08:00:00Z',
    uptime: '2d 4h 12m',
    network: 'edge',
    disk: '340 MB',
  },
  {
    id: 'cda0b1c2',
    name: 'postgres-replica',
    image: 'postgres:16.2',
    status: 'exited',
    cpu: 0.0,
    memory: 0,
    memoryLimit: 2048,
    ports: [{ host: 5433, container: 5432, protocol: 'tcp' }],
    created: '2026-03-11T16:00:00Z',
    uptime: '0s',
    network: 'app-net',
    disk: '5.2 GB',
  },
  {
    id: 'ceb1c2d3',
    name: 'node-exporter',
    image: 'prom/node-exporter:v1.7.0',
    status: 'running',
    cpu: 1.4,
    memory: 32,
    memoryLimit: 128,
    ports: [{ host: 9100, container: 9100, protocol: 'tcp' }],
    created: '2026-03-10T07:45:00Z',
    uptime: '2d 4h 27m',
    network: 'monitoring',
    disk: '95 MB',
  },
];

// ---------------------------------------------------------------------------
// Worker containers (30 dynamically generated)
// ---------------------------------------------------------------------------

const WORKER_IMAGES = [
  'myapp/worker:v2.4.1',
  'myapp/task-runner:v1.2.0',
  'myapp/job-processor:v3.0.0',
  'myapp/event-consumer:v1.8.2',
];

const WORKER_NETWORKS = ['app-net', 'worker-net', 'processing'];

export function generateWorkers(count: number): Container[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = i + 1;
    const isRunning = i % 7 !== 0;
    return {
      id: `worker${idx.toString().padStart(3, '0')}`,
      name: `worker-${idx.toString().padStart(3, '0')}`,
      image: WORKER_IMAGES[i % WORKER_IMAGES.length]!,
      status: isRunning ? 'running' : 'stopped',
      cpu: isRunning ? seeded(idx * 13, 1, 92) : 0,
      memory: isRunning ? seeded(idx * 17, 64, 512) : 0,
      memoryLimit: 1024,
      ports: [],
      created: new Date(Date.now() - seeded(idx, 3600000, 86400000 * 7)).toISOString(),
      uptime: isRunning ? `${seeded(idx, 1, 72)}h ${seeded(idx + 1, 0, 59)}m` : '0s',
      network: WORKER_NETWORKS[i % WORKER_NETWORKS.length]!,
      disk: `${seeded(idx, 100, 800)} MB`,
    };
  });
}

// ---------------------------------------------------------------------------
// Full container list
// ---------------------------------------------------------------------------

export const containers: Container[] = [...NAMED_CONTAINERS, ...generateWorkers(30)];

// ---------------------------------------------------------------------------
// getContainerDetail
// ---------------------------------------------------------------------------

export function getContainerDetail(container: Container): ContainerDetail {
  const seed = container.id.charCodeAt(0) + container.id.charCodeAt(1);
  return {
    ...container,
    logs: generateLogs(container.name),
    config: generateConfig(container),
    filesystem: containerFilesystem(container.name),
    stats: generateStats(seed),
  };
}

// ---------------------------------------------------------------------------
// clusterStats — aggregate stats for status bar
// ---------------------------------------------------------------------------

export const clusterStats = {
  total: containers.length,
  running: containers.filter((c) => c.status === 'running').length,
  stopped: containers.filter((c) => c.status === 'stopped').length,
  paused: containers.filter((c) => c.status === 'paused').length,
  restarting: containers.filter((c) => c.status === 'restarting').length,
  exited: containers.filter((c) => c.status === 'exited').length,
  totalMemoryMB: containers.reduce((acc, c) => acc + c.memory, 0),
  avgCpu: containers.reduce((acc, c) => acc + c.cpu, 0) / containers.filter((c) => c.status === 'running').length,
};
