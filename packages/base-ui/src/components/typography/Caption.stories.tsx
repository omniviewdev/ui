import type { Meta, StoryObj } from '@storybook/react';
import { Caption, type CaptionProps } from './Caption';

const meta = {
  title: 'Typography/Caption',
  component: Caption,
  tags: ['autodocs'],
  args: {
    as: 'span',
    size: 'md',
    tone: 'muted',
    truncate: false,
    children: 'Last synced 7s ago',
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
      <Caption {...args} />
    </div>
  ),
} satisfies Meta<CaptionProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
