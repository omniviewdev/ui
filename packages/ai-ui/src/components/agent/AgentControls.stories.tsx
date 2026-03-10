import type { Meta, StoryObj } from '@storybook/react';
import { AgentControls } from './AgentControls';

const meta = {
  title: 'AI/Agent/AgentControls',
  component: AgentControls,
  tags: ['autodocs'],
  args: {
    status: 'idle',
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['idle', 'running', 'paused', 'complete', 'error'] },
  },
} satisfies Meta<typeof AgentControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    onStart: () => alert('Start'),
    onStop: () => alert('Stop'),
    onPause: () => alert('Pause'),
    onResume: () => alert('Resume'),
  },
};

export const Idle: Story = {
  args: { status: 'idle', onStart: () => {} },
};

export const Running: Story = {
  args: { status: 'running', onPause: () => {}, onStop: () => {} },
};

export const Paused: Story = {
  args: { status: 'paused', onResume: () => {}, onStop: () => {} },
};

export const Complete: Story = {
  args: { status: 'complete' },
};

export const Error: Story = {
  args: { status: 'error' },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AgentControls status="idle" onStart={() => {}} />
      <AgentControls status="running" onPause={() => {}} onStop={() => {}} />
      <AgentControls status="paused" onResume={() => {}} onStop={() => {}} />
      <AgentControls status="complete" />
      <AgentControls status="error" />
    </div>
  ),
};
