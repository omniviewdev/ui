import type { Meta, StoryObj } from '@storybook/react';
import { AIRetryButton } from './AIRetryButton';

const meta = {
  title: 'AI/Chat/AIRetryButton',
  component: AIRetryButton,
  tags: ['autodocs'],
  args: {
    onRetry: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AIRetryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Retrying: Story = {
  args: {
    retrying: true,
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'Regenerate response',
  },
};
