import type { Meta, StoryObj } from '@storybook/react';
import { ToolCall } from './ToolCall';

const meta: Meta<typeof ToolCall> = {
  title: 'AI/ToolCalls/ToolCall',
  component: ToolCall,
  tags: ['autodocs'],
  args: {
    name: 'read_file',
    status: 'success',
    arguments: { path: '/src/index.ts', encoding: 'utf-8' },
    duration: 245,
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['pending', 'running', 'success', 'error'] },
    duration: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Pending: Story = {
  args: { name: 'search_code', status: 'pending', arguments: { query: 'handleSubmit' } },
};

export const Running: Story = {
  args: { name: 'execute_command', status: 'running', arguments: { command: 'npm test' } },
};

export const Success: Story = {
  args: { name: 'write_file', status: 'success', arguments: { path: '/src/utils.ts' }, duration: 120 },
};

export const Error: Story = {
  args: { name: 'delete_file', status: 'error', arguments: { path: '/protected/config.yaml' }, duration: 50 },
};

export const NoArguments: Story = {
  args: { name: 'list_tools', status: 'success', arguments: undefined, duration: 10 },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ToolCall name="step_1" status="success" duration={100} />
      <ToolCall name="step_2" status="success" duration={250} />
      <ToolCall name="step_3" status="running" />
      <ToolCall name="step_4" status="pending" />
    </div>
  ),
};

// With children (tool result output)
export const WithResult: Story = {
  render: () => (
    <ToolCall
      name="kubectl get pods"
      status="success"
      duration={340}
      arguments={{ namespace: 'production', selector: 'app=payments-api' }}
      defaultExpanded
    >
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`NAME                            READY   STATUS    RESTARTS   AGE
payments-api-8c4d5e7f1-jkl89   1/1     Running   0          2d
payments-api-8c4d5e7f1-mno12   1/1     Running   0          2d
payments-api-8c4d5e7f1-pqr34   1/1     Running   0          2d`}
      </pre>
    </ToolCall>
  ),
};

// Running with streaming output
export const RunningWithOutput: Story = {
  render: () => (
    <ToolCall
      name="kubectl rollout status"
      status="running"
      arguments={{ deployment: 'payments-api', namespace: 'production' }}
      defaultExpanded
    >
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--ov-color-fg-muted)' }}>
{`Waiting for deployment "payments-api" rollout to finish: 1 of 3 updated replicas are available...`}
      </pre>
    </ToolCall>
  ),
};

// Error with output
export const ErrorWithOutput: Story = {
  render: () => (
    <ToolCall
      name="kubectl apply"
      status="error"
      duration={120}
      arguments={{ file: 'deployment.yaml' }}
      defaultExpanded
    >
      <div style={{ color: 'var(--ov-color-danger-default)' }}>
        Error from server (Forbidden): deployments.apps &quot;payments-api&quot; is forbidden: User &quot;dev-user&quot; cannot patch resource &quot;deployments&quot; in namespace &quot;production&quot;
      </div>
    </ToolCall>
  ),
};

// Result-only (no arguments, just output)
export const ResultOnly: Story = {
  render: () => (
    <ToolCall name="list_namespaces" status="success" duration={80} defaultExpanded>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`default
kube-system
kube-public
production
staging`}
      </pre>
    </ToolCall>
  ),
};
