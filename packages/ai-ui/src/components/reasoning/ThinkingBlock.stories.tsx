import { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ThinkingBlock } from './ThinkingBlock';

const meta = {
  title: 'AI/Reasoning/ThinkingBlock',
  component: ThinkingBlock,
  tags: ['autodocs'],
  args: {
    content: 'Let me analyze this step by step:\n\n1. First, I need to understand the context\n2. Then, I\'ll consider different approaches\n3. Finally, I\'ll provide the best solution\n\nThis reasoning process helps me give you more accurate and thoughtful responses.',
    streaming: false,
    defaultExpanded: true,
  },
  argTypes: {
    streaming: { control: 'boolean' },
    defaultExpanded: { control: 'boolean' },
    duration: { control: 'number' },
    autoClose: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThinkingBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithDuration: Story = {
  args: {
    content: 'After careful analysis, the issue is in the event handler binding. The component re-renders on every state change because the handler is not memoized.',
    duration: 4000,
    defaultExpanded: true,
  },
};

export const Collapsed: Story = {
  args: {
    content: 'This reasoning is hidden by default. Click to expand.',
    duration: 2000,
    defaultExpanded: false,
  },
};

export const Streaming: Story = {
  args: {
    content: 'Analyzing the code structure... checking for potential issues...',
    streaming: true,
    defaultExpanded: true,
    autoClose: false,
  },
};

function SimulateStreamingComponent() {
  const [isStreaming, setIsStreaming] = useState(false);

  const simulateStreaming = useCallback(() => {
    setIsStreaming(true);
    setTimeout(() => setIsStreaming(false), 3000);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ThinkingBlock
        content={`Let me analyze this step by step:

1. First, I need to understand the context
2. Then, I'll consider different approaches
3. Finally, I'll provide the best solution

This reasoning process helps me give you more accurate and thoughtful responses.`}
        streaming={isStreaming}
        defaultExpanded
      />
      <button
        type="button"
        onClick={simulateStreaming}
        style={{
          alignSelf: 'flex-start',
          padding: '8px 16px',
          borderRadius: 6,
          border: '1px solid var(--ov-color-border-default)',
          background: 'var(--ov-color-bg-surface)',
          color: 'var(--ov-color-fg-default)',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Simulate Streaming
      </button>
    </div>
  );
}

export const SimulateStreaming: Story = {
  render: () => <SimulateStreamingComponent />,
};

export const LongReasoning: Story = {
  args: {
    content: `Step 1: Parse the input string to extract the relevant tokens.
Step 2: Build an abstract syntax tree from the tokens.
Step 3: Traverse the AST to identify all variable declarations.
Step 4: Check each declaration for potential type mismatches.
Step 5: Generate diagnostic messages for any issues found.
Step 6: Format the output in a user-friendly way with line numbers and suggestions.`,
    defaultExpanded: true,
    duration: 5200,
  },
};
