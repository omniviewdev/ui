import type { Meta, StoryObj } from '@storybook/react';
import { Code, type CodeProps } from './Code';

const meta = {
  title: 'Typography/Code',
  component: Code,
  tags: ['autodocs'],
  args: {
    size: 'md',
    tone: 'default',
    truncate: false,
    children: '/api/v1/models',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'brand', 'success', 'warning', 'danger'],
    },
    truncate: { control: 'select', options: [false, true, 2, 3] },
  },
} satisfies Meta<CodeProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InlineUsage: Story = {
  render: (args) => (
    <p style={{ margin: 0, fontFamily: 'var(--ov-font-sans)' }}>
      Use <Code {...args}>pnpm --filter @omniview/base-ui storybook</Code> to run docs.
    </p>
  ),
};
