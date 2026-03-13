// apps/showcase/src/demos/file-explorer/data.ts

import type { FileNode, Transfer, LogEntry } from './types';

export { formatBytes, formatDate, fileTypeLabel } from '@omniview/base-ui';

// ---------------------------------------------------------------------------
// Local files — a typical TypeScript/React project tree (~30 nodes)
// ---------------------------------------------------------------------------

export const localFiles: FileNode = {
  id: 'local-root',
  name: 'my-project',
  type: 'folder',
  modified: '2026-03-10T14:22:00Z',
  permissions: 'rwxr-xr-x',
  children: [
    {
      id: 'local-src',
      name: 'src',
      type: 'folder',
      modified: '2026-03-10T14:22:00Z',
      permissions: 'rwxr-xr-x',
      children: [
        {
          id: 'local-src-components',
          name: 'components',
          type: 'folder',
          modified: '2026-03-09T10:00:00Z',
          permissions: 'rwxr-xr-x',
          children: [
            {
              id: 'local-src-components-button',
              name: 'Button.tsx',
              type: 'file',
              size: 1842,
              modified: '2026-03-09T10:00:00Z',
              permissions: 'rw-r--r--',
              extension: 'tsx',
              content: `import React from 'react';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({ label, variant = 'primary', disabled, onClick }: ButtonProps) {
  return (
    <button
      className={\`btn btn--\${variant}\`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}`,
            },
            {
              id: 'local-src-components-card',
              name: 'Card.tsx',
              type: 'file',
              size: 1104,
              modified: '2026-03-08T16:30:00Z',
              permissions: 'rw-r--r--',
              extension: 'tsx',
              content: `import React from 'react';

interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Card({ title, description, children }: CardProps) {
  return (
    <div className="card">
      <div className="card__header">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      <div className="card__body">{children}</div>
    </div>
  );
}`,
            },
            {
              id: 'local-src-components-modal',
              name: 'Modal.tsx',
              type: 'file',
              size: 2310,
              modified: '2026-03-07T09:15:00Z',
              permissions: 'rw-r--r--',
              extension: 'tsx',
              content: `import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header"><h2>{title}</h2></div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}`,
            },
            {
              id: 'local-src-components-index',
              name: 'index.ts',
              type: 'file',
              size: 128,
              modified: '2026-03-09T10:05:00Z',
              permissions: 'rw-r--r--',
              extension: 'ts',
              content: `export { Button } from './Button';
export { Card } from './Card';
export { Modal } from './Modal';`,
            },
          ],
        },
        {
          id: 'local-src-hooks',
          name: 'hooks',
          type: 'folder',
          modified: '2026-03-08T11:40:00Z',
          permissions: 'rwxr-xr-x',
          children: [
            {
              id: 'local-src-hooks-usefetch',
              name: 'useFetch.ts',
              type: 'file',
              size: 980,
              modified: '2026-03-08T11:40:00Z',
              permissions: 'rw-r--r--',
              extension: 'ts',
              content: `import { useState, useEffect } from 'react';

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}`,
            },
            {
              id: 'local-src-hooks-uselocalstorage',
              name: 'useLocalStorage.ts',
              type: 'file',
              size: 620,
              modified: '2026-03-06T13:00:00Z',
              permissions: 'rw-r--r--',
              extension: 'ts',
              content: `import { useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initial;
    } catch {
      return initial;
    }
  });

  const set = (v: T) => {
    setValue(v);
    window.localStorage.setItem(key, JSON.stringify(v));
  };

  return [value, set] as const;
}`,
            },
          ],
        },
        {
          id: 'local-src-utils',
          name: 'utils',
          type: 'folder',
          modified: '2026-03-05T08:00:00Z',
          permissions: 'rwxr-xr-x',
          children: [
            {
              id: 'local-src-utils-format',
              name: 'format.ts',
              type: 'file',
              size: 540,
              modified: '2026-03-05T08:00:00Z',
              permissions: 'rw-r--r--',
              extension: 'ts',
              content: `export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}`,
            },
            {
              id: 'local-src-utils-cn',
              name: 'cn.ts',
              type: 'file',
              size: 210,
              modified: '2026-03-04T10:20:00Z',
              permissions: 'rw-r--r--',
              extension: 'ts',
              content: `type ClassValue = string | undefined | null | false;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}`,
            },
          ],
        },
        {
          id: 'local-src-styles',
          name: 'styles',
          type: 'folder',
          modified: '2026-03-07T17:00:00Z',
          permissions: 'rwxr-xr-x',
          children: [
            {
              id: 'local-src-styles-globals',
              name: 'globals.css',
              type: 'file',
              size: 1420,
              modified: '2026-03-07T17:00:00Z',
              permissions: 'rw-r--r--',
              extension: 'css',
              content: `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-primary: #6366f1;
  --color-bg: #0f0f13;
  --color-surface: #1a1a24;
  --color-text: #e2e2ef;
  --radius: 6px;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
}`,
            },
            {
              id: 'local-src-styles-components',
              name: 'components.css',
              type: 'file',
              size: 880,
              modified: '2026-03-07T15:30:00Z',
              permissions: 'rw-r--r--',
              extension: 'css',
              content: `.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: opacity 0.15s;
}

.btn--primary { background: var(--color-primary); color: #fff; }
.btn--secondary { background: var(--color-surface); color: var(--color-text); }
.btn--ghost { background: transparent; color: var(--color-text); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }`,
            },
          ],
        },
        {
          id: 'local-src-app',
          name: 'App.tsx',
          type: 'file',
          size: 720,
          modified: '2026-03-10T14:22:00Z',
          permissions: 'rw-r--r--',
          extension: 'tsx',
          content: `import React from 'react';
import { Button } from './components';
import './styles/globals.css';

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>My Project</h1>
      </header>
      <main className="app__main">
        <Button label="Get Started" variant="primary" />
      </main>
    </div>
  );
}

export default App;`,
        },
        {
          id: 'local-src-main',
          name: 'main.tsx',
          type: 'file',
          size: 168,
          modified: '2026-03-01T09:00:00Z',
          permissions: 'rw-r--r--',
          extension: 'tsx',
          content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
        },
        {
          id: 'local-src-vite-env',
          name: 'vite-env.d.ts',
          type: 'file',
          size: 38,
          modified: '2026-03-01T09:00:00Z',
          permissions: 'rw-r--r--',
          extension: 'ts',
          content: `/// <reference types="vite/client" />`,
        },
      ],
    },
    {
      id: 'local-public',
      name: 'public',
      type: 'folder',
      modified: '2026-03-01T09:00:00Z',
      permissions: 'rwxr-xr-x',
      children: [
        {
          id: 'local-public-favicon',
          name: 'favicon.ico',
          type: 'file',
          size: 1150,
          modified: '2026-03-01T09:00:00Z',
          permissions: 'rw-r--r--',
          extension: 'ico',
        },
        {
          id: 'local-public-logo',
          name: 'logo.svg',
          type: 'file',
          size: 2048,
          modified: '2026-03-01T09:00:00Z',
          permissions: 'rw-r--r--',
          extension: 'svg',
        },
        {
          id: 'local-public-robots',
          name: 'robots.txt',
          type: 'file',
          size: 67,
          modified: '2026-03-01T09:00:00Z',
          permissions: 'rw-r--r--',
          extension: 'txt',
          content: `User-agent: *
Allow: /`,
        },
      ],
    },
    {
      id: 'local-package-json',
      name: 'package.json',
      type: 'file',
      size: 862,
      modified: '2026-03-10T12:00:00Z',
      permissions: 'rw-r--r--',
      extension: 'json',
      content: `{
  "name": "my-project",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}`,
    },
    {
      id: 'local-tsconfig',
      name: 'tsconfig.json',
      type: 'file',
      size: 480,
      modified: '2026-03-01T09:00:00Z',
      permissions: 'rw-r--r--',
      extension: 'json',
      content: `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
    },
    {
      id: 'local-readme',
      name: 'README.md',
      type: 'file',
      size: 510,
      modified: '2026-03-10T10:00:00Z',
      permissions: 'rw-r--r--',
      extension: 'md',
      content: `# my-project

A modern TypeScript/React application.

## Getting Started

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Scripts

| Script | Description |
|--------|-------------|
| \`dev\` | Start development server |
| \`build\` | Build for production |
| \`preview\` | Preview production build |
| \`lint\` | Lint source files |`,
    },
    {
      id: 'local-gitignore',
      name: '.gitignore',
      type: 'file',
      size: 192,
      modified: '2026-03-01T09:00:00Z',
      permissions: 'rw-r--r--',
      extension: 'gitignore',
      content: `node_modules
dist
dist-ssr
*.local
.DS_Store
.env
.env.local
.env.production
coverage/`,
    },
    {
      id: 'local-eslintrc',
      name: '.eslintrc.cjs',
      type: 'file',
      size: 340,
      modified: '2026-03-02T11:00:00Z',
      permissions: 'rw-r--r--',
      extension: 'cjs',
      content: `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
  },
};`,
    },
  ],
};

// ---------------------------------------------------------------------------
// Remote files — an S3 bucket tree (~20 nodes)
// ---------------------------------------------------------------------------

export const remoteFiles: FileNode = {
  id: 'remote-root',
  name: 's3://my-bucket',
  type: 'folder',
  modified: '2026-03-11T08:00:00Z',
  permissions: 'rwxr-xr-x',
  children: [
    {
      id: 'remote-assets',
      name: 'assets',
      type: 'folder',
      modified: '2026-03-11T08:00:00Z',
      permissions: 'rwxr-xr-x',
      children: [
        {
          id: 'remote-assets-images',
          name: 'images',
          type: 'folder',
          modified: '2026-03-11T08:00:00Z',
          permissions: 'rwxr-xr-x',
          children: [
            {
              id: 'remote-assets-images-hero',
              name: 'hero.webp',
              type: 'file',
              size: 189432,
              modified: '2026-03-11T08:00:00Z',
              permissions: 'rw-r--r--',
              extension: 'webp',
            },
            {
              id: 'remote-assets-images-logo',
              name: 'logo@2x.png',
              type: 'file',
              size: 42816,
              modified: '2026-03-10T15:30:00Z',
              permissions: 'rw-r--r--',
              extension: 'png',
            },
            {
              id: 'remote-assets-images-og',
              name: 'og-image.jpg',
              type: 'file',
              size: 98304,
              modified: '2026-03-09T10:00:00Z',
              permissions: 'rw-r--r--',
              extension: 'jpg',
            },
            {
              id: 'remote-assets-images-avatar',
              name: 'avatar-placeholder.png',
              type: 'file',
              size: 8192,
              modified: '2026-03-01T09:00:00Z',
              permissions: 'rw-r--r--',
              extension: 'png',
            },
          ],
        },
        {
          id: 'remote-assets-fonts',
          name: 'fonts',
          type: 'folder',
          modified: '2026-03-05T12:00:00Z',
          permissions: 'rwxr-xr-x',
          children: [
            {
              id: 'remote-assets-fonts-inter-regular',
              name: 'Inter-Regular.woff2',
              type: 'file',
              size: 86016,
              modified: '2026-03-05T12:00:00Z',
              permissions: 'rw-r--r--',
              extension: 'woff2',
            },
            {
              id: 'remote-assets-fonts-inter-medium',
              name: 'Inter-Medium.woff2',
              type: 'file',
              size: 87552,
              modified: '2026-03-05T12:00:00Z',
              permissions: 'rw-r--r--',
              extension: 'woff2',
            },
            {
              id: 'remote-assets-fonts-jetbrains',
              name: 'JetBrainsMono-Regular.woff2',
              type: 'file',
              size: 114688,
              modified: '2026-03-05T12:00:00Z',
              permissions: 'rw-r--r--',
              extension: 'woff2',
            },
          ],
        },
      ],
    },
    {
      id: 'remote-backups',
      name: 'backups',
      type: 'folder',
      modified: '2026-03-11T03:00:00Z',
      permissions: 'rwxr-x---',
      children: [
        {
          id: 'remote-backups-db-2026-03-11',
          name: 'db-2026-03-11.sql.gz',
          type: 'file',
          size: 5242880,
          modified: '2026-03-11T03:00:00Z',
          permissions: 'rw-------',
          extension: 'gz',
        },
        {
          id: 'remote-backups-db-2026-03-10',
          name: 'db-2026-03-10.sql.gz',
          type: 'file',
          size: 5210112,
          modified: '2026-03-10T03:00:00Z',
          permissions: 'rw-------',
          extension: 'gz',
        },
        {
          id: 'remote-backups-db-2026-03-09',
          name: 'db-2026-03-09.sql.gz',
          type: 'file',
          size: 5185536,
          modified: '2026-03-09T03:00:00Z',
          permissions: 'rw-------',
          extension: 'gz',
        },
      ],
    },
    {
      id: 'remote-config',
      name: 'config.yaml',
      type: 'file',
      size: 744,
      modified: '2026-03-08T09:30:00Z',
      permissions: 'rw-r--r--',
      extension: 'yaml',
      content: `# my-bucket configuration
bucket:
  name: my-bucket
  region: us-east-1
  versioning: enabled

cors:
  allowed_origins:
    - https://my-project.com
    - https://staging.my-project.com
  allowed_methods: [GET, PUT, POST, DELETE]
  max_age_seconds: 3600

lifecycle:
  rules:
    - id: expire-backups
      prefix: backups/
      expiration_days: 30
    - id: transition-assets
      prefix: assets/
      transition_days: 90
      storage_class: STANDARD_IA`,
    },
    {
      id: 'remote-deploy-manifest',
      name: 'deploy-manifest.json',
      type: 'file',
      size: 388,
      modified: '2026-03-11T07:45:00Z',
      permissions: 'rw-r--r--',
      extension: 'json',
      content: `{
  "version": "1.4.2",
  "deployedAt": "2026-03-11T07:45:00Z",
  "deployedBy": "ci-pipeline",
  "commit": "e310435f",
  "environment": "production",
  "assets": {
    "hash": "sha256:a3f8c2d1",
    "count": 47,
    "totalBytes": 1048576
  }
}`,
    },
    {
      id: 'remote-policy',
      name: 'bucket-policy.json',
      type: 'file',
      size: 512,
      modified: '2026-03-01T09:00:00Z',
      permissions: 'rw-r-----',
      extension: 'json',
      content: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadAssets",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/assets/*"
    },
    {
      "Sid": "DenyPublicBackups",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/backups/*"
    }
  ]
}`,
    },
  ],
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Flatten a FileNode tree into a list for counting */
export function countNodes(node: FileNode): { files: number; folders: number; totalSize: number } {
  if (node.type === 'file') {
    return { files: 1, folders: 0, totalSize: node.size ?? 0 };
  }
  const counts = { files: 0, folders: 1, totalSize: 0 };
  for (const child of node.children ?? []) {
    const c = countNodes(child);
    counts.files += c.files;
    counts.folders += c.folders;
    counts.totalSize += c.totalSize;
  }
  return counts;
}

/** Get relative time string */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Mock transfers
// ---------------------------------------------------------------------------

export const mockTransfers: Transfer[] = [
  {
    id: 'transfer-1',
    source: '/home/sftpclient/web/public_html/app/bundle.min.js',
    direction: 'upload',
    destination: 's3://my-bucket/assets/js/bundle.min.js',
    size: 77_104_128,
    priority: 2,
    status: 'processing',
    remaining: '32 secs',
    speed: '13.60 Mbit/s',
    progress: 24.6,
  },
  {
    id: 'transfer-2',
    source: '/local/src/styles/globals.css',
    direction: 'upload',
    destination: 's3://my-bucket/assets/css/globals.css',
    size: 1_420,
    priority: 3,
    status: 'queued',
    progress: 0,
  },
  {
    id: 'transfer-3',
    source: 's3://my-bucket/backups/db-2026-03-11.sql.gz',
    direction: 'download',
    destination: '/local/backups/db-2026-03-11.sql.gz',
    size: 5_242_880,
    priority: 1,
    status: 'completed',
    progress: 100,
    speed: '8.42 Mbit/s',
  },
  {
    id: 'transfer-4',
    source: '/local/config.yaml',
    direction: 'upload',
    destination: 's3://my-bucket/config.yaml',
    size: 744,
    priority: 4,
    status: 'failed',
    progress: 43,
  },
  {
    id: 'transfer-5',
    source: 's3://my-bucket/assets/images/hero.webp',
    direction: 'download',
    destination: '/local/public/hero.webp',
    size: 189_432,
    priority: 2,
    status: 'completed',
    progress: 100,
    speed: '11.20 Mbit/s',
  },
];

// ---------------------------------------------------------------------------
// Mock command log entries
// ---------------------------------------------------------------------------

export const mockLogEntries: LogEntry[] = [
  { id: 'log-1', type: 'command', message: 'Connecting to s3://my-bucket (us-east-1)', timestamp: '14:42:01' },
  { id: 'log-2', type: 'response', message: 'Connection established — bucket versioning: enabled', timestamp: '14:42:02' },
  { id: 'log-3', type: 'command', message: 'Getting remote directory listing for s3://my-bucket/', timestamp: '14:42:03' },
  { id: 'log-4', type: 'response', message: 'listing retrieved for s3://my-bucket/ — 5 items', timestamp: '14:42:03' },
  { id: 'log-5', type: 'command', message: 'Getting remote directory listing for s3://my-bucket/assets/', timestamp: '14:43:15' },
  { id: 'log-6', type: 'response', message: 'listing retrieved for s3://my-bucket/assets/ — 2 items', timestamp: '14:43:16' },
  { id: 'log-7', type: 'command', message: 'Starting upload: bundle.min.js → s3://my-bucket/assets/js/bundle.min.js', timestamp: '14:44:23' },
  { id: 'log-8', type: 'response', message: 'Upload in progress — 24.6% complete, 13.60 Mbit/s', timestamp: '14:44:26' },
];
