import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LuPanelLeftClose, LuPanelLeftOpen, LuPanelRightClose, LuPanelRightOpen, LuMessageSquare, LuBox, LuPlug, LuSettings, LuSearch, LuLayers } from 'react-icons/lu';
import { AppShell, type AppShellProps } from './AppShell';
import { Button } from '../button';
import { IconButton } from '../icon-button';

const meta = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  args: {
    sidebarWidth: 240,
    sidebarCollapsed: false,
    sidebarPosition: 'left',
    headerHeight: 40,
    footerHeight: 24,
  },
  argTypes: {
    sidebarWidth: { control: { type: 'number', min: 100, max: 500 } },
    sidebarCollapsed: { control: 'boolean' },
    sidebarPosition: { control: 'radio', options: ['left', 'right'] },
    headerHeight: { control: { type: 'number', min: 20, max: 80 } },
    footerHeight: { control: { type: 'number', min: 16, max: 60 } },
    navRailWidth: { control: { type: 'number', min: 36, max: 72 } },
    secondarySidebarWidth: { control: { type: 'number', min: 100, max: 500 } },
    secondarySidebarCollapsed: { control: 'boolean' },
  },
} satisfies Meta<AppShellProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const SlotLabel = ({ label, area }: { label: string; area: string }) => (
  <div
    style={{
      padding: 8,
      fontSize: 13,
      color: 'var(--ov-color-fg-muted)',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {label} ({area})
  </div>
);

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: 500, border: '1px solid var(--ov-color-border-default)' }}>
      <AppShell {...args}>
        <AppShell.Header>
          <SlotLabel label="Header" area="header" />
        </AppShell.Header>
        <AppShell.Sidebar>
          <SlotLabel label="Sidebar" area="sidebar" />
        </AppShell.Sidebar>
        <AppShell.Content>
          <SlotLabel label="Content" area="content" />
        </AppShell.Content>
        <AppShell.Footer>
          <SlotLabel label="Footer" area="footer" />
        </AppShell.Footer>
      </AppShell>
    </div>
  ),
};

function CollapsibleSidebarDemo() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ height: 400, border: '1px solid var(--ov-color-border-default)' }}>
      <AppShell sidebarCollapsed={collapsed}>
        <AppShell.Header>
          <div style={{ padding: '0 12px' }}>
            <Button
              size="sm"
              variant="outline"
              startDecorator={collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? 'Expand' : 'Collapse'} Sidebar
            </Button>
          </div>
        </AppShell.Header>
        <AppShell.Sidebar>
          <div style={{ padding: 12, fontSize: 13 }}>
            <p>Navigation items</p>
          </div>
        </AppShell.Sidebar>
        <AppShell.Content>
          <SlotLabel label="Main Content" area="content" />
        </AppShell.Content>
        <AppShell.Footer>
          <div style={{ padding: '0 8px', fontSize: 11, color: 'var(--ov-color-fg-muted)' }}>
            Status bar
          </div>
        </AppShell.Footer>
      </AppShell>
    </div>
  );
}

export const CollapsibleSidebar: Story = {
  render: () => <CollapsibleSidebarDemo />,
};

export const RightSidebar: Story = {
  render: () => (
    <div style={{ height: 400, border: '1px solid var(--ov-color-border-default)' }}>
      <AppShell sidebarPosition="right" sidebarWidth={300}>
        <AppShell.Header>
          <SlotLabel label="Header" area="header" />
        </AppShell.Header>
        <AppShell.Sidebar>
          <SlotLabel label="Properties Panel" area="sidebar" />
        </AppShell.Sidebar>
        <AppShell.Content>
          <SlotLabel label="Main Content" area="content" />
        </AppShell.Content>
        <AppShell.Footer>
          <SlotLabel label="Footer" area="footer" />
        </AppShell.Footer>
      </AppShell>
    </div>
  ),
};

export const ContentOnly: Story = {
  name: 'Content Only (No Optional Slots)',
  render: () => (
    <div style={{ height: 300, border: '1px solid var(--ov-color-border-default)' }}>
      <AppShell>
        <AppShell.Content>
          <SlotLabel label="Full Content Area" area="content" />
        </AppShell.Content>
      </AppShell>
    </div>
  ),
};

const NavIcon = ({ icon: Icon, label, active }: { icon: typeof LuMessageSquare; label: string; active?: boolean }) => (
  <IconButton size="sm" variant="ghost" color={active ? 'brand' : 'neutral'} aria-label={label}>
    <Icon size={16} />
  </IconButton>
);

function ThreeColumnDemo() {
  const [secondaryCollapsed, setSecondaryCollapsed] = useState(false);
  const [activeNav] = useState('chat');
  return (
    <div style={{ height: 500, border: '1px solid var(--ov-color-border-default)' }}>
      <AppShell
        navRailWidth={44}
        sidebarWidth={240}
        secondarySidebarWidth={300}
        secondarySidebarCollapsed={secondaryCollapsed}
      >
        <AppShell.NavRail>
          <NavIcon icon={LuMessageSquare} label="Chat" active={activeNav === 'chat'} />
          <NavIcon icon={LuBox} label="Models" active={activeNav === 'models'} />
          <NavIcon icon={LuSearch} label="Search" active={activeNav === 'search'} />
          <NavIcon icon={LuPlug} label="Connections" active={activeNav === 'connections'} />
          <div style={{ marginTop: 'auto' }}>
            <NavIcon icon={LuSettings} label="Settings" active={activeNav === 'settings'} />
          </div>
        </AppShell.NavRail>
        <AppShell.Header>
          <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Desktop App Layout</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSecondaryCollapsed((c) => !c)}
              startDecorator={secondaryCollapsed ? <LuPanelRightOpen size={14} /> : <LuPanelRightClose size={14} />}
              style={{ marginLeft: 'auto' }}
            >
              {secondaryCollapsed ? 'Show' : 'Hide'} Panel
            </Button>
          </div>
        </AppShell.Header>
        <AppShell.Sidebar>
          <div style={{ padding: 'var(--ov-space-3, 12px)', fontSize: 'var(--ov-font-size-sm, 13px)' }}>
            <div style={{ fontWeight: 600, marginBottom: 'var(--ov-space-2, 8px)', color: 'var(--ov-color-fg-default)' }}>Conversations</div>
            {['New Chat', 'Cluster Setup', 'Code Review', 'Debug Session'].map((item, i) => (
              <div
                key={item}
                style={{
                  padding: 'var(--ov-space-1-5, 6px) var(--ov-space-2, 8px)',
                  borderRadius: 'var(--ov-radius-sm, 4px)',
                  cursor: 'pointer',
                  fontSize: 'var(--ov-font-size-xs, 12px)',
                  color: 'var(--ov-color-fg-default)',
                  background: i === 0 ? 'var(--ov-color-bg-hover)' : undefined,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </AppShell.Sidebar>
        <AppShell.Content>
          <SlotLabel label="Main Content" area="content" />
        </AppShell.Content>
        <AppShell.SecondarySidebar>
          <div style={{ padding: 'var(--ov-space-3, 12px)', fontSize: 'var(--ov-font-size-sm, 13px)' }}>
            <div style={{ fontWeight: 600, marginBottom: 'var(--ov-space-2, 8px)', color: 'var(--ov-color-fg-default)' }}>Detail Panel</div>
            <div style={{ fontSize: 'var(--ov-font-size-xs, 12px)', color: 'var(--ov-color-fg-muted)' }}>
              Properties, parameters, or inspector content goes here.
            </div>
          </div>
        </AppShell.SecondarySidebar>
        <AppShell.Footer>
          <div style={{ padding: '0 var(--ov-space-2, 8px)', fontSize: 'var(--ov-font-size-xs, 11px)', color: 'var(--ov-color-fg-muted)' }}>
            Ready
          </div>
        </AppShell.Footer>
      </AppShell>
    </div>
  );
}

export const ThreeColumnLayout: Story = {
  name: 'Three-Column (Nav Rail + Dual Sidebars)',
  render: () => <ThreeColumnDemo />,
};

export const NavRailOnly: Story = {
  name: 'Nav Rail + Sidebar',
  render: () => (
    <div style={{ height: 400, border: '1px solid var(--ov-color-border-default)' }}>
      <AppShell navRailWidth={44} sidebarWidth={220}>
        <AppShell.NavRail>
          <NavIcon icon={LuMessageSquare} label="Chat" active />
          <NavIcon icon={LuBox} label="Models" />
          <NavIcon icon={LuLayers} label="Stacks" />
          <div style={{ marginTop: 'auto' }}>
            <NavIcon icon={LuSettings} label="Settings" />
          </div>
        </AppShell.NavRail>
        <AppShell.Header>
          <SlotLabel label="Header" area="header" />
        </AppShell.Header>
        <AppShell.Sidebar>
          <SlotLabel label="Sidebar" area="sidebar" />
        </AppShell.Sidebar>
        <AppShell.Content>
          <SlotLabel label="Content" area="content" />
        </AppShell.Content>
        <AppShell.Footer>
          <SlotLabel label="Footer" area="footer" />
        </AppShell.Footer>
      </AppShell>
    </div>
  ),
};

function DualSidebarNoRailDemo() {
  const [secondaryCollapsed, setSecondaryCollapsed] = useState(false);
  return (
    <div style={{ height: 400, border: '1px solid var(--ov-color-border-default)' }}>
      <AppShell
        sidebarWidth={200}
        secondarySidebarWidth={280}
        secondarySidebarCollapsed={secondaryCollapsed}
      >
        <AppShell.Header>
          <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Dual Sidebars</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSecondaryCollapsed((c) => !c)}
              style={{ marginLeft: 'auto' }}
            >
              Toggle Right
            </Button>
          </div>
        </AppShell.Header>
        <AppShell.Sidebar>
          <SlotLabel label="Navigation" area="sidebar" />
        </AppShell.Sidebar>
        <AppShell.Content>
          <SlotLabel label="Main Content" area="content" />
        </AppShell.Content>
        <AppShell.SecondarySidebar>
          <SlotLabel label="Inspector" area="secondary" />
        </AppShell.SecondarySidebar>
        <AppShell.Footer>
          <SlotLabel label="Footer" area="footer" />
        </AppShell.Footer>
      </AppShell>
    </div>
  );
}

export const DualSidebarNoRail: Story = {
  name: 'Dual Sidebars (No Nav Rail)',
  render: () => <DualSidebarNoRailDemo />,
};
