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
    pulseIntensity: 'default',
    label: '',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['success', 'warning', 'danger', 'info', 'neutral', 'pending'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    pulse: { control: 'boolean' },
    pulseIntensity: { control: 'inline-radio', options: ['subtle', 'default', 'strong'] },
    label: { control: 'text' },
  },
} satisfies Meta<StatusDotProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    status: 'success',
    label: 'Online',
    pulse: true,
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

export const PulseIntensity: Story = {
  name: 'Pulse intensity levels',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <StatusDot status="success" label="Subtle" pulse pulseIntensity="subtle" />
      <StatusDot status="success" label="Default" pulse pulseIntensity="default" />
      <StatusDot status="success" label="Strong" pulse pulseIntensity="strong" />
    </div>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatusDot size="sm" status="success" label="Small" pulse />
      <StatusDot size="md" status="success" label="Medium" pulse />
      <StatusDot size="lg" status="success" label="Large" pulse />
    </div>
  ),
};

export const SizeWithIntensity: Story = {
  name: 'Size + intensity combinations',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <StatusDot
          size="sm"
          status="danger"
          label="Alert (sm, strong)"
          pulse
          pulseIntensity="strong"
        />
        <StatusDot
          size="md"
          status="danger"
          label="Alert (md, strong)"
          pulse
          pulseIntensity="strong"
        />
        <StatusDot
          size="lg"
          status="danger"
          label="Alert (lg, strong)"
          pulse
          pulseIntensity="strong"
        />
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <StatusDot
          size="sm"
          status="info"
          label="Sync (sm, subtle)"
          pulse
          pulseIntensity="subtle"
        />
        <StatusDot
          size="md"
          status="info"
          label="Sync (md, subtle)"
          pulse
          pulseIntensity="subtle"
        />
        <StatusDot
          size="lg"
          status="info"
          label="Sync (lg, subtle)"
          pulse
          pulseIntensity="subtle"
        />
      </div>
    </div>
  ),
};
