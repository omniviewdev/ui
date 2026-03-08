import { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  LuFolder,
  LuFolderOpen,
  LuFile,
  LuFileCode,
  LuFileText,
  LuFileJson,
  LuBox,
  LuBraces,
  LuHash,
  LuType,
  LuChevronRight,
} from 'react-icons/lu';
import { TreeList } from './TreeList';
import { SearchInput } from '../search-input';
import type { Key } from './types';

// ---------------------------------------------------------------------------
// Shared types and data
// ---------------------------------------------------------------------------

interface FileItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  status?: 'A' | 'M' | 'D' | 'R';
  permissions?: string;
  size?: string;
  linkTarget?: string;
  children?: FileItem[];
}

const fileExplorerData: FileItem[] = [
  {
    path: '/src',
    name: 'src',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    children: [
      {
        path: '/src/components',
        name: 'components',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        children: [
          { path: '/src/components/App.tsx', name: 'App.tsx', type: 'file', status: 'M', permissions: '-rw-r--r--', size: '2.4 KB' },
          { path: '/src/components/Header.tsx', name: 'Header.tsx', type: 'file', status: 'A', permissions: '-rw-r--r--', size: '1.1 KB' },
          { path: '/src/components/Footer.tsx', name: 'Footer.tsx', type: 'file', permissions: '-rw-r--r--', size: '0.8 KB' },
          { path: '/src/components/Sidebar.tsx', name: 'Sidebar.tsx', type: 'file', status: 'M', permissions: '-rw-r--r--', size: '3.2 KB' },
        ],
      },
      {
        path: '/src/hooks',
        name: 'hooks',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        children: [
          { path: '/src/hooks/useAuth.ts', name: 'useAuth.ts', type: 'file', permissions: '-rw-r--r--', size: '1.8 KB' },
          { path: '/src/hooks/useTheme.ts', name: 'useTheme.ts', type: 'file', status: 'A', permissions: '-rw-r--r--', size: '0.9 KB' },
        ],
      },
      {
        path: '/src/utils',
        name: 'utils',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        children: [
          { path: '/src/utils/api.ts', name: 'api.ts', type: 'file', permissions: '-rw-r--r--', size: '4.1 KB' },
          { path: '/src/utils/helpers.ts', name: 'helpers.ts', type: 'file', status: 'D', permissions: '-rw-r--r--', size: '0.5 KB' },
        ],
      },
      { path: '/src/index.ts', name: 'index.ts', type: 'file', status: 'M', permissions: '-rw-r--r--', size: '0.3 KB' },
      { path: '/src/types.ts', name: 'types.ts', type: 'file', permissions: '-rw-r--r--', size: '1.2 KB' },
    ],
  },
  {
    path: '/public',
    name: 'public',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    children: [
      { path: '/public/index.html', name: 'index.html', type: 'file', permissions: '-rw-r--r--', size: '0.5 KB' },
      { path: '/public/favicon.ico', name: 'favicon.ico', type: 'file', permissions: '-rw-r--r--', size: '4.2 KB' },
    ],
  },
  { path: '/package.json', name: 'package.json', type: 'file', status: 'M', permissions: '-rw-r--r--', size: '1.8 KB' },
  { path: '/tsconfig.json', name: 'tsconfig.json', type: 'file', permissions: '-rw-r--r--', size: '0.6 KB' },
  { path: '/README.md', name: 'README.md', type: 'file', status: 'M', permissions: '-rw-r--r--', size: '2.1 KB', linkTarget: undefined },
];

function getFileIcon(item: FileItem, isExpanded: boolean) {
  if (item.type === 'directory') {
    return isExpanded ? <LuFolderOpen /> : <LuFolder />;
  }
  if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) return <LuFileCode />;
  if (item.name.endsWith('.json')) return <LuFileJson />;
  if (item.name.endsWith('.md') || item.name.endsWith('.html')) return <LuFileText />;
  return <LuFile />;
}

const statusColor: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  A: 'success',
  M: 'warning',
  D: 'danger',
  R: 'info',
};

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

interface PlaygroundArgs {
  size: 'sm' | 'md' | 'lg';
  density: 'compact' | 'default' | 'comfortable';
  selectionMode: 'none' | 'single' | 'multiple';
  selectionBehavior: 'replace' | 'toggle';
  loopFocus: boolean;
  typeahead: boolean;
  indentation: number;
  showBranchConnectors: boolean;
}

const meta: Meta<PlaygroundArgs> = {
  title: 'Lists/TreeList',
  tags: ['autodocs'],
  args: {
    size: 'md',
    density: 'default',
    selectionMode: 'single',
    selectionBehavior: 'replace',
    loopFocus: false,
    typeahead: true,
    indentation: 16,
    showBranchConnectors: false,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Controls the overall size of tree items (font size, icon size, spacing).',
      table: { defaultValue: { summary: 'md' } },
    },
    density: {
      control: 'inline-radio',
      options: ['compact', 'default', 'comfortable'],
      description: 'Controls vertical density — how tightly items are packed.',
      table: { defaultValue: { summary: 'default' } },
    },
    selectionMode: {
      control: 'inline-radio',
      options: ['none', 'single', 'multiple'],
      description: 'Whether items are selectable and how many can be selected at once.',
      table: { defaultValue: { summary: 'single' } },
    },
    selectionBehavior: {
      control: 'inline-radio',
      options: ['replace', 'toggle'],
      description: 'Whether clicking an item replaces the selection or toggles it.',
      table: { defaultValue: { summary: 'replace' } },
    },
    loopFocus: {
      control: 'boolean',
      description: 'Whether keyboard navigation wraps around from the last item to the first.',
      table: { defaultValue: { summary: 'false' } },
    },
    typeahead: {
      control: 'boolean',
      description: 'Whether typing characters focuses the matching item via typeahead search.',
      table: { defaultValue: { summary: 'true' } },
    },
    indentation: {
      control: { type: 'range', min: 8, max: 32, step: 2 },
      description: 'Pixels of indentation per depth level.',
      table: { defaultValue: { summary: '16' } },
    },
    showBranchConnectors: {
      control: 'boolean',
      description: 'Show vertical connector lines from branches to children.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  parameters: {
    controls: {
      include: ['size', 'density', 'selectionMode', 'selectionBehavior', 'loopFocus', 'typeahead', 'indentation', 'showBranchConnectors'],
    },
  },
};

export default meta;

type Story = StoryObj<PlaygroundArgs>;

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `<TreeList.Root
  items={treeData}
  itemKey={(item) => item.path}
  getChildren={(item) => item.children}
  isBranch={(item) => item.type === 'directory'}
  getTextValue={(item) => item.name}
  selectionMode="single"
  defaultExpandedKeys={new Set(['/src'])}
  renderItem={(item, node) => (
    <TreeList.Item itemKey={node.key} textValue={item.name}>
      <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
      <TreeList.ItemToggle itemKey={node.key} />
      <TreeList.ItemIcon>{getIcon(item, node.isExpanded)}</TreeList.ItemIcon>
      <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
      {item.status && <TreeList.ItemBadge color="warning">{item.status}</TreeList.ItemBadge>}
    </TreeList.Item>
  )}
>
  <TreeList.Viewport />
</TreeList.Root>`,
      },
    },
  },
  render: ({ size, density, selectionMode, selectionBehavior, loopFocus, typeahead, indentation, showBranchConnectors }) => (
    <TreeList.Root
      items={fileExplorerData}
      itemKey={(item) => item.path}
      getChildren={(item) => item.children}
      isBranch={(item) => item.type === 'directory'}
      getTextValue={(item) => item.name}
      defaultExpandedKeys={new Set(['/src', '/src/components'])}
      renderItem={(item, node) => (
        <TreeList.Item itemKey={node.key} textValue={item.name}>
          <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
          <TreeList.ItemToggle itemKey={node.key} />
          <TreeList.ItemIcon>{getFileIcon(item, node.isExpanded)}</TreeList.ItemIcon>
          <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          {item.status && (
            <TreeList.ItemBadge color={statusColor[item.status]}>{item.status}</TreeList.ItemBadge>
          )}
        </TreeList.Item>
      )}
      style={{ width: 400, maxHeight: 500 }}
      size={size}
      density={density}
      selectionMode={selectionMode}
      selectionBehavior={selectionBehavior}
      loopFocus={loopFocus}
      typeahead={typeahead}
      indentation={indentation}
      showBranchConnectors={showBranchConnectors}
    >
      <TreeList.Viewport />
    </TreeList.Root>
  ),
};

// ---------------------------------------------------------------------------
// 1. FileExplorer
// ---------------------------------------------------------------------------

function FileExplorerStory() {
  const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set());

  return (
    <TreeList.Root
      items={fileExplorerData}
      itemKey={(item) => item.path}
      getChildren={(item) => item.children}
      isBranch={(item) => item.type === 'directory'}
      getTextValue={(item) => item.name}
      selectionMode="single"
      selectedKeys={selected}
      onSelectedKeysChange={setSelected}
      defaultExpandedKeys={new Set(['/src', '/src/components'])}
      renderItem={(item, node) => (
        <TreeList.Item itemKey={node.key} textValue={item.name}>
          <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
          <TreeList.ItemToggle itemKey={node.key} />
          <TreeList.ItemIcon>{getFileIcon(item, node.isExpanded)}</TreeList.ItemIcon>
          <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          {item.status && (
            <TreeList.ItemBadge color={statusColor[item.status]}>{item.status}</TreeList.ItemBadge>
          )}
          {item.permissions && <TreeList.ItemMeta>{item.permissions}</TreeList.ItemMeta>}
          {item.size && <TreeList.ItemMeta>{item.size}</TreeList.ItemMeta>}
        </TreeList.Item>
      )}
      style={{ width: 560, maxHeight: 500 }}
    >
      <TreeList.Viewport />
    </TreeList.Root>
  );
}

export const FileExplorer: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<TreeList.Root
  items={fileData}
  itemKey={(item) => item.path}
  getChildren={(item) => item.children}
  isBranch={(item) => item.type === 'directory'}
  getTextValue={(item) => item.name}
  selectionMode="single"
  defaultExpandedKeys={new Set(['/src', '/src/components'])}
  renderItem={(item, node) => (
    <TreeList.Item itemKey={node.key} textValue={item.name}>
      <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
      <TreeList.ItemToggle itemKey={node.key} />
      <TreeList.ItemIcon>{getIcon(item, node.isExpanded)}</TreeList.ItemIcon>
      <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
      {item.status && <TreeList.ItemBadge color={statusColor[item.status]}>{item.status}</TreeList.ItemBadge>}
      {item.permissions && <TreeList.ItemMeta>{item.permissions}</TreeList.ItemMeta>}
      {item.size && <TreeList.ItemMeta>{item.size}</TreeList.ItemMeta>}
    </TreeList.Item>
  )}
>
  <TreeList.Viewport />
</TreeList.Root>`,
      },
    },
  },
  render: () => <FileExplorerStory />,
};

// ---------------------------------------------------------------------------
// 2. AsyncLoading
// ---------------------------------------------------------------------------

interface LazyFolder {
  id: string;
  name: string;
  type: 'file' | 'directory';
  children?: LazyFolder[];
}

function AsyncLoadingStory() {
  const [items, setItems] = useState<LazyFolder[]>([
    { id: 'root-1', name: 'Documents', type: 'directory', children: [] },
    { id: 'root-2', name: 'Downloads', type: 'directory', children: [] },
    { id: 'root-3', name: 'notes.txt', type: 'file' },
  ]);

  const loadChildren = useCallback(async (key: Key) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const fakeChildren: LazyFolder[] = [
      { id: `${key}/file-1`, name: `report-${Math.random().toString(36).slice(2, 6)}.pdf`, type: 'file' },
      { id: `${key}/file-2`, name: `notes-${Math.random().toString(36).slice(2, 6)}.md`, type: 'file' },
      { id: `${key}/sub`, name: 'Subfolder', type: 'directory', children: [] },
    ];

    setItems((prev) => {
      function addChildren(nodes: LazyFolder[]): LazyFolder[] {
        return nodes.map((node) => {
          if (node.id === key) {
            return { ...node, children: fakeChildren };
          }
          if (node.children) {
            return { ...node, children: addChildren(node.children) };
          }
          return node;
        });
      }
      return addChildren(prev);
    });
  }, []);

  return (
    <div>
      <p style={{ marginBottom: 8, color: 'var(--ov-color-fg-subtle)', fontSize: 'var(--ov-font-size-caption)' }}>
        Click a folder arrow to load children (simulated 1s delay).
      </p>
      <TreeList.Root
        items={items}
        itemKey={(item) => item.id}
        getChildren={(item) => item.children}
        isBranch={(item) => item.type === 'directory'}
        getTextValue={(item) => item.name}
        loadChildren={loadChildren}
        selectionMode="single"
        renderItem={(item, node) => (
          <TreeList.Item itemKey={node.key} textValue={item.name}>
            <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
            <TreeList.ItemToggle itemKey={node.key} />
            <TreeList.ItemIcon>
              {item.type === 'directory'
                ? (node.isExpanded ? <LuFolderOpen /> : <LuFolder />)
                : <LuFile />}
            </TreeList.ItemIcon>
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          </TreeList.Item>
        )}
        style={{ width: 400, maxHeight: 400 }}
      >
        <TreeList.Viewport />
      </TreeList.Root>
    </div>
  );
}

export const AsyncLoading: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `function AsyncLoadingExample() {
  const [items, setItems] = useState(initialItems);

  const loadChildren = useCallback(async (key: Key) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setItems((prev) => addChildrenToNode(prev, key, fakeChildren));
  }, []);

  return (
    <TreeList.Root
      items={items}
      itemKey={(item) => item.id}
      getChildren={(item) => item.children}
      isBranch={(item) => item.type === 'directory'}
      loadChildren={loadChildren}
      selectionMode="single"
      renderItem={(item, node) => (
        <TreeList.Item itemKey={node.key} textValue={item.name}>
          <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
          <TreeList.ItemToggle itemKey={node.key} />
          <TreeList.ItemIcon>{getIcon(item)}</TreeList.ItemIcon>
          <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
        </TreeList.Item>
      )}
    >
      <TreeList.Viewport />
    </TreeList.Root>
  );
}`,
      },
    },
  },
  render: () => <AsyncLoadingStory />,
};

// ---------------------------------------------------------------------------
// 3. LargeTree (virtualized)
// ---------------------------------------------------------------------------

interface GeneratedNode {
  id: string;
  name: string;
  depth: number;
  children?: GeneratedNode[];
}

function generateTree(
  prefix: string,
  depth: number,
  breadth: number,
  maxDepth: number,
): GeneratedNode[] {
  if (depth > maxDepth) return [];
  return Array.from({ length: breadth }, (_, i) => {
    const id = `${prefix}/${i}`;
    const isDir = depth < maxDepth;
    return {
      id,
      name: isDir ? `folder-${i}` : `file-${i}.ts`,
      depth,
      children: isDir ? generateTree(id, depth + 1, breadth, maxDepth) : undefined,
    };
  });
}

// 5^5 = 3125 directories + leaves = ~15k nodes total
const largeTreeData = generateTree('root', 0, 5, 4);

function countNodes(items: GeneratedNode[]): number {
  let count = 0;
  for (const item of items) {
    count += 1;
    if (item.children) count += countNodes(item.children);
  }
  return count;
}

const totalNodeCount = countNodes(largeTreeData);

function LargeTreeStory() {
  const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set());

  return (
    <div>
      <p style={{ marginBottom: 8, color: 'var(--ov-color-fg-subtle)', fontSize: 'var(--ov-font-size-caption)' }}>
        {totalNodeCount.toLocaleString()} total nodes. Virtualized. Selected: {selected.size}
      </p>
      <TreeList.Root
        items={largeTreeData}
        itemKey={(item) => item.id}
        getChildren={(item) => item.children}
        isBranch={(item) => item.children !== undefined}
        getTextValue={(item) => item.name}
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        defaultExpandedKeys={new Set(['root/0', 'root/0/0'])}
        virtualized
        renderItem={(item, node) => (
          <TreeList.Item itemKey={node.key} textValue={item.name}>
            <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
            <TreeList.ItemToggle itemKey={node.key} />
            <TreeList.ItemIcon>
              {item.children !== undefined
                ? (node.isExpanded ? <LuFolderOpen /> : <LuFolder />)
                : <LuFileCode />}
            </TreeList.ItemIcon>
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          </TreeList.Item>
        )}
        style={{ width: 400, height: 500 }}
      >
        <TreeList.Viewport />
      </TreeList.Root>
    </div>
  );
}

export const LargeTree: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<TreeList.Root
  items={largeTreeData}
  itemKey={(item) => item.id}
  getChildren={(item) => item.children}
  isBranch={(item) => item.children !== undefined}
  selectionMode="multiple"
  virtualized
  renderItem={(item, node) => (
    <TreeList.Item itemKey={node.key} textValue={item.name}>
      <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
      <TreeList.ItemToggle itemKey={node.key} />
      <TreeList.ItemIcon>{getIcon(item)}</TreeList.ItemIcon>
      <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
    </TreeList.Item>
  )}
  style={{ height: 500 }}
>
  <TreeList.Viewport />
</TreeList.Root>`,
      },
    },
  },
  render: () => <LargeTreeStory />,
};

// ---------------------------------------------------------------------------
// 4. SymbolOutline
// ---------------------------------------------------------------------------

interface SymbolItem {
  id: string;
  name: string;
  kind: 'class' | 'method' | 'property' | 'interface' | 'function' | 'type';
  children?: SymbolItem[];
}

const symbolData: SymbolItem[] = [
  {
    id: 'TreeList',
    name: 'TreeList',
    kind: 'class',
    children: [
      { id: 'TreeList.items', name: 'items', kind: 'property' },
      { id: 'TreeList.expandedKeys', name: 'expandedKeys', kind: 'property' },
      { id: 'TreeList.render', name: 'render()', kind: 'method' },
      { id: 'TreeList.handleKeyDown', name: 'handleKeyDown()', kind: 'method' },
    ],
  },
  {
    id: 'TreeStore',
    name: 'TreeStore',
    kind: 'interface',
    children: [
      { id: 'TreeStore.subscribe', name: 'subscribe()', kind: 'method' },
      { id: 'TreeStore.getSnapshot', name: 'getSnapshot()', kind: 'method' },
      { id: 'TreeStore.getItemState', name: 'getItemState()', kind: 'method' },
    ],
  },
  {
    id: 'useTreeFlattener',
    name: 'useTreeFlattener()',
    kind: 'function',
  },
  {
    id: 'FlatNode',
    name: 'FlatNode',
    kind: 'type',
    children: [
      { id: 'FlatNode.key', name: 'key', kind: 'property' },
      { id: 'FlatNode.depth', name: 'depth', kind: 'property' },
      { id: 'FlatNode.isBranch', name: 'isBranch', kind: 'property' },
    ],
  },
];

function getSymbolIcon(kind: SymbolItem['kind']) {
  switch (kind) {
    case 'class': return <LuBox />;
    case 'interface': return <LuBraces />;
    case 'method': return <LuHash />;
    case 'function': return <LuHash />;
    case 'property': return <LuChevronRight />;
    case 'type': return <LuType />;
  }
}

function SymbolOutlineStory() {
  return (
    <TreeList.Root
      items={symbolData}
      itemKey={(item) => item.id}
      getChildren={(item) => item.children}
      isBranch={(item) => item.children !== undefined}
      getTextValue={(item) => item.name}
      selectionMode="single"
      defaultExpandedKeys={new Set(['TreeList', 'TreeStore'])}
      density="compact"
      renderItem={(item, node) => (
        <TreeList.Item itemKey={node.key} textValue={item.name}>
          <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
          <TreeList.ItemToggle itemKey={node.key} />
          <TreeList.ItemIcon>{getSymbolIcon(item.kind)}</TreeList.ItemIcon>
          <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          <TreeList.ItemMeta>{item.kind}</TreeList.ItemMeta>
        </TreeList.Item>
      )}
      style={{ width: 360, maxHeight: 400 }}
    >
      <TreeList.Viewport />
    </TreeList.Root>
  );
}

export const SymbolOutline: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<TreeList.Root
  items={symbolData}
  itemKey={(item) => item.id}
  getChildren={(item) => item.children}
  isBranch={(item) => item.children !== undefined}
  selectionMode="single"
  defaultExpandedKeys={new Set(['TreeList', 'TreeStore'])}
  density="compact"
  renderItem={(item, node) => (
    <TreeList.Item itemKey={node.key} textValue={item.name}>
      <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
      <TreeList.ItemToggle itemKey={node.key} />
      <TreeList.ItemIcon>{getSymbolIcon(item.kind)}</TreeList.ItemIcon>
      <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
      <TreeList.ItemMeta>{item.kind}</TreeList.ItemMeta>
    </TreeList.Item>
  )}
>
  <TreeList.Viewport />
</TreeList.Root>`,
      },
    },
  },
  render: () => <SymbolOutlineStory />,
};

// ---------------------------------------------------------------------------
// 5. MultiSelect
// ---------------------------------------------------------------------------

function MultiSelectStory() {
  const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set());

  return (
    <div>
      <p style={{ marginBottom: 8, color: 'var(--ov-color-fg-subtle)', fontSize: 'var(--ov-font-size-caption)' }}>
        Ctrl+click to toggle. Shift+click for range. Ctrl+A to select all visible.
      </p>
      <TreeList.Root
        items={fileExplorerData}
        itemKey={(item) => item.path}
        getChildren={(item) => item.children}
        isBranch={(item) => item.type === 'directory'}
        getTextValue={(item) => item.name}
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        defaultExpandedKeys={new Set(['/src', '/src/components'])}
        renderItem={(item, node) => (
          <TreeList.Item itemKey={node.key} textValue={item.name}>
            <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
            <TreeList.ItemToggle itemKey={node.key} />
            <TreeList.ItemIcon>{getFileIcon(item, node.isExpanded)}</TreeList.ItemIcon>
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          </TreeList.Item>
        )}
        style={{ width: 400, maxHeight: 400 }}
      >
        <TreeList.Viewport />
      </TreeList.Root>
      <p style={{ marginTop: 8, color: 'var(--ov-color-fg-subtle)', fontSize: 'var(--ov-font-size-caption)' }}>
        Selected: {selected.size === 0 ? 'none' : [...selected].join(', ')}
      </p>
    </div>
  );
}

export const MultiSelect: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<TreeList.Root
  items={fileData}
  itemKey={(item) => item.path}
  getChildren={(item) => item.children}
  isBranch={(item) => item.type === 'directory'}
  selectionMode="multiple"
  selectedKeys={selected}
  onSelectedKeysChange={setSelected}
  renderItem={(item, node) => (
    <TreeList.Item itemKey={node.key} textValue={item.name}>
      <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
      <TreeList.ItemToggle itemKey={node.key} />
      <TreeList.ItemIcon>{getIcon(item)}</TreeList.ItemIcon>
      <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
    </TreeList.Item>
  )}
>
  <TreeList.Viewport />
</TreeList.Root>`,
      },
    },
  },
  render: () => <MultiSelectStory />,
};

// ---------------------------------------------------------------------------
// 6. WithBranchConnectors
// ---------------------------------------------------------------------------

export const WithBranchConnectors: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<TreeList.Root
  items={fileData}
  itemKey={(item) => item.path}
  getChildren={(item) => item.children}
  isBranch={(item) => item.type === 'directory'}
  selectionMode="single"
  showBranchConnectors
  renderItem={(item, node) => (
    <TreeList.Item itemKey={node.key} textValue={item.name}>
      <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
      <TreeList.ItemToggle itemKey={node.key} />
      <TreeList.ItemIcon>{getIcon(item)}</TreeList.ItemIcon>
      <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
    </TreeList.Item>
  )}
>
  <TreeList.Viewport />
</TreeList.Root>`,
      },
    },
  },
  render: () => (
    <TreeList.Root
      items={fileExplorerData}
      itemKey={(item) => item.path}
      getChildren={(item) => item.children}
      isBranch={(item) => item.type === 'directory'}
      getTextValue={(item) => item.name}
      selectionMode="single"
      defaultExpandedKeys={new Set(['/src', '/src/components', '/src/hooks'])}
      showBranchConnectors
      renderItem={(item, node) => (
        <TreeList.Item itemKey={node.key} textValue={item.name}>
          <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
          <TreeList.ItemToggle itemKey={node.key} />
          <TreeList.ItemIcon>{getFileIcon(item, node.isExpanded)}</TreeList.ItemIcon>
          <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
        </TreeList.Item>
      )}
      style={{ width: 400, maxHeight: 500 }}
    >
      <TreeList.Viewport />
    </TreeList.Root>
  ),
};

// ---------------------------------------------------------------------------
// 7. DensityVariants
// ---------------------------------------------------------------------------

export const DensityVariants: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<TreeList.Root
  items={fileData}
  itemKey={(item) => item.path}
  getChildren={(item) => item.children}
  isBranch={(item) => item.type === 'directory'}
  selectionMode="single"
  density="compact" // or "default" | "comfortable"
  renderItem={(item, node) => (
    <TreeList.Item itemKey={node.key} textValue={item.name}>
      <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
      <TreeList.ItemToggle itemKey={node.key} />
      <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
    </TreeList.Item>
  )}
>
  <TreeList.Viewport />
</TreeList.Root>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      {(['compact', 'default', 'comfortable'] as const).map((density) => (
        <div key={density}>
          <p style={{ marginBottom: 8, color: 'var(--ov-color-fg-subtle)', fontSize: 'var(--ov-font-size-caption)' }}>
            {density}
          </p>
          <TreeList.Root
            items={fileExplorerData.slice(0, 2)}
            itemKey={(item) => item.path}
            getChildren={(item) => item.children}
            isBranch={(item) => item.type === 'directory'}
            getTextValue={(item) => item.name}
            selectionMode="single"
            defaultExpandedKeys={new Set(['/src'])}
            density={density}
            renderItem={(item, node) => (
              <TreeList.Item itemKey={node.key} textValue={item.name}>
                <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
                <TreeList.ItemToggle itemKey={node.key} />
                <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
              </TreeList.Item>
            )}
            style={{ width: 240 }}
          >
            <TreeList.Viewport />
          </TreeList.Root>
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 8. ControlledExpansion
// ---------------------------------------------------------------------------

function ControlledExpansionStory() {
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<Key>>(new Set(['/src']));

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setExpandedKeys(new Set())}
          style={{ fontSize: 'var(--ov-font-size-caption)', padding: '4px 8px', cursor: 'pointer' }}
        >
          Collapse All
        </button>
        <button
          type="button"
          onClick={() => setExpandedKeys(new Set(['/src', '/src/components', '/src/hooks', '/src/utils', '/public']))}
          style={{ fontSize: 'var(--ov-font-size-caption)', padding: '4px 8px', cursor: 'pointer' }}
        >
          Expand All
        </button>
      </div>
      <TreeList.Root
        items={fileExplorerData}
        itemKey={(item) => item.path}
        getChildren={(item) => item.children}
        isBranch={(item) => item.type === 'directory'}
        getTextValue={(item) => item.name}
        selectionMode="single"
        expandedKeys={expandedKeys}
        onExpandedKeysChange={setExpandedKeys}
        renderItem={(item, node) => (
          <TreeList.Item itemKey={node.key} textValue={item.name}>
            <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
            <TreeList.ItemToggle itemKey={node.key} />
            <TreeList.ItemIcon>{getFileIcon(item, node.isExpanded)}</TreeList.ItemIcon>
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          </TreeList.Item>
        )}
        style={{ width: 400, maxHeight: 500 }}
      >
        <TreeList.Viewport />
      </TreeList.Root>
      <p style={{ marginTop: 8, color: 'var(--ov-color-fg-subtle)', fontSize: 'var(--ov-font-size-caption)' }}>
        Expanded: {expandedKeys.size === 0 ? 'none' : [...expandedKeys].join(', ')}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. Filterable (SearchInput + TreeList)
// ---------------------------------------------------------------------------

function FilterableTreeStory() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set());

  return (
    <div style={{ width: 400 }}>
      <SearchInput
        placeholder="Filter files…"
        value={query}
        onValueChange={setQuery}
        variant="soft"
        size="sm"
        style={{ marginBottom: 8 }}
      />
      <TreeList.Root
        items={fileExplorerData}
        itemKey={(item) => item.path}
        getChildren={(item) => item.children}
        isBranch={(item) => item.type === 'directory'}
        getTextValue={(item) => item.name}
        selectionMode="single"
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        defaultExpandedKeys={new Set(['/src', '/src/components'])}
        filterText={query}
        renderItem={(item, node) => (
          <TreeList.Item itemKey={node.key} textValue={item.name}>
            <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
            <TreeList.ItemToggle itemKey={node.key} />
            <TreeList.ItemIcon>{getFileIcon(item, node.isExpanded)}</TreeList.ItemIcon>
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
            {item.status && (
              <TreeList.ItemBadge color={statusColor[item.status]}>{item.status}</TreeList.ItemBadge>
            )}
          </TreeList.Item>
        )}
        style={{ maxHeight: 400 }}
      >
        <TreeList.Viewport />
        <TreeList.Empty>No matching files</TreeList.Empty>
      </TreeList.Root>
    </div>
  );
}

export const Filterable: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `function FilterableTree() {
  const [query, setQuery] = useState('');

  return (
    <>
      <SearchInput placeholder="Filter files…" value={query} onValueChange={setQuery} variant="soft" size="sm" />
      <TreeList.Root
        items={treeData}
        itemKey={(item) => item.path}
        getChildren={(item) => item.children}
        getTextValue={(item) => item.name}
        filterText={query}
        renderItem={(item, node) => (
          <TreeList.Item itemKey={node.key} textValue={item.name}>
            <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
            <TreeList.ItemToggle itemKey={node.key} />
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          </TreeList.Item>
        )}
      >
        <TreeList.Viewport />
        <TreeList.Empty>No matching files</TreeList.Empty>
      </TreeList.Root>
    </>
  );
}`,
      },
    },
  },
  render: () => <FilterableTreeStory />,
};

// ---------------------------------------------------------------------------
// 10. CustomFilterFn
// ---------------------------------------------------------------------------

function CustomFilterStory() {
  const [query, setQuery] = useState('');

  // Custom filter: match by file extension
  const filterByExtension = useCallback(
    (item: FileItem, text: string) => {
      if (item.type === 'directory') return false;
      const ext = item.name.split('.').pop() ?? '';
      return ext.toLowerCase().includes(text.toLowerCase());
    },
    [],
  );

  return (
    <div style={{ width: 400 }}>
      <SearchInput
        placeholder="Filter by extension (tsx, ts, json, md)…"
        value={query}
        onValueChange={setQuery}
        variant="soft"
        size="sm"
        style={{ marginBottom: 8 }}
      />
      <TreeList.Root
        items={fileExplorerData}
        itemKey={(item) => item.path}
        getChildren={(item) => item.children}
        isBranch={(item) => item.type === 'directory'}
        getTextValue={(item) => item.name}
        selectionMode="single"
        defaultExpandedKeys={new Set(['/src', '/src/components'])}
        filterText={query}
        filterFn={filterByExtension}
        renderItem={(item, node) => (
          <TreeList.Item itemKey={node.key} textValue={item.name}>
            <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
            <TreeList.ItemToggle itemKey={node.key} />
            <TreeList.ItemIcon>{getFileIcon(item, node.isExpanded)}</TreeList.ItemIcon>
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
            {item.status && (
              <TreeList.ItemBadge color={statusColor[item.status]}>{item.status}</TreeList.ItemBadge>
            )}
          </TreeList.Item>
        )}
        style={{ maxHeight: 400 }}
      >
        <TreeList.Viewport />
        <TreeList.Empty>No files with that extension</TreeList.Empty>
      </TreeList.Root>
    </div>
  );
}

export const CustomFilterFn: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `function CustomFilterTree() {
  const [query, setQuery] = useState('');

  // Custom filter: match by file extension only
  const filterByExtension = useCallback(
    (item: FileItem, text: string) => {
      if (item.type === 'directory') return false;
      const ext = item.name.split('.').pop() ?? '';
      return ext.toLowerCase().includes(text.toLowerCase());
    },
    [],
  );

  return (
    <>
      <SearchInput placeholder="Extension…" value={query} onValueChange={setQuery} variant="soft" size="sm" />
      <TreeList.Root
        items={treeData}
        itemKey={(item) => item.path}
        getChildren={(item) => item.children}
        getTextValue={(item) => item.name}
        filterText={query}
        filterFn={filterByExtension}
        renderItem={(item, node) => (
          <TreeList.Item itemKey={node.key} textValue={item.name}>
            <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
            <TreeList.ItemToggle itemKey={node.key} />
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          </TreeList.Item>
        )}
      >
        <TreeList.Viewport />
        <TreeList.Empty>No files with that extension</TreeList.Empty>
      </TreeList.Root>
    </>
  );
}`,
      },
    },
  },
  render: () => <CustomFilterStory />,
};

// ---------------------------------------------------------------------------
// 11. FilterByStatus
// ---------------------------------------------------------------------------

function FilterByStatusStory() {
  const [statusFilter, setStatusFilter] = useState('');

  // Custom filter: match by git status badge
  const filterByStatus = useCallback(
    (item: FileItem, text: string) => {
      if (!item.status) return false;
      return item.status.toLowerCase() === text.toLowerCase();
    },
    [],
  );

  return (
    <div style={{ width: 400 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {['', 'M', 'A', 'D'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            style={{
              fontSize: 'var(--ov-font-size-caption)',
              padding: '4px 8px',
              cursor: 'pointer',
              borderRadius: 'var(--ov-radius-sm)',
              border: statusFilter === s ? '1px solid var(--ov-color-state-focus-ring)' : '1px solid var(--ov-color-border-muted)',
              background: statusFilter === s ? 'var(--ov-color-state-hover)' : 'transparent',
              color: 'var(--ov-color-fg-default)',
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>
      <TreeList.Root
        items={fileExplorerData}
        itemKey={(item) => item.path}
        getChildren={(item) => item.children}
        isBranch={(item) => item.type === 'directory'}
        getTextValue={(item) => item.name}
        selectionMode="single"
        defaultExpandedKeys={new Set(['/src', '/src/components'])}
        filterText={statusFilter}
        filterFn={filterByStatus}
        renderItem={(item, node) => (
          <TreeList.Item itemKey={node.key} textValue={item.name}>
            <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
            <TreeList.ItemToggle itemKey={node.key} />
            <TreeList.ItemIcon>{getFileIcon(item, node.isExpanded)}</TreeList.ItemIcon>
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
            {item.status && (
              <TreeList.ItemBadge color={statusColor[item.status]}>{item.status}</TreeList.ItemBadge>
            )}
          </TreeList.Item>
        )}
        style={{ maxHeight: 400 }}
      >
        <TreeList.Viewport />
        <TreeList.Empty>No files with that status</TreeList.Empty>
      </TreeList.Root>
    </div>
  );
}

export const FilterByStatus: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `const filterByStatus = (item, text) => item.status?.toLowerCase() === text.toLowerCase();

<TreeList.Root
  items={treeData}
  filterText={statusFilter}
  filterFn={filterByStatus}
  // ...
>
  <TreeList.Viewport />
  <TreeList.Empty>No files with that status</TreeList.Empty>
</TreeList.Root>`,
      },
    },
  },
  render: () => <FilterByStatusStory />,
};

// ---------------------------------------------------------------------------
// 12. ControlledExpansion (source-only)
// ---------------------------------------------------------------------------

export const ControlledExpansion: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `function ControlledExpansionExample() {
  const [expandedKeys, setExpandedKeys] = useState(new Set(['/src']));

  return (
    <>
      <button onClick={() => setExpandedKeys(new Set())}>Collapse All</button>
      <button onClick={() => setExpandedKeys(allKeys)}>Expand All</button>
      <TreeList.Root
        items={fileData}
        itemKey={(item) => item.path}
        getChildren={(item) => item.children}
        isBranch={(item) => item.type === 'directory'}
        expandedKeys={expandedKeys}
        onExpandedKeysChange={setExpandedKeys}
        renderItem={(item, node) => (
          <TreeList.Item itemKey={node.key} textValue={item.name}>
            <TreeList.ItemIndent depth={node.depth} ancestorIsLast={node.ancestorIsLast} isLastChild={node.isLastChild} />
            <TreeList.ItemToggle itemKey={node.key} />
            <TreeList.ItemIcon>{getIcon(item)}</TreeList.ItemIcon>
            <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          </TreeList.Item>
        )}
      >
        <TreeList.Viewport />
      </TreeList.Root>
    </>
  );
}`,
      },
    },
  },
  render: () => <ControlledExpansionStory />,
};
