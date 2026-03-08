import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: {
    variant: 'text',
    animation: 'pulse',
    width: 200,
    height: 20,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'circular', 'rectangular', 'rounded'] },
    animation: { control: 'inline-radio', options: ['pulse', 'wave', 'none'] },
    width: { control: 'text' },
    height: { control: 'text' },
    lines: { control: 'number' },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton variant="text" width={200} />
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton variant="rectangular" width={200} height={60} />
      <Skeleton variant="rounded" width={200} height={60} />
    </div>
  ),
};

export const MultiLineText: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <Skeleton variant="text" lines={4} />
    </div>
  ),
};

export const AnimationTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton variant="rectangular" width={200} height={40} animation="pulse" />
      <Skeleton variant="rectangular" width={200} height={40} animation="wave" />
      <Skeleton variant="rectangular" width={200} height={40} animation="none" />
    </div>
  ),
};
