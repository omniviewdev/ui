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
import type { TabDescriptor, TabGroupDescriptor, TabGroupId, TabId } from './types';

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
      options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info'],
      description: 'Active indicator color',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
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
    const [groups, setGroups] = useState<TabGroupDescriptor[]>(
      args.groups ?? [],
    );

    const handleToggle = useCallback((groupId: TabGroupId) => {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g)),
      );
    }, []);

    return (
      <EditorTabs
        {...args}
        groups={groups}
        onToggleGroupCollapsed={handleToggle}
      />
    );
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
          if (!next.some((t) => t.id === current) && next.length > 0) return next[next.length - 1]!.id;
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
      setTabs((prev) =>
        prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)),
      );
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
                onClick={() => { const id = getContextTab(); if (id) closeTab(id); }}
              >
                Close
              </ContextMenu.Item>
              <ContextMenu.Item
                startDecorator={<LuCircleX size={14} />}
                onClick={() => { const id = getContextTab(); if (id) closeOthers(id); }}
              >
                Close Others
              </ContextMenu.Item>
              <ContextMenu.Item
                startDecorator={<LuArrowRightToLine size={14} />}
                onClick={() => { const id = getContextTab(); if (id) closeToRight(id); }}
              >
                Close to the Right
              </ContextMenu.Item>
              <ContextMenu.Item
                startDecorator={<LuArrowLeftToLine size={14} />}
                onClick={() => { const id = getContextTab(); if (id) closeToLeft(id); }}
              >
                Close to the Left
              </ContextMenu.Item>
              <ContextMenu.Item
                startDecorator={<LuCircleX size={14} />}
                onClick={closeAll}
              >
                Close All
              </ContextMenu.Item>

              <ContextMenu.Separator />

              {/* ── Tab organization ── */}
              <ContextMenu.Item
                startDecorator={<LuPin size={14} />}
                onClick={() => { const id = getContextTab(); if (id) togglePin(id); }}
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
