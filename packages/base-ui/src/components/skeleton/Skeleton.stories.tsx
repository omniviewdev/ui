import type { Meta, StoryObj } from '@storybook/react';
import type { SkeletonProps } from './Skeleton';
import { Skeleton } from './Skeleton';

const Label = ({ children }: { children: string }) => (
  <p
    style={{
      margin: '0 0 8px',
      fontFamily: 'var(--ov-font-sans)',
      fontSize: 'var(--ov-font-size-caption)',
      color: 'var(--ov-color-fg-muted)',
    }}
  >
    {children}
  </p>
);

const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: {
    variant: 'text',
    animation: 'pulse',
    width: 200,
    height: 20,
    size: 'md',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'circular', 'rectangular', 'rounded'] },
    animation: { control: 'inline-radio', options: ['pulse', 'wave', 'none'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    width: { control: 'text' },
    height: { control: 'text' },
    lines: { control: 'number' },
  },
} as Meta<SkeletonProps>;

export default meta;
type Story = StoryObj<SkeletonProps>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Label>Text</Label>
        <Skeleton variant="text" width={240} />
      </div>
      <div>
        <Label>Circular</Label>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <div>
        <Label>Rectangular</Label>
        <Skeleton variant="rectangular" width={240} height={80} />
      </div>
      <div>
        <Label>Rounded</Label>
        <Skeleton variant="rounded" width={240} height={80} />
      </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Label>Pulse</Label>
        <Skeleton variant="rounded" width={240} height={48} animation="pulse" />
      </div>
      <div>
        <Label>Wave</Label>
        <Skeleton variant="rounded" width={240} height={48} animation="wave" />
      </div>
      <div>
        <Label>None</Label>
        <Skeleton variant="rounded" width={240} height={48} animation="none" />
      </div>
    </div>
  ),
};

export const CardSkeleton: Story = {
  name: 'Pattern: Card',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 20,
        borderRadius: 'var(--ov-radius-surface)',
        border: '1px solid var(--ov-color-border-default)',
        background: 'var(--ov-color-bg-surface)',
        width: 320,
      }}
    >
      <Skeleton variant="rounded" width="100%" height={160} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" style={{ marginTop: 8 }} />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
    </div>
  ),
};

export const ProfileSkeleton: Story = {
  name: 'Pattern: Profile',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <Skeleton variant="circular" width={64} height={64} />
      <div style={{ flex: 1, paddingTop: 4 }}>
        <Skeleton variant="text" width={180} />
        <Skeleton variant="text" width={120} style={{ marginTop: 8 }} />
        <Skeleton variant="text" lines={2} style={{ marginTop: 16 }} />
      </div>
    </div>
  ),
};

export const TableSkeleton: Story = {
  name: 'Pattern: Table rows',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={140} />
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={80} />
        </div>
      ))}
    </div>
  ),
};
