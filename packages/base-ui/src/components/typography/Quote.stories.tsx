import type { Meta, StoryObj } from '@storybook/react';
import { Quote, type QuoteProps } from './Quote';

const meta = {
  title: 'Typography/Quote',
  component: Quote,
  tags: ['autodocs'],
  args: {
    size: 'md',
    tone: 'default',
    truncate: false,
    children: 'quoted guidance',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'brand', 'success', 'warning', 'danger'],
    },
    truncate: { control: 'select', options: [false, true, 2, 3] },
  },
  render: (args) => (
    <p style={{ margin: 0, fontFamily: 'var(--ov-font-sans)' }}>
      The assistant said <Quote {...args} /> during runtime validation.
    </p>
  ),
} satisfies Meta<QuoteProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
