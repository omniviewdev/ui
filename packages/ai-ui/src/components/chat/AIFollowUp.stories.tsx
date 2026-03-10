import type { Meta, StoryObj } from '@storybook/react';
import { AIFollowUp } from './AIFollowUp';

const meta = {
  title: 'AI/Chat/AIFollowUp',
  component: AIFollowUp,
  tags: ['autodocs'],
} satisfies Meta<typeof AIFollowUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    suggestions: [
      'What are the resource limits?',
      'How do I scale this deployment?',
      'Show me the pod logs',
    ],
    onSelect: (s) => console.log('selected', s),
  },
};

export const Empty: Story = {
  args: {
    suggestions: [],
  },
};

export const ManySuggestions: Story = {
  args: {
    suggestions: [
      'What are the resource limits?',
      'How do I scale this deployment?',
      'Show me the pod logs',
      'Describe the network policies',
      'What is the current replica count?',
      'How do I update the image?',
    ],
    onSelect: (s) => console.log('selected', s),
  },
};
