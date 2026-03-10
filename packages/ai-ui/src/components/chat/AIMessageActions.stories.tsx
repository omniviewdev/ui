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
    onCopy: () => console.log('copy'),
    onRegenerate: () => console.log('regenerate'),
    onEdit: () => console.log('edit'),
    onFeedback: (v) => console.log('feedback', v),
    feedback: null,
  },
};

export const AllActions: Story = {
  args: {
    onCopy: () => console.log('copy'),
    onRegenerate: () => console.log('regenerate'),
    onEdit: () => console.log('edit'),
    onShare: () => console.log('share'),
    onBranch: () => console.log('branch'),
    onDelete: () => console.log('delete'),
    onFeedback: (v) => console.log('feedback', v),
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
