import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, type AppShellProps } from './AppShell';

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
            <button
              onClick={() => setCollapsed((c) => !c)}
              style={{
                padding: '4px 8px',
                fontSize: 12,
                cursor: 'pointer',
                background: 'var(--ov-color-bg-surface-raised)',
                border: '1px solid var(--ov-color-border-default)',
                borderRadius: 'var(--ov-radius-sm, 4px)',
                color: 'var(--ov-color-fg-default)',
              }}
            >
              {collapsed ? 'Expand' : 'Collapse'} Sidebar
            </button>
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
