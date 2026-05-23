import type { Meta, StoryObj } from '@storybook/react';
import type { ConfirmButtonProps } from './ConfirmButton';
import { ConfirmButton } from './ConfirmButton';

const noop = () => {};

const meta = {
  title: 'Inputs/ConfirmButton',
  component: ConfirmButton,
  tags: ['autodocs'],
  args: {
    children: 'Delete Item',
    onConfirm: noop,
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    confirmLabel: 'Confirm',
    confirmColor: 'danger',
    confirmTimeout: 3000,
    disabled: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    confirmColor: {
      control: 'select',
      options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'],
    },
    confirmTimeout: { control: { type: 'number', min: 500, max: 10000, step: 500 } },
    onConfirm: { action: 'onConfirm' },
  },
} satisfies Meta<ConfirmButtonProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  name: 'Default (click to see confirm state)',
  args: {
    children: 'Remove',
  },
};

export const CustomLabelsAndColors: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <ConfirmButton
        {...args}
        confirmLabel="Yes, delete"
        confirmColor="danger"
        variant="soft"
        color="neutral"
      >
        Delete File
      </ConfirmButton>
      <ConfirmButton
        {...args}
        confirmLabel="Really reset?"
        confirmColor="warning"
        variant="outline"
        color="brand"
      >
        Reset Settings
      </ConfirmButton>
      <ConfirmButton
        {...args}
        confirmLabel="Confirm deploy"
        confirmColor="success"
        variant="solid"
        color="brand"
      >
        Deploy
      </ConfirmButton>
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <ConfirmButton {...args} variant="solid" color="brand">
        Solid
      </ConfirmButton>
      <ConfirmButton {...args} variant="soft" color="brand">
        Soft
      </ConfirmButton>
      <ConfirmButton {...args} variant="outline" color="brand">
        Outline
      </ConfirmButton>
      <ConfirmButton {...args} variant="ghost" color="brand">
        Ghost
      </ConfirmButton>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Cannot Delete',
    disabled: true,
  },
};
