import type { Meta, StoryObj } from '@storybook/react';
import { Heading, type HeadingProps } from './Heading';

const meta = {
  title: 'Typography/Heading',
  component: Heading,
  tags: ['autodocs'],
  args: {
    level: 2,
    size: 'md',
    tone: 'default',
    truncate: false,
    children: 'Workspace Runtime Policies',
  },
  argTypes: {
    level: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'brand', 'success', 'warning', 'danger'],
    },
    truncate: { control: 'select', options: [false, true, 2, 3] },
  },
} satisfies Meta<HeadingProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllLevels: Story = {
  parameters: {
    controls: {
      exclude: ['children', 'level'],
    },
  },
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      {[1, 2, 3, 4, 5, 6].map((level) => (
        <Heading key={level} {...args} level={level as 1 | 2 | 3 | 4 | 5 | 6}>
          Heading {level}
        </Heading>
      ))}
    </div>
  ),
};
