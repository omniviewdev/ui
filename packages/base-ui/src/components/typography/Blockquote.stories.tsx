import type { Meta, StoryObj } from '@storybook/react';
import { Blockquote, type BlockquoteProps } from './Blockquote';

const meta = {
  title: 'Typography/Blockquote',
  component: Blockquote,
  tags: ['autodocs'],
  args: {
    variant: 'emphasis',
    size: 'md',
    tone: 'default',
    truncate: false,
    children: 'Perfect typography is certainly the most elusive of all arts.',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['emphasis', 'plain'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'brand', 'success', 'warning', 'danger'],
    },
    truncate: { control: 'select', options: [false, true, 2, 3] },
  },
  render: (args) => (
    <div style={{ maxWidth: 760 }}>
      <Blockquote {...args} />
    </div>
  ),
} satisfies Meta<BlockquoteProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const PlainLineStyle: Story = {
  args: {
    variant: 'plain',
    children:
      'Perfect typography is certainly the most elusive of all arts. Sculpture in stone alone comes near it in obstinacy.',
  },
};
