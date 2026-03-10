import type { Meta, StoryObj } from '@storybook/react';
import { AICommandSuggestion } from './AICommandSuggestion';

const meta = {
  title: 'AI/Domain/AICommandSuggestion',
  component: AICommandSuggestion,
  tags: ['autodocs'],
  args: {
    command: 'kubectl rollout restart deployment/api-server -n production',
    description: 'Restart the API server deployment to pick up the new configuration.',
    destructive: false,
  },
  argTypes: {
    destructive: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AICommandSuggestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    onApply: () => alert('Applied'),
    onCopy: () => alert('Copied'),
  },
};

export const Destructive: Story = {
  args: {
    command: 'kubectl delete pod --all -n staging',
    description: 'Delete all pods in the staging namespace. They will be recreated by their controllers.',
    destructive: true,
    onApply: () => {},
    onCopy: () => {},
  },
};

export const CopyOnly: Story = {
  args: {
    command: 'kubectl get pods -A -o wide',
    description: 'List all pods across namespaces with extended information.',
    onCopy: () => {},
  },
};

export const MultipleCommands: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <AICommandSuggestion
        command="kubectl scale deployment/web --replicas=5"
        description="Scale up the web deployment to 5 replicas."
        onApply={() => {}}
        onCopy={() => {}}
      />
      <AICommandSuggestion
        command="kubectl delete pod stuck-pod-xyz -n prod"
        description="Force delete the stuck pod."
        destructive
        onApply={() => {}}
        onCopy={() => {}}
      />
    </div>
  ),
};
