import type { Meta, StoryObj } from '@storybook/react';
import { Underline, type UnderlineProps } from './Underline';

const meta = {
  title: 'Typography/Underline',
  component: Underline,
  tags: ['autodocs'],
  args: {
    as: 'u',
    size: 'md',
    tone: 'default',
    truncate: false,
    children: 'Underline this text',
  },
  argTypes: {
    as: { control: 'inline-radio', options: ['u', 'span'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'brand', 'success', 'warning', 'danger'],
    },
    truncate: { control: 'select', options: [false, true, 2, 3] },
  },
  render: (args) => (
    <div style={{ maxWidth: 260 }}>
      <Underline {...args} />
    </div>
  ),
} satisfies Meta<UnderlineProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
