import type { Meta, StoryObj } from '@storybook/react';
import { ChatBubble } from './ChatBubble';
import { ChatAvatar } from './ChatAvatar';

const meta = {
  title: 'AI/Chat/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  args: {
    role: 'assistant',
    children: 'Hello! How can I help you today?',
  },
  argTypes: {
    role: { control: 'inline-radio', options: ['user', 'assistant', 'system'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const UserMessage: Story = {
  args: {
    role: 'user',
    children: 'Can you help me write a function to sort an array?',
  },
};

export const AssistantMessage: Story = {
  args: {
    role: 'assistant',
    children: 'Sure! Here\'s a simple quicksort implementation that handles most common cases efficiently.',
  },
};

export const SystemMessage: Story = {
  args: {
    role: 'system',
    children: 'You are a helpful coding assistant.',
  },
};

export const WithAvatar: Story = {
  args: {
    role: 'assistant',
    children: 'I\'m here to help with your code!',
    avatar: <ChatAvatar role="assistant" name="Claude" />,
  },
};

export const WithTimestamp: Story = {
  args: {
    role: 'user',
    children: 'What time is it?',
    timestamp: new Date(),
  },
};

export const Conversation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ChatBubble role="user" avatar={<ChatAvatar role="user" name="Josh" />}>
        How do I center a div?
      </ChatBubble>
      <ChatBubble role="assistant" avatar={<ChatAvatar role="assistant" name="Claude" />}>
        There are several ways to center a div. The most modern approach is using flexbox:
        display: flex; justify-content: center; align-items: center;
      </ChatBubble>
      <ChatBubble role="user" avatar={<ChatAvatar role="user" name="Josh" />}>
        Thanks! What about grid?
      </ChatBubble>
      <ChatBubble role="assistant" avatar={<ChatAvatar role="assistant" name="Claude" />}>
        With CSS Grid you can use: display: grid; place-items: center; — even simpler!
      </ChatBubble>
    </div>
  ),
};
