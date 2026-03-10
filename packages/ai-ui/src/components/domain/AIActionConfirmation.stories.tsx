import type { Meta, StoryObj } from '@storybook/react';
import { AIActionConfirmation } from './AIActionConfirmation';

const meta: Meta<typeof AIActionConfirmation> = {
  title: 'AI/Domain/AIActionConfirmation',
  component: AIActionConfirmation,
  tags: ['autodocs'],
  args: {
    title: 'Scale Deployment',
    description: 'Scale the web deployment from 3 to 5 replicas in the production namespace.',
    destructive: false,
    onConfirm: () => alert('Confirmed'),
    onCancel: () => alert('Cancelled'),
  },
  argTypes: {
    destructive: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithResource: Story = {
  name: 'With Resource Identifier',
  args: {
    title: 'Scale Deployment',
    description: 'Scale from 3 to 5 replicas in the production namespace.',
    resource: 'production/web-deploy',
  },
};

export const Destructive: Story = {
  args: {
    title: 'Delete Namespace',
    description: 'This will permanently delete the namespace and all resources within it. This action cannot be undone.',
    resource: 'staging',
    destructive: true,
  },
};

export const DestructiveWithCustomLabels: Story = {
  name: 'Destructive (Custom Labels)',
  args: {
    title: 'Remove Node from Cluster',
    description: 'The node will be cordoned, drained, and removed. Running workloads will be rescheduled.',
    resource: 'worker-node-03',
    destructive: true,
    confirmLabel: 'Remove Node',
    cancelLabel: 'Keep',
  },
};

export const SafeAction: Story = {
  name: 'Safe Action',
  args: {
    title: 'Apply ConfigMap',
    description: 'Update the ConfigMap with new environment variables. Existing pods will need a restart.',
    resource: 'production/app-config',
  },
};

export const MultipleActions: Story = {
  name: 'Multiple Confirmations',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <AIActionConfirmation
        title="Create Secret"
        description="Store database credentials as a Kubernetes Secret."
        resource="production/db-creds"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
      <AIActionConfirmation
        title="Delete CronJob"
        description="Remove the scheduled cleanup job. Pending executions will be cancelled."
        resource="staging/nightly-cleanup"
        destructive
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    </div>
  ),
};
