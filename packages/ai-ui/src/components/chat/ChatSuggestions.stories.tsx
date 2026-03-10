import type { Meta, StoryObj } from '@storybook/react';
import { ChatSuggestions } from './ChatSuggestions';

const meta = {
  title: 'AI/Chat/ChatSuggestions',
  component: ChatSuggestions,
  tags: ['autodocs'],
  args: {
    suggestions: [
      { label: 'Explain this error', value: 'explain-error' },
      { label: 'Show me an example', value: 'show-example' },
      { label: 'How do I fix this?', value: 'fix-this' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatSuggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    onSelect: (value: string) => alert(`Selected: ${value}`),
  },
};

export const ManySuggestions: Story = {
  args: {
    suggestions: [
      { label: 'Debug this issue', value: 'debug' },
      { label: 'Write tests', value: 'tests' },
      { label: 'Refactor code', value: 'refactor' },
      { label: 'Add documentation', value: 'docs' },
      { label: 'Optimize performance', value: 'optimize' },
      { label: 'Review changes', value: 'review' },
    ],
    onSelect: (value: string) => alert(`Selected: ${value}`),
  },
};
