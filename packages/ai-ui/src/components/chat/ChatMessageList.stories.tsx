import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessageList } from './ChatMessageList';
import { ChatBubble } from './ChatBubble';
import { ChatAvatar } from './ChatAvatar';

const MESSAGES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
  content: i % 2 === 0
    ? `User message #${i + 1}: Can you help me with task ${Math.floor(i / 2) + 1}?`
    : `Assistant message #${i + 1}: Sure! Here's the solution for task ${Math.floor(i / 2) + 1}. Let me walk you through the approach step by step.`,
}));

const meta = {
  title: 'AI/Chat/ChatMessageList',
  component: ChatMessageList,
  tags: ['autodocs'],
  args: {
    count: MESSAGES.length,
    estimateSize: 80,
    autoScroll: true,
  },
  argTypes: {
    count: { control: { type: 'range', min: 5, max: 200, step: 5 } },
    estimateSize: { control: { type: 'range', min: 40, max: 200, step: 10 } },
    autoScroll: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ height: 500, maxWidth: 600, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatMessageList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    renderItem: (index: number) => {
      const msg = MESSAGES[index]!;
      return (
        <ChatBubble
          role={msg.role}
          avatar={<ChatAvatar role={msg.role} name={msg.role === 'user' ? 'You' : 'Claude'} />}
        >
          {msg.content}
        </ChatBubble>
      );
    },
  },
};

export const ManyMessages: Story = {
  args: {
    count: 200,
    renderItem: (index: number) => {
      const role = index % 2 === 0 ? 'user' : 'assistant';
      return (
        <ChatBubble role={role as 'user' | 'assistant'}>
          {role === 'user'
            ? `Question ${index + 1}: How does this work?`
            : `Answer ${index + 1}: Here is a detailed explanation of how this works in practice.`}
        </ChatBubble>
      );
    },
  },
};
