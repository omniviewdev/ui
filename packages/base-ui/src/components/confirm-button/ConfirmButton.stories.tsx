import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import type { ConfirmButtonProps } from './ConfirmButton';
import { ConfirmButton } from './ConfirmButton';

const meta = {
  title: 'Inputs/ConfirmButton',
  component: ConfirmButton,
  tags: ['autodocs'],
  args: {
    children: 'Delete Item',
    onConfirm: fn(),
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
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    confirmColor: {
      control: 'select',
      options: ['neutral', 'brand', 'success', 'warning', 'danger'],
    },
    confirmTimeout: { control: { type: 'number', min: 500, max: 10000, step: 500 } },
  },
} satisfies Meta<ConfirmButtonProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  name: 'Default (click to see confirm state)',
  args: {
    children: 'Remove',
    onConfirm: fn(),
  },
};

export const CustomLabelsAndColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <ConfirmButton
        onConfirm={fn()}
        confirmLabel="Yes, delete"
        confirmColor="danger"
        variant="soft"
        color="neutral"
      >
        Delete File
      </ConfirmButton>
      <ConfirmButton
        onConfirm={fn()}
        confirmLabel="Really reset?"
        confirmColor="warning"
        variant="outline"
        color="brand"
      >
        Reset Settings
      </ConfirmButton>
      <ConfirmButton
        onConfirm={fn()}
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
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <ConfirmButton onConfirm={fn()} variant="solid" color="brand">
        Solid
      </ConfirmButton>
      <ConfirmButton onConfirm={fn()} variant="soft" color="brand">
        Soft
      </ConfirmButton>
      <ConfirmButton onConfirm={fn()} variant="outline" color="brand">
        Outline
      </ConfirmButton>
      <ConfirmButton onConfirm={fn()} variant="ghost" color="brand">
        Ghost
      </ConfirmButton>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Cannot Delete',
    disabled: true,
    onConfirm: fn(),
  },
};
