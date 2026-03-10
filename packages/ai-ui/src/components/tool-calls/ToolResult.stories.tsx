import type { Meta, StoryObj } from '@storybook/react';
import { ToolResult } from './ToolResult';

const meta = {
  title: 'AI/ToolCalls/ToolResult',
  component: ToolResult,
  tags: ['autodocs'],
  args: {
    status: 'success',
    content: 'File contents retrieved successfully. Found 42 lines of TypeScript code.',
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['success', 'error'] },
    truncated: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ToolResult>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SuccessResult: Story = {
  args: {
    status: 'success',
    content: 'Command executed successfully. All 15 tests passed.',
  },
};

export const ErrorResult: Story = {
  args: {
    status: 'error',
    content: 'Error: ENOENT: no such file or directory, open \'/src/missing.ts\'',
  },
};

export const TruncatedResult: Story = {
  args: {
    status: 'success',
    content: 'Found 1,234 matches across 89 files. Showing first 50 results...',
    truncated: true,
  },
};
