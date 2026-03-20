import { useState, useCallback, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  LuFile,
  LuFileCode,
  LuFileJson,
  LuFileText,
  LuFileType,
  LuSettings,
  LuPackage,
  LuWrench,
  LuCode,
  LuBraces,
  LuX,
  LuArrowRightToLine,
  LuArrowLeftToLine,
  LuCircleX,
  LuPin,
  LuCopy,
} from 'react-icons/lu';
import { EditorTabs } from './EditorTabs';
import { ContextMenu } from '../context-menu';
import { TabDragBrokerProvider } from './context/TabDragBroker';
import type { TabDescriptor, TabGroupDescriptor, TabGroupId, TabId, AttachCommit } from './types';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof EditorTabs> = {
  title: 'Components/EditorTabs',
  component: EditorTabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      source: { type: 'dynamic' },
    },
  },
  argTypes: {
    tabs: { control: false },
    groups: { control: false },
    variant: {
      control: 'select',
      options: ['solid', 'soft', 'outline', 'ghost'],
      description: 'Visual variant',
    },
    color: {
      control: 'select',
      options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'],
      description: 'Active indicator color',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Tab size',
    },
    activeId: { control: 'text', description: 'Currently active tab ID (controlled)' },
    defaultActiveId: { control: 'text', description: 'Initially active tab ID (uncontrolled)' },
    onActiveChange: { action: 'active-changed' },
    onCloseTab: { action: 'close-tab' },
    onContextMenuTab: { action: 'context-menu-tab' },
    onToggleGroupCollapsed: { action: 'toggle-group-collapsed' },
    onGroupContextMenu: { action: 'group-context-menu' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Shared tab data
// ---------------------------------------------------------------------------

const basicTabs: TabDescriptor[] = [
  { id: 'index', title: 'index.ts', icon: <LuFileCode size={14} /> },
  { id: 'app', title: 'App.tsx', icon: <LuCode size={14} /> },
  { id: 'styles', title: 'styles.css', icon: <LuFileType size={14} /> },
  { id: 'readme', title: 'README.md', icon: <LuFileText size={14} /> },
  { id: 'config', title: 'vite.config.ts', icon: <LuSettings size={14} /> },
];

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Basic uncontrolled usage — click tabs to switch, all state managed internally.
 */
export const Default: Story = {
  args: {
    tabs: basicTabs,
    defaultActiveId: 'index',
  },
};

/**
 * Pinned tabs render in a separate segment on the left with icon-only display.
 */
export const WithPinnedTabs: Story = {
  args: {
    tabs: [
      { id: 'pin1', title: 'package.json', icon: <LuPackage size={14} />, pinned: true },
      { id: 'pin2', title: 'tsconfig.json', icon: <LuFileJson size={14} />, pinned: true },
      { id: 'file1', title: 'index.ts', icon: <LuFileCode size={14} /> },
      { id: 'file2', title: 'App.tsx', icon: <LuCode size={14} /> },
      { id: 'file3', title: 'utils.ts', icon: <LuWrench size={14} /> },
      { id: 'file4', title: 'hooks.ts', icon: <LuBraces size={14} /> },
      { id: 'file5', title: 'types.ts', icon: <LuFile size={14} /> },
    ],
    defaultActiveId: 'file1',
  },
};

/**
 * Tabs with `dirty: true` show a modified indicator dot on the bottom border.
 */
export const DirtyTabs: Story = {
  args: {
    tabs: [
      { id: 'clean', title: 'clean.ts', icon: <LuFile size={14} /> },
      { id: 'dirty1', title: 'modified.ts', icon: <LuFileCode size={14} />, dirty: true },
      { id: 'dirty2', title: 'unsaved.tsx', icon: <LuCode size={14} />, dirty: true },
      { id: 'clean2', title: 'saved.ts', icon: <LuFile size={14} /> },
    ],
    defaultActiveId: 'dirty1',
  },
};

/**
 * 30 tabs to demonstrate horizontal scroll, scroll buttons, and scroll shadows.
 * Use the chevron buttons or scroll with the mouse wheel.
 */
export const ManyTabs: Story = {
  args: {
    tabs: Array.from({ length: 30 }, (_, i) => ({
      id: `file-${i}`,
      title: `file-${i}.ts`,
      icon: <LuFile size={14} />,
    })),
    defaultActiveId: 'file-0',
  },
};

/**
 * Grouped tabs with collapsible Chrome-style group chips.
 * Click a group chip to collapse/expand its tabs.
 */
export const WithGroups: Story = {
  args: {
    tabs: [
      { id: 'comp1', title: 'Button.tsx', icon: <LuCode size={14} />, groupId: 'components' },
      { id: 'comp2', title: 'Input.tsx', icon: <LuCode size={14} />, groupId: 'components' },
      { id: 'comp3', title: 'Select.tsx', icon: <LuCode size={14} />, groupId: 'components' },
      { id: 'api1', title: 'users.ts', icon: <LuFileCode size={14} />, groupId: 'api' },
      { id: 'api2', title: 'auth.ts', icon: <LuFileCode size={14} />, groupId: 'api' },
      { id: 'misc1', title: 'README.md', icon: <LuFileText size={14} /> },
    ],
    groups: [
      { id: 'components', title: 'Components', color: '#4CAF50' },
      { id: 'api', title: 'API', color: '#2196F3' },
    ],
    defaultActiveId: 'comp1',
  },
  render: function WithGroupsRender(args) {
    const [groups, setGroups] = useState<TabGroupDescriptor[]>(args.groups ?? []);

    const handleToggle = useCallback((groupId: TabGroupId) => {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g)),
      );
    }, []);

    return <EditorTabs {...args} groups={groups} onToggleGroupCollapsed={handleToggle} />;
  },
};

/**
 * Closable tabs with dirty state. Hover a tab to reveal its close button.
 * The close button and dirty dot occupy the same space with no layout shift.
 */
export const Closable: Story = {
  args: {
    tabs: [
      { id: 'f1', title: 'index.ts', icon: <LuFileCode size={14} />, closable: true },
      { id: 'f2', title: 'App.tsx', icon: <LuCode size={14} />, closable: true, dirty: true },
      { id: 'f3', title: 'styles.css', icon: <LuFileType size={14} />, closable: true },
      { id: 'f4', title: 'permanent.ts', icon: <LuFile size={14} />, closable: false },
    ],
    defaultActiveId: 'f1',
  },
  render: function ClosableRender(args) {
    const [tabs, setTabs] = useState(args.tabs);
    const [activeId, setActiveId] = useState<string | undefined>(args.defaultActiveId ?? 'f1');

    return (
      <EditorTabs
        {...args}
        tabs={tabs}
        activeId={activeId}
        onActiveChange={setActiveId}
        onCloseTab={(id) => {
          const remaining = tabs.filter((t) => t.id !== id);
          setTabs(remaining);
          if (remaining.length === 0) {
            setActiveId(undefined);
          } else if (activeId === id) {
            setActiveId(remaining[0]!.id);
          }
        }}
      />
    );
  },
};

/**
 * Right-click any tab for a full Chrome-style context menu built with the
 * library's own `ContextMenu` component. Supports close, close others,
 * close to left/right, close all, pin/unpin, copy path, and add to group.
 */
export const WithContextMenu: Story = {
  args: {
    tabs: [
      { id: 'index', title: 'index.ts', icon: <LuFileCode size={14} />, closable: true },
      { id: 'app', title: 'App.tsx', icon: <LuCode size={14} />, closable: true, dirty: true },
      { id: 'styles', title: 'styles.css', icon: <LuFileType size={14} />, closable: true },
      { id: 'readme', title: 'README.md', icon: <LuFileText size={14} />, closable: true },
      { id: 'config', title: 'vite.config.ts', icon: <LuSettings size={14} />, closable: true },
    ],
    defaultActiveId: 'index',
  },
  render: function WithContextMenuRender(args) {
    const [tabs, setTabs] = useState(args.tabs);
    const [activeId, setActiveId] = useState<string | undefined>(args.defaultActiveId ?? 'index');
    const contextTabRef = useRef<TabId | null>(null);

    const findTab = (id: TabId) => tabs.find((t) => t.id === id);

    const closeTab = useCallback((id: TabId) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (next.length === 0) {
          setActiveId(undefined);
        } else {
          setActiveId((current) => (current === id ? next[0]!.id : current));
        }
        return next;
      });
    }, []);

    const closeOthers = useCallback((id: TabId) => {
      setTabs((prev) => prev.filter((t) => t.id === id));
      setActiveId(id);
    }, []);

    const closeToRight = useCallback((id: TabId) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === id);
        if (idx === -1) return prev;
        const next = prev.slice(0, idx + 1);
        setActiveId((current) => {
          if (!next.some((t) => t.id === current) && next.length > 0)
            return next[next.length - 1]!.id;
          return current;
        });
        return next;
      });
    }, []);

    const closeToLeft = useCallback((id: TabId) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === id);
        if (idx === -1) return prev;
        const next = prev.slice(idx);
        setActiveId((current) => {
          if (!next.some((t) => t.id === current) && next.length > 0) return next[0]!.id;
          return current;
        });
        return next;
      });
    }, []);

    const closeAll = useCallback(() => {
      setTabs([]);
      setActiveId(undefined);
    }, []);

    const togglePin = useCallback((id: TabId) => {
      setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)));
    }, []);

    const getContextTab = () => contextTabRef.current;

    return (
      <ContextMenu.Root>
        <ContextMenu.Trigger style={{ display: 'block' }}>
          <EditorTabs
            {...args}
            tabs={tabs}
            activeId={activeId}
            onActiveChange={setActiveId}
            onCloseTab={closeTab}
            onContextMenuTab={(id) => {
              contextTabRef.current = id;
            }}
          />
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner>
            <ContextMenu.Popup>
              {/* ── Close actions ── */}
              <ContextMenu.Item
                startDecorator={<LuX size={14} />}
                onClick={() => {
                  const id = getContextTab();
                  if (id) closeTab(id);
                }}
              >
                Close
              </ContextMenu.Item>
              <ContextMenu.Item
                startDecorator={<LuCircleX size={14} />}
                onClick={() => {
                  const id = getContextTab();
                  if (id) closeOthers(id);
                }}
              >
                Close Others
              </ContextMenu.Item>
              <ContextMenu.Item
                startDecorator={<LuArrowRightToLine size={14} />}
                onClick={() => {
                  const id = getContextTab();
                  if (id) closeToRight(id);
                }}
              >
                Close to the Right
              </ContextMenu.Item>
              <ContextMenu.Item
                startDecorator={<LuArrowLeftToLine size={14} />}
                onClick={() => {
                  const id = getContextTab();
                  if (id) closeToLeft(id);
                }}
              >
                Close to the Left
              </ContextMenu.Item>
              <ContextMenu.Item startDecorator={<LuCircleX size={14} />} onClick={closeAll}>
                Close All
              </ContextMenu.Item>

              <ContextMenu.Separator />

              {/* ── Tab organization ── */}
              <ContextMenu.Item
                startDecorator={<LuPin size={14} />}
                onClick={() => {
                  const id = getContextTab();
                  if (id) togglePin(id);
                }}
              >
                Pin Tab
              </ContextMenu.Item>

              <ContextMenu.Separator />

              {/* ── Clipboard ── */}
              <ContextMenu.Item
                startDecorator={<LuCopy size={14} />}
                onClick={() => {
                  const id = getContextTab();
                  const tab = id ? findTab(id) : undefined;
                  if (tab) navigator.clipboard.writeText(tab.title).catch(() => {});
                }}
              >
                Copy File Name
              </ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `
<ContextMenu.Root>
  <ContextMenu.Trigger>
    <EditorTabs
      tabs={tabs}
      activeId={activeId}
      onActiveChange={setActiveId}
      onCloseTab={closeTab}
      onContextMenuTab={(id) => {
        contextTabRef.current = id;
      }}
    />
  </ContextMenu.Trigger>
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Item onClick={() => closeTab(contextTabRef.current)}>
          Close
        </ContextMenu.Item>
        <ContextMenu.Item onClick={() => closeOthers(contextTabRef.current)}>
          Close Others
        </ContextMenu.Item>
        <ContextMenu.Item onClick={() => closeToRight(contextTabRef.current)}>
          Close to the Right
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item onClick={() => togglePin(contextTabRef.current)}>
          Pin Tab
        </ContextMenu.Item>
        <ContextMenu.Item onClick={() => {
          const tab = tabs.find((t) => t.id === contextTabRef.current);
          if (tab) navigator.clipboard.writeText(tab.title);
        }}>
          Copy File Name
        </ContextMenu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
`,
      },
    },
  },
};

/**
 * Drag tabs to reorder. The `onReorder` callback receives the updated tab array.
 */
export const Reorderable: Story = {
  args: {
    tabs: basicTabs,
    defaultActiveId: 'index',
  },
  render: function ReorderableRender(args) {
    const [tabs, setTabs] = useState(args.tabs);

    const handleReorder = useCallback((nextTabs: TabDescriptor[]) => {
      setTabs(nextTabs);
    }, []);

    return <EditorTabs {...args} tabs={tabs} onReorder={handleReorder} />;
  },
};

/**
 * Pinned tabs stay in the pinned zone; unpinned tabs stay in the unpinned zone.
 * Drag across the boundary to see the constraint in action (tab snaps back).
 */
export const ReorderableWithPinned: Story = {
  args: {
    tabs: [
      { id: 'pin1', title: 'package.json', icon: <LuPackage size={14} />, pinned: true },
      { id: 'pin2', title: 'tsconfig.json', icon: <LuFileJson size={14} />, pinned: true },
      { id: 'file1', title: 'index.ts', icon: <LuFileCode size={14} /> },
      { id: 'file2', title: 'App.tsx', icon: <LuCode size={14} /> },
      { id: 'file3', title: 'utils.ts', icon: <LuWrench size={14} /> },
      { id: 'file4', title: 'hooks.ts', icon: <LuBraces size={14} /> },
    ],
    defaultActiveId: 'file1',
  },
  render: function ReorderableWithPinnedRender(args) {
    const [tabs, setTabs] = useState(args.tabs);

    return <EditorTabs {...args} tabs={tabs} onReorder={(nextTabs) => setTabs(nextTabs)} />;
  },
};

/**
 * Tabs within a group can be reordered, but cannot be dragged to another group
 * by default. Toggle `allowReorderAcrossGroups` to relax the constraint.
 */
export const ReorderableWithGroups: Story = {
  args: {
    tabs: [
      { id: 'comp1', title: 'Button.tsx', icon: <LuCode size={14} />, groupId: 'components' },
      { id: 'comp2', title: 'Input.tsx', icon: <LuCode size={14} />, groupId: 'components' },
      { id: 'comp3', title: 'Select.tsx', icon: <LuCode size={14} />, groupId: 'components' },
      { id: 'api1', title: 'users.ts', icon: <LuFileCode size={14} />, groupId: 'api' },
      { id: 'api2', title: 'auth.ts', icon: <LuFileCode size={14} />, groupId: 'api' },
      { id: 'misc1', title: 'README.md', icon: <LuFileText size={14} /> },
    ],
    groups: [
      { id: 'components', title: 'Components', color: '#4CAF50' },
      { id: 'api', title: 'API', color: '#2196F3' },
    ],
    defaultActiveId: 'comp1',
  },
  render: function ReorderableWithGroupsRender(args) {
    const [tabs, setTabs] = useState(args.tabs);
    const [groups, setGroups] = useState<TabGroupDescriptor[]>(args.groups ?? []);

    const handleToggle = useCallback((groupId: TabGroupId) => {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g)),
      );
    }, []);

    return (
      <EditorTabs
        {...args}
        tabs={tabs}
        groups={groups}
        onReorder={(nextTabs) => setTabs(nextTabs)}
        onToggleGroupCollapsed={handleToggle}
      />
    );
  },
};

// ---------------------------------------------------------------------------
// Detachable stories
// ---------------------------------------------------------------------------

type DetachedWindow = {
  id: string;
  tab: TabDescriptor;
  x: number;
  y: number;
};

const fileContents: Record<string, string> = {
  'index.ts': `import { createApp } from './app';\n\nconst app = createApp();\napp.listen(3000, () => {\n  console.log('Server running on :3000');\n});`,
  'App.tsx': `export function App() {\n  return (\n    <div className="app">\n      <h1>Hello World</h1>\n    </div>\n  );\n}`,
  'styles.css': `.app {\n  font-family: system-ui, sans-serif;\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 2rem;\n}`,
  'vite.config.ts': `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});`,
};

function FakeWindow({
  tab,
  x,
  y,
  onClose,
}: {
  tab: TabDescriptor;
  x: number;
  y: number;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ x, y });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pos],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPos({
      x: dragRef.current.originX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.originY + (e.clientY - dragRef.current.startY),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 420,
        minHeight: 260,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
        border: '1px solid var(--ov-color-border-default, #333)',
        background: 'var(--ov-color-bg-surface, #1e1e1e)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        fontFamily: 'var(--ov-font-sans, system-ui, sans-serif)',
      }}
    >
      {/* Title bar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          background: 'var(--ov-color-bg-surface-raised, #252526)',
          borderBottom: '1px solid var(--ov-color-border-default, #333)',
          cursor: 'grab',
          userSelect: 'none',
          fontSize: 13,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#ff5f57',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontSize: 8,
              color: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = '#4a0002';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = 'transparent';
            }}
          >
            <LuX />
          </button>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <span style={{ flex: 1, textAlign: 'center', opacity: 0.8, fontSize: 12 }}>
          {tab.title}
        </span>
      </div>
      {/* Tab bar (single tab) */}
      <div
        style={{
          background: 'var(--ov-color-editor-group-header-bg, #1e1e1e)',
          borderBottom: '1px solid var(--ov-color-border-default, #333)',
          padding: '0',
        }}
      >
        <EditorTabs
          tabs={[{ ...tab, closable: false }]}
          defaultActiveId={tab.id}
          detachable={false}
        />
      </div>
      {/* Editor content */}
      <div
        style={{
          flex: 1,
          padding: '12px 16px',
          fontSize: 12,
          fontFamily: 'var(--ov-font-mono, "SF Mono", "Fira Code", monospace)',
          lineHeight: 1.6,
          color: 'var(--ov-color-fg-default, #d4d4d4)',
          whiteSpace: 'pre',
          overflow: 'auto',
        }}
      >
        {fileContents[tab.title] ?? `// ${tab.title}\n// No preview available`}
      </div>
    </div>
  );
}

export const Detachable: StoryObj<typeof EditorTabs> = {
  args: {
    tabs: [
      {
        id: 'file1',
        title: 'index.ts',
        icon: <LuFileCode />,
        closable: true,
        payload: { path: '/src/index.ts' },
      },
      {
        id: 'file2',
        title: 'App.tsx',
        icon: <LuFileCode />,
        closable: true,
        payload: { path: '/src/App.tsx' },
      },
      {
        id: 'file3',
        title: 'styles.css',
        icon: <LuFile />,
        closable: true,
        payload: { path: '/src/styles.css' },
      },
      {
        id: 'file4',
        title: 'vite.config.ts',
        icon: <LuSettings />,
        closable: true,
        payload: { path: '/vite.config.ts' },
      },
    ],
    defaultActiveId: 'file1',
    detachable: true,
    detachThresholdPx: 18,
  },
  render: function DetachableRender(args) {
    const [tabs, setTabs] = useState(args.tabs);
    const [windows, setWindows] = useState<DetachedWindow[]>([]);
    // Track last pointer position in viewport coords for accurate window placement
    const lastPointerRef = useRef({ x: 0, y: 0 });

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    return (
      <div onPointerMove={handlePointerMove} style={{ position: 'relative' }}>
        <EditorTabs
          {...args}
          tabs={tabs}
          onReorder={(nextTabs) => setTabs(nextTabs)}
          onDetachCommit={(commit) => {
            const tab = tabs.find((t) => t.id === commit.id);
            if (!tab) return;

            // Use tracked viewport-relative coords; offset so the window
            // appears centered below the pointer rather than top-left aligned
            setWindows((prev) => [
              ...prev,
              {
                id: commit.id,
                tab,
                x: lastPointerRef.current.x - 210,
                y: lastPointerRef.current.y + 8,
              },
            ]);
            setTabs((prev) => prev.filter((t) => t.id !== commit.id));
          }}
        />
        {windows.map((w) => (
          <FakeWindow
            key={w.id}
            tab={w.tab}
            x={w.x}
            y={w.y}
            onClose={() => {
              setWindows((prev) => prev.filter((p) => p.id !== w.id));
              setTabs((prev) => [...prev, w.tab]);
            }}
          />
        ))}
      </div>
    );
  },
};

export const DetachDisabled: StoryObj<typeof EditorTabs> = {
  args: {
    tabs: [
      { id: 'file1', title: 'index.ts', icon: <LuFileCode />, closable: true },
      { id: 'file2', title: 'App.tsx', icon: <LuFileCode />, closable: true },
      { id: 'file3', title: 'styles.css', icon: <LuFile />, closable: true },
    ],
    defaultActiveId: 'file1',
    detachable: false,
  },
  render: function DetachDisabledRender(args) {
    const [tabs, setTabs] = useState(args.tabs);

    return <EditorTabs {...args} tabs={tabs} onReorder={(nextTabs) => setTabs(nextTabs)} />;
  },
};

// ---------------------------------------------------------------------------
// Cross-window attach stories
// ---------------------------------------------------------------------------

function BrokerFakeWindow({
  tab,
  instanceId,
  x,
  y,
  onClose,
  onRemoveTab,
}: {
  tab: TabDescriptor;
  instanceId: string;
  x: number;
  y: number;
  onClose: () => void;
  onRemoveTab: (tabId: string) => void;
}) {
  const [pos, setPos] = useState({ x, y });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pos],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPos({
      x: dragRef.current.originX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.originY + (e.clientY - dragRef.current.startY),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 420,
        minHeight: 260,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
        border: '1px solid var(--ov-color-border-default, #333)',
        background: 'var(--ov-color-bg-surface, #1e1e1e)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        fontFamily: 'var(--ov-font-sans, system-ui, sans-serif)',
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          background: 'var(--ov-color-bg-surface-raised, #252526)',
          borderBottom: '1px solid var(--ov-color-border-default, #333)',
          cursor: 'grab',
          userSelect: 'none',
          fontSize: 13,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#ff5f57',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontSize: 8,
              color: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = '#4a0002';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = 'transparent';
            }}
          >
            <LuX />
          </button>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <span style={{ flex: 1, textAlign: 'center', opacity: 0.8, fontSize: 12 }}>
          {tab.title}
        </span>
      </div>
      <div
        style={{
          background: 'var(--ov-color-editor-group-header-bg, #1e1e1e)',
          borderBottom: '1px solid var(--ov-color-border-default, #333)',
        }}
      >
        <EditorTabs
          tabs={[{ ...tab, closable: false }]}
          defaultActiveId={tab.id}
          detachable={true}
          detachToBroker={true}
          instanceId={instanceId}
          onDetachCommit={(commit) => {
            onRemoveTab(commit.id);
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          padding: '12px 16px',
          fontSize: 12,
          fontFamily: 'var(--ov-font-mono, "SF Mono", "Fira Code", monospace)',
          lineHeight: 1.6,
          color: 'var(--ov-color-fg-default, #d4d4d4)',
          whiteSpace: 'pre',
          overflow: 'auto',
        }}
      >
        {fileContents[tab.title] ?? `// ${tab.title}\n// No preview available`}
      </div>
    </div>
  );
}

/**
 * Cross-window attach: Detach a tab to spawn a FakeWindow, then drag a tab
 * from the FakeWindow back onto the main strip (or another window).
 *
 * **Demo flow:**
 * 1. Drag a tab downward from the main strip to detach → FakeWindow spawns
 * 2. Drag a tab downward from a FakeWindow → ghost follows pointer
 * 3. Move ghost over the main strip → strip highlights with insertion indicator
 * 4. Release → tab attaches at that position
 * 5. Release elsewhere → tab returns to its source FakeWindow
 */
export const CrossWindowAttach: StoryObj<typeof EditorTabs> = {
  args: {
    tabs: [
      {
        id: 'file1',
        title: 'index.ts',
        icon: <LuFileCode />,
        closable: true,
        payload: { path: '/src/index.ts' },
      },
      {
        id: 'file2',
        title: 'App.tsx',
        icon: <LuFileCode />,
        closable: true,
        payload: { path: '/src/App.tsx' },
      },
      {
        id: 'file3',
        title: 'styles.css',
        icon: <LuFile />,
        closable: true,
        payload: { path: '/src/styles.css' },
      },
      {
        id: 'file4',
        title: 'vite.config.ts',
        icon: <LuSettings />,
        closable: true,
        payload: { path: '/vite.config.ts' },
      },
    ],
    defaultActiveId: 'file1',
    detachable: true,
    detachThresholdPx: 18,
  },
  render: function CrossWindowAttachRender(args) {
    const [tabs, setTabs] = useState(args.tabs);
    const [windows, setWindows] = useState<DetachedWindow[]>([]);
    const lastPointerRef = useRef({ x: 0, y: 0 });

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleAttachTab = useCallback((commit: AttachCommit) => {
      // Remove from source window if it came from one
      setWindows((prev) => prev.filter((w) => w.tab.id !== commit.tab.id));
      // Insert at the specified position
      setTabs((prev) => {
        const filtered = prev.filter((t) => t.id !== commit.tab.id);
        const idx = Math.min(commit.insertIndex, filtered.length);
        const next = [...filtered];
        next.splice(idx, 0, commit.tab);
        return next;
      });
    }, []);

    const handleCancel = useCallback(
      (session: { tab: TabDescriptor; sourceInstanceId: string }) => {
        // Only re-create FakeWindow if the source was a window (not the main strip)
        if (!session.sourceInstanceId.startsWith('window-')) return;
        setWindows((prev) => {
          if (prev.some((w) => w.tab.id === session.tab.id)) return prev;
          return [...prev, { id: session.tab.id, tab: session.tab, x: 200, y: 200 }];
        });
      },
      [],
    );

    return (
      <TabDragBrokerProvider onCancel={handleCancel}>
        <div onPointerMove={handlePointerMove} style={{ position: 'relative' }}>
          <EditorTabs
            {...args}
            tabs={tabs}
            instanceId="main"
            onReorder={(nextTabs) => setTabs(nextTabs)}
            onAttachTab={handleAttachTab}
            onDetachCommit={(commit) => {
              const tab = tabs.find((t) => t.id === commit.id);
              if (!tab) return;
              setWindows((prev) => [
                ...prev,
                {
                  id: commit.id,
                  tab,
                  x: lastPointerRef.current.x - 210,
                  y: lastPointerRef.current.y + 8,
                },
              ]);
              setTabs((prev) => prev.filter((t) => t.id !== commit.id));
            }}
          />
          {windows.map((w) => (
            <BrokerFakeWindow
              key={w.id}
              tab={w.tab}
              instanceId={`window-${w.id}`}
              x={w.x}
              y={w.y}
              onRemoveTab={(tabId) => {
                setWindows((prev) => prev.filter((p) => p.tab.id !== tabId));
              }}
              onClose={() => {
                setWindows((prev) => prev.filter((p) => p.id !== w.id));
                setTabs((prev) => [...prev, w.tab]);
              }}
            />
          ))}
        </div>
      </TabDragBrokerProvider>
    );
  },
};

/**
 * Split pane attach: Two EditorTabs side by side. Drag a tab vertically from
 * one pane and drop it onto the other pane's tab strip.
 *
 * **Demo flow:**
 * 1. Drag a tab downward from the left pane → ghost follows pointer
 * 2. Move ghost over the right pane → right strip highlights with insertion indicator
 * 3. Release → tab moves from left to right pane at the drop position
 * 4. Works in both directions
 */
export const SplitPaneAttach: StoryObj<typeof EditorTabs> = {
  render: function SplitPaneAttachRender() {
    const [leftTabs, setLeftTabs] = useState<TabDescriptor[]>([
      { id: 'l1', title: 'index.ts', icon: <LuFileCode /> },
      { id: 'l2', title: 'App.tsx', icon: <LuCode /> },
      { id: 'l3', title: 'styles.css', icon: <LuFileType /> },
    ]);
    const [rightTabs, setRightTabs] = useState<TabDescriptor[]>([
      { id: 'r1', title: 'README.md', icon: <LuFileText /> },
      { id: 'r2', title: 'vite.config.ts', icon: <LuSettings /> },
    ]);
    const [leftActiveId, setLeftActiveId] = useState<string | undefined>('l1');
    const [rightActiveId, setRightActiveId] = useState<string | undefined>('r1');

    const handleLeftAttach = useCallback((commit: AttachCommit) => {
      setRightTabs((prev) => prev.filter((t) => t.id !== commit.tab.id));
      setLeftTabs((prev) => {
        const filtered = prev.filter((t) => t.id !== commit.tab.id);
        const idx = Math.min(commit.insertIndex, filtered.length);
        const next = [...filtered];
        next.splice(idx, 0, commit.tab);
        return next;
      });
      // Activate the dropped tab
      setLeftActiveId(commit.tab.id);
    }, []);

    const handleRightAttach = useCallback((commit: AttachCommit) => {
      setLeftTabs((prev) => prev.filter((t) => t.id !== commit.tab.id));
      setRightTabs((prev) => {
        const filtered = prev.filter((t) => t.id !== commit.tab.id);
        const idx = Math.min(commit.insertIndex, filtered.length);
        const next = [...filtered];
        next.splice(idx, 0, commit.tab);
        return next;
      });
      // Activate the dropped tab
      setRightActiveId(commit.tab.id);
    }, []);

    const handleLeftDetach = useCallback((commit: { id: string }) => {
      setLeftTabs((prev) => {
        const remaining = prev.filter((t) => t.id !== commit.id);
        // If we detached the active tab, select a neighbor
        setLeftActiveId((current) => {
          if (current !== commit.id) return current;
          return remaining[0]?.id;
        });
        return remaining;
      });
    }, []);

    const handleRightDetach = useCallback((commit: { id: string }) => {
      setRightTabs((prev) => {
        const remaining = prev.filter((t) => t.id !== commit.id);
        setRightActiveId((current) => {
          if (current !== commit.id) return current;
          return remaining[0]?.id;
        });
        return remaining;
      });
    }, []);

    const handleCancel = useCallback(
      (session: { tab: TabDescriptor; sourceInstanceId: string }) => {
        if (session.sourceInstanceId === 'left') {
          setLeftTabs((prev) =>
            prev.some((t) => t.id === session.tab.id) ? prev : [...prev, session.tab],
          );
        } else if (session.sourceInstanceId === 'right') {
          setRightTabs((prev) =>
            prev.some((t) => t.id === session.tab.id) ? prev : [...prev, session.tab],
          );
        }
      },
      [],
    );

    return (
      <TabDragBrokerProvider onCancel={handleCancel}>
        <SplitPaneInner
          leftTabs={leftTabs}
          rightTabs={rightTabs}
          leftActiveId={leftActiveId}
          rightActiveId={rightActiveId}
          setLeftActiveId={setLeftActiveId}
          setRightActiveId={setRightActiveId}
          setLeftTabs={setLeftTabs}
          setRightTabs={setRightTabs}
          onLeftAttach={handleLeftAttach}
          onRightAttach={handleRightAttach}
          onLeftDetach={handleLeftDetach}
          onRightDetach={handleRightDetach}
        />
      </TabDragBrokerProvider>
    );
  },
};

function SplitPaneInner({
  leftTabs,
  rightTabs,
  leftActiveId,
  rightActiveId,
  setLeftActiveId,
  setRightActiveId,
  setLeftTabs,
  setRightTabs,
  onLeftAttach,
  onRightAttach,
  onLeftDetach,
  onRightDetach,
}: {
  leftTabs: TabDescriptor[];
  rightTabs: TabDescriptor[];
  leftActiveId: string | undefined;
  rightActiveId: string | undefined;
  setLeftActiveId: (id: string) => void;
  setRightActiveId: (id: string) => void;
  setLeftTabs: React.Dispatch<React.SetStateAction<TabDescriptor[]>>;
  setRightTabs: React.Dispatch<React.SetStateAction<TabDescriptor[]>>;
  onLeftAttach: (commit: AttachCommit) => void;
  onRightAttach: (commit: AttachCommit) => void;
  onLeftDetach: (commit: { id: string }) => void;
  onRightDetach: (commit: { id: string }) => void;
}) {
  const leftActiveTab = leftTabs.find((t) => t.id === leftActiveId) ?? leftTabs[0];
  const rightActiveTab = rightTabs.find((t) => t.id === rightActiveId) ?? rightTabs[0];

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      <div
        style={{
          flex: 1,
          border: '1px solid var(--ov-color-border-default, #333)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '4px 8px',
            fontSize: 11,
            opacity: 0.6,
            background: 'var(--ov-color-bg-surface-raised, #252526)',
          }}
        >
          Left Pane
        </div>
        <EditorTabs
          tabs={leftTabs}
          activeId={leftActiveId}
          onActiveChange={setLeftActiveId}
          detachable={true}
          detachToBroker={true}
          instanceId="left"
          onReorder={(nextTabs) => setLeftTabs(nextTabs)}
          onAttachTab={onLeftAttach}
          onDetachCommit={onLeftDetach}
        />
        <div
          style={{
            padding: '12px 16px',
            fontSize: 12,
            fontFamily: 'var(--ov-font-mono, monospace)',
            color: 'var(--ov-color-fg-default, #d4d4d4)',
            minHeight: 120,
            whiteSpace: 'pre',
          }}
        >
          {leftActiveTab
            ? (fileContents[leftActiveTab.title] ?? `// ${leftActiveTab.title}`)
            : '// No files open'}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          border: '1px solid var(--ov-color-border-default, #333)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '4px 8px',
            fontSize: 11,
            opacity: 0.6,
            background: 'var(--ov-color-bg-surface-raised, #252526)',
          }}
        >
          Right Pane
        </div>
        <EditorTabs
          tabs={rightTabs}
          activeId={rightActiveId}
          onActiveChange={setRightActiveId}
          detachable={true}
          detachToBroker={true}
          instanceId="right"
          onReorder={(nextTabs) => setRightTabs(nextTabs)}
          onAttachTab={onRightAttach}
          onDetachCommit={onRightDetach}
        />
        <div
          style={{
            padding: '12px 16px',
            fontSize: 12,
            fontFamily: 'var(--ov-font-mono, monospace)',
            color: 'var(--ov-color-fg-default, #d4d4d4)',
            minHeight: 120,
            whiteSpace: 'pre',
          }}
        >
          {rightActiveTab
            ? (fileContents[rightActiveTab.title] ?? `// ${rightActiveTab.title}`)
            : '// No files open'}
        </div>
      </div>
    </div>
  );
}
