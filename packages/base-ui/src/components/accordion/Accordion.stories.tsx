import type { Meta, StoryObj } from '@storybook/react';
import { LuFile, LuFolder, LuGitBranch, LuSearch, LuSettings, LuTerminal } from 'react-icons/lu';
import type { AccordionProps } from './Accordion';
import { Accordion } from './Accordion';

const meta = {
  title: 'Data Display/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: {
    exclusive: false,
    animation: 'default',
    size: 'md',
  },
  argTypes: {
    exclusive: { control: 'boolean' },
    defaultExpanded: { control: 'object' },
    animation: { control: 'inline-radio', options: ['default', 'fast', 'none'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<AccordionProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Accordion {...args}>
      <Accordion.Item id="overview" title="Overview">
        <p>This is the overview section with general information about the topic.</p>
      </Accordion.Item>
      <Accordion.Item id="details" title="Details">
        <p>Here you will find more detailed information and specifics.</p>
      </Accordion.Item>
      <Accordion.Item id="advanced" title="Advanced">
        <p>Advanced configuration options and settings live here.</p>
      </Accordion.Item>
    </Accordion>
  ),
};

export const Small: Story = {
  name: 'Size: sm',
  render: () => (
    <Accordion size="sm" defaultExpanded={['files']}>
      <Accordion.Item id="files" title="Open Editors" icon={<LuFile />} count={3}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--ov-color-fg-muted)' }}>
          <div>index.tsx</div>
          <div>App.module.css</div>
          <div>utils.ts</div>
        </div>
      </Accordion.Item>
      <Accordion.Item id="explorer" title="Explorer" icon={<LuFolder />}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--ov-color-fg-muted)' }}>
          <div>src/</div>
          <div>public/</div>
          <div>package.json</div>
        </div>
      </Accordion.Item>
      <Accordion.Item id="outline" title="Outline" icon={<LuSearch />}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--ov-color-fg-muted)' }}>
          No symbols found in the current file.
        </div>
      </Accordion.Item>
      <Accordion.Item id="timeline" title="Timeline" icon={<LuGitBranch />}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--ov-color-fg-muted)' }}>
          No timeline entries.
        </div>
      </Accordion.Item>
    </Accordion>
  ),
};

export const Medium: Story = {
  name: 'Size: md (default)',
  render: () => (
    <Accordion size="md" defaultExpanded={['general']}>
      <Accordion.Item id="general" title="General" icon={<LuSettings />}>
        <p>General application settings and preferences.</p>
      </Accordion.Item>
      <Accordion.Item id="terminal" title="Terminal" icon={<LuTerminal />}>
        <p>Terminal configuration and shell settings.</p>
      </Accordion.Item>
      <Accordion.Item id="source-control" title="Source Control" icon={<LuGitBranch />} count={5}>
        <p>Git and version control settings.</p>
      </Accordion.Item>
    </Accordion>
  ),
};

export const Large: Story = {
  name: 'Size: lg',
  render: () => (
    <Accordion size="lg" defaultExpanded={['faq-1']}>
      <Accordion.Item id="faq-1" title="What is your return policy?">
        <p>
          We offer a 30-day return policy on all items. Items must be in their original packaging
          and condition. Contact our support team to initiate a return.
        </p>
      </Accordion.Item>
      <Accordion.Item id="faq-2" title="How long does shipping take?">
        <p>
          Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business
          day delivery. International orders may take longer.
        </p>
      </Accordion.Item>
      <Accordion.Item id="faq-3" title="Do you offer international shipping?">
        <p>
          Yes, we ship to over 40 countries worldwide. Shipping costs and delivery times vary by
          destination. Check our shipping page for details.
        </p>
      </Accordion.Item>
    </Accordion>
  ),
};

export const SizeComparison: Story = {
  name: 'Size comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <p
            style={{
              margin: '0 0 8px',
              fontFamily: 'var(--ov-font-sans)',
              fontSize: 'var(--ov-font-size-caption)',
              color: 'var(--ov-color-fg-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {size}
          </p>
          <Accordion size={size} defaultExpanded={['item']}>
            <Accordion.Item id="item" title="Expanded item" icon={<LuFolder />} count={7}>
              <p>Content at {size} size.</p>
            </Accordion.Item>
            <Accordion.Item id="collapsed" title="Collapsed item" icon={<LuFile />}>
              <p>Hidden content.</p>
            </Accordion.Item>
          </Accordion>
        </div>
      ))}
    </div>
  ),
};

export const SidebarPanel: Story = {
  name: 'Sidebar panel (VSCode-like)',
  render: () => (
    <div
      style={{
        width: 260,
        background: 'var(--ov-color-bg-surface)',
        borderRight: '1px solid var(--ov-color-border-muted)',
        height: 400,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Accordion size="sm" exclusive defaultExpanded={['explorer']} style={{ flex: 1 }}>
        <Accordion.Item id="editors" title="Open Editors" icon={<LuFile />} count={2} disableContentPadding>
          <div style={{ fontSize: '0.75rem', color: 'var(--ov-color-fg-muted)', lineHeight: 1.8, padding: '0 8px 6px' }}>
            <div>Welcome.tsx</div>
            <div>package.json</div>
          </div>
        </Accordion.Item>
        <Accordion.Item id="explorer" title="Explorer" icon={<LuFolder />} disableContentPadding>
          <div style={{ fontSize: '0.75rem', color: 'var(--ov-color-fg-muted)', lineHeight: 1.8, padding: '0 8px 6px' }}>
            <div>src/</div>
            <div>public/</div>
            <div>node_modules/</div>
            <div>package.json</div>
            <div>tsconfig.json</div>
            <div>README.md</div>
          </div>
        </Accordion.Item>
        <Accordion.Item id="outline" title="Outline" icon={<LuSearch />}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ov-color-fg-muted)' }}>
            The active editor cannot provide outline information.
          </div>
        </Accordion.Item>
        <Accordion.Item id="timeline" title="Timeline" icon={<LuGitBranch />}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ov-color-fg-muted)' }}>
            No timeline entries.
          </div>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
};

export const MultipleOpen: Story = {
  name: 'Multiple items open (non-exclusive)',
  render: () => (
    <Accordion defaultExpanded={['first', 'third']}>
      <Accordion.Item id="first" title="First section">
        <p>This section starts expanded.</p>
      </Accordion.Item>
      <Accordion.Item id="second" title="Second section">
        <p>This section starts collapsed.</p>
      </Accordion.Item>
      <Accordion.Item id="third" title="Third section">
        <p>This section also starts expanded.</p>
      </Accordion.Item>
    </Accordion>
  ),
};

export const ExclusiveMode: Story = {
  name: 'Exclusive mode',
  render: () => (
    <Accordion exclusive defaultExpanded={['alpha']}>
      <Accordion.Item id="alpha" title="Alpha">
        <p>Only one section can be open at a time. Click another header to switch.</p>
      </Accordion.Item>
      <Accordion.Item id="beta" title="Beta">
        <p>Opening this closes Alpha.</p>
      </Accordion.Item>
      <Accordion.Item id="gamma" title="Gamma">
        <p>Opening this closes whichever is currently open.</p>
      </Accordion.Item>
    </Accordion>
  ),
};

export const WithCounts: Story = {
  name: 'With counts',
  render: () => (
    <Accordion>
      <Accordion.Item id="errors" title="Errors" count={3}>
        <p>There are 3 errors to review.</p>
      </Accordion.Item>
      <Accordion.Item id="warnings" title="Warnings" count={12}>
        <p>There are 12 warnings to review.</p>
      </Accordion.Item>
      <Accordion.Item id="info" title="Info" count={0}>
        <p>No informational messages.</p>
      </Accordion.Item>
    </Accordion>
  ),
};

export const WithEndDecorators: Story = {
  name: 'With end decorators',
  render: () => (
    <Accordion>
      <Accordion.Item
        id="cpu"
        title="CPU Usage"
        endDecorator={
          <span style={{ fontSize: '0.75rem', color: 'var(--ov-color-fg-muted)' }}>72%</span>
        }
      >
        <p>Current CPU utilization across all cores.</p>
      </Accordion.Item>
      <Accordion.Item
        id="memory"
        title="Memory"
        endDecorator={
          <span style={{ fontSize: '0.75rem', color: 'var(--ov-color-fg-muted)' }}>4.2 GB</span>
        }
      >
        <p>Current memory allocation and usage.</p>
      </Accordion.Item>
      <Accordion.Item
        id="disk"
        title="Disk"
        endDecorator={
          <span style={{ fontSize: '0.75rem', color: 'var(--ov-color-fg-muted)' }}>
            120 GB free
          </span>
        }
      >
        <p>Available disk space on primary volume.</p>
      </Accordion.Item>
    </Accordion>
  ),
};

export const DisabledItems: Story = {
  name: 'Disabled items',
  render: () => (
    <Accordion defaultExpanded={['enabled']}>
      <Accordion.Item id="enabled" title="Enabled section">
        <p>This section can be toggled normally.</p>
      </Accordion.Item>
      <Accordion.Item id="locked" title="Locked section" disabled>
        <p>This content is not reachable because the item is disabled.</p>
      </Accordion.Item>
      <Accordion.Item id="also-enabled" title="Another enabled section">
        <p>This section works fine too.</p>
      </Accordion.Item>
    </Accordion>
  ),
};
