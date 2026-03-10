import type { Meta, StoryObj } from '@storybook/react';
import { AgentTaskList } from './AgentTaskList';

const meta = {
  title: 'AI/Agent/AgentTaskList',
  component: AgentTaskList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AgentTaskList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    tasks: [
      { id: '1', label: 'Read source files', status: 'complete' as const, detail: '3 files' },
      { id: '2', label: 'Analyze dependencies', status: 'complete' as const },
      { id: '3', label: 'Generate solution', status: 'running' as const, detail: 'In progress...' },
      { id: '4', label: 'Write output', status: 'idle' as const },
      { id: '5', label: 'Run tests', status: 'idle' as const },
    ],
  },
};

export const AllComplete: Story = {
  args: {
    tasks: [
      { id: '1', label: 'Read file', status: 'complete' as const },
      { id: '2', label: 'Fix bug', status: 'complete' as const },
      { id: '3', label: 'Run tests', status: 'complete' as const },
    ],
  },
};

export const WithError: Story = {
  args: {
    tasks: [
      { id: '1', label: 'Read config', status: 'complete' as const },
      { id: '2', label: 'Apply migration', status: 'error' as const, detail: 'Schema conflict' },
      { id: '3', label: 'Verify', status: 'idle' as const },
    ],
  },
};
