import type { Meta, StoryObj } from '@storybook/react';
import { TypingIndicator } from './TypingIndicator';

const meta = {
  title: 'AI/Streaming/TypingIndicator',
  component: TypingIndicator,
  tags: ['autodocs'],
  args: {
    label: undefined,
  },
  argTypes: {
    label: { control: 'text' },
  },
} satisfies Meta<typeof TypingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Assistant is typing',
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'Thinking...',
  },
};
