import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

const meta = {
  title: 'Surfaces/Progress',
  component: Progress,
  tags: ['autodocs'],
  args: {
    value: 45,
    variant: 'solid',
    color: 'brand',
    size: 'md',
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => <Progress {...args} style={{ width: 320 }} aria-label="Demo progress" />,
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Indeterminate: Story = {
  args: { value: undefined },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}>
      {(['solid', 'soft', 'outline', 'ghost'] as const).map((variant) => (
        <div key={variant}>
          <p style={{ margin: '0 0 4px', fontSize: 'var(--ov-font-size-caption)', color: 'var(--ov-color-fg-muted)' }}>{variant}</p>
          <Progress value={65} variant={variant} color="brand" aria-label={variant} />
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
      {(['brand', 'success', 'warning', 'danger', 'info', 'neutral'] as const).map((color) => (
        <Progress key={color} value={65} color={color} aria-label={color} />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Progress key={size} value={55} size={size} aria-label={size} />
      ))}
    </div>
  ),
};
