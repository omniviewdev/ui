import type { Meta, StoryObj } from '@storybook/react';
import { AIMessageGroup } from './AIMessageGroup';
import { ChatAvatar } from './ChatAvatar';
import { ChatBubble } from './ChatBubble';

const meta = {
  title: 'AI/Chat/AIMessageGroup',
  component: AIMessageGroup,
  tags: ['autodocs'],
  args: {
    role: 'assistant',
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
} satisfies Meta<typeof AIMessageGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    avatar: <ChatAvatar role="assistant" name="Claude" />,
    children: (
      <>
        <ChatBubble role="assistant">Here is how you can sort an array.</ChatBubble>
        <ChatBubble role="assistant">Let me know if you have questions!</ChatBubble>
      </>
    ),
  },
};

export const UserGroup: Story = {
  args: {
    role: 'user',
    avatar: <ChatAvatar role="user" name="Josh" />,
    children: (
      <>
        <ChatBubble role="user">Can you help me with sorting?</ChatBubble>
        <ChatBubble role="user">Specifically quicksort.</ChatBubble>
      </>
    ),
  },
};

export const SystemGroup: Story = {
  args: {
    role: 'system',
    children: (
      <>
        <ChatBubble role="system">System configuration updated.</ChatBubble>
        <ChatBubble role="system">New model selected: GPT-4.</ChatBubble>
      </>
    ),
  },
};
