import type { Meta, StoryObj } from '@storybook/react';
import { NumberInput } from './NumberInput';

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput.Root,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'brand',
    size: 'md',
    disabled: false,
    defaultValue: 3,
    min: 0,
    max: 12,
    step: 1,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  parameters: {
    controls: {
      include: ['variant', 'color', 'size', 'disabled', 'defaultValue', 'min', 'max', 'step'],
    },
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <NumberInput.Root {...args}>
        <NumberInput.Label>Max retries</NumberInput.Label>
        <NumberInput.Group>
          <NumberInput.Decrement aria-label="Decrease" />
          <NumberInput.Input aria-label="Max retries" placeholder="0" />
          <NumberInput.Increment aria-label="Increase" />
        </NumberInput.Group>
        <NumberInput.Description>Used for runtime reconnection backoff.</NumberInput.Description>
      </NumberInput.Root>
    </div>
  ),
} satisfies Meta<typeof NumberInput.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ width: 280, display: 'grid', gap: 12 }}>
      <NumberInput.Root {...args} size="sm" defaultValue={2}>
        <NumberInput.Label>Small</NumberInput.Label>
        <NumberInput.Group>
          <NumberInput.Decrement aria-label="Decrease small" />
          <NumberInput.Input aria-label="Small value" />
          <NumberInput.Increment aria-label="Increase small" />
        </NumberInput.Group>
      </NumberInput.Root>
      <NumberInput.Root {...args} size="md" defaultValue={4}>
        <NumberInput.Label>Medium</NumberInput.Label>
        <NumberInput.Group>
          <NumberInput.Decrement aria-label="Decrease medium" />
          <NumberInput.Input aria-label="Medium value" />
          <NumberInput.Increment aria-label="Increase medium" />
        </NumberInput.Group>
      </NumberInput.Root>
      <NumberInput.Root {...args} size="lg" defaultValue={6}>
        <NumberInput.Label>Large</NumberInput.Label>
        <NumberInput.Group>
          <NumberInput.Decrement aria-label="Decrease large" />
          <NumberInput.Input aria-label="Large value" />
          <NumberInput.Increment aria-label="Increase large" />
        </NumberInput.Group>
      </NumberInput.Root>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
