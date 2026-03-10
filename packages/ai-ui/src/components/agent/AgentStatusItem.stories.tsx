import type { Meta, StoryObj } from '@storybook/react';
import { AgentStatusItem } from './AgentStatusItem';

const meta = {
  title: 'AI/Agent/AgentStatusItem',
  component: AgentStatusItem,
  tags: ['autodocs'],
  args: {
    label: 'Analyzing codebase',
    status: 'running',
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['idle', 'running', 'paused', 'complete', 'error'] },
    detail: { control: 'text' },
  },
} satisfies Meta<typeof AgentStatusItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Pending: Story = {
  args: { label: 'Run tests', status: 'idle' },
};

export const Active: Story = {
  args: { label: 'Analyzing code', status: 'running', detail: 'src/components/' },
};

export const Complete: Story = {
  args: { label: 'Read file', status: 'complete', detail: 'src/index.ts' },
};

export const Error: Story = {
  args: { label: 'Deploy', status: 'error', detail: 'Permission denied' },
};
