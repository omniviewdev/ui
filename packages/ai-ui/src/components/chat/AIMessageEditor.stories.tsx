import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AIMessageEditor } from './AIMessageEditor';

const meta: Meta<typeof AIMessageEditor> = {
  title: 'AI/Chat/AIMessageEditor',
  component: AIMessageEditor,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    defaultValue: 'How do I configure a Kubernetes HPA?',
    onSave: (value: string) => console.log('Saved:', value),
    onCancel: () => console.log('Cancelled'),
  },
};

export const WithPlaceholder: Story = {
  args: {
    defaultValue: '',
    placeholder: 'Edit your message...',
    onSave: (value: string) => console.log('Saved:', value),
    onCancel: () => console.log('Cancelled'),
  },
};

export const SavingState: Story = {
  args: {
    defaultValue: 'Updated message content',
    saving: true,
    onSave: () => {},
    onCancel: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const [editing, setEditing] = useState(true);
    const [message, setMessage] = useState('What are the best practices for pod security?');

    if (!editing) {
      return (
        <div>
          <p style={{ margin: '0 0 8px' }}>{message}</p>
          <button type="button" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
      );
    }

    return (
      <AIMessageEditor
        defaultValue={message}
        onSave={(value) => {
          setMessage(value);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  },
};
