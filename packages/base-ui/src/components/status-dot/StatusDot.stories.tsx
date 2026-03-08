import type { Meta, StoryObj } from '@storybook/react';
import { StatusDot, type StatusDotProps } from './StatusDot';

const meta = {
  title: 'Feedback/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
  args: {
    status: 'neutral',
    size: 'md',
    pulse: false,
    label: '',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['success', 'warning', 'danger', 'info', 'neutral', 'pending'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    pulse: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<StatusDotProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    status: 'success',
    label: 'Online',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatusDot status="success" label="Success" />
      <StatusDot status="warning" label="Warning" />
      <StatusDot status="danger" label="Danger" />
      <StatusDot status="info" label="Info" />
      <StatusDot status="neutral" label="Neutral" />
      <StatusDot status="pending" label="Pending" />
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatusDot status="success" label="Connected" />
      <StatusDot status="warning" label="Degraded" />
      <StatusDot status="danger" label="Offline" />
      <StatusDot status="info" label="Syncing" />
      <StatusDot status="neutral" label="Unknown" />
      <StatusDot status="pending" label="Starting..." />
    </div>
  ),
};

export const PulseAnimation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatusDot status="success" label="Live" pulse />
      <StatusDot status="danger" label="Alert" pulse />
      <StatusDot status="pending" label="Provisioning..." pulse />
      <StatusDot status="info" label="Syncing" pulse />
    </div>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatusDot size="sm" status="success" label="Small" />
      <StatusDot size="md" status="success" label="Medium" />
      <StatusDot size="lg" status="success" label="Large" />
    </div>
  ),
};
