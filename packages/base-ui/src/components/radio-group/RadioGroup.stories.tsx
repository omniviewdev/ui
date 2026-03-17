import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, type RadioGroupProps } from './RadioGroup';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'brand',
    size: 'md',
    orientation: 'vertical',
    defaultValue: 'comfortable',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="compact">Compact density</RadioGroup.Item>
      <RadioGroup.Item value="comfortable">Comfortable density</RadioGroup.Item>
      <RadioGroup.Item value="spacious">Spacious density</RadioGroup.Item>
    </RadioGroup>
  ),
} satisfies Meta<RadioGroupProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
