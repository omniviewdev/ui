import type { Meta, StoryObj } from '@storybook/react';
import { AIStopButton } from './AIStopButton';

const meta = {
  title: 'AI/Streaming/AIStopButton',
  component: AIStopButton,
  tags: ['autodocs'],
  args: {
    onStop: () => console.log('stop'),
  },
} satisfies Meta<typeof AIStopButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Stopping: Story = {
  args: {
    stopping: true,
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'Cancel generation',
  },
};
