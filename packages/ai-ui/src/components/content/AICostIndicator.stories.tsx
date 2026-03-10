import type { Meta, StoryObj } from '@storybook/react';
import { AICostIndicator } from './AICostIndicator';

const meta = {
  title: 'AI/Content/AICostIndicator',
  component: AICostIndicator,
  tags: ['autodocs'],
  args: {
    cost: 0.0023,
  },
  argTypes: {
    cost: { control: 'number' },
    currency: { control: 'text' },
  },
} satisfies Meta<typeof AICostIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const HighCost: Story = {
  args: {
    cost: 1.2345,
  },
};

export const EuroCurrency: Story = {
  args: {
    cost: 0.0058,
    currency: '\u20AC',
  },
};
