import type { Meta, StoryObj } from '@storybook/react';
import { LuHardDrive, LuRocket, LuShieldCheck } from 'react-icons/lu';
import { RadioGroup } from '../radio-group';
import { Radio } from './Radio';

const meta = {
  title: 'Components/Radio',
  component: Radio.Item,
  tags: ['autodocs'],
  args: {
    children: 'Use isolated runtime',
    description: 'Starts each workspace in its own process tree.',
    variant: 'soft',
    color: 'brand',
    size: 'md',
    disabled: false,
    value: 'isolated-runtime',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  render: (args) => (
    <RadioGroup defaultValue="isolated-runtime">
      <Radio.Item {...args} />
    </RadioGroup>
  ),
} satisfies Meta<typeof Radio.Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Grouped: Story = {
  render: () => (
    <RadioGroup defaultValue="secure" color="brand" variant="soft" size="md">
      <RadioGroup.Item value="secure" description="Strict plugin signature and policy checks.">
        Secure mode
      </RadioGroup.Item>
      <RadioGroup.Item value="balanced" description="Balanced performance and safety defaults.">
        Balanced mode
      </RadioGroup.Item>
      <RadioGroup.Item
        value="performance"
        description="Maximum local performance, fewer safeguards."
      >
        Performance mode
      </RadioGroup.Item>
    </RadioGroup>
  ),
};

export const CustomIndicators: Story = {
  render: () => (
    <RadioGroup defaultValue="fast" color="success" variant="outline" size="md">
      <RadioGroup.Item value="secure" indicator={<LuShieldCheck aria-hidden />}>
        Secure
      </RadioGroup.Item>
      <RadioGroup.Item value="balanced" indicator={<LuHardDrive aria-hidden />}>
        Balanced
      </RadioGroup.Item>
      <RadioGroup.Item value="fast" indicator={<LuRocket aria-hidden />}>
        Fast
      </RadioGroup.Item>
    </RadioGroup>
  ),
};
