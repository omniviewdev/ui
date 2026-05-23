import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxGroup } from './CheckboxGroup';

const meta = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'brand',
    size: 'md',
    orientation: 'vertical',
    defaultValue: ['focus-mode'],
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
  },
  render: (args) => (
    <CheckboxGroup {...args}>
      <CheckboxGroup.Item value="focus-mode">Focus mode</CheckboxGroup.Item>
      <CheckboxGroup.Item value="compact-icons">Compact side icons</CheckboxGroup.Item>
      <CheckboxGroup.Item value="inline-help">Inline assistant hints</CheckboxGroup.Item>
    </CheckboxGroup>
  ),
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
