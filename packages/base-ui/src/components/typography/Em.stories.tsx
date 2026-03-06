import type { Meta, StoryObj } from '@storybook/react';
import { Em, type EmProps } from './Em';

const meta = {
  title: 'Typography/Em',
  component: Em,
  tags: ['autodocs'],
  args: {
    size: 'md',
    tone: 'default',
    truncate: false,
    children: 'Emphasized guidance text',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'brand', 'success', 'warning', 'danger'],
    },
    truncate: { control: 'select', options: [false, true, 2, 3] },
  },
} satisfies Meta<EmProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
