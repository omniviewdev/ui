import type { Meta, StoryObj } from '@storybook/react';
import { AIConversationHeader } from './AIConversationHeader';

const meta = {
  title: 'AI/Chat/AIConversationHeader',
  component: AIConversationHeader,
  tags: ['autodocs'],
  args: {
    title: 'Kubernetes Debugging Session',
    model: 'Claude 3.5 Sonnet',
  },
  argTypes: {
    title: { control: 'text' },
    model: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AIConversationHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithActions: Story = {
  args: {
    title: 'Pod Troubleshooting',
    model: 'GPT-4o',
    onNewChat: () => {},
    onSettings: () => {},
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Very long conversation title that should be truncated when it overflows the available space in the header bar',
    model: 'Claude 3 Opus',
    onNewChat: () => {},
  },
};
