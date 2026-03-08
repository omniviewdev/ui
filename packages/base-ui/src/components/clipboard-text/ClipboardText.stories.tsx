import type { Meta, StoryObj } from '@storybook/react';
import type { ClipboardTextProps } from './ClipboardText';
import { ClipboardText } from './ClipboardText';

const meta = {
  title: 'Data Display/ClipboardText',
  component: ClipboardText,
  tags: ['autodocs'],
  args: {
    value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    mono: false,
    truncate: false,
    feedbackDuration: 1500,
  },
  argTypes: {
    value: { control: 'text' },
    mono: { control: 'boolean' },
    truncate: { control: 'boolean' },
    feedbackDuration: { control: 'number' },
  },
} satisfies Meta<ClipboardTextProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const MonoVariant: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '12px' }}>
      <ClipboardText value="default-sans-font" />
      <ClipboardText value="a1b2c3d4e5f6" mono />
      <ClipboardText value="sha256:9f86d08..." mono />
      <ClipboardText value="192.168.1.100" mono />
    </div>
  ),
};

export const Truncation: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '250px' }}>
      <ClipboardText value="a1b2c3d4-e5f6-7890-abcd-ef1234567890" mono truncate />
      <ClipboardText
        value="This is a very long piece of text that should be truncated with an ellipsis"
        truncate
      />
      <ClipboardText value="short" truncate />
    </div>
  ),
};
