import { action } from 'storybook/actions';
import type { Meta, StoryObj } from '@storybook/react';
import { AIMessageActions } from './AIMessageActions';

const meta = {
  title: 'AI/Chat/AIMessageActions',
  component: AIMessageActions,
  tags: ['autodocs'],
} satisfies Meta<typeof AIMessageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    onCopy: action('copy'),
    onRegenerate: action('regenerate'),
    onEdit: action('edit'),
    onFeedback: action('feedback'),
    feedback: null,
  },
};

export const AllActions: Story = {
  args: {
    onCopy: action('copy'),
    onRegenerate: action('regenerate'),
    onEdit: action('edit'),
    onShare: action('share'),
    onBranch: action('branch'),
    onDelete: action('delete'),
    onFeedback: action('feedback'),
    feedback: null,
  },
};

export const CopyOnly: Story = {
  args: { onCopy: () => {} },
};

export const ShareBranchDelete: Story = {
  args: {
    onShare: () => {},
    onBranch: () => {},
    onDelete: () => {},
  },
};

export const WithPositiveFeedback: Story = {
  args: {
    onCopy: () => {},
    onRegenerate: () => {},
    onFeedback: () => {},
    feedback: 'positive',
  },
};

export const WithNegativeFeedback: Story = {
  args: {
    onCopy: () => {},
    onRegenerate: () => {},
    onFeedback: () => {},
    feedback: 'negative',
  },
};
