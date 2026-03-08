import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Card } from '../card';
import { Separator, type SeparatorProps } from './Separator';

const meta = {
  title: 'Layout/Separator',
  component: Separator,
  tags: ['autodocs'],
  args: {
    variant: 'solid',
    color: 'neutral',
    size: 'md',
    orientation: 'horizontal',
    inset: 'none',
    label: '',
    labelAlign: 'center',
    decorative: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    inset: { control: 'inline-radio', options: ['none', 'start', 'end', 'middle'] },
    labelAlign: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    decorative: { control: 'boolean' },
  },
  render: (args) =>
    args.orientation === 'vertical' ? (
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 12,
          minHeight: 72,
          border: '1px solid var(--ov-color-border-default)',
          borderRadius: 'var(--ov-radius-surface)',
          padding: 12,
        }}
      >
        <span style={{ alignSelf: 'center' }}>Left Pane</span>
        <Separator {...args} />
        <span style={{ alignSelf: 'center' }}>Right Pane</span>
      </div>
    ) : (
      <div style={{ display: 'grid', gap: 12, width: '100%' }}>
        <span>Above</span>
        <Separator {...args} />
        <span>Below</span>
      </div>
    ),
} satisfies Meta<SeparatorProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const LabeledVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 14 }}>
      <Separator label="Workspace" labelAlign="start" />
      <Separator label="Runtime" labelAlign="center" color="brand" />
      <Separator label="Diagnostics" labelAlign="end" color="warning" />
    </div>
  ),
};

export const InCardUsage: Story = {
  render: () => (
    <Card style={{ width: 460 }}>
      <Card.Header>
        <Card.Title>Session</Card.Title>
        <Card.Description>Connected to runtime and healthy.</Card.Description>
      </Card.Header>
      <Separator inset="middle" />
      <Card.Body style={{ display: 'grid', gap: 8 }}>
        <div>Queue depth: 3</div>
        <div>Workers online: 12</div>
      </Card.Body>
      <Separator inset="middle" label="Actions" />
      <Card.Footer>
        <Button color="brand" variant="solid">
          Open
        </Button>
        <Button variant="ghost">Dismiss</Button>
      </Card.Footer>
    </Card>
  ),
};

export const VerticalPaneDivider: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'stretch',
        gap: 0,
        minHeight: 140,
        border: '1px solid var(--ov-color-border-default)',
        borderRadius: 'var(--ov-radius-surface)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 12, background: 'var(--ov-color-bg-surface)' }}>Explorer</div>
      <Separator orientation="vertical" variant="solid" color="neutral" />
      <div style={{ padding: 12, background: 'var(--ov-color-bg-surface-raised)' }}>Editor</div>
    </div>
  ),
};
