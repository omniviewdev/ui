import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs.Root,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'brand',
    size: 'md',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost', 'flat'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => (
    <Tabs.Root {...args} defaultValue="overview" style={{ width: 520 }}>
      <Tabs.List aria-label="Workspace sections">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="operations">Operations</Tabs.Tab>
        <Tabs.Tab value="connections">Connections</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="overview">Overview panel content</Tabs.Panel>
      <Tabs.Panel value="operations">Operations panel content</Tabs.Panel>
      <Tabs.Panel value="connections">Connections panel content</Tabs.Panel>
    </Tabs.Root>
  ),
} satisfies Meta<typeof Tabs.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithBadges: Story = {
  render: (args) => (
    <Tabs.Root {...args} defaultValue="queued" style={{ width: 520 }}>
      <Tabs.List aria-label="Transfer status">
        <Tabs.Tab value="queued" endDecorator={<span style={{ fontSize: 10, background: 'var(--ov-color-info-soft)', color: 'var(--ov-color-info)', padding: '0 4px', borderRadius: 999, fontWeight: 600 }}>2</span>}>
          Queued
        </Tabs.Tab>
        <Tabs.Tab value="failed" endDecorator={<span style={{ fontSize: 10, background: 'var(--ov-color-danger-soft)', color: 'var(--ov-color-danger)', padding: '0 4px', borderRadius: 999, fontWeight: 600 }}>1</span>}>
          Failed
        </Tabs.Tab>
        <Tabs.Tab value="completed" endDecorator={<span style={{ fontSize: 10, background: 'var(--ov-color-success-soft)', color: 'var(--ov-color-success)', padding: '0 4px', borderRadius: 999, fontWeight: 600 }}>5</span>}>
          Completed
        </Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="queued">Queued transfers</Tabs.Panel>
      <Tabs.Panel value="failed">Failed transfers</Tabs.Panel>
      <Tabs.Panel value="completed">Completed transfers</Tabs.Panel>
    </Tabs.Root>
  ),
};
