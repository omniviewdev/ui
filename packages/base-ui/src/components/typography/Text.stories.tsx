import type { Meta, StoryObj } from '@storybook/react';
import { Text, type TextProps } from './Text';

const meta = {
  title: 'Typography/Text',
  component: Text,
  tags: ['autodocs'],
  args: {
    as: 'p',
    size: 'md',
    tone: 'default',
    weight: 'regular',
    mono: false,
    truncate: false,
    children: 'Runtime output appears here and updates as tasks complete.',
  },
  argTypes: {
    as: { control: 'inline-radio', options: ['span', 'p', 'div', 'label'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'brand', 'success', 'warning', 'danger'],
    },
    weight: { control: 'inline-radio', options: ['regular', 'medium', 'semibold'] },
    mono: { control: 'boolean' },
    truncate: { control: 'select', options: [false, true, 2, 3] },
  },
  render: (args) => (
    <div style={{ maxWidth: 460 }}>
      <Text {...args} />
    </div>
  ),
} satisfies Meta<TextProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ToneScale: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      {(['default', 'muted', 'subtle', 'brand', 'success', 'warning', 'danger'] as const).map(
        (tone) => (
          <Text key={tone} {...args} tone={tone}>
            {tone} text
          </Text>
        ),
      )}
    </div>
  ),
};
