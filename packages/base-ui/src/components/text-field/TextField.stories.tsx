import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './TextField';

const meta = {
  title: 'Components/TextField',
  component: TextField.Root,
  tags: ['autodocs'],
  args: {
    variant: 'outline',
    color: 'brand',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <TextField.Root {...args}>
        <TextField.Label>Workspace Name</TextField.Label>
        <TextField.Control placeholder="omniview-dev" required />
        <TextField.Description>Used in local context and API calls.</TextField.Description>
        <TextField.Error match="valueMissing">Workspace name is required.</TextField.Error>
      </TextField.Root>
    </div>
  ),
} satisfies Meta<typeof TextField.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ width: 360, display: 'grid', gap: '12px' }}>
      <TextField.Root {...args} size="sm">
        <TextField.Label>Small</TextField.Label>
        <TextField.Control placeholder="small" />
      </TextField.Root>
      <TextField.Root {...args} size="md">
        <TextField.Label>Medium</TextField.Label>
        <TextField.Control placeholder="medium" />
      </TextField.Root>
      <TextField.Root {...args} size="lg">
        <TextField.Label>Large</TextField.Label>
        <TextField.Control placeholder="large" />
      </TextField.Root>
    </div>
  ),
};
