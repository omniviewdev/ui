import type { IDEFile, IDETab, SearchResult, GitStatusEntry } from './types';

// ─── Project Files ────────────────────────────────────────────────────────────

export const projectFiles: IDEFile[] = [
  {
    id: 'file-readme',
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    content: `# my-app

A modern React application built with TypeScript and Vite.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

- \`dev\` — Start the development server
- \`build\` — Build for production
- \`preview\` — Preview the production build
- \`lint\` — Run ESLint
`,
  },
  {
    id: 'file-package-json',
    name: 'package.json',
    path: 'package.json',
    language: 'json',
    content: `{
  "name": "my-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
`,
  },
  {
    id: 'file-tsconfig',
    name: 'tsconfig.json',
    path: 'tsconfig.json',
    language: 'json',
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"]
}
`,
  },
  {
    id: 'file-main',
    name: 'main.tsx',
    path: 'src/main.tsx',
    language: 'typescript',
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
  },
  {
    id: 'file-app',
    name: 'App.tsx',
    path: 'src/App.tsx',
    language: 'typescript',
    content: `import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { useTheme } from './hooks/useTheme';
import styles from './App.module.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.root} data-theme={theme}>
      <Header onToggleSidebar={() => setSidebarOpen(o => !o)} onToggleTheme={toggleTheme} />
      <div className={styles.layout}>
        {sidebarOpen && <Sidebar />}
        <main className={styles.main}>
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
`,
  },
  {
    id: 'file-app-css',
    name: 'App.module.css',
    path: 'src/App.module.css',
    language: 'css',
    content: `.root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg);
  color: var(--color-text);
}

.layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main {
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
}
`,
  },
  {
    id: 'file-index-css',
    name: 'index.css',
    path: 'src/index.css',
    language: 'css',
    content: `*, *::before, *::after {
  box-sizing: border-box;
}

:root {
  --color-bg: #ffffff;
  --color-text: #111827;
  --color-primary: #6366f1;
  --color-border: #e5e7eb;
  font-family: Inter, system-ui, sans-serif;
  font-size: 16px;
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-border: #1e293b;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
}
`,
  },
  {
    id: 'file-header',
    name: 'Header.tsx',
    path: 'src/components/Header.tsx',
    language: 'typescript',
    content: `import type { FC } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
}

export const Header: FC<HeaderProps> = ({ onToggleSidebar, onToggleTheme }) => {
  return (
    <header className={styles.header}>
      <button onClick={onToggleSidebar} aria-label="Toggle sidebar">☰</button>
      <span className={styles.title}>my-app</span>
      <button onClick={onToggleTheme} aria-label="Toggle theme">◑</button>
    </header>
  );
};
`,
  },
  {
    id: 'file-header-css',
    name: 'Header.module.css',
    path: 'src/components/Header.module.css',
    language: 'css',
    content: `.header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  height: 48px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.title {
  flex: 1;
  font-weight: 600;
  font-size: 0.875rem;
}
`,
  },
  {
    id: 'file-sidebar',
    name: 'Sidebar.tsx',
    path: 'src/components/Sidebar.tsx',
    language: 'typescript',
    content: `import { useState } from 'react';
import { NavLink } from './NavLink';
import styles from './Sidebar.module.css';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Users', href: '/users' },
  { label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={styles.sidebar} data-collapsed={collapsed}>
      <nav>
        {navItems.map(item => (
          <NavLink key={item.href} href={item.href} label={item.label} collapsed={collapsed} />
        ))}
      </nav>
      <button className={styles.toggle} onClick={() => setCollapsed(c => !c)}>
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  );
}
`,
  },
  {
    id: 'file-dashboard',
    name: 'Dashboard.tsx',
    path: 'src/components/Dashboard.tsx',
    language: 'typescript',
    content: `import { useStats } from '../hooks/useStats';
import { StatCard } from './StatCard';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { stats, loading } = useStats();

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.grid}>
      {stats.map(stat => (
        <StatCard key={stat.id} label={stat.label} value={stat.value} delta={stat.delta} />
      ))}
    </div>
  );
}
`,
  },
  {
    id: 'file-stat-card',
    name: 'StatCard.tsx',
    path: 'src/components/StatCard.tsx',
    language: 'typescript',
    content: `import type { FC } from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
}

export const StatCard: FC<StatCardProps> = ({ label, value, delta }) => {
  const positive = delta !== undefined && delta >= 0;
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {delta !== undefined && (
        <span className={styles.delta} data-positive={positive}>
          {positive ? '+' : ''}{delta}%
        </span>
      )}
    </div>
  );
};
`,
  },
  {
    id: 'file-use-theme',
    name: 'useTheme.ts',
    path: 'src/hooks/useTheme.ts',
    language: 'typescript',
    content: `import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return { theme, toggleTheme };
}
`,
  },
  {
    id: 'file-use-stats',
    name: 'useStats.ts',
    path: 'src/hooks/useStats.ts',
    language: 'typescript',
    content: `import { useState, useEffect } from 'react';

interface Stat {
  id: string;
  label: string;
  value: string | number;
  delta: number;
}

export function useStats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call
    const timer = setTimeout(() => {
      setStats([
        { id: 'users', label: 'Total Users', value: '12,481', delta: 4.2 },
        { id: 'revenue', label: 'Revenue', value: '$84,320', delta: 11.5 },
        { id: 'sessions', label: 'Sessions', value: '34,920', delta: -1.8 },
        { id: 'conversion', label: 'Conversion', value: '3.24%', delta: 0.6 },
      ]);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return { stats, loading };
}
`,
  },
  {
    id: 'file-types',
    name: 'types.ts',
    path: 'src/types.ts',
    language: 'typescript',
    content: `export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    perPage: number;
  };
  error?: string;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';
`,
  },
  {
    id: 'file-utils',
    name: 'utils.ts',
    path: 'src/utils.ts',
    language: 'typescript',
    content: `export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatCurrency(n: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let id: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), delay);
  }) as T;
}
`,
  },
  {
    id: 'file-nav-link',
    name: 'NavLink.tsx',
    path: 'src/components/NavLink.tsx',
    language: 'typescript',
    content: `import type { FC } from 'react';
import styles from './NavLink.module.css';

interface NavLinkProps {
  href: string;
  label: string;
  collapsed: boolean;
}

export const NavLink: FC<NavLinkProps> = ({ href, label, collapsed }) => {
  const active = window.location.pathname === href;
  return (
    <a href={href} className={styles.link} data-active={active} aria-label={label}>
      {!collapsed && <span>{label}</span>}
    </a>
  );
};
`,
  },
  {
    id: 'file-vite-config',
    name: 'vite.config.ts',
    path: 'vite.config.ts',
    language: 'typescript',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
});
`,
  },
  {
    id: 'file-env',
    name: '.env.example',
    path: '.env.example',
    language: 'plaintext',
    content: `# API Configuration
VITE_API_URL=https://api.example.com
VITE_API_KEY=your_api_key_here

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false
`,
  },
  {
    id: 'file-gitignore',
    name: '.gitignore',
    path: '.gitignore',
    language: 'plaintext',
    content: `node_modules
dist
.env
.env.local
.DS_Store
*.local
`,
  },
];

// ─── File Tree ────────────────────────────────────────────────────────────────

export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

export const fileTree: FileTreeNode[] = [
  { id: 'file-readme', name: 'README.md', type: 'file' },
  { id: 'file-package-json', name: 'package.json', type: 'file' },
  { id: 'file-tsconfig', name: 'tsconfig.json', type: 'file' },
  { id: 'file-vite-config', name: 'vite.config.ts', type: 'file' },
  { id: 'file-env', name: '.env.example', type: 'file' },
  { id: 'file-gitignore', name: '.gitignore', type: 'file' },
  {
    id: 'folder-src',
    name: 'src',
    type: 'folder',
    children: [
      { id: 'file-main', name: 'main.tsx', type: 'file' },
      { id: 'file-app', name: 'App.tsx', type: 'file' },
      { id: 'file-app-css', name: 'App.module.css', type: 'file' },
      { id: 'file-index-css', name: 'index.css', type: 'file' },
      { id: 'file-types', name: 'types.ts', type: 'file' },
      { id: 'file-utils', name: 'utils.ts', type: 'file' },
      {
        id: 'folder-components',
        name: 'components',
        type: 'folder',
        children: [
          { id: 'file-header', name: 'Header.tsx', type: 'file' },
          { id: 'file-header-css', name: 'Header.module.css', type: 'file' },
          { id: 'file-sidebar', name: 'Sidebar.tsx', type: 'file' },
          { id: 'file-dashboard', name: 'Dashboard.tsx', type: 'file' },
          { id: 'file-stat-card', name: 'StatCard.tsx', type: 'file' },
          { id: 'file-nav-link', name: 'NavLink.tsx', type: 'file' },
        ],
      },
      {
        id: 'folder-hooks',
        name: 'hooks',
        type: 'folder',
        children: [
          { id: 'file-use-theme', name: 'useTheme.ts', type: 'file' },
          { id: 'file-use-stats', name: 'useStats.ts', type: 'file' },
        ],
      },
    ],
  },
];

// ─── Initial Tabs ─────────────────────────────────────────────────────────────

const getFile = (id: string): IDEFile => {
  const f = projectFiles.find(f => f.id === id);
  if (!f) throw new Error(`File not found: ${id}`);
  return f;
};

export const initialTabs: IDETab[] = [
  {
    id: 'tab-app',
    file: getFile('file-app'),
    type: 'code',
  },
  {
    id: 'tab-use-theme',
    file: getFile('file-use-theme'),
    type: 'code',
  },
  {
    id: 'tab-dashboard-diff',
    file: getFile('file-dashboard'),
    type: 'diff',
    originalContent: `import { useStats } from '../hooks/useStats';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { stats, loading } = useStats();

  if (loading) return <p>Loading...</p>;

  return (
    <ul>
      {stats.map(stat => (
        <li key={stat.id}>{stat.label}: {stat.value}</li>
      ))}
    </ul>
  );
}
`,
  },
  {
    id: 'tab-readme',
    file: getFile('file-readme'),
    type: 'markdown',
  },
  {
    id: 'tab-utils',
    file: getFile('file-utils'),
    type: 'code',
  },
];

// ─── Terminal Output ──────────────────────────────────────────────────────────

export const terminalOutput = `$ npm run build

> my-app@1.0.0 build
> tsc && vite build

vite v5.0.12 building for production...
✓ 42 modules transformed.
dist/index.html                  0.46 kB │ gzip:  0.30 kB
dist/assets/index-BxPQ3rVa.css  3.21 kB │ gzip:  1.14 kB
dist/assets/index-Dv3mXaYN.js  148.32 kB │ gzip: 48.21 kB
✓ built in 1.84s

Process finished with exit code 0
$`;

// ─── Search Results ───────────────────────────────────────────────────────────

export const searchResults: SearchResult[] = [
  {
    file: 'src/App.tsx',
    line: 1,
    column: 9,
    match: 'useState',
    context: "import { useState } from 'react';",
  },
  {
    file: 'src/components/Sidebar.tsx',
    line: 1,
    column: 9,
    match: 'useState',
    context: "import { useState } from 'react';",
  },
  {
    file: 'src/hooks/useTheme.ts',
    line: 1,
    column: 9,
    match: 'useState',
    context: "import { useState, useEffect } from 'react';",
  },
  {
    file: 'src/hooks/useStats.ts',
    line: 1,
    column: 9,
    match: 'useState',
    context: "import { useState, useEffect } from 'react';",
  },
  {
    file: 'src/App.tsx',
    line: 6,
    column: 9,
    match: 'useState',
    context: '  const [sidebarOpen, setSidebarOpen] = useState(true);',
  },
  {
    file: 'src/components/Sidebar.tsx',
    line: 11,
    column: 19,
    match: 'useState',
    context: '  const [collapsed, setCollapsed] = useState(false);',
  },
  {
    file: 'src/hooks/useTheme.ts',
    line: 6,
    column: 19,
    match: 'useState',
    context: '  const [theme, setTheme] = useState<Theme>(() => {',
  },
  {
    file: 'src/hooks/useStats.ts',
    line: 11,
    column: 19,
    match: 'useState',
    context: '  const [stats, setStats] = useState<Stat[]>([]);',
  },
  {
    file: 'src/hooks/useStats.ts',
    line: 12,
    column: 19,
    match: 'useState',
    context: '  const [loading, setLoading] = useState(true);',
  },
  {
    file: 'src/components/Dashboard.tsx',
    line: 1,
    column: 9,
    match: 'useState',
    context: "import { useStats } from '../hooks/useStats';",
  },
];

// ─── Git Status ───────────────────────────────────────────────────────────────

export const gitStatus: GitStatusEntry[] = [
  { file: 'src/App.tsx', status: 'modified' },
  { file: 'src/components/Dashboard.tsx', status: 'modified' },
  { file: 'src/components/StatCard.tsx', status: 'staged' },
  { file: 'src/hooks/useStats.ts', status: 'staged' },
  { file: 'src/types.ts', status: 'staged' },
  { file: 'src/components/StatCard.module.css', status: 'untracked' },
  { file: 'src/components/Dashboard.module.css', status: 'untracked' },
  { file: '.env.local', status: 'untracked' },
];

// ─── Palette Commands ─────────────────────────────────────────────────────────

export interface PaletteCommand {
  id: string;
  label: string;
  group: string;
}

export const paletteCommands: PaletteCommand[] = [
  { id: 'cmd-go-file', label: 'Go to File…', group: 'Navigation' },
  { id: 'cmd-go-symbol', label: 'Go to Symbol…', group: 'Navigation' },
  { id: 'cmd-go-line', label: 'Go to Line…', group: 'Navigation' },
  { id: 'cmd-go-definition', label: 'Go to Definition', group: 'Navigation' },
  { id: 'cmd-toggle-theme', label: 'Toggle Color Theme', group: 'Preferences' },
  { id: 'cmd-toggle-sidebar', label: 'Toggle Primary Sidebar', group: 'View' },
  { id: 'cmd-toggle-terminal', label: 'Toggle Terminal', group: 'View' },
  { id: 'cmd-toggle-minimap', label: 'Toggle Minimap', group: 'View' },
  { id: 'cmd-toggle-word-wrap', label: 'Toggle Word Wrap', group: 'Editor' },
  { id: 'cmd-format-document', label: 'Format Document', group: 'Editor' },
  { id: 'cmd-rename-symbol', label: 'Rename Symbol', group: 'Editor' },
  { id: 'cmd-find-replace', label: 'Find and Replace', group: 'Editor' },
];
