import type { Meta, StoryObj } from '@storybook/react';
import { ChatAvatar } from './ChatAvatar';

const meta = {
  title: 'AI/Chat/ChatAvatar',
  component: ChatAvatar,
  tags: ['autodocs'],
  args: {
    role: 'assistant',
  },
  argTypes: {
    role: { control: 'inline-radio', options: ['user', 'assistant', 'system'] },
    name: { control: 'text' },
    src: { control: 'text' },
  },
} satisfies Meta<typeof ChatAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const UserRole: Story = {
  args: { role: 'user' },
};

export const AssistantRole: Story = {
  args: { role: 'assistant' },
};

export const SystemRole: Story = {
  args: { role: 'system' },
};

export const WithName: Story = {
  args: { role: 'user', name: 'John Doe' },
};

export const AllRoles: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <ChatAvatar role="user" />
      <ChatAvatar role="user" name="John Doe" />
      <ChatAvatar role="assistant" />
      <ChatAvatar role="assistant" name="Claude" />
      <ChatAvatar role="system" />
    </div>
  ),
};
