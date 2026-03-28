# Showcase Demos Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build four interactive demos (File Explorer, IDE Editor, AI Chat, Container Management) in `apps/showcase/` that exercise components from all three workspace packages.

**Architecture:** Each demo is self-contained in `apps/showcase/src/demos/<name>/` with its own mock data (`data.ts`), internal components (`components/`), and CSS Modules. Demos replace existing placeholder files. No cross-demo imports. All styling uses `--ov-*` CSS tokens.

**Tech Stack:** React 19, TypeScript, CSS Modules, pnpm workspace packages (`@omniviewdev/base-ui`, `@omniviewdev/ai-ui`, `@omniviewdev/editors`), Vite 7 with React Compiler.

**Critical API Notes (read before implementing ANY task):**
- **Tooltip:** Compound — `Tooltip.Root > Tooltip.Trigger (render prop) > Tooltip.Portal > Tooltip.Positioner > Tooltip.Popup`
- **TreeList:** Compound — `TreeList.Root` (accepts `items`, `itemKey`, `getChildren`, `renderItem`, `selectionMode`, `expandedKeys`, `onExpandedKeysChange`, `selectedKeys`, `onSelectedKeysChange`; `expandedKeys` is `ReadonlySet<Key>`) > `TreeList.Viewport` (REQUIRED child — nothing renders without it). `renderItem(item, node)` must return `TreeList.Item > TreeList.ItemIndent + TreeList.ItemToggle + TreeList.ItemIcon + TreeList.ItemLabel` for proper keyboard nav and a11y.
- **Card:** Compound — `Card`, `Card.ActionArea`, `Card.Header`, `Card.Title`, `Card.Description`, `Card.Body`, `Card.Footer`, `Card.Stat` (takes `children`, NOT `value`/`label` — use `Card.KeyValue` for label+value pattern), `Card.Group`
- **Typography:** Compound — `Typography` (body), `Typography.Heading` (level=1-6), `Typography.Caption`, `Typography.Code`, `Typography.Strong`
- **Toolbar:** Compound — `Toolbar.Root`, `Toolbar.Group`
- **StatusBar:** Compound — `StatusBar`, `StatusBar.Section`, `StatusBar.Item`, `StatusBar.Indicator`
- **Tabs:** Compound — `Tabs.Root`, `Tabs.List`, `Tabs.Tab`, `Tabs.Panel`, `Tabs.Indicator`
- **NavList:** Compound — `NavList.Root`, `NavList.Item`, `NavList.Group`, `NavList.GroupHeader`, `NavList.GroupItems`
- **FilterBar:** Compound — `FilterBar.Root`, `FilterBar.Chip`, `FilterBar.Add`, `FilterBar.Clear`. Has NO built-in search input — compose `SearchInput` alongside `FilterBar.Chip` elements.
- **ContextMenu:** Compound — `ContextMenu.Root > ContextMenu.Trigger > ContextMenu.Portal > ContextMenu.Positioner > ContextMenu.Popup > ContextMenu.Item`. Items use `onClick` (NOT `onSelect`), `color="danger"` (NOT `variant="danger"`). There is NO `ContextMenu.Content`.
- **ResizableSplitPane:** Children = `[leftPane, rightPane]`, props: `direction`, `defaultSize` (**pixels**, NOT percentage — default 200px), `minSize`, `maxSize`
- **IconButton:** props: `variant` ('solid'|'soft'|'outline'|'ghost'), `color` ('neutral'|'brand'|'success'|'warning'|'danger'|'info'), `size` ('sm'|'md'|'lg')
- **SearchInput:** props: `value`, `onValueChange` (receives string directly, NOT a change event). Do NOT use `onChange`.
- **EditorTabs:** Tab bar ONLY — does NOT render tab panel content. Uses `TabDescriptor[]` (`{ id, title, icon, dirty, closable, pinned, payload }`), `activeId`, `onActiveChange`, `onClose`. Render content area separately below based on `activeId`.
- **CodeEditor:** Uses `value` prop (controlled), NOT `defaultValue`. Empty `defaultValue` will render empty.
- **CommandPalette:** props: `open` (boolean), `commands` (NOT `items`), `onSelect`, `onClose`. `CommandItem` uses `group` field (NOT `category`).
- **Terminal:** xterm.js-based, NO `initialContent` prop. Use `ref` with `TerminalHandle` + `onReady` callback: `ref.current.write(content)`.
- **AIArtifact:** Separate named exports (NOT dot-notation): `AIArtifact`, `AIArtifactHeader`, `AIArtifactTitle`, `AIArtifactDescription`, `AIArtifactActions`, `AIArtifactAction`, `AIArtifactContent`, `AIArtifactClose`
- **AIBranch:** Separate named exports: `AIBranch`, `AIBranchContent`, `AIBranchSelector`, `AIBranchPrevious`, `AIBranchNext`, `AIBranchIndicator`
- **DataTable:** Compound — `DataTable.Root`, `DataTable.Container`, `DataTable.Header`, `DataTable.Body` (or `DataTable.VirtualBody`), `DataTable.Footer`, `DataTable.Toolbar`. Uses TanStack Table instance via `table` prop. `DataTable.VirtualBody` takes `estimateRowSize` (number, NOT function) and `overscan`. Has NO `onRowClick` — attach click handlers to rows manually.
- **Toast:** Use `useToast()` hook — `const { toast } = useToast(); toast(message, { severity, title })`. Severity options: 'success'|'info'|'warning'|'error'. There is NO `description` prop. **Requires `ToastProvider` wrapping the app** — add to `apps/showcase/src/main.tsx` if not present.
- **`statusToColor(status)`:** Maps status strings to component colors. Does NOT map `paused`, `restarting`, or `exited` — add a local wrapper for container-specific statuses.
- **CSS tokens:** `--ov-space-stack-xs` does NOT exist yet. Use `4px` literal with `/* TODO: --ov-space-stack-xs */` comment.

**Icons:** ALL icons must come from `react-icons/lu` (Lucide). NO text emojis anywhere. Use `LuFolder`, `LuFile`, `LuFileText`, `LuFileCode`, `LuImage`, etc. for file type indicators.

**Before writing ANY component:** Read the source files for every component you're about to use. Check exports, props, compound sub-components. Do NOT guess APIs. The notes above were verified from source but APIs can change — always double-check.

---

## Chunk 1: File Explorer Demo

### Task 1: File Explorer — Mock Data & Types

**Files:**
- Create: `apps/showcase/src/demos/file-explorer/types.ts`
- Create: `apps/showcase/src/demos/file-explorer/data.ts`

- [ ] **Step 1: Create types file**

```tsx
// apps/showcase/src/demos/file-explorer/types.ts

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;         // bytes
  modified?: string;     // ISO date string
  permissions?: string;  // e.g. "rw-r--r--"
  extension?: string;    // e.g. "tsx", "json"
  children?: FileNode[];
  content?: string;      // preview content for text files
}

export interface FileSelection {
  pane: 'local' | 'remote';
  node: FileNode;
  path: string[];  // breadcrumb segments
}
```

- [ ] **Step 2: Create mock data**

Create `data.ts` with two exported trees:

```tsx
// apps/showcase/src/demos/file-explorer/data.ts
import type { FileNode } from './types';

export const localFiles: FileNode = {
  id: 'local-root',
  name: 'my-project',
  type: 'folder',
  children: [
    {
      id: 'src', name: 'src', type: 'folder', children: [
        {
          id: 'components', name: 'components', type: 'folder', children: [
            { id: 'app-tsx', name: 'App.tsx', type: 'file', size: 2400, modified: '2026-03-12T10:00:00Z', permissions: 'rw-r--r--', extension: 'tsx',
              content: 'import { useState } from \'react\';\nimport { ThemeProvider } from \'@omniviewdev/base-ui\';\n\nexport function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <ThemeProvider>\n      <main>\n        <h1>Hello World</h1>\n        <button onClick={() => setCount(c => c + 1)}>\n          Count: {count}\n        </button>\n      </main>\n    </ThemeProvider>\n  );\n}' },
            // ... ~8 more component files
          ]
        },
        {
          id: 'hooks', name: 'hooks', type: 'folder', children: [
            { id: 'use-theme', name: 'useTheme.ts', type: 'file', size: 890, modified: '2026-03-10T14:00:00Z', permissions: 'rw-r--r--', extension: 'ts',
              content: 'import { useContext } from \'react\';\nimport { ThemeContext } from \'../context\';\n\nexport function useTheme() {\n  return useContext(ThemeContext);\n}' },
            // ... 2-3 more hook files
          ]
        },
        // ... utils/, styles/ folders
      ]
    },
    { id: 'pkg-json', name: 'package.json', type: 'file', size: 1200, modified: '2026-03-11T09:00:00Z', permissions: 'rw-r--r--', extension: 'json',
      content: '{\n  "name": "my-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^19.0.0"\n  }\n}' },
    { id: 'tsconfig', name: 'tsconfig.json', type: 'file', size: 450, modified: '2026-03-08T12:00:00Z', permissions: 'rw-r--r--', extension: 'json' },
    { id: 'readme', name: 'README.md', type: 'file', size: 3200, modified: '2026-03-12T08:00:00Z', permissions: 'rw-r--r--', extension: 'md' },
    // ... public/ folder, .gitignore, etc.
  ],
};

export const remoteFiles: FileNode = {
  id: 'remote-root',
  name: 's3://my-bucket',
  type: 'folder',
  children: [
    {
      id: 'assets', name: 'assets', type: 'folder', children: [
        { id: 'images', name: 'images', type: 'folder', children: [
          { id: 'logo-png', name: 'logo.png', type: 'file', size: 45000, modified: '2026-02-15T10:00:00Z', permissions: 'rw-r--r--', extension: 'png' },
          // ... more image files
        ]},
        { id: 'fonts', name: 'fonts', type: 'folder', children: [
          { id: 'inter-woff2', name: 'Inter.woff2', type: 'file', size: 98000, modified: '2026-01-20T10:00:00Z', permissions: 'rw-r--r--', extension: 'woff2' },
        ]},
      ]
    },
    { id: 'backups', name: 'backups', type: 'folder', children: [
      // ... backup files
    ]},
    { id: 'config-yaml', name: 'config.yaml', type: 'file', size: 620, modified: '2026-03-01T10:00:00Z', permissions: 'rw-r--r--', extension: 'yaml',
      content: 'server:\n  host: 0.0.0.0\n  port: 8080\n\ndatabase:\n  host: postgres.internal\n  port: 5432\n  name: myapp' },
  ],
};
```

Build out ~30 local nodes and ~20 remote nodes total. Each text file (`.ts`, `.tsx`, `.json`, `.yaml`, `.md`, `.css`) should have a realistic `content` string (5-15 lines).

- [ ] **Step 3: Add helper functions**

Add to bottom of `data.ts`:

```tsx
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

/** Format bytes to human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
```

- [ ] **Step 4: Verify build**

```bash
cd apps/showcase && pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/showcase/src/demos/file-explorer/types.ts apps/showcase/src/demos/file-explorer/data.ts
git commit -m "feat(file-explorer): add mock data and types"
```

---

### Task 2: File Explorer — Layout Shell & Tree Panes

**Files:**
- Create: `apps/showcase/src/demos/file-explorer/components/TreePane.tsx`
- Create: `apps/showcase/src/demos/file-explorer/components/TreePane.module.css`
- Modify: `apps/showcase/src/demos/file-explorer/index.tsx` (replace placeholder)
- Create: `apps/showcase/src/demos/file-explorer/index.module.css`

**Before starting:** Read source for `TreeList`, `Breadcrumbs`, `ResizableSplitPane` to verify their exact APIs. Read their CSS too.

- [ ] **Step 1: Create TreePane component**

TreePane wraps a TreeList with a Breadcrumbs header. It receives the file tree data, handles expand/collapse, and reports selections upward.

```tsx
// apps/showcase/src/demos/file-explorer/components/TreePane.tsx
import { useState } from 'react';
import { TreeList, Breadcrumbs } from '@omniviewdev/base-ui';
import { LuFolder, LuFile } from 'react-icons/lu';
import type { FileNode } from '../types';
import styles from './TreePane.module.css';

interface TreePaneProps {
  label: string;
  root: FileNode;
  onSelectFile: (node: FileNode, path: string[]) => void;
  searchQuery: string;
}

export function TreePane({ label, root, onSelectFile, searchQuery }: TreePaneProps) {
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<string>>(new Set(['src', 'components', 'assets']));
  const [selectedKeys, setSelectedKeys] = useState<ReadonlySet<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string[]>([root.name]);

  // Filter nodes based on search query
  // ... implement filtering logic that keeps parent folders visible

  return (
    <div className={styles.pane}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <Breadcrumbs>
          {currentPath.map((segment, i) => (
            <Breadcrumbs.Item key={i} onClick={() => {/* navigate up */}}>
              {segment}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      </div>
      <div className={styles.treeContainer}>
        <TreeList.Root
          items={root.children ?? []}
          itemKey={(item: FileNode) => item.id}
          getChildren={(item: FileNode) => item.children}
          expandedKeys={expandedKeys}
          onExpandedKeysChange={setExpandedKeys}
          selectedKeys={selectedKeys}
          onSelectedKeysChange={(keys) => {
            setSelectedKeys(keys);
            // Find selected node, call onSelectFile
          }}
          selectionMode="single"
          renderItem={(item: FileNode) => (
            <TreeList.Item>
              <TreeList.ItemIndent />
              <TreeList.ItemToggle />
              <TreeList.ItemIcon>
                {item.type === 'folder' ? <LuFolder /> : <LuFile />}
              </TreeList.ItemIcon>
              <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
            </TreeList.Item>
          )}
        >
          <TreeList.Viewport />
        </TreeList.Root>
      </div>
    </div>
  );
}
```

**Important:** TreeList is compound. `TreeList.Root` must contain `<TreeList.Viewport />` as a child or nothing renders. The `renderItem` callback must return compound sub-components (`TreeList.Item > ItemIndent + ItemToggle + ItemIcon + ItemLabel`). Prop names: `onExpandedKeysChange` (NOT `onExpandedChange`), `onSelectedKeysChange` (NOT `onSelectionChange`). `expandedKeys` type is `ReadonlySet<Key>`.

- [ ] **Step 2: Create TreePane CSS module**

```css
/* apps/showcase/src/demos/file-explorer/components/TreePane.module.css */
.pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.header {
  padding: 4px /* TODO: --ov-space-stack-xs */ var(--ov-space-stack-sm);
  border-bottom: 1px solid var(--ov-color-border-default);
  background: var(--ov-color-bg-secondary);
}

.label {
  font-size: 10px;
  text-transform: uppercase;
  opacity: 0.6;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 2px;
}

.treeContainer {
  flex: 1;
  overflow: auto;
}
```

- [ ] **Step 3: Create main layout component**

Replace the placeholder `index.tsx` with the full layout using nested ResizableSplitPane:

```tsx
// apps/showcase/src/demos/file-explorer/index.tsx
import { useState, useCallback } from 'react';
import { ResizableSplitPane } from '@omniviewdev/base-ui';
import { TreePane } from './components/TreePane';
import { localFiles, remoteFiles } from './data';
import type { FileNode, FileSelection } from './types';
import styles from './index.module.css';

export default function FileExplorer() {
  const [selected, setSelected] = useState<FileSelection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectFile = useCallback((pane: 'local' | 'remote') =>
    (node: FileNode, path: string[]) => {
      setSelected({ pane, node, path });
    }, []);

  return (
    <div className={styles.explorer}>
      {/* Toolbar goes here (Task 3) */}
      <div className={styles.content}>
        <ResizableSplitPane direction="horizontal" defaultSize={600}>
          {/* Left: dual tree panes */}
          <ResizableSplitPane direction="horizontal" defaultSize={300}>
            <TreePane label="Local" root={localFiles} onSelectFile={handleSelectFile('local')} searchQuery={searchQuery} />
            <TreePane label="Remote (S3)" root={remoteFiles} onSelectFile={handleSelectFile('remote')} searchQuery={searchQuery} />
          </ResizableSplitPane>
          {/* Right: detail panel (Task 3) */}
          <div className={styles.detailPlaceholder}>
            {selected ? <p>Selected: {selected.node.name}</p> : <p>Select a file</p>}
          </div>
        </ResizableSplitPane>
      </div>
      {/* StatusBar goes here (Task 3) */}
    </div>
  );
}
```

**Important:** Read ResizableSplitPane source to verify it accepts two children and the `direction`/`defaultSize` props. The `defaultSize` might be a percentage or pixel value — check.

- [ ] **Step 4: Create layout CSS module**

```css
/* apps/showcase/src/demos/file-explorer/index.module.css */
.explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.content {
  flex: 1;
  min-height: 0;
}

.detailPlaceholder {
  padding: var(--ov-space-stack-md);
  color: var(--ov-color-fg-secondary);
}
```

- [ ] **Step 5: Verify build and visual check**

```bash
cd apps/showcase && pnpm exec tsc --noEmit && pnpm dev
```

Open `http://localhost:3000`, click the File Explorer icon in the dock. Verify: two tree panes visible in a split layout with a detail area on the right.

- [ ] **Step 6: Commit**

```bash
git add apps/showcase/src/demos/file-explorer/
git commit -m "feat(file-explorer): layout shell with dual tree panes"
```

---

### Task 3: File Explorer — Detail Panel, Toolbar, Context Menu, StatusBar

**Files:**
- Create: `apps/showcase/src/demos/file-explorer/components/DetailPanel.tsx`
- Create: `apps/showcase/src/demos/file-explorer/components/DetailPanel.module.css`
- Create: `apps/showcase/src/demos/file-explorer/components/ExplorerToolbar.tsx`
- Modify: `apps/showcase/src/demos/file-explorer/index.tsx` — wire everything together

**Before starting:** Read source for `DescriptionList`, `CodeBlock`, `Toolbar`, `ContextMenu`, `StatusBar`, `Toast` / `useToast`, `SearchInput`, `IconButton`.

- [ ] **Step 1: Create DetailPanel component**

```tsx
// apps/showcase/src/demos/file-explorer/components/DetailPanel.tsx
import { DescriptionList, CodeBlock, Typography } from '@omniviewdev/base-ui';
import type { FileNode } from '../types';
import { formatBytes, timeAgo } from '../data';
import styles from './DetailPanel.module.css';

interface DetailPanelProps {
  node: FileNode | null;
}

export function DetailPanel({ node }: DetailPanelProps) {
  if (!node) {
    return <div className={styles.empty}>Select a file to view details</div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.metadata}>
        <Typography.Heading level={4}>{node.name}</Typography.Heading>
        <DescriptionList>
          <DescriptionList.Item label="Type">{node.extension ?? node.type}</DescriptionList.Item>
          <DescriptionList.Item label="Size">{node.size ? formatBytes(node.size) : '—'}</DescriptionList.Item>
          <DescriptionList.Item label="Modified">{node.modified ? timeAgo(node.modified) : '—'}</DescriptionList.Item>
          <DescriptionList.Item label="Permissions">{node.permissions ?? '—'}</DescriptionList.Item>
        </DescriptionList>
      </div>
      {node.content && (
        <div className={styles.preview}>
          <CodeBlock language={node.extension ?? 'text'}>{node.content}</CodeBlock>
        </div>
      )}
    </div>
  );
}
```

**Important:** Read DescriptionList source for exact sub-component names (`.Item`, `.Label`, `.Value` — verify). Read CodeBlock for props (`language`, `children` or `code`).

- [ ] **Step 2: Create ExplorerToolbar component**

```tsx
// apps/showcase/src/demos/file-explorer/components/ExplorerToolbar.tsx
import { Toolbar, IconButton, SearchInput, Separator, useToast } from '@omniviewdev/base-ui';
import { LuArrowLeft, LuArrowRight, LuArrowUp, LuCopy, LuFolderPlus, LuMove, LuTrash2 } from 'react-icons/lu';
import styles from './ExplorerToolbar.module.css';

interface ExplorerToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasSelection: boolean;
}

export function ExplorerToolbar({ searchQuery, onSearchChange, hasSelection }: ExplorerToolbarProps) {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast(`${action} completed`, { severity: 'success' });
  };

  return (
    <Toolbar.Root className={styles.toolbar}>
      <Toolbar.Group>
        <IconButton variant="ghost" color="neutral" size="sm" aria-label="Back"><LuArrowLeft /></IconButton>
        <IconButton variant="ghost" color="neutral" size="sm" aria-label="Forward"><LuArrowRight /></IconButton>
        <IconButton variant="ghost" color="neutral" size="sm" aria-label="Up"><LuArrowUp /></IconButton>
      </Toolbar.Group>
      <Toolbar.Group>
        <SearchInput
          placeholder="Search files..."
          value={searchQuery}
          onValueChange={onSearchChange}
        />
      </Toolbar.Group>
      <Toolbar.Group>
        <IconButton variant="ghost" color="neutral" size="sm" aria-label="Copy" disabled={!hasSelection} onClick={() => handleAction('Copy')}>
          <LuCopy />
        </IconButton>
        <IconButton variant="ghost" color="neutral" size="sm" aria-label="Move" disabled={!hasSelection} onClick={() => handleAction('Move')}>
          <LuMove />
        </IconButton>
        <IconButton variant="ghost" color="neutral" size="sm" aria-label="Delete" disabled={!hasSelection} onClick={() => handleAction('Delete')}>
          <LuTrash2 />
        </IconButton>
        <IconButton variant="ghost" color="neutral" size="sm" aria-label="New Folder" onClick={() => handleAction('Folder created')}>
          <LuFolderPlus />
        </IconButton>
      </Toolbar.Group>
    </Toolbar.Root>
  );
}
```

**Important:** Toast API is `toast(message, { severity })` NOT `toast({ title, description })`. SearchInput uses `onValueChange` (string callback) NOT `onChange`. A `ToastProvider` must wrap the app — add to `apps/showcase/src/main.tsx` if not present.

- [ ] **Step 3: Add ContextMenu to TreePane**

Wrap tree items with ContextMenu. Read ContextMenu source to verify API — it may be compound (`ContextMenu.Root`, `ContextMenu.Trigger`, `ContextMenu.Content`, `ContextMenu.Item`) or a flat API.

```tsx
// In TreePane.tsx renderItem, wrap with ContextMenu
<ContextMenu.Root>
  <ContextMenu.Trigger>
    <span>{item.type === 'folder' ? <LuFolder /> : <LuFile />} {item.name}</span>
  </ContextMenu.Trigger>
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Item onClick={() => toast('Copied', { severity: 'success' })}>Copy</ContextMenu.Item>
        <ContextMenu.Item onClick={() => toast('Moved', { severity: 'success' })}>Move</ContextMenu.Item>
        <ContextMenu.Item onClick={() => toast('Renamed', { severity: 'success' })}>Rename</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item color="danger" onClick={() => toast('Deleted', { severity: 'success' })}>Delete</ContextMenu.Item>
        <ContextMenu.Item onClick={() => toast('Folder created', { severity: 'success' })}>New Folder</ContextMenu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

**Important:** ContextMenu uses `Portal > Positioner > Popup` (NOT `Content`). Items use `onClick` (NOT `onSelect`). Danger styling uses `color="danger"` (NOT `variant="danger"`).

- [ ] **Step 4: Add StatusBar to main layout**

```tsx
// In index.tsx, below the content area
<StatusBar>
  <StatusBar.Section>
    <StatusBar.Item>
      {stats.files + stats.folders} items • {stats.folders} folders, {stats.files} files • {formatBytes(stats.totalSize)}
    </StatusBar.Item>
  </StatusBar.Section>
</StatusBar>
```

Use `countNodes()` from `data.ts` to compute stats for whichever pane is active.

- [ ] **Step 5: Wire everything together in index.tsx**

Update the main `FileExplorer` component to:
1. Import and render `ExplorerToolbar` at top
2. Replace detail placeholder with `DetailPanel`
3. Add `StatusBar` at bottom
4. Add `ToastProvider` to `apps/showcase/src/main.tsx` wrapping `<App />` (inside `ThemeProvider`). Import from `@omniviewdev/base-ui`. This is REQUIRED — `useToast()` will crash without it

- [ ] **Step 6: Verify build and visual check**

```bash
cd apps/showcase && pnpm exec tsc --noEmit && pnpm dev
```

Verify in browser: toolbar with navigation + search + action buttons, two tree panes, detail panel showing metadata + code preview when a file is clicked, context menu on right-click, status bar at bottom.

- [ ] **Step 7: Commit**

```bash
git add apps/showcase/src/demos/file-explorer/
git commit -m "feat(file-explorer): detail panel, toolbar, context menu, status bar"
```

---

## Chunk 2: IDE Editor Demo

### Task 4: IDE Editor — Mock Data

**Files:**
- Create: `apps/showcase/src/demos/ide-editor/types.ts`
- Create: `apps/showcase/src/demos/ide-editor/data.ts`

- [ ] **Step 1: Create types**

```tsx
// apps/showcase/src/demos/ide-editor/types.ts

export interface IDEFile {
  id: string;
  name: string;
  path: string;         // e.g. "src/components/App.tsx"
  language: string;     // Monaco language id: "typescript", "css", "json", "markdown"
  content: string;
}

export interface IDETab {
  id: string;
  file: IDEFile;
  type: 'code' | 'diff' | 'markdown';
  /** For diff tabs only */
  originalContent?: string;
}

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  match: string;
  context: string;  // surrounding text
}

export interface GitStatusEntry {
  file: string;
  status: 'modified' | 'staged' | 'untracked';
}

export type SidebarPanel = 'files' | 'search' | 'git';
```

- [ ] **Step 2: Create mock data**

```tsx
// apps/showcase/src/demos/ide-editor/data.ts
import type { IDEFile, IDETab, SearchResult, GitStatusEntry } from './types';

// ~20 files in a TypeScript project tree structure
export const projectFiles: IDEFile[] = [
  {
    id: 'app-tsx',
    name: 'App.tsx',
    path: 'src/App.tsx',
    language: 'typescript',
    content: `import { useState } from 'react';
import { Button } from './components/Button';
import { Header } from './components/Header';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <Header title="My App" />
      <main>
        <p>Count: {count}</p>
        <Button onClick={() => setCount(c => c + 1)}>
          Increment
        </Button>
      </main>
    </div>
  );
}`,
  },
  // ... ~19 more files (Button.tsx, Header.tsx, index.css, utils.ts, etc.)
];

// File tree structure for TreeList (nested)
export const fileTree = [
  { id: 'src', name: 'src', type: 'folder' as const, children: [
    { id: 'components', name: 'components', type: 'folder' as const, children: [
      { id: 'app-tsx', name: 'App.tsx', type: 'file' as const },
      // ...
    ]},
    // ...
  ]},
  // ...
];

// 5 pre-opened tabs
export const initialTabs: IDETab[] = [
  { id: 'tab-app', file: projectFiles[0], type: 'code' },
  { id: 'tab-button', file: projectFiles[1], type: 'code' },
  { id: 'tab-css', file: projectFiles[2], type: 'code' },
  { id: 'tab-diff', file: projectFiles[3], type: 'diff', originalContent: '// old version...' },
  { id: 'tab-readme', file: projectFiles[4], type: 'markdown' },
];

// Terminal mock output
export const terminalOutput = `$ npm run build
> my-project@1.0.0 build
> tsc && vite build

vite v7.0.0 building for production...
✓ 42 modules transformed.
dist/index.html          0.46 kB │ gzip:  0.30 kB
dist/assets/index.css    1.24 kB │ gzip:  0.65 kB
dist/assets/index.js   142.35 kB │ gzip: 45.67 kB
✓ built in 1.23s`;

// 10 mock search results
export const searchResults: SearchResult[] = [
  { file: 'src/App.tsx', line: 3, column: 10, match: 'useState', context: "const [count, setCount] = useState(0);" },
  // ... 9 more
];

// 8 mock git status entries
export const gitStatus: GitStatusEntry[] = [
  { file: 'src/App.tsx', status: 'modified' },
  { file: 'src/components/Button.tsx', status: 'staged' },
  { file: 'src/utils/helpers.ts', status: 'untracked' },
  // ... 5 more
];

// Command palette commands — CommandItem uses `group` (NOT `category`)
export const paletteCommands = [
  { id: 'goto-file', label: 'Go to File', group: 'Navigation' },
  { id: 'toggle-theme', label: 'Toggle Theme', group: 'Preferences' },
  { id: 'toggle-terminal', label: 'Toggle Terminal', group: 'View' },
  { id: 'change-language', label: 'Change Language', group: 'Editor' },
];
```

- [ ] **Step 3: Verify build**

```bash
cd apps/showcase && pnpm exec tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add apps/showcase/src/demos/ide-editor/
git commit -m "feat(ide-editor): add mock data and types"
```

---

### Task 5: IDE Editor — Layout Shell & Sidebar

**Files:**
- Create: `apps/showcase/src/demos/ide-editor/components/IconStrip.tsx`
- Create: `apps/showcase/src/demos/ide-editor/components/IconStrip.module.css`
- Create: `apps/showcase/src/demos/ide-editor/components/SidebarPanel.tsx`
- Create: `apps/showcase/src/demos/ide-editor/components/SidebarPanel.module.css`
- Modify: `apps/showcase/src/demos/ide-editor/index.tsx` (replace placeholder)
- Create: `apps/showcase/src/demos/ide-editor/index.module.css`

**Before starting:** Read `DockLayout` source to determine if it supports icon-strip + panel switching. If not, use the fallback: flex layout + conditional rendering. Also read `EditorTabs` source for exact API. Import `setupMonacoWorkers` and `@omniviewdev/editors/styles.css`.

- [ ] **Step 1: Setup Monaco workers and editor CSS import**

At the top of `index.tsx` (module level, before component):

```tsx
// apps/showcase/src/demos/ide-editor/index.tsx
import '@omniviewdev/editors/styles.css';
import { setupMonacoWorkers } from '@omniviewdev/editors';
setupMonacoWorkers();
```

**Important:** `setupMonacoWorkers()` MUST be called at module level (outside any component), before any editor mounts. Verify the exact import path from `packages/editors/src/index.ts`.

- [ ] **Step 2: Create IconStrip component**

Vertical strip of icon buttons that switch sidebar panels. Uses `NavList` from the spec + `Tooltip` for labels + `Separator` for visual dividers:

```tsx
// apps/showcase/src/demos/ide-editor/components/IconStrip.tsx
import { NavList, IconButton, Tooltip, Separator } from '@omniviewdev/base-ui';
import { LuFiles, LuSearch, LuGitBranch } from 'react-icons/lu';
import type { SidebarPanel } from '../types';
import styles from './IconStrip.module.css';

interface IconStripProps {
  activePanel: SidebarPanel;
  onPanelChange: (panel: SidebarPanel) => void;
}

const panels: { id: SidebarPanel; icon: typeof LuFiles; label: string }[] = [
  { id: 'files', icon: LuFiles, label: 'Explorer' },
  { id: 'search', icon: LuSearch, label: 'Search' },
  { id: 'git', icon: LuGitBranch, label: 'Source Control' },
];

export function IconStrip({ activePanel, onPanelChange }: IconStripProps) {
  return (
    <NavList.Root className={styles.strip}>
      {panels.map(({ id, icon: Icon, label }) => (
        <NavList.Item key={id}>
          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <IconButton
                  variant={activePanel === id ? 'soft' : 'ghost'}
                  color={activePanel === id ? 'brand' : 'neutral'}
                  size="md"
                  aria-label={label}
                  onClick={() => onPanelChange(id)}
                >
                  <Icon />
                </IconButton>
              }
            />
            <Tooltip.Portal>
              <Tooltip.Positioner side="right" sideOffset={8}>
                <Tooltip.Popup>{label}</Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </NavList.Item>
      ))}
      <Separator />
    </NavList.Root>
  );
}
```

- [ ] **Step 3: Create SidebarPanel component**

Renders the correct panel based on `activePanel` state:

```tsx
// apps/showcase/src/demos/ide-editor/components/SidebarPanel.tsx
import { TreeList, SearchInput, List, StatusDot, Badge } from '@omniviewdev/base-ui';
import type { SidebarPanel as PanelType } from '../types';
import { fileTree, searchResults, gitStatus } from '../data';
import styles from './SidebarPanel.module.css';

interface SidebarPanelProps {
  panel: PanelType;
  onOpenFile: (fileId: string) => void;
}

export function SidebarPanel({ panel, onOpenFile }: SidebarPanelProps) {
  switch (panel) {
    case 'files':
      return <FileTreePanel onOpenFile={onOpenFile} />;
    case 'search':
      return <SearchPanel onOpenFile={onOpenFile} />;
    case 'git':
      return <GitPanel />;
  }
}

function FileTreePanel({ onOpenFile }: { onOpenFile: (id: string) => void }) {
  // TreeList rendering the file tree
  // Click a file node → calls onOpenFile(fileId)
  // Read TreeList source for exact props
}

function SearchPanel({ onOpenFile }: { onOpenFile: (id: string) => void }) {
  // SearchInput at top + List of searchResults below
  // Each result shows file path, line number, matching text
}

function GitPanel() {
  // List with StatusDot + Badge for each git status entry
  // StatusDot color: modified=yellow, staged=green, untracked=red
  // Use statusToColor() or manual mapping
}
```

- [ ] **Step 4: Create main IDE layout**

```tsx
// apps/showcase/src/demos/ide-editor/index.tsx
import '@omniviewdev/editors/styles.css';
import { setupMonacoWorkers } from '@omniviewdev/editors';
setupMonacoWorkers();

import { useState, useCallback, useEffect, useRef } from 'react';
import { ResizableSplitPane, EditorTabs } from '@omniviewdev/base-ui';
import { CodeEditor, DiffViewer, Terminal, CommandPalette, MarkdownPreview } from '@omniviewdev/editors';
import type { TerminalHandle } from '@omniviewdev/editors';
import { IconStrip } from './components/IconStrip';
import { SidebarPanel } from './components/SidebarPanel';
import { initialTabs, projectFiles, terminalOutput, paletteCommands } from './data';
import type { SidebarPanel as PanelType, IDETab } from './types';
import styles from './index.module.css';

export default function IdeEditor() {
  const [sidebarPanel, setSidebarPanel] = useState<PanelType>('files');
  const [tabs, setTabs] = useState(initialTabs);
  const [activeTabId, setActiveTabId] = useState(initialTabs[0].id);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showPalette, setShowPalette] = useState(false);
  const terminalRef = useRef<TerminalHandle>(null);

  // Ctrl+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleOpenFile = useCallback((fileId: string) => {
    // If tab already open, activate it
    // Otherwise, find file in projectFiles, create new tab, add to tabs
  }, [tabs]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  // Convert IDETab[] to TabDescriptor[] for EditorTabs
  const tabDescriptors = tabs.map(t => ({
    id: t.id,
    title: t.file.name,
    closable: true,
  }));

  return (
    <div className={styles.ide}>
      <IconStrip activePanel={sidebarPanel} onPanelChange={setSidebarPanel} />
      <ResizableSplitPane direction="horizontal" defaultSize={250} minSize={180} maxSize={400}>
        <SidebarPanel panel={sidebarPanel} onOpenFile={handleOpenFile} />
        <div className={styles.editorArea}>
          {/* EditorTabs is tab BAR only — renders strip, NOT content */}
          <EditorTabs
            tabs={tabDescriptors}
            activeId={activeTabId}
            onActiveChange={setActiveTabId}
            onClose={(tabId) => setTabs(ts => ts.filter(t => t.id !== tabId))}
          />
          {/* Content area rendered separately based on activeTabId */}
          <ResizableSplitPane direction="vertical" defaultSize={400}>
            <div className={styles.editorContent}>
              {activeTab?.type === 'code' && (
                <CodeEditor value={activeTab.file.content} language={activeTab.file.language} />
              )}
              {activeTab?.type === 'diff' && (
                <DiffViewer original={activeTab.originalContent ?? ''} modified={activeTab.file.content} />
              )}
              {activeTab?.type === 'markdown' && (
                <MarkdownPreview content={activeTab.file.content} />
              )}
            </div>
            {showTerminal && (
              <Terminal ref={terminalRef} onReady={() => terminalRef.current?.write(terminalOutput)} />
            )}
          </ResizableSplitPane>
        </div>
      </ResizableSplitPane>
      <CommandPalette
        open={showPalette}
        commands={paletteCommands}
        onSelect={(cmd) => {
          setShowPalette(false);
          if (cmd.id === 'toggle-terminal') setShowTerminal(t => !t);
          // handle other commands
        }}
        onClose={() => setShowPalette(false)}
      />
    </div>
  );
}
```

**Key API corrections applied:**
- **EditorTabs** is a tab BAR only — does NOT render content. Uses `TabDescriptor[]` (`{ id, title, closable, ... }`), `activeId`, `onActiveChange`, `onClose`. Content area is rendered separately below.
- **CodeEditor** uses `value` (controlled), NOT `defaultValue`.
- **CommandPalette** uses `open` prop (boolean) + `commands` (NOT `items`). It handles its own visibility — no conditional rendering needed.
- **Terminal** has NO `initialContent` prop. Use `ref` with `TerminalHandle` + `onReady` callback to write content: `terminalRef.current?.write(terminalOutput)`.
- **ResizableSplitPane** `defaultSize` is in **pixels** (e.g., 400), NOT percentages.

- [ ] **Step 5: Create CSS module**

```css
/* apps/showcase/src/demos/ide-editor/index.module.css */
.ide {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.editorArea {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.editorContent {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 6: Verify build and visual check**

```bash
cd apps/showcase && pnpm exec tsc --noEmit && pnpm dev
```

Verify: icon strip on left, sidebar panel switching, editor area with tabs, terminal at bottom. Command palette opens with Ctrl+K.

- [ ] **Step 7: Commit**

```bash
git add apps/showcase/src/demos/ide-editor/
git commit -m "feat(ide-editor): layout shell with sidebar, editor tabs, terminal"
```

---

### Task 6: IDE Editor — EditorTabs, Sidebar Panels, Command Palette Polish

**Files:**
- Modify: `apps/showcase/src/demos/ide-editor/components/SidebarPanel.tsx` — flesh out all three panels
- Modify: `apps/showcase/src/demos/ide-editor/index.tsx` — wire EditorTabs fully

**Before starting:** Read `EditorTabs` source to understand: tab data structure, how to render custom content per tab, active/close/reorder callbacks. Read `List` for how to render items with icons.

- [ ] **Step 1: Flesh out FileTreePanel**

Implement the TreeList with expand/collapse, click-to-open behavior. Use the `fileTree` mock data.

- [ ] **Step 2: Flesh out SearchPanel**

Implement SearchInput with a `useState` for query. Below it, render a List of `searchResults` filtered by query. Each item shows: file path (muted), line number, and matching text with the match highlighted.

- [ ] **Step 3: Flesh out GitPanel**

Render a list grouping entries by status. Use `StatusDot` with color mapped from status (modified → `'warning'`, staged → `'success'`, untracked → `'danger'`). Show `Badge` with count per group.

- [ ] **Step 4: Wire EditorTabs**

Connect the `EditorTabs` component to the `tabs` and `activeTabId` state. Handle tab close (remove from state), tab click (set active), tab reorder if supported. Render the correct editor component based on active tab type.

- [ ] **Step 5: Verify build and visual check**

```bash
cd apps/showcase && pnpm exec tsc --noEmit && pnpm dev
```

Verify: all three sidebar panels render correctly, EditorTabs shows 5 tabs with correct content types, command palette functions.

- [ ] **Step 6: Commit**

```bash
git add apps/showcase/src/demos/ide-editor/
git commit -m "feat(ide-editor): complete sidebar panels, editor tabs, command palette"
```

---

## Chunk 3: AI Chat Demo

### Task 7: AI Chat — Mock Data & Types

**Files:**
- Create: `apps/showcase/src/demos/ai-chat/types.ts`
- Create: `apps/showcase/src/demos/ai-chat/data.ts`

- [ ] **Step 1: Create types**

```tsx
// apps/showcase/src/demos/ai-chat/types.ts

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;          // markdown content
  thinking?: {
    text: string;
    durationMs: number;
  };
  toolCalls?: ToolCallData[];
  citations?: CitationData[];
  sources?: SourceData[];
  branches?: BranchData[];
  contextFiles?: string[];   // for AIContextIndicator
  artifact?: ArtifactData;
}

export interface ToolCallData {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  durationMs: number;
  input?: string;
  output?: string;
}

export interface CitationData {
  id: string;
  number: number;
  text: string;
  source: string;
}

export interface SourceData {
  id: string;
  title: string;
  url: string;
  snippet: string;
}

export interface BranchData {
  id: string;
  content: string;
}

export interface ArtifactData {
  title: string;
  language: string;
  code: string;
}

/** Phases of the scripted replay state machine */
export type ReplayPhase =
  | 'idle'
  | 'typing'
  | 'thinking'
  | 'tool-call'
  | 'streaming'
  | 'artifact'
  | 'follow-up'
  | 'done';
```

- [ ] **Step 2: Create mock data**

Create the 6 pre-built messages plus scripted replay data:

```tsx
// apps/showcase/src/demos/ai-chat/data.ts
import type { ChatMessage, ArtifactData } from './types';

export const prebuiltMessages: ChatMessage[] = [
  // 1. User message — simple question
  {
    id: 'msg-1',
    role: 'user',
    content: 'How does the React reconciler work?',
  },
  // 2. Assistant response — ThinkingBlock + AIMarkdown
  {
    id: 'msg-2',
    role: 'assistant',
    content: "React's reconciler (called \"Fiber\") works by...\n\n## Key Concepts\n\n1. **Virtual DOM diffing** — React creates a lightweight copy...\n2. **Work loops** — The fiber architecture breaks rendering into units...\n3. **Reconciliation** — When state changes, React compares...\n\n```tsx\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c + 1)}>{count}</button>;\n}\n```\n\nThe key insight is that Fiber makes rendering interruptible...",
    thinking: { text: 'Let me think about how to explain the React reconciler clearly...', durationMs: 2100 },
  },
  // 3. User message — triggers tool use
  {
    id: 'msg-3',
    role: 'user',
    content: 'Search for recent articles about React Server Components and summarize the key points.',
  },
  // 4. Assistant response — ToolCall + ToolResult + Citations + Sources
  {
    id: 'msg-4',
    role: 'assistant',
    content: 'Based on my research, here are the key developments in React Server Components:\n\n1. **Server-first rendering** — RSCs render entirely on the server [1].\n2. **Zero bundle size** — Server components aren\'t included in the client bundle [2].\n3. **Async data fetching** — Components can use `async/await` directly [1][3].',
    toolCalls: [{
      id: 'tc-1', name: 'web_search', status: 'success', durationMs: 1200,
      input: 'React Server Components 2026',
      output: 'Found 3 relevant articles...',
    }],
    citations: [
      { id: 'c1', number: 1, text: 'RSCs render entirely on the server', source: 'React Blog' },
      { id: 'c2', number: 2, text: 'Zero client-side JavaScript for server components', source: 'Vercel Engineering' },
      { id: 'c3', number: 3, text: 'Native async/await in components', source: 'Dan Abramov' },
    ],
    sources: [
      { id: 's1', title: 'React Blog — Server Components Update', url: 'https://react.dev/blog/rsc', snippet: 'Server Components are a new kind of component...' },
      { id: 's2', title: 'Vercel — Understanding RSC', url: 'https://vercel.com/blog/rsc', snippet: 'Zero-bundle-size components that render...' },
      { id: 's3', title: 'Dan Abramov — RSC From Scratch', url: 'https://overreacted.io/rsc', snippet: 'Let me walk you through building...' },
    ],
  },
  // 5. Assistant message with branching — 3 alternatives
  {
    id: 'msg-5',
    role: 'assistant',
    content: 'Here\'s a practical example of Server Components:\n\n```tsx\n// This runs on the server\nasync function PostList() {\n  const posts = await db.posts.findMany();\n  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}\n```',
    branches: [
      { id: 'b1', content: 'Here\'s a practical example of Server Components:\n\n```tsx\nasync function PostList() {\n  const posts = await db.posts.findMany();\n  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}\n```' },
      { id: 'b2', content: 'Let me show you a comparison between client and server components:\n\n**Server Component:**\n```tsx\nasync function UserProfile({ id }) {\n  const user = await getUser(id);\n  return <h1>{user.name}</h1>;\n}\n```\n\n**Client Component:**\n```tsx\n\'use client\';\nfunction LikeButton() {\n  const [liked, setLiked] = useState(false);\n  return <button onClick={() => setLiked(true)}>Like</button>;\n}\n```' },
      { id: 'b3', content: 'Here\'s how data flows between server and client components:\n\n1. Server components fetch data directly\n2. They pass serializable props to client components\n3. Client components handle interactivity\n\nThis creates a clear separation of concerns...' },
    ],
  },
  // 6. User message with AIContextIndicator
  {
    id: 'msg-6',
    role: 'user',
    content: 'Given these files, can you write a fibonacci function in Python?',
    contextFiles: ['src/utils/math.py', 'tests/test_math.py'],
  },
];

export const replayArtifact: ArtifactData = {
  title: 'fibonacci.py',
  language: 'python',
  code: `def fib(n: int) -> int:
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)


def fib_memo(n: int, memo: dict[int, int] | None = None) -> int:
    """Memoized Fibonacci for better performance."""
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]


# Example usage
if __name__ == "__main__":
    print([fib(i) for i in range(10)])
    print([fib_memo(i) for i in range(10)])`,
};

export const replayStreamedText = `Here's a fibonacci function with both a naive recursive and memoized version:

The naive version has O(2^n) time complexity, while the memoized version runs in O(n). For production code, the memoized approach or an iterative solution would be preferred.

I've also included type hints and a main block for testing.`;

export const chatSuggestions = [
  'Write a fibonacci function in Python',
  'Explain how async/await works',
  'Compare REST vs GraphQL',
];

export const followUpSuggestions = [
  'Add unit tests for the fibonacci function',
  'Convert to an iterative approach',
  'Add error handling for negative inputs',
];

export const modelOptions = [
  { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet' },
  { id: 'claude-4-opus', name: 'Claude 4 Opus' },
  { id: 'claude-4-haiku', name: 'Claude 4 Haiku' },
];
```

- [ ] **Step 3: Verify build**

```bash
cd apps/showcase && pnpm exec tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add apps/showcase/src/demos/ai-chat/
git commit -m "feat(ai-chat): add mock data, types, and conversation script"
```

---

### Task 8: AI Chat — Layout & Pre-built Conversation

**Files:**
- Modify: `apps/showcase/src/demos/ai-chat/index.tsx` (replace placeholder)
- Create: `apps/showcase/src/demos/ai-chat/index.module.css`
- Create: `apps/showcase/src/demos/ai-chat/components/MessageRenderer.tsx`
- Create: `apps/showcase/src/demos/ai-chat/components/MessageRenderer.module.css`
- Create: `apps/showcase/src/demos/ai-chat/components/ArtifactPanel.tsx`

**Before starting:** Read source for ALL ai-ui components listed in the spec. Pay close attention to:
- `ChatMessageList` — container props (scrollable? ref?)
- `ChatBubble` — how it wraps content, role prop
- `ChatAvatar` — role prop
- `ChatInput` — onSubmit callback
- `ChatSuggestions` — items prop, onSelect callback
- `AIConversationHeader` — title, model, actions props
- `AIMarkdown` — how to render markdown content
- `ThinkingBlock` — collapsed state, duration, content
- `ToolCall` — name, status, duration props
- `ToolResult` — content rendering
- `AIInlineCitation` — number prop, how it embeds in markdown
- `AISources` — items prop
- `AIBranch*` — how branch navigation wires together
- `AIContextIndicator` — files prop
- `AIMessageActions` — what actions are available

Also import CSS: `import '@omniviewdev/ai-ui/styles.css';`

- [ ] **Step 1: Create MessageRenderer component**

A component that takes a `ChatMessage` and renders the appropriate ai-ui components:

```tsx
// apps/showcase/src/demos/ai-chat/components/MessageRenderer.tsx
import {
  ChatBubble, ChatAvatar, AIMarkdown, AIMessageActions,
  ThinkingBlock, ToolCall, ToolResult,
  AIInlineCitation, AISources, AIContextIndicator,
  AIBranch, AIBranchContent, AIBranchSelector,
  AIBranchPrevious, AIBranchNext, AIBranchIndicator,
} from '@omniviewdev/ai-ui';
import { useState } from 'react';
import type { ChatMessage } from '../types';

interface MessageRendererProps {
  message: ChatMessage;
}

export function MessageRenderer({ message }: MessageRendererProps) {
  const [activeBranch, setActiveBranch] = useState(0);

  return (
    <>
      {/* Avatar */}
      <ChatAvatar role={message.role} />

      <ChatBubble role={message.role}>
        {/* Context indicator (user messages with attached files) */}
        {message.contextFiles && (
          <AIContextIndicator files={message.contextFiles} />
        )}

        {/* Thinking block */}
        {message.thinking && (
          <ThinkingBlock
            content={message.thinking.text}
            duration={message.thinking.durationMs}
            defaultCollapsed
          />
        )}

        {/* Tool calls */}
        {message.toolCalls?.map(tc => (
          <div key={tc.id}>
            <ToolCall name={tc.name} status={tc.status} duration={tc.durationMs} />
            {tc.output && <ToolResult>{tc.output}</ToolResult>}
          </div>
        ))}

        {/* Main content */}
        {message.branches ? (
          <AIBranch>
            <AIBranchContent>
              <AIMarkdown>{message.branches[activeBranch].content}</AIMarkdown>
            </AIBranchContent>
            <AIBranchSelector>
              <AIBranchPrevious onClick={() => setActiveBranch(i => Math.max(0, i - 1))} disabled={activeBranch === 0} />
              <AIBranchIndicator current={activeBranch + 1} total={message.branches.length} />
              <AIBranchNext onClick={() => setActiveBranch(i => Math.min(message.branches.length - 1, i + 1))} disabled={activeBranch === message.branches.length - 1} />
            </AIBranchSelector>
          </AIBranch>
        ) : (
          <AIMarkdown>{message.content}</AIMarkdown>
        )}

        {/* Citations */}
        {message.citations?.map(c => (
          <AIInlineCitation key={c.id} number={c.number} source={c.source} />
        ))}

        {/* Sources */}
        {message.sources && <AISources items={message.sources} />}

        {/* Message actions (assistant messages only) */}
        {message.role === 'assistant' && <AIMessageActions />}
      </ChatBubble>
    </>
  );
}
```

**IMPORTANT:** The code above is approximate. EVERY component's props must be verified from source. The compound patterns for AIBranch, the way ChatBubble wraps children, the way AIMarkdown accepts content, etc. — all must be read from the actual component source files before implementation.

- [ ] **Step 2: Create ArtifactPanel component**

```tsx
// apps/showcase/src/demos/ai-chat/components/ArtifactPanel.tsx
import {
  AIArtifact, AIArtifactHeader, AIArtifactTitle, AIArtifactDescription,
  AIArtifactActions, AIArtifactAction, AIArtifactContent, AIArtifactClose,
  AICodeBlock,
} from '@omniviewdev/ai-ui';
import type { ArtifactData } from '../types';

interface ArtifactPanelProps {
  artifact: ArtifactData;
  onClose: () => void;
}

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  return (
    <AIArtifact>
      <AIArtifactHeader>
        <AIArtifactTitle>{artifact.title}</AIArtifactTitle>
        <AIArtifactDescription>{artifact.language} source file</AIArtifactDescription>
        <AIArtifactActions>
          <AIArtifactAction onClick={() => navigator.clipboard.writeText(artifact.code)}>
            Copy
          </AIArtifactAction>
          <AIArtifactAction>Apply</AIArtifactAction>
        </AIArtifactActions>
        <AIArtifactClose onClick={onClose} />
      </AIArtifactHeader>
      <AIArtifactContent>
        <AICodeBlock language={artifact.language}>{artifact.code}</AICodeBlock>
      </AIArtifactContent>
    </AIArtifact>
  );
}
```

- [ ] **Step 3: Create main AI Chat layout**

```tsx
// apps/showcase/src/demos/ai-chat/index.tsx
import '@omniviewdev/ai-ui/styles.css';

import { useState, useCallback } from 'react';
import {
  ChatMessageList, ChatInput, ChatSuggestions,
  AIConversationHeader, AIModelSelector, AIFollowUp,
} from '@omniviewdev/ai-ui';
import { ResizableSplitPane } from '@omniviewdev/base-ui';
import { MessageRenderer } from './components/MessageRenderer';
import { ArtifactPanel } from './components/ArtifactPanel';
import { prebuiltMessages, chatSuggestions, modelOptions } from './data';
import type { ChatMessage, ArtifactData } from './types';
import styles from './index.module.css';

export default function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(prebuiltMessages);
  const [selectedModel, setSelectedModel] = useState(modelOptions[0].id);
  const [artifact, setArtifact] = useState<ArtifactData | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);

  const handleSend = useCallback((text: string) => {
    // Add user message, then trigger scripted replay (Task 9)
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSend(suggestion);
  }, [handleSend]);

  const chatContent = (
    <div className={styles.chatColumn}>
      <AIConversationHeader>
        {/* Model selector, new chat button, settings */}
        <AIModelSelector
          models={modelOptions}
          selected={selectedModel}
          onSelect={setSelectedModel}
        />
      </AIConversationHeader>
      <ChatMessageList>
        {messages.map(msg => (
          <MessageRenderer key={msg.id} message={msg} />
        ))}
      </ChatMessageList>
      {!isReplaying && messages.length === prebuiltMessages.length && (
        <ChatSuggestions items={chatSuggestions} onSelect={handleSuggestionClick} />
      )}
      <ChatInput onSubmit={handleSend} disabled={isReplaying} />
    </div>
  );

  return (
    <div className={styles.chat}>
      {artifact ? (
        <ResizableSplitPane direction="horizontal" defaultSize={60}>
          {chatContent}
          <ArtifactPanel artifact={artifact} onClose={() => setArtifact(null)} />
        </ResizableSplitPane>
      ) : (
        chatContent
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create CSS module**

```css
/* apps/showcase/src/demos/ai-chat/index.module.css */
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chatColumn {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
```

- [ ] **Step 5: Verify build and visual check**

```bash
cd apps/showcase && pnpm exec tsc --noEmit && pnpm dev
```

Verify: conversation header with model selector, 6 pre-built messages rendering with thinking blocks, tool calls, citations, sources, branch navigation, and context indicators. Chat suggestions visible at bottom. Artifact panel not yet shown (that's triggered by replay in Task 9).

- [ ] **Step 6: Commit**

```bash
git add apps/showcase/src/demos/ai-chat/
git commit -m "feat(ai-chat): layout with pre-built conversation and artifact panel"
```

---

### Task 9: AI Chat — Scripted Replay

**Files:**
- Create: `apps/showcase/src/demos/ai-chat/hooks/useScriptedReplay.ts`
- Modify: `apps/showcase/src/demos/ai-chat/index.tsx` — wire replay hook

- [ ] **Step 1: Create useScriptedReplay hook**

State machine that drives the scripted animation sequence:

```tsx
// apps/showcase/src/demos/ai-chat/hooks/useScriptedReplay.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import type { ReplayPhase, ChatMessage, ArtifactData } from '../types';
import { replayArtifact, replayStreamedText, followUpSuggestions } from '../data';

interface ReplayState {
  phase: ReplayPhase;
  thinkingText: string;
  streamedText: string;
  toolCallStatus: 'pending' | 'running' | 'success';
  artifact: ArtifactData | null;
  followUps: string[];
}

export function useScriptedReplay() {
  const [state, setState] = useState<ReplayState>({
    phase: 'idle',
    thinkingText: '',
    streamedText: '',
    toolCallStatus: 'pending',
    artifact: null,
    followUps: [],
  });

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  const schedule = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const startReplay = useCallback((userMessage: string) => {
    // Clear old timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    let elapsed = 0;

    // Phase 1: Typing indicator (~500ms)
    setState(s => ({ ...s, phase: 'typing' }));
    elapsed += 500;

    // Phase 2: Thinking block (~2s)
    schedule(() => {
      setState(s => ({ ...s, phase: 'thinking', thinkingText: 'Analyzing the request and considering the best approach...' }));
    }, elapsed);
    elapsed += 2000;

    // Phase 3: Tool call (~1s)
    schedule(() => {
      setState(s => ({ ...s, phase: 'tool-call', toolCallStatus: 'running' }));
    }, elapsed);
    elapsed += 1000;
    schedule(() => {
      setState(s => ({ ...s, toolCallStatus: 'success' }));
    }, elapsed);
    elapsed += 300;

    // Phase 4: Streaming text (~50ms per character)
    schedule(() => {
      setState(s => ({ ...s, phase: 'streaming' }));
      // Stream characters one at a time
      let charIndex = 0;
      const streamInterval = setInterval(() => {
        charIndex++;
        if (charIndex >= replayStreamedText.length) {
          clearInterval(streamInterval);
          // Phase 5: Artifact
          setState(s => ({ ...s, phase: 'artifact', artifact: replayArtifact, streamedText: replayStreamedText }));
          // Phase 6: Follow-ups
          setTimeout(() => {
            setState(s => ({ ...s, phase: 'follow-up', followUps: followUpSuggestions }));
            setTimeout(() => {
              setState(s => ({ ...s, phase: 'done' }));
            }, 500);
          }, 500);
        } else {
          setState(s => ({ ...s, streamedText: replayStreamedText.slice(0, charIndex) }));
        }
      }, 50);
      // Track interval for cleanup
      timeoutsRef.current.push(streamInterval as unknown as ReturnType<typeof setTimeout>);
      // IMPORTANT: Also track the setTimeout calls inside the interval callback
      // by pushing their IDs to timeoutsRef.current when created
    }, elapsed);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  return { state, startReplay };
}
```

- [ ] **Step 2: Wire replay into main component**

In `index.tsx`, integrate the replay hook:

1. When `handleSend` is called, add the user message to `messages`, then call `startReplay(text)`
2. Render replay UI based on `state.phase`:
   - `typing` → show `TypingIndicator`
   - `thinking` → show `ThinkingBlock` with `state.thinkingText`
   - `tool-call` → show `ToolCall` with `state.toolCallStatus`
   - `streaming` → show `StreamingText` with `state.streamedText`
   - `artifact` → set artifact state to show `ArtifactPanel`
   - `follow-up` → show `AIFollowUp` with `state.followUps`
3. Show `AIStopButton` during phases `typing` through `streaming`
4. Set `isReplaying = state.phase !== 'idle' && state.phase !== 'done'`

```tsx
// Key rendering logic in ChatMessageList — CUMULATIVE display:
// Each component stays visible once its phase starts. Use phase ordering:
const phaseOrder = ['typing', 'thinking', 'tool-call', 'streaming', 'artifact', 'follow-up', 'done'];
const phaseIndex = phaseOrder.indexOf(state.phase);
const pastPhase = (p: string) => phaseIndex >= phaseOrder.indexOf(p);

{state.phase !== 'idle' && (
  <div>
    {/* Typing indicator only shows during its phase, replaced by thinking */}
    {state.phase === 'typing' && <TypingIndicator />}
    {/* ThinkingBlock appears at 'thinking' and stays visible (collapsed) in later phases */}
    {pastPhase('thinking') && <ThinkingBlock content={state.thinkingText} defaultCollapsed={pastPhase('tool-call')} />}
    {/* ToolCall appears at 'tool-call' and stays visible */}
    {pastPhase('tool-call') && <ToolCall name="run_code" status={state.toolCallStatus} />}
    {/* StreamingText appears at 'streaming' */}
    {pastPhase('streaming') && <StreamingText text={state.streamedText} />}
    {/* Stop button visible during active phases */}
    {!pastPhase('artifact') && state.phase !== 'idle' && <AIStopButton onClick={handleStop} />}
  </div>
)}
{state.followUps.length > 0 && <AIFollowUp items={state.followUps} onSelect={handleSend} />}
```

**Important:** Components must render CUMULATIVELY — once a thinking block appears, it stays visible (collapsed) during subsequent phases. The tool call stays visible after completion. This creates a realistic conversation flow where each element accumulates rather than replacing the previous one.

- [ ] **Step 3: Verify build and visual check**

```bash
cd apps/showcase && pnpm exec tsc --noEmit && pnpm dev
```

Verify: clicking a suggestion or typing a message triggers the full replay sequence — typing indicator, thinking block, tool call, streaming text, artifact panel slides in, follow-up suggestions appear. Stop button is visible during streaming phases.

- [ ] **Step 4: Commit**

```bash
git add apps/showcase/src/demos/ai-chat/
git commit -m "feat(ai-chat): scripted replay with streaming, tool calls, and artifacts"
```

---

## Chunk 4: Container Management Demo

### Task 10: Container Management — Mock Data

**Files:**
- Create: `apps/showcase/src/demos/container-management/types.ts`
- Create: `apps/showcase/src/demos/container-management/data.ts`

- [ ] **Step 1: Create types**

```tsx
// apps/showcase/src/demos/container-management/types.ts

export type ContainerStatus = 'running' | 'stopped' | 'paused' | 'restarting' | 'exited';

export interface Container {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  cpu: number;       // 0-100 percentage
  memory: number;    // MB
  memoryLimit: number; // MB
  ports: PortMapping[];
  created: string;   // ISO date
  uptime: string;    // e.g. "2 days"
  network: string;   // bytes/s formatted
  disk: string;      // e.g. "45 MB"
}

export interface PortMapping {
  host: number;
  container: number;
  protocol: 'tcp' | 'udp';
}

export interface ContainerDetail extends Container {
  logs: string;           // multi-line log output
  config: Record<string, unknown>; // nested JSON config
  filesystem: FileSystemNode[];
  stats: ContainerStats;
}

export interface ContainerStats {
  cpuHistory: number[];     // last 10 readings
  memoryHistory: number[];
  networkRx: string;
  networkTx: string;
  diskRead: string;
  diskWrite: string;
  pids: number;
}

export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileSystemNode[];
}
```

- [ ] **Step 2: Create mock data generator**

```tsx
// apps/showcase/src/demos/container-management/data.ts
import type { Container, ContainerDetail, ContainerStatus, FileSystemNode } from './types';

// 15-20 unique containers with realistic names
const uniqueContainers: Omit<Container, 'cpu' | 'memory'>[] = [
  { id: 'c001', name: 'api-server', image: 'node:20-slim', status: 'running', memoryLimit: 512, ports: [{ host: 3000, container: 3000, protocol: 'tcp' }], created: '2026-03-10T08:00:00Z', uptime: '2 days', network: '1.2 MB/s', disk: '45 MB' },
  { id: 'c002', name: 'postgres-db', image: 'postgres:16', status: 'running', memoryLimit: 1024, ports: [{ host: 5432, container: 5432, protocol: 'tcp' }], created: '2026-03-08T12:00:00Z', uptime: '4 days', network: '850 KB/s', disk: '2.1 GB' },
  { id: 'c003', name: 'redis-cache', image: 'redis:7-alpine', status: 'stopped', memoryLimit: 256, ports: [{ host: 6379, container: 6379, protocol: 'tcp' }], created: '2026-03-09T10:00:00Z', uptime: '0', network: '0', disk: '12 MB' },
  { id: 'c004', name: 'nginx-proxy', image: 'nginx:1.25', status: 'running', memoryLimit: 128, ports: [{ host: 80, container: 80, protocol: 'tcp' }, { host: 443, container: 443, protocol: 'tcp' }], created: '2026-03-10T08:00:00Z', uptime: '2 days', network: '3.4 MB/s', disk: '22 MB' },
  // ... grafana, prometheus, kafka, zookeeper, elasticsearch, kibana, rabbitmq,
  // minio, vault, consul, jaeger, tempo, loki (~15-20 total)
];

// Generate ~30 worker variants
function generateWorkers(count: number): Container[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `w${String(i + 1).padStart(3, '0')}`,
    name: `worker-${i + 1}`,
    image: 'python:3.12-slim',
    status: (Math.random() > 0.3 ? 'running' : 'stopped') as ContainerStatus,
    cpu: Math.round(Math.random() * 80),
    memory: Math.round(50 + Math.random() * 200),
    memoryLimit: 512,
    ports: [{ host: 9000 + i, container: 8080, protocol: 'tcp' as const }],
    created: '2026-03-11T06:00:00Z',
    uptime: Math.random() > 0.3 ? '1 day' : '0',
    network: `${Math.round(Math.random() * 500)} KB/s`,
    disk: `${Math.round(Math.random() * 100)} MB`,
  }));
}

export const containers: Container[] = [
  ...uniqueContainers.map(c => ({
    ...c,
    cpu: c.status === 'running' ? Math.round(5 + Math.random() * 75) : 0,
    memory: c.status === 'running' ? Math.round(64 + Math.random() * (c.memoryLimit * 0.8)) : 0,
  })),
  ...generateWorkers(30),
];

// Detail data for each container (generate on demand)
export function getContainerDetail(container: Container): ContainerDetail {
  return {
    ...container,
    logs: generateLogs(container.name, 50),
    config: generateConfig(container),
    filesystem: containerFilesystem,
    stats: {
      cpuHistory: Array.from({ length: 10 }, () => Math.round(Math.random() * 100)),
      memoryHistory: Array.from({ length: 10 }, () => Math.round(Math.random() * container.memoryLimit)),
      networkRx: '12.4 MB',
      networkTx: '3.2 MB',
      diskRead: '145 MB',
      diskWrite: '67 MB',
      pids: Math.round(5 + Math.random() * 50),
    },
  };
}

/** Wrapper for statusToColor that handles container-specific statuses not in the base mapping */
export function containerStatusColor(status: ContainerStatus): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (status) {
    case 'running': return 'success';
    case 'paused': return 'warning';
    case 'restarting': return 'info';
    case 'exited': return 'neutral';
    case 'stopped': return 'neutral';
    default: return statusToColor(status);
  }
}

function generateLogs(name: string, lines: number): string {
  const levels = ['INFO', 'DEBUG', 'WARN', 'ERROR'];
  const messages = [
    'Request processed successfully',
    'Connection established',
    'Health check passed',
    'Cache miss, fetching from source',
    'Worker thread started',
    'Scheduled task completed',
    'Memory usage within bounds',
    'Configuration reloaded',
  ];
  return Array.from({ length: lines }, (_, i) => {
    const level = levels[Math.floor(Math.random() * (i > 45 ? 4 : 2))]; // more errors near end
    const msg = messages[Math.floor(Math.random() * messages.length)];
    return `2026-03-12T${String(10 + Math.floor(i / 6)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00Z [${level}] ${name}: ${msg}`;
  }).join('\n');
}

function generateConfig(container: Container): Record<string, unknown> {
  return {
    Id: container.id,
    Name: `/${container.name}`,
    Image: container.image,
    State: { Status: container.status, Running: container.status === 'running', Pid: Math.round(Math.random() * 50000) },
    NetworkSettings: { Networks: { bridge: { IPAddress: `172.17.0.${Math.round(2 + Math.random() * 250)}` } } },
    HostConfig: { Memory: container.memoryLimit * 1024 * 1024, CpuShares: 1024 },
    Config: { Env: ['NODE_ENV=production', `HOSTNAME=${container.name}`], Cmd: ['/bin/sh', '-c', 'node server.js'] },
  };
}

const containerFilesystem: FileSystemNode[] = [
  { id: 'app', name: 'app', type: 'directory', children: [
    { id: 'app-src', name: 'src', type: 'directory', children: [
      { id: 'app-index', name: 'index.js', type: 'file', size: 2400 },
      { id: 'app-server', name: 'server.js', type: 'file', size: 5600 },
    ]},
    { id: 'app-pkg', name: 'package.json', type: 'file', size: 1200 },
    { id: 'app-node', name: 'node_modules', type: 'directory', children: [] },
  ]},
  { id: 'etc', name: 'etc', type: 'directory', children: [
    { id: 'etc-hosts', name: 'hosts', type: 'file', size: 180 },
    { id: 'etc-resolv', name: 'resolv.conf', type: 'file', size: 120 },
  ]},
  { id: 'var', name: 'var', type: 'directory', children: [
    { id: 'var-log', name: 'log', type: 'directory', children: [
      { id: 'var-log-app', name: 'app.log', type: 'file', size: 45000 },
    ]},
  ]},
];

// Aggregate stats for the status bar
export const clusterStats = {
  totalMemory: '4.13 GB',
  totalCpu: '57%',
  totalDisk: '12.4 GB',
};
```

- [ ] **Step 3: Verify build**

```bash
cd apps/showcase && pnpm exec tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add apps/showcase/src/demos/container-management/
git commit -m "feat(container-mgmt): add mock data with 50 containers"
```

---

### Task 11: Container Management — List View

**Files:**
- Modify: `apps/showcase/src/demos/container-management/index.tsx` (replace placeholder)
- Create: `apps/showcase/src/demos/container-management/index.module.css`
- Create: `apps/showcase/src/demos/container-management/components/ContainerList.tsx`
- Create: `apps/showcase/src/demos/container-management/components/ContainerList.module.css`

**Before starting:** Read `DataTable` source thoroughly — understand column definitions (TanStack Table `createColumnHelper`), how to use `DataTable.Root`, `DataTable.Container`, `DataTable.Header`, `DataTable.Body` or `DataTable.VirtualBody`, `DataTable.Toolbar`, `DataTable.Footer`. Read `FilterBar` source for compound API. Read `Meter`, `StatusDot`, `Badge`, `IconButton` for inline cell rendering. Read `Toolbar` for bulk action bar. Import `@omniviewdev/editors/styles.css`.

- [ ] **Step 1: Create ContainerList with DataTable**

```tsx
// apps/showcase/src/demos/container-management/components/ContainerList.tsx
import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  DataTable, FilterBar, StatusDot, Badge, Meter,
  IconButton, Button, Toolbar, SearchInput, useToast, statusToColor,
} from '@omniviewdev/base-ui';
import { LuPlay, LuSquare, LuTrash2 } from 'react-icons/lu';
import type { Container } from '../types';
import styles from './ContainerList.module.css';

interface ContainerListProps {
  containers: Container[];
  onSelectContainer: (container: Container) => void;
}

const columnHelper = createColumnHelper<Container>();

export function ContainerList({ containers, onSelectContainer }: ContainerListProps) {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      // Checkbox column — DataTable may handle this via features prop
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <span className={styles.nameCell}>
          <StatusDot color={statusToColor(info.row.original.status)} />
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('image', { header: 'Image' }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <Badge color={statusToColor(info.getValue())}>{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('cpu', {
      header: 'CPU',
      cell: (info) => info.row.original.status === 'running'
        ? <Meter value={info.getValue()} max={100} />
        : <span className={styles.inactive}>—</span>,
    }),
    columnHelper.accessor('memory', {
      header: 'Memory',
      cell: (info) => info.row.original.status === 'running'
        ? `${info.getValue()} MB`
        : <span className={styles.inactive}>—</span>,
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <Toolbar.Root>
          <Toolbar.Group>
            {info.row.original.status === 'running' ? (
              <IconButton variant="ghost" color="neutral" size="sm" aria-label="Stop" onClick={(e) => { e.stopPropagation(); toast(`Stopped ${info.row.original.name}`, { severity: 'info' }); }}>
                <LuSquare />
              </IconButton>
            ) : (
              <IconButton variant="ghost" color="success" size="sm" aria-label="Start" onClick={(e) => { e.stopPropagation(); toast(`Started ${info.row.original.name}`, { severity: 'success' }); }}>
                <LuPlay />
              </IconButton>
            )}
            <IconButton variant="ghost" color="danger" size="sm" aria-label="Delete" onClick={(e) => { e.stopPropagation(); toast(`Deleted ${info.row.original.name}`, { severity: 'success' }); }}>
              <LuTrash2 />
            </IconButton>
          </Toolbar.Group>
        </Toolbar.Root>
      ),
    }),
  ], [toast]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data = containers;
    if (statusFilter) data = data.filter(c => c.status === statusFilter);
    if (searchQuery) data = data.filter(c =>
      c.name.includes(searchQuery) || c.image.includes(searchQuery)
    );
    return data;
  }, [containers, statusFilter, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Row selection, column resizing — check DataTable docs/source for how to enable
  });

  const selectedCount = Object.keys(table.getState().rowSelection ?? {}).length;

  return (
    <div className={styles.list}>
      {/* FilterBar + SearchInput composed together (FilterBar has NO built-in search) */}
      <div className={styles.filterRow}>
        <FilterBar.Root>
          {['running', 'stopped', 'paused', 'exited'].map(status => (
            <FilterBar.Chip
              key={status}
              active={statusFilter === status}
              onClick={() => setStatusFilter(statusFilter === status ? null : status)}
            >
              {status}
            </FilterBar.Chip>
          ))}
          {statusFilter && <FilterBar.Clear onClick={() => setStatusFilter(null)} />}
        </FilterBar.Root>
        <SearchInput
          placeholder="Search by name or image..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
      </div>

      <DataTable.Root table={table}>
        <DataTable.Container>
          <DataTable.Header />
          <DataTable.VirtualBody
            estimateRowSize={48}
            overscan={5}
          />
        </DataTable.Container>
      </DataTable.Root>

      {/* Bulk action toolbar — show when rows selected */}
      {selectedCount > 0 && (
        <Toolbar.Root className={styles.bulkBar}>
          <Toolbar.Group>
            <span>{selectedCount} selected</span>
            <Button variant="soft" color="success" size="sm" onClick={() => toast(`Started ${selectedCount} containers`, { severity: 'success' })}>
              <LuPlay /> Start
            </Button>
            <Button variant="soft" color="neutral" size="sm" onClick={() => toast(`Stopped ${selectedCount} containers`, { severity: 'info' })}>
              <LuSquare /> Stop
            </Button>
            <Button variant="soft" color="danger" size="sm" onClick={() => toast(`Deleted ${selectedCount} containers`, { severity: 'success' })}>
              <LuTrash2 /> Delete
            </Button>
          </Toolbar.Group>
        </Toolbar.Root>
      )}
    </div>
  );
}
```

**CRITICAL:**
- `DataTable.VirtualBody` takes `estimateRowSize` (number) and `overscan` — NOT `estimateSize` (function) or `onRowClick`.
- Row click handling: `DataTable.VirtualBody` has NO `onRowClick` prop. Attach click handlers via TanStack Table's row model — either add an `onClick` handler in a wrapper, or use a custom cell renderer that makes the name cell clickable.
- `FilterBar` has NO built-in search input. Compose a `SearchInput` alongside `FilterBar.Chip` elements for status filtering.
- Use `Button` (not just `IconButton`) for bulk action text buttons to match the spec.

- [ ] **Step 2: Create main component with list/detail routing**

```tsx
// apps/showcase/src/demos/container-management/index.tsx
import '@omniviewdev/editors/styles.css';

import { useState } from 'react';
import { StatusBar } from '@omniviewdev/base-ui';
import { ContainerList } from './components/ContainerList';
// import { ContainerDetail } from './components/ContainerDetail'; // Task 12
import { containers, clusterStats } from './data';
import type { Container } from './types';
import styles from './index.module.css';

export default function ContainerManagement() {
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

  return (
    <div className={styles.container}>
      {selectedContainer ? (
        <div>Detail view placeholder — {selectedContainer.name}</div>
        // <ContainerDetail container={selectedContainer} onBack={() => setSelectedContainer(null)} />
      ) : (
        <ContainerList containers={containers} onSelectContainer={setSelectedContainer} />
      )}
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Item>RAM {clusterStats.totalMemory}</StatusBar.Item>
          <StatusBar.Item>CPU {clusterStats.totalCpu}</StatusBar.Item>
          <StatusBar.Item>Disk {clusterStats.totalDisk}</StatusBar.Item>
        </StatusBar.Section>
      </StatusBar>
    </div>
  );
}
```

- [ ] **Step 3: Create CSS modules**

```css
/* apps/showcase/src/demos/container-management/index.module.css */
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
```

- [ ] **Step 4: Verify build and visual check**

```bash
cd apps/showcase && pnpm exec tsc --noEmit && pnpm dev
```

Verify: filter bar at top, DataTable with 50 rows, sortable columns, StatusDot and Badge in status column, Meter in CPU column, row action buttons, bulk action bar when rows are selected, status bar at bottom.

- [ ] **Step 5: Commit**

```bash
git add apps/showcase/src/demos/container-management/
git commit -m "feat(container-mgmt): list view with DataTable, filtering, bulk actions"
```

---

### Task 12: Container Management — Detail View

**Files:**
- Create: `apps/showcase/src/demos/container-management/components/ContainerDetail.tsx`
- Create: `apps/showcase/src/demos/container-management/components/ContainerDetail.module.css`
- Create: `apps/showcase/src/demos/container-management/components/tabs/LogsTab.tsx`
- Create: `apps/showcase/src/demos/container-management/components/tabs/InspectTab.tsx`
- Create: `apps/showcase/src/demos/container-management/components/tabs/StatsTab.tsx`
- Create: `apps/showcase/src/demos/container-management/components/tabs/FilesTab.tsx`
- Modify: `apps/showcase/src/demos/container-management/index.tsx` — uncomment detail view

**Before starting:** Read `Tabs` source for exact compound API. Read `Terminal`, `ObjectInspector`, `DescriptionList`, `TreeList`, `Card.Stat`, `Meter`, `Breadcrumbs`, `Typography.Heading`, `Typography.Code` source.

- [ ] **Step 1: Create ContainerDetail layout**

```tsx
// apps/showcase/src/demos/container-management/components/ContainerDetail.tsx
import { useMemo } from 'react';
import {
  Breadcrumbs, IconButton, Typography, StatusDot, Badge,
  Tabs, Toolbar, useToast, statusToColor,
} from '@omniviewdev/base-ui';
import { LuArrowLeft, LuPlay, LuSquare, LuRotateCw, LuTrash2 } from 'react-icons/lu';
import { getContainerDetail } from '../data';
import type { Container } from '../types';
import { LogsTab } from './tabs/LogsTab';
import { InspectTab } from './tabs/InspectTab';
import { StatsTab } from './tabs/StatsTab';
import { FilesTab } from './tabs/FilesTab';
import styles from './ContainerDetail.module.css';

interface ContainerDetailProps {
  container: Container;
  onBack: () => void;
}

export function ContainerDetail({ container, onBack }: ContainerDetailProps) {
  const { toast } = useToast();
  const detail = useMemo(() => getContainerDetail(container), [container]);

  return (
    <div className={styles.detail}>
      {/* Header */}
      <div className={styles.header}>
        <Breadcrumbs>
          <Breadcrumbs.Item onClick={onBack}>Containers</Breadcrumbs.Item>
          <Breadcrumbs.Item>{container.name}</Breadcrumbs.Item>
        </Breadcrumbs>
        <div className={styles.headerRow}>
          <IconButton variant="ghost" color="neutral" size="sm" aria-label="Back" onClick={onBack}>
            <LuArrowLeft />
          </IconButton>
          <Typography.Heading level={3}>{container.name}</Typography.Heading>
          <Typography.Code>{container.id}</Typography.Code>
          <Typography.Code>{container.image}</Typography.Code>
          {container.ports.map(p => (
            <Typography.Code key={`${p.host}:${p.container}`}>
              {p.host}:{p.container}
            </Typography.Code>
          ))}
          <StatusDot color={statusToColor(container.status)} />
          <Badge color={statusToColor(container.status)}>{container.status}</Badge>
          <Toolbar.Root>
            <Toolbar.Group>
              <IconButton variant="ghost" color="neutral" size="sm" aria-label="Stop" onClick={() => toast('Stopped', { severity: 'info' })}>
                <LuSquare />
              </IconButton>
              <IconButton variant="ghost" color="neutral" size="sm" aria-label="Restart" onClick={() => toast('Restarting', { severity: 'info' })}>
                <LuRotateCw />
              </IconButton>
              <IconButton variant="ghost" color="success" size="sm" aria-label="Start" onClick={() => toast('Started', { severity: 'success' })}>
                <LuPlay />
              </IconButton>
              <IconButton variant="ghost" color="danger" size="sm" aria-label="Delete" onClick={() => toast('Deleted', { severity: 'success' })}>
                <LuTrash2 />
              </IconButton>
            </Toolbar.Group>
          </Toolbar.Root>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="logs">
        <Tabs.List>
          <Tabs.Tab value="logs">Logs</Tabs.Tab>
          <Tabs.Tab value="inspect">Inspect</Tabs.Tab>
          <Tabs.Tab value="stats">Stats</Tabs.Tab>
          <Tabs.Tab value="files">Files</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="logs"><LogsTab logs={detail.logs} /></Tabs.Panel>
        <Tabs.Panel value="inspect"><InspectTab container={container} config={detail.config} /></Tabs.Panel>
        <Tabs.Panel value="stats"><StatsTab stats={detail.stats} container={container} /></Tabs.Panel>
        <Tabs.Panel value="files"><FilesTab filesystem={detail.filesystem} /></Tabs.Panel>
      </Tabs.Root>
    </div>
  );
}
```

**Important:** Verify Tabs compound API — `Tabs.Root` may use `defaultValue` or `value`/`onValueChange`. Verify `Breadcrumbs.Item` exists as sub-component.

- [ ] **Step 2: Create LogsTab**

```tsx
// apps/showcase/src/demos/container-management/components/tabs/LogsTab.tsx
import { useRef } from 'react';
import { Terminal } from '@omniviewdev/editors';
import type { TerminalHandle } from '@omniviewdev/editors';

interface LogsTabProps {
  logs: string;
}

export function LogsTab({ logs }: LogsTabProps) {
  const terminalRef = useRef<TerminalHandle>(null);

  return (
    <div style={{ height: '100%' }}>
      <Terminal ref={terminalRef} onReady={() => terminalRef.current?.write(logs)} />
    </div>
  );
}
```

**Important:** Terminal has NO `initialContent` or `content` prop — it's xterm.js-based. Use a `ref` with `TerminalHandle` and write content in the `onReady` callback.

- [ ] **Step 3: Create InspectTab**

```tsx
// apps/showcase/src/demos/container-management/components/tabs/InspectTab.tsx
import { DescriptionList } from '@omniviewdev/base-ui';
import { ObjectInspector } from '@omniviewdev/editors';
import type { Container } from '../../types';

interface InspectTabProps {
  container: Container;
  config: Record<string, unknown>;
}

export function InspectTab({ container, config }: InspectTabProps) {
  return (
    <div>
      <DescriptionList>
        <DescriptionList.Item label="Name">{container.name}</DescriptionList.Item>
        <DescriptionList.Item label="Image">{container.image}</DescriptionList.Item>
        <DescriptionList.Item label="Status">{container.status}</DescriptionList.Item>
        <DescriptionList.Item label="Created">{container.created}</DescriptionList.Item>
        <DescriptionList.Item label="Uptime">{container.uptime}</DescriptionList.Item>
      </DescriptionList>
      <ObjectInspector data={config} /* read source for exact prop name */ />
    </div>
  );
}
```

- [ ] **Step 4: Create StatsTab**

```tsx
// apps/showcase/src/demos/container-management/components/tabs/StatsTab.tsx
import { Card, Meter } from '@omniviewdev/base-ui';
import type { Container, ContainerStats } from '../../types';

interface StatsTabProps {
  stats: ContainerStats;
  container: Container;
}

export function StatsTab({ stats, container }: StatsTabProps) {
  return (
    <Card.Group columns={2}>
      <Card size="sm">
        <Card.Header><Card.Title>CPU Usage</Card.Title></Card.Header>
        <Card.Body>
          <Card.Stat>{container.cpu}%</Card.Stat>
          <Meter value={container.cpu} max={100} />
        </Card.Body>
      </Card>
      <Card size="sm">
        <Card.Header><Card.Title>Memory</Card.Title></Card.Header>
        <Card.Body>
          <Card.Stat>{container.memory} / {container.memoryLimit} MB</Card.Stat>
          <Meter value={container.memory} max={container.memoryLimit} />
        </Card.Body>
      </Card>
      <Card size="sm">
        <Card.Header><Card.Title>Network I/O</Card.Title></Card.Header>
        <Card.Body>
          <Card.KeyValue label="Received">↓ {stats.networkRx}</Card.KeyValue>
          <Card.KeyValue label="Transmitted">↑ {stats.networkTx}</Card.KeyValue>
        </Card.Body>
      </Card>
      <Card size="sm">
        <Card.Header><Card.Title>Disk I/O</Card.Title></Card.Header>
        <Card.Body>
          <Card.KeyValue label="Read">R: {stats.diskRead}</Card.KeyValue>
          <Card.KeyValue label="Write">W: {stats.diskWrite}</Card.KeyValue>
        </Card.Body>
      </Card>
    </Card.Group>
  );
}
```

**Important:** `Card.Stat` takes `children` (NOT `value`/`label` props). For label+value pairs, use `Card.KeyValue` which has a `label` prop. Both render as `<div>` with appropriate styling.

- [ ] **Step 5: Create FilesTab**

```tsx
// apps/showcase/src/demos/container-management/components/tabs/FilesTab.tsx
import { TreeList } from '@omniviewdev/base-ui';
import { LuFolder, LuFile } from 'react-icons/lu';
import type { FileSystemNode } from '../../types';

interface FilesTabProps {
  filesystem: FileSystemNode[];
}

export function FilesTab({ filesystem }: FilesTabProps) {
  return (
    <TreeList
      items={filesystem}
      itemKey={(item) => item.id}
      getChildren={(item) => item.children}
      renderItem={(item) => (
        <span>
          {item.type === 'directory' ? <LuFolder /> : <LuFile />} {item.name}
          {item.size != null && <span style={{ opacity: 0.5, marginLeft: 8 }}>{item.size} B</span>}
        </span>
      )}
      selectionMode="single"
    />
  );
}
```

- [ ] **Step 6: Wire detail view into main component**

Uncomment the `ContainerDetail` import and usage in `index.tsx`.

- [ ] **Step 7: Verify build and visual check**

```bash
cd apps/showcase && pnpm exec tsc --noEmit && pnpm dev
```

Verify: clicking a container row shows detail view with breadcrumbs, header info, action buttons, and 4 tabs (Logs with Terminal, Inspect with DescriptionList + ObjectInspector, Stats with Card grid + Meters, Files with TreeList). Back button returns to list view.

- [ ] **Step 8: Commit**

```bash
git add apps/showcase/src/demos/container-management/
git commit -m "feat(container-mgmt): detail view with logs, inspect, stats, files tabs"
```

---

## Final Verification

### Task 13: Cross-Demo Verification & Cleanup

**Files:**
- No new files — verification and cleanup only

- [ ] **Step 1: Full build check**

```bash
cd /Users/joshuapare/Repos/omniviewdev/ui/feat/demos && pnpm build
```

Expected: all packages and showcase app build successfully.

- [ ] **Step 2: Type check**

```bash
cd apps/showcase && pnpm exec tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 3: Visual verification of all 4 demos**

```bash
cd apps/showcase && pnpm dev
```

Test each demo in the browser:

1. **File Explorer:** Expand/collapse trees, click files for detail panel, use toolbar actions, right-click context menu, search filtering, verify toasts fire
2. **IDE Editor:** Switch sidebar panels, click files to open tabs, switch tabs, verify CodeEditor/DiffViewer/MarkdownPreview render correctly, toggle terminal, open command palette (Ctrl+K)
3. **AI Chat:** Scroll through pre-built messages, navigate branch alternatives, click a suggestion to trigger scripted replay, verify streaming animation sequence, artifact panel opens, follow-ups appear
4. **Container Management:** Sort columns, filter by status, search, select rows for bulk actions, click a row for detail view, switch tabs (logs/inspect/stats/files), verify back navigation

- [ ] **Step 4: Note any gaps discovered during implementation**

If any component API didn't work as expected, or composability issues were found, add them to a `GAPS.md` file in the showcase app:

```bash
# Only if gaps were found
cat > apps/showcase/GAPS.md << 'EOF'
# Component Library Gaps Discovered During Showcase Implementation

<!-- Add entries here as they are discovered -->
EOF
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete all 4 showcase demos — file explorer, IDE, AI chat, containers"
```
