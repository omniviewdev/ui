import type { Meta, StoryObj } from '@storybook/react';
import { AITokenUsage } from './AITokenUsage';

const meta = {
  title: 'AI/Content/AITokenUsage',
  component: AITokenUsage,
  tags: ['autodocs'],
} satisfies Meta<typeof AITokenUsage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    inputTokens: 1250,
    outputTokens: 3400,
  },
};

export const SmallResponse: Story = {
  args: {
    inputTokens: 42,
    outputTokens: 128,
  },
};

export const LargeResponse: Story = {
  args: {
    inputTokens: 32000,
    outputTokens: 100000,
  },
};
