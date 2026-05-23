import type { Meta, StoryObj } from '@storybook/react';
import { Hotkey, type HotkeyProps } from './Hotkey';

const meta = {
  title: 'Typography/Hotkey',
  component: Hotkey,
  tags: ['autodocs'],
  args: {
    size: 'md',
    tone: 'default',
    truncate: false,
    children: 'CMD+K',
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
      Open command palette with <Hotkey {...args} />.
    </p>
  ),
} satisfies Meta<HotkeyProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
