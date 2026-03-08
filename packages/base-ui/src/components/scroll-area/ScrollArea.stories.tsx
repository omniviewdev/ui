import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './ScrollArea';

const meta = {
  title: 'Layout/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  args: {
    orientation: 'vertical',
    size: 'md',
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal', 'both'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => (
    <ScrollArea
      {...args}
      style={{
        height: 200,
        width: 320,
        border: '1px solid var(--ov-color-border-muted)',
        borderRadius: 'var(--ov-radius-surface)',
      }}
    >
      <div style={{ padding: 'var(--ov-panel-padding)' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <p
            key={i}
            style={{
              margin: '0 0 8px',
              color: 'var(--ov-color-fg-muted)',
              fontSize: 'var(--ov-font-size-caption)',
            }}
          >
            Line {i + 1} — Scrollable content inside a styled scroll container.
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <ScrollArea
      {...args}
      style={{
        width: 320,
        border: '1px solid var(--ov-color-border-muted)',
        borderRadius: 'var(--ov-radius-surface)',
      }}
    >
      <div style={{ display: 'flex', gap: 12, padding: 'var(--ov-panel-padding)', width: 900 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              minWidth: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--ov-color-bg-inset)',
              borderRadius: 'var(--ov-radius-control)',
              color: 'var(--ov-color-fg-muted)',
              fontSize: 'var(--ov-font-size-caption)',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
