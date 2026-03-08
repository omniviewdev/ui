import { useState, useCallback, useRef, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  LuFile,
  LuSearch,
  LuTerminal,
  LuSettings,
  LuGitBranch,
  LuPalette,
  LuCode,
  LuFolder,
  LuBug,
  LuPlay,
  LuSave,
  LuCopy,
  LuScissors,
  LuClipboard,
  LuUndo2,
  LuRedo2,
  LuZap,
} from 'react-icons/lu';
import { CommandList } from './CommandList';
import type { CommandItemMeta, HighlightRange } from './types';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  category?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

const allCommands: Command[] = [
  { id: 'open-file', label: 'Open File', shortcut: '⌘O', category: 'file', icon: <LuFile /> },
  { id: 'save-file', label: 'Save File', shortcut: '⌘S', category: 'file', icon: <LuSave /> },
  { id: 'save-all', label: 'Save All Files', shortcut: '⌘⇧S', category: 'file', icon: <LuSave /> },
  { id: 'new-file', label: 'New File', shortcut: '⌘N', category: 'file', icon: <LuFile /> },
  { id: 'open-folder', label: 'Open Folder', category: 'file', icon: <LuFolder /> },
  { id: 'find', label: 'Find in Files', shortcut: '⇧⌘F', category: 'search', icon: <LuSearch /> },
  {
    id: 'replace',
    label: 'Find and Replace',
    shortcut: '⌘H',
    category: 'search',
    icon: <LuSearch />,
  },
  { id: 'go-to-line', label: 'Go to Line', shortcut: '⌘G', category: 'search', icon: <LuCode /> },
  {
    id: 'go-to-symbol',
    label: 'Go to Symbol',
    shortcut: '⌘⇧O',
    category: 'search',
    icon: <LuCode />,
  },
  {
    id: 'toggle-terminal',
    label: 'Toggle Terminal',
    shortcut: '⌘`',
    category: 'view',
    icon: <LuTerminal />,
  },
  {
    id: 'toggle-sidebar',
    label: 'Toggle Sidebar',
    shortcut: '⌘B',
    category: 'view',
    icon: <LuPalette />,
  },
  {
    id: 'settings',
    label: 'Open Settings',
    shortcut: '⌘,',
    category: 'preferences',
    icon: <LuSettings />,
  },
  {
    id: 'keyboard-shortcuts',
    label: 'Keyboard Shortcuts',
    shortcut: '⌘K ⌘S',
    category: 'preferences',
    icon: <LuSettings />,
  },
  { id: 'color-theme', label: 'Color Theme', category: 'preferences', icon: <LuPalette /> },
  { id: 'git-checkout', label: 'Git: Checkout to...', category: 'git', icon: <LuGitBranch /> },
  { id: 'git-pull', label: 'Git: Pull', category: 'git', icon: <LuGitBranch /> },
  { id: 'git-push', label: 'Git: Push', category: 'git', icon: <LuGitBranch /> },
  {
    id: 'debug-start',
    label: 'Start Debugging',
    shortcut: 'F5',
    category: 'debug',
    icon: <LuBug />,
  },
  {
    id: 'debug-stop',
    label: 'Stop Debugging',
    shortcut: '⇧F5',
    category: 'debug',
    icon: <LuBug />,
  },
  { id: 'run-task', label: 'Run Task', category: 'debug', icon: <LuPlay /> },
  { id: 'copy', label: 'Copy', shortcut: '⌘C', category: 'edit', icon: <LuCopy /> },
  { id: 'cut', label: 'Cut', shortcut: '⌘X', category: 'edit', icon: <LuScissors /> },
  { id: 'paste', label: 'Paste', shortcut: '⌘V', category: 'edit', icon: <LuClipboard /> },
  { id: 'undo', label: 'Undo', shortcut: '⌘Z', category: 'edit', icon: <LuUndo2 /> },
  { id: 'redo', label: 'Redo', shortcut: '⇧⌘Z', category: 'edit', icon: <LuRedo2 /> },
];

const categoryLabels: Record<string, string> = {
  file: 'File',
  search: 'Search',
  view: 'View',
  preferences: 'Preferences',
  git: 'Git',
  debug: 'Debug',
  edit: 'Edit',
  recent: 'Recently Used',
};

// ---------------------------------------------------------------------------
// Default renderItem
// ---------------------------------------------------------------------------

function defaultRenderItem(item: Command, meta: CommandItemMeta) {
  return (
    <CommandList.Item itemKey={meta.key} disabled={item.disabled}>
      {item.icon && <CommandList.ItemIcon>{item.icon}</CommandList.ItemIcon>}
      <CommandList.ItemLabel highlights={meta.highlights}>{item.label}</CommandList.ItemLabel>
      {item.description && (
        <CommandList.ItemDescription>{item.description}</CommandList.ItemDescription>
      )}
      {item.shortcut && <CommandList.ItemShortcut keys={item.shortcut.split(' ')} />}
    </CommandList.Item>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Lists/CommandList',
  parameters: {
    layout: 'centered',
  },
};
export default meta;

// ---------------------------------------------------------------------------
// 1. BasicCommands
// ---------------------------------------------------------------------------

export const BasicCommands: StoryObj = {
  render: () => (
    <div
      style={{
        width: 520,
        border: '1px solid var(--ov-color-border-default)',
        borderRadius: 'var(--ov-radius-md)',
        overflow: 'hidden',
      }}
    >
      <CommandList.Root
        items={allCommands.slice(0, 10)}
        itemKey={(item) => item.id}
        renderItem={defaultRenderItem}
        onAction={(key) => console.log('Action:', key)}
        onDismiss={() => console.log('Dismissed')}
        placeholder="Type a command..."
      >
        <CommandList.Input />
        <CommandList.Results />
        <CommandList.Empty>No commands found</CommandList.Empty>
      </CommandList.Root>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 2. ExternalSearch — simulated backend with debounce
// ---------------------------------------------------------------------------

function useDebouncedSearch(allItems: Command[], delay = 200) {
  const [results, setResults] = useState<Command[]>(allItems.slice(0, 8));
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<Map<string | number, HighlightRange[]>>(new Map());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clean up pending timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    };
  }, []);

  const search = useCallback(
    (query: string) => {
      clearTimeout(timerRef.current);
      if (!query) {
        setResults(allItems.slice(0, 8));
        setHighlights(new Map());
        setLoading(false);
        return;
      }
      setLoading(true);
      timerRef.current = setTimeout(() => {
        const q = query.toLowerCase();
        const matched: Command[] = [];
        const hl = new Map<string | number, HighlightRange[]>();

        for (const item of allItems) {
          const label = item.label.toLowerCase();
          const idx = label.indexOf(q);
          if (idx >= 0) {
            matched.push(item);
            hl.set(item.id, [{ start: idx, end: idx + q.length }]);
          }
        }
        setResults(matched);
        setHighlights(hl);
        setLoading(false);
      }, delay);
    },
    [allItems, delay],
  );

  return { results, loading, highlights, search };
}

export const ExternalSearch: StoryObj = {
  render: function ExternalSearchStory() {
    const { results, loading, highlights, search } = useDebouncedSearch(allCommands);

    return (
      <div
        style={{
          width: 520,
          border: '1px solid var(--ov-color-border-default)',
          borderRadius: 'var(--ov-radius-md)',
          overflow: 'hidden',
        }}
      >
        <CommandList.Root
          items={results}
          itemKey={(item) => item.id}
          renderItem={defaultRenderItem}
          onQueryChange={search}
          onAction={(key) => console.log('Action:', key)}
          onDismiss={() => console.log('Dismissed')}
          loading={loading}
          highlights={highlights}
          placeholder="Search commands (simulated server)..."
        >
          <CommandList.Input />
          <CommandList.Results />
          <CommandList.Empty>No results found</CommandList.Empty>
          <CommandList.Loading>Searching…</CommandList.Loading>
        </CommandList.Root>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 3. ClientFiltering
// ---------------------------------------------------------------------------

export const ClientFiltering: StoryObj = {
  render: () => (
    <div
      style={{
        width: 520,
        border: '1px solid var(--ov-color-border-default)',
        borderRadius: 'var(--ov-radius-md)',
        overflow: 'hidden',
      }}
    >
      <CommandList.Root
        items={allCommands}
        itemKey={(item) => item.id}
        getTextValue={(item) => item.label}
        renderItem={defaultRenderItem}
        filterFn={(item, query) => {
          const label = item.label.toLowerCase();
          const q = query.toLowerCase();
          if (!label.includes(q)) return 0;
          // Score: exact prefix match > contains
          return label.startsWith(q) ? 100 : 50;
        }}
        onAction={(key) => console.log('Action:', key)}
        placeholder="Filter commands locally..."
      >
        <CommandList.Input />
        <CommandList.Results />
        <CommandList.Empty>No matching commands</CommandList.Empty>
      </CommandList.Root>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 4. GroupedCommands
// ---------------------------------------------------------------------------

export const GroupedCommands: StoryObj = {
  render: () => (
    <div
      style={{
        width: 520,
        border: '1px solid var(--ov-color-border-default)',
        borderRadius: 'var(--ov-radius-md)',
        overflow: 'hidden',
      }}
    >
      <CommandList.Root
        items={allCommands}
        itemKey={(item) => item.id}
        renderItem={defaultRenderItem}
        groupBy={(item) => item.category ?? 'other'}
        groupOrder={['edit', 'file', 'search', 'view', 'preferences', 'git', 'debug']}
        groupLabel={(key) => categoryLabels[key] ?? key}
        onAction={(key) => console.log('Action:', key)}
        placeholder="Type a command..."
      >
        <CommandList.Input />
        <CommandList.Results />
        <CommandList.Empty>No commands found</CommandList.Empty>
      </CommandList.Root>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 5. LargeResultSet (virtualized)
// ---------------------------------------------------------------------------

function generateManyCommands(count: number): Command[] {
  const items: Command[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: `cmd-${i}`,
      label: `Command ${i}: ${['Open', 'Close', 'Save', 'Delete', 'Create', 'Update', 'Run', 'Build'][i % 8]} ${['File', 'Project', 'Task', 'Window', 'Buffer', 'Process'][i % 6]}`,
      shortcut: i % 5 === 0 ? '⌘K' : undefined,
      category: ['file', 'edit', 'view', 'debug', 'git'][i % 5],
      icon: <LuZap />,
    });
  }
  return items;
}

const manyCommands = generateManyCommands(1000);

export const LargeResultSet: StoryObj = {
  render: function LargeResultSetStory() {
    const [query, setQuery] = useState('');
    const filtered = query
      ? manyCommands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
      : manyCommands;

    return (
      <div
        style={{
          width: 520,
          border: '1px solid var(--ov-color-border-default)',
          borderRadius: 'var(--ov-radius-md)',
          overflow: 'hidden',
        }}
      >
        <CommandList.Root
          items={filtered}
          itemKey={(item) => item.id}
          renderItem={defaultRenderItem}
          onQueryChange={setQuery}
          onAction={(key) => console.log('Action:', key)}
          virtualized
          placeholder={`Search ${manyCommands.length} commands...`}
        >
          <CommandList.Input />
          <CommandList.Results />
          <CommandList.Empty>No results</CommandList.Empty>
        </CommandList.Root>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 6. WithHighlights
// ---------------------------------------------------------------------------

export const WithHighlights: StoryObj = {
  render: function HighlightsStory() {
    const staticHighlights = new Map<string | number, HighlightRange[]>([
      ['open-file', [{ start: 0, end: 4 }]],
      ['save-file', [{ start: 0, end: 4 }]],
      ['find', [{ start: 0, end: 4 }]],
      [
        'replace',
        [
          { start: 0, end: 4 },
          { start: 9, end: 12 },
        ],
      ],
    ]);

    return (
      <div
        style={{
          width: 520,
          border: '1px solid var(--ov-color-border-default)',
          borderRadius: 'var(--ov-radius-md)',
          overflow: 'hidden',
        }}
      >
        <CommandList.Root
          items={allCommands.slice(0, 8)}
          itemKey={(item) => item.id}
          renderItem={defaultRenderItem}
          highlights={staticHighlights}
          placeholder="Highlights pre-applied..."
        >
          <CommandList.Input />
          <CommandList.Results />
        </CommandList.Root>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 7. EmptyAndLoading
// ---------------------------------------------------------------------------

export const EmptyAndLoading: StoryObj = {
  render: function EmptyAndLoadingStory() {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<Command[]>([]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setItems([]);
            }}
          >
            Show Loading
          </button>
          <button
            type="button"
            onClick={() => {
              setLoading(false);
              setItems([]);
            }}
          >
            Show Empty
          </button>
          <button
            type="button"
            onClick={() => {
              setLoading(false);
              setItems(allCommands.slice(0, 3));
            }}
          >
            Show Results
          </button>
        </div>
        <div
          style={{
            width: 520,
            border: '1px solid var(--ov-color-border-default)',
            borderRadius: 'var(--ov-radius-md)',
            overflow: 'hidden',
          }}
        >
          <CommandList.Root
            items={items}
            itemKey={(item) => item.id}
            renderItem={defaultRenderItem}
            loading={loading}
            placeholder="Type to search..."
          >
            <CommandList.Input />
            <CommandList.Results />
            <CommandList.Empty>No results found</CommandList.Empty>
            <CommandList.Loading>Searching…</CommandList.Loading>
          </CommandList.Root>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 8. DensityVariants
// ---------------------------------------------------------------------------

export const DensityVariants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      {(['compact', 'default', 'comfortable'] as const).map((d) => (
        <div
          key={d}
          style={{
            width: 320,
            border: '1px solid var(--ov-color-border-default)',
            borderRadius: 'var(--ov-radius-md)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--ov-color-border-muted)',
              fontSize: 'var(--ov-font-size-caption)',
              color: 'var(--ov-color-fg-muted)',
            }}
          >
            density=&quot;{d}&quot;
          </div>
          <CommandList.Root
            items={allCommands.slice(0, 5)}
            itemKey={(item) => item.id}
            renderItem={defaultRenderItem}
            density={d}
            placeholder="Commands..."
          >
            <CommandList.Input />
            <CommandList.Results />
          </CommandList.Root>
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 9. DisabledItems
// ---------------------------------------------------------------------------

export const DisabledItems: StoryObj = {
  render: () => (
    <div
      style={{
        width: 520,
        border: '1px solid var(--ov-color-border-default)',
        borderRadius: 'var(--ov-radius-md)',
        overflow: 'hidden',
      }}
    >
      <CommandList.Root
        items={allCommands.slice(0, 8)}
        itemKey={(item) => item.id}
        renderItem={defaultRenderItem}
        disabledKeys={['save-file', 'find', 'go-to-line']}
        onAction={(key) => console.log('Action:', key)}
        placeholder="Some items disabled..."
      >
        <CommandList.Input />
        <CommandList.Results />
      </CommandList.Root>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 10. CustomRenderItem
// ---------------------------------------------------------------------------

export const CustomRenderItem: StoryObj = {
  render: () => (
    <div
      style={{
        width: 520,
        border: '1px solid var(--ov-color-border-default)',
        borderRadius: 'var(--ov-radius-md)',
        overflow: 'hidden',
      }}
    >
      <CommandList.Root
        items={allCommands.slice(0, 10)}
        itemKey={(item) => item.id}
        renderItem={(item, meta) => (
          <CommandList.Item itemKey={meta.key}>
            <CommandList.ItemIcon>{item.icon ?? <LuZap />}</CommandList.ItemIcon>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <CommandList.ItemLabel highlights={meta.highlights}>
                {item.label}
              </CommandList.ItemLabel>
              {item.description && (
                <CommandList.ItemDescription>{item.description}</CommandList.ItemDescription>
              )}
            </div>
            {item.category && (
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 'var(--ov-radius-sm)',
                  background: 'var(--ov-color-state-hover)',
                  color: 'var(--ov-color-fg-muted)',
                }}
              >
                {item.category}
              </span>
            )}
            {item.shortcut && <CommandList.ItemShortcut keys={item.shortcut.split(' ')} />}
          </CommandList.Item>
        )}
        onAction={(key) => console.log('Action:', key)}
        placeholder="Rich items..."
      >
        <CommandList.Input />
        <CommandList.Results />
      </CommandList.Root>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 11. HybridSearch
// ---------------------------------------------------------------------------

export const HybridSearch: StoryObj = {
  render: function HybridSearchStory() {
    const { results, loading, highlights, search } = useDebouncedSearch(allCommands, 150);

    return (
      <div
        style={{
          width: 520,
          border: '1px solid var(--ov-color-border-default)',
          borderRadius: 'var(--ov-radius-md)',
          overflow: 'hidden',
        }}
      >
        <CommandList.Root
          items={results}
          itemKey={(item) => item.id}
          renderItem={defaultRenderItem}
          onQueryChange={search}
          onAction={(key) => console.log('Action:', key)}
          loading={loading}
          highlights={highlights}
          groupBy={(item) => item.category ?? 'other'}
          groupOrder={['file', 'search', 'edit', 'view', 'preferences', 'git', 'debug']}
          groupLabel={(key) => categoryLabels[key] ?? key}
          placeholder="Hybrid: server search + client grouping..."
        >
          <CommandList.Input />
          <CommandList.Results />
          <CommandList.Empty>No results found</CommandList.Empty>
          <CommandList.Loading>Searching…</CommandList.Loading>
        </CommandList.Root>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 12. ControlledQuery
// ---------------------------------------------------------------------------

export const ControlledQuery: StoryObj = {
  render: function ControlledQueryStory() {
    const [query, setQuery] = useState('');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setQuery('')}>
            Clear
          </button>
          <button type="button" onClick={() => setQuery('git')}>
            Set &quot;git&quot;
          </button>
          <button type="button" onClick={() => setQuery('save')}>
            Set &quot;save&quot;
          </button>
          <span
            style={{ color: 'var(--ov-color-fg-muted)', fontSize: 'var(--ov-font-size-caption)' }}
          >
            Query: &quot;{query}&quot;
          </span>
        </div>
        <div
          style={{
            width: 520,
            border: '1px solid var(--ov-color-border-default)',
            borderRadius: 'var(--ov-radius-md)',
            overflow: 'hidden',
          }}
        >
          <CommandList.Root
            items={allCommands}
            itemKey={(item) => item.id}
            renderItem={defaultRenderItem}
            query={query}
            onQueryChange={setQuery}
            filterFn={(item, q) => item.label.toLowerCase().includes(q.toLowerCase())}
            onAction={(key) => console.log('Action:', key)}
            placeholder="Controlled query..."
          >
            <CommandList.Input />
            <CommandList.Results />
            <CommandList.Empty>No matches</CommandList.Empty>
          </CommandList.Root>
        </div>
      </div>
    );
  },
};
