import type { Meta, StoryObj } from '@storybook/react';
import { Strong, type StrongProps } from './Strong';

const meta = {
  title: 'Typography/Strong',
  component: Strong,
  tags: ['autodocs'],
  args: {
    size: 'md',
    tone: 'default',
    truncate: false,
    children: 'Strongly emphasized text',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'brand', 'success', 'warning', 'danger'],
    },
    truncate: { control: 'select', options: [false, true, 2, 3] },
  },
} satisfies Meta<StrongProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
