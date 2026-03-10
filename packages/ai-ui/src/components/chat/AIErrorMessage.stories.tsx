import type { Meta, StoryObj } from '@storybook/react';
import { AIErrorMessage } from './AIErrorMessage';

const meta = {
  title: 'AI/Chat/AIErrorMessage',
  component: AIErrorMessage,
  tags: ['autodocs'],
  args: {
    message: 'The model encountered an unexpected error while generating a response. Please try again.',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AIErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    onRetry: () => console.log('retry'),
  },
};

export const WithRetry: Story = {
  args: {
    message: 'Rate limit exceeded. Please wait a moment and try again.',
    onRetry: () => alert('Retrying...'),
  },
};

export const WithoutRetry: Story = {
  args: {
    message: 'This model is currently unavailable. Please select a different model.',
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Connection error',
    message: 'Unable to reach the AI service. Check your network connection and try again.',
    onRetry: () => {},
  },
};
