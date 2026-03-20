import type { Meta, StoryObj } from '@storybook/react';
import { LuBell, LuCommand, LuSearch } from 'react-icons/lu';
import { ToggleButtonGroup } from './ToggleButtonGroup';

const meta = {
  title: 'Components/ToggleButtonGroup',
  component: ToggleButtonGroup,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    orientation: 'horizontal',
    attached: true,
    multiple: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    attached: { control: 'boolean' },
    multiple: { control: 'boolean' },
  },
  parameters: {
    docs: {
      source: {
        code: `<ToggleButtonGroup variant="soft" color="neutral" size="md" defaultValue={['errors']}>
  <ToggleButtonGroup.Item value="errors" startDecorator={<LuBell />} endDecorator="⌘1">
    Errors
  </ToggleButtonGroup.Item>
  <ToggleButtonGroup.Item value="warnings" startDecorator={<LuSearch />} endDecorator="⌘2">
    Warnings
  </ToggleButtonGroup.Item>
  <ToggleButtonGroup.Item value="info" startDecorator={<LuCommand />} endDecorator="⌘3">
    Info
  </ToggleButtonGroup.Item>
</ToggleButtonGroup>`,
      },
    },
  },
  render: (args) => {
    const initialValue = args.multiple ? ['errors', 'warnings'] : ['errors'];

    return (
      <ToggleButtonGroup {...args} defaultValue={initialValue}>
        <ToggleButtonGroup.Item value="errors" startDecorator={<LuBell />} endDecorator="⌘1">
          Errors
        </ToggleButtonGroup.Item>
        <ToggleButtonGroup.Item value="warnings" startDecorator={<LuSearch />} endDecorator="⌘2">
          Warnings
        </ToggleButtonGroup.Item>
        <ToggleButtonGroup.Item value="info" startDecorator={<LuCommand />} endDecorator="⌘3">
          Info
        </ToggleButtonGroup.Item>
      </ToggleButtonGroup>
    );
  },
} satisfies Meta<typeof ToggleButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const VerticalDetached: Story = {
  args: {
    orientation: 'vertical',
    attached: false,
    multiple: true,
    color: 'brand',
  },
  render: (args) => (
    <ToggleButtonGroup {...args} defaultValue={['errors', 'warnings']}>
      <ToggleButtonGroup.Item value="errors" startDecorator={<LuBell />} endDecorator="⌘1">
        Errors
      </ToggleButtonGroup.Item>
      <ToggleButtonGroup.Item value="warnings" startDecorator={<LuSearch />} endDecorator="⌘2">
        Warnings
      </ToggleButtonGroup.Item>
      <ToggleButtonGroup.Item value="info" startDecorator={<LuCommand />} endDecorator="⌘3">
        Info
      </ToggleButtonGroup.Item>
    </ToggleButtonGroup>
  ),
};
