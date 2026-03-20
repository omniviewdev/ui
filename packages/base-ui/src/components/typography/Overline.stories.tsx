import type { Meta, StoryObj } from '@storybook/react';
import { Overline, type OverlineProps } from './Overline';

const meta = {
  title: 'Typography/Overline',
  component: Overline,
  tags: ['autodocs'],
  args: {
    as: 'span',
    size: 'md',
    tone: 'muted',
    truncate: false,
    children: 'Workspace Settings',
  },
  argTypes: {
    as: { control: 'inline-radio', options: ['span', 'p', 'div'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'brand', 'success', 'warning', 'danger'],
    },
    truncate: { control: 'select', options: [false, true, 2, 3] },
  },
  render: (args) => (
    <div style={{ maxWidth: 260 }}>
      <Overline {...args} />
    </div>
  ),
} satisfies Meta<OverlineProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
