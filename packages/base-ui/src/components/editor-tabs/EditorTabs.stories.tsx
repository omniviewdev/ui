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
import type {
  TabDescriptor,
  TabGroupDescriptor,
  TabGroupId,
  TabId,
  AttachCommit,
  DetachCommit,
  RemoteTabDragEvent,
  RemoteTabDropResult,
  TabDragPayload,
  TabDragTransport,
  TabDragType,
  TabTransferCommit,
} from './types';

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

function insertTabAt(tabs: TabDescriptor[], tab: TabDescriptor, index: number): TabDescriptor[] {
  const next = tabs.filter((t) => t.id !== tab.id);
  next.splice(Math.min(index, next.length), 0, tab);
  return next;
}

/** Tab list + active tab of one strip, with the broker callbacks every strip needs. */
interface StripTabs {
  tabs: TabDescriptor[];
  setTabs: React.Dispatch<React.SetStateAction<TabDescriptor[]>>;
  activeId: TabId | undefined;
  setActiveId: React.Dispatch<React.SetStateAction<TabId | undefined>>;
  attachTab: (commit: AttachCommit) => void;
  removeTab: (id: TabId) => void;
}

function useStripTabs(initialTabs: TabDescriptor[]): StripTabs {
  const [tabs, setTabs] = useState(initialTabs);
  const [activeId, setActiveId] = useState<TabId | undefined>(initialTabs[0]?.id);

  const attachTab = (commit: AttachCommit) => {
    setTabs((prev) => insertTabAt(prev, commit.tab, commit.insertIndex));
    setActiveId(commit.tab.id);
  };

  const removeTab = (id: TabId) => {
    setTabs((prev) => prev.filter((t) => t.id !== id));
    setActiveId((current) => (current === id ? tabs.find((t) => t.id !== id)?.id : current));
  };

  return { tabs, setTabs, activeId, setActiveId, attachTab, removeTab };
}

type BrokerWindow = { id: string; tabs: TabDescriptor[]; x: number; y: number };

function BrokerFakeWindow({
  instanceId,
  tabs,
  x,
  y,
  onClose,
  onReorder,
  onAttachTab,
  onTabTransferred,
  onDetachCommit,
}: {
  instanceId: string;
  tabs: TabDescriptor[];
  x: number;
  y: number;
  onClose: () => void;
  onReorder: (nextTabs: TabDescriptor[]) => void;
  onAttachTab: (commit: AttachCommit) => void;
  onTabTransferred: (commit: TabTransferCommit) => void;
  onDetachCommit: (commit: DetachCommit) => void;
}) {
  const [pos, setPos] = useState({ x, y });
  const [selectedId, setSelectedId] = useState<TabId | undefined>(tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === selectedId) ?? tabs[0];
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
          {activeTab?.title}
        </span>
      </div>
      <div
        style={{
          background: 'var(--ov-color-editor-group-header-bg, #1e1e1e)',
          borderBottom: '1px solid var(--ov-color-border-default, #333)',
        }}
      >
        <EditorTabs
          tabs={tabs}
          activeId={activeTab?.id}
          onActiveChange={setSelectedId}
          detachable={true}
          detachToBroker={true}
          instanceId={instanceId}
          onReorder={onReorder}
          onAttachTab={(commit) => {
            onAttachTab(commit);
            setSelectedId(commit.tab.id);
          }}
          onTabTransferred={onTabTransferred}
          onDetachCommit={onDetachCommit}
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
        {activeTab
          ? (fileContents[activeTab.title] ?? `// ${activeTab.title}\n// No preview available`)
          : null}
      </div>
    </div>
  );
}

/**
 * Cross-window attach: every strip (main and each FakeWindow) is both a drag
 * source and a drop target on one shared TabDragBrokerProvider.
 *
 * **Demo flow:**
 * 1. Drag a tab out of any strip and release over nothing → a FakeWindow opens
 *    at the release point holding that tab (tear-off).
 * 2. Drag a tab onto another strip (main or a window) → the strip highlights
 *    with an insertion indicator; release attaches it there and the source
 *    removes it (`onTabTransferred`).
 * 3. A window whose last tab leaves closes. Press Escape mid-drag to cancel:
 *    the tab never leaves its strip.
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
    detachable: true,
    detachThresholdPx: 18,
    detachToBroker: true,
  },
  render: function CrossWindowAttachRender(args) {
    const main = useStripTabs(args.tabs);
    const [windows, setWindows] = useState<BrokerWindow[]>([]);

    const openWindowAtRelease = (tab: TabDescriptor, commit: DetachCommit) => {
      const { clientX, clientY } = commit;
      setWindows((prev) => [
        ...prev,
        // Center the window horizontally under the release point.
        { id: `window-${tab.id}-${Date.now()}`, tabs: [tab], x: clientX - 210, y: clientY - 16 },
      ]);
    };

    /** Applies `update` to a window's tabs; a window left without tabs closes. */
    const updateWindowTabs = (
      windowId: string,
      update: (tabs: TabDescriptor[]) => TabDescriptor[],
    ) => {
      setWindows((prev) =>
        prev.flatMap((w) => {
          if (w.id !== windowId) return [w];
          const nextTabs = update(w.tabs);
          return nextTabs.length > 0 ? [{ ...w, tabs: nextTabs }] : [];
        }),
      );
    };

    return (
      <TabDragBrokerProvider>
        <EditorTabs
          {...args}
          tabs={main.tabs}
          activeId={main.activeId}
          onActiveChange={main.setActiveId}
          instanceId="main"
          onReorder={(nextTabs) => main.setTabs(nextTabs)}
          onAttachTab={main.attachTab}
          onTabTransferred={(commit) => main.removeTab(commit.id)}
          onDetachCommit={(commit) => {
            const tab = main.tabs.find((t) => t.id === commit.id);
            if (!tab) return;
            main.removeTab(commit.id);
            openWindowAtRelease(tab, commit);
          }}
        />
        {windows.map((w) => (
          <BrokerFakeWindow
            key={w.id}
            instanceId={w.id}
            tabs={w.tabs}
            x={w.x}
            y={w.y}
            onReorder={(nextTabs) => updateWindowTabs(w.id, () => nextTabs)}
            onAttachTab={(commit) =>
              updateWindowTabs(w.id, (tabs) => insertTabAt(tabs, commit.tab, commit.insertIndex))
            }
            onTabTransferred={(commit) =>
              updateWindowTabs(w.id, (tabs) => tabs.filter((t) => t.id !== commit.id))
            }
            onDetachCommit={(commit) => {
              const tab = w.tabs.find((t) => t.id === commit.id);
              if (!tab) return;
              updateWindowTabs(w.id, (tabs) => tabs.filter((t) => t.id !== commit.id));
              openWindowAtRelease(tab, commit);
            }}
            onClose={() => {
              setWindows((prev) => prev.filter((p) => p.id !== w.id));
              main.setTabs((prev) => [...prev, ...w.tabs]);
            }}
          />
        ))}
      </TabDragBrokerProvider>
    );
  },
};

/** One tab strip with a header label and the active tab's content below it. */
function StripPane({
  label,
  instanceId,
  strip,
  dragType,
}: {
  label: string;
  instanceId: string;
  strip: StripTabs;
  dragType?: TabDragType;
}) {
  const activeTab = strip.tabs.find((t) => t.id === strip.activeId) ?? strip.tabs[0];

  return (
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
        {label}
      </div>
      <EditorTabs
        tabs={strip.tabs}
        activeId={activeTab?.id}
        onActiveChange={strip.setActiveId}
        detachable={true}
        detachToBroker={true}
        instanceId={instanceId}
        dragType={dragType}
        onReorder={(nextTabs) => strip.setTabs(nextTabs)}
        onAttachTab={strip.attachTab}
        onTabTransferred={(commit) => strip.removeTab(commit.id)}
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
        {activeTab
          ? (fileContents[activeTab.title] ?? `// ${activeTab.title}`)
          : '// No files open'}
      </div>
    </div>
  );
}

/**
 * Split pane attach: Two EditorTabs side by side. Drag a tab vertically from
 * one pane and drop it onto the other pane's tab strip.
 *
 * **Demo flow:**
 * 1. Drag a tab downward from the left pane → ghost follows pointer
 * 2. Move ghost over the right pane → right strip highlights with insertion indicator
 * 3. Release → tab moves from left to right pane at the drop position
 * 4. Works in both directions; releasing over nothing leaves the tab where it was
 */
export const SplitPaneAttach: StoryObj<typeof EditorTabs> = {
  render: function SplitPaneAttachRender() {
    const left = useStripTabs([
      { id: 'l1', title: 'index.ts', icon: <LuFileCode /> },
      { id: 'l2', title: 'App.tsx', icon: <LuCode /> },
      { id: 'l3', title: 'styles.css', icon: <LuFileType /> },
    ]);
    const right = useStripTabs([
      { id: 'r1', title: 'README.md', icon: <LuFileText /> },
      { id: 'r2', title: 'vite.config.ts', icon: <LuSettings /> },
    ]);

    return (
      <TabDragBrokerProvider>
        <div style={{ display: 'flex', gap: 2 }}>
          <StripPane label="Left Pane" instanceId="left" strip={left} />
          <StripPane label="Right Pane" instanceId="right" strip={right} />
        </div>
      </TabDragBrokerProvider>
    );
  },
};

// ---------------------------------------------------------------------------
// Cross-document transport story
// ---------------------------------------------------------------------------

type InMemoryDocument = {
  element: HTMLElement | null;
  handlers: Set<(event: RemoteTabDragEvent) => void>;
};

type InMemoryDragSession = {
  sourceDocument: string;
  payload: TabDragPayload;
  hoverDocument: string | null;
};

interface InMemoryTabDragHub {
  createTransport: (documentName: string) => TabDragTransport;
  setDocumentElement: (documentName: string, element: HTMLElement | null) => void;
}

/**
 * Plays the role of the native window service for documents simulated as
 * panes of one page: routes each broker's drag to the pane under the pointer,
 * found by the pane's bounding rect.
 */
function createInMemoryTabDragHub(): InMemoryTabDragHub {
  const documents = new Map<string, InMemoryDocument>();
  const sessions = new Map<string, InMemoryDragSession>();

  const getDocument = (name: string) => {
    let simulatedDocument = documents.get(name);
    if (!simulatedDocument) {
      simulatedDocument = { element: null, handlers: new Set() };
      documents.set(name, simulatedDocument);
    }
    return simulatedDocument;
  };

  const emit = (documentName: string, event: RemoteTabDragEvent) => {
    for (const handler of getDocument(documentName).handlers) handler(event);
  };

  /** The other pane whose rect contains the client point, if any. */
  const findTargetDocument = (session: InMemoryDragSession, clientX: number, clientY: number) => {
    for (const [name, simulatedDocument] of documents) {
      if (name === session.sourceDocument) continue;
      const rect = simulatedDocument.element?.getBoundingClientRect();
      if (!rect) continue;
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return name;
      }
    }
    return null;
  };

  const endSession = (sessionId: string) => {
    sessions.delete(sessionId);
    for (const name of documents.keys()) emit(name, { type: 'end', sessionId });
  };

  const createTransport = (documentName: string): TabDragTransport => ({
    begin(sessionId, payload) {
      sessions.set(sessionId, { sourceDocument: documentName, payload, hoverDocument: null });
    },
    move(sessionId, pointer) {
      const session = sessions.get(sessionId);
      if (!session) return;
      const { clientX, clientY } = pointer;
      const target = findTargetDocument(session, clientX, clientY);
      if (session.hoverDocument && session.hoverDocument !== target) {
        emit(session.hoverDocument, { type: 'leave', sessionId });
      }
      session.hoverDocument = target;
      if (target) {
        emit(target, { type: 'hover', sessionId, payload: session.payload, clientX, clientY });
      }
    },
    drop(sessionId, pointer) {
      const session = sessions.get(sessionId);
      if (!session) return Promise.resolve(null);
      const { clientX, clientY } = pointer;
      const target = findTargetDocument(session, clientX, clientY);
      if (!target) {
        endSession(sessionId);
        return Promise.resolve(null);
      }
      return new Promise<RemoteTabDropResult>((respond) => {
        emit(target, {
          type: 'drop',
          sessionId,
          payload: session.payload,
          clientX,
          clientY,
          respond,
        });
      }).finally(() => endSession(sessionId));
    },
    cancel(sessionId) {
      if (sessions.has(sessionId)) endSession(sessionId);
    },
    subscribe(handler) {
      const { handlers } = getDocument(documentName);
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    },
  });

  const setDocumentElement = (documentName: string, element: HTMLElement | null) => {
    getDocument(documentName).element = element;
  };

  return { createTransport, setDocumentElement };
}

function SimulatedDocumentPane({
  hub,
  documentName,
  initialEditorTabs,
  initialOtherTypeTabs,
}: {
  hub: InMemoryTabDragHub;
  documentName: string;
  initialEditorTabs: TabDescriptor[];
  initialOtherTypeTabs: TabDescriptor[];
}) {
  const [transport] = useState(() => hub.createTransport(documentName));
  const editorStrip = useStripTabs(initialEditorTabs);
  const otherTypeStrip = useStripTabs(initialOtherTypeTabs);

  return (
    <div
      ref={(element) => hub.setDocumentElement(documentName, element)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 8,
        border: '1px dashed var(--ov-color-border-default, #555)',
        borderRadius: 6,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>Simulated window “{documentName}”</div>
      <TabDragBrokerProvider transport={transport}>
        <StripPane
          label="editor-tab strip"
          instanceId={`${documentName}-editor`}
          strip={editorStrip}
        />
        <StripPane
          label="other-type strip (accepts only other-type tabs)"
          instanceId={`${documentName}-other`}
          strip={otherTypeStrip}
          dragType="other-type"
        />
      </TabDragBrokerProvider>
    </div>
  );
}

/**
 * Cross-document transport: two independent TabDragBrokerProviders side by
 * side stand in for two OS windows. They share no React state; tabs cross
 * between them only through an in-memory `TabDragTransport` pair, the same
 * contract the desktop app implements over native windows.
 *
 * **Demo flow:**
 * 1. Drag a tab from the left editor strip into the right pane → the right
 *    pane renders the ghost and highlights its editor strip.
 * 2. Release → the right pane attaches the tab (from its serialized payload,
 *    so without its icon) and the left strip removes it.
 * 3. The other-type strips only exchange tabs with each other; editor tabs
 *    released over them stay in their source strip.
 */
export const CrossDocumentTransport: StoryObj<typeof EditorTabs> = {
  render: function CrossDocumentTransportRender() {
    const [hub] = useState(() => createInMemoryTabDragHub());

    return (
      <div style={{ display: 'flex', gap: 24 }}>
        <SimulatedDocumentPane
          hub={hub}
          documentName="left"
          initialEditorTabs={[
            { id: 'doc-l1', title: 'index.ts', icon: <LuFileCode /> },
            { id: 'doc-l2', title: 'App.tsx', icon: <LuCode /> },
          ]}
          initialOtherTypeTabs={[{ id: 'doc-lo1', title: 'terminal 1' }]}
        />
        <SimulatedDocumentPane
          hub={hub}
          documentName="right"
          initialEditorTabs={[{ id: 'doc-r1', title: 'README.md', icon: <LuFileText /> }]}
          initialOtherTypeTabs={[{ id: 'doc-ro1', title: 'terminal 2' }]}
        />
      </div>
    );
  },
};
