import type { Meta, StoryObj } from '@storybook/react';
import type { AccordionProps } from './Accordion';
import { Accordion } from './Accordion';

const meta = {
  title: 'Data Display/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: {
    exclusive: false,
  },
  argTypes: {
    exclusive: { control: 'boolean' },
    defaultExpanded: { control: 'object' },
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
