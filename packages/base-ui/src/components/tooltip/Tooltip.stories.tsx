import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';

const meta: Meta = {
  title: 'Components/Tooltip',
  component: Tooltip.Root as Meta['component'],
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    controls: {
      include: ['variant', 'color', 'size'],
    },
    docs: {
      source: {
        code: `<Tooltip.Root variant="soft" color="neutral" size="md">
  <Tooltip.Trigger>Schema Cache</Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Positioner sideOffset={8}>
      <Tooltip.Popup>Rebuild indexes to include latest model metadata.</Tooltip.Popup>
      <Tooltip.Arrow />
    </Tooltip.Positioner>
  </Tooltip.Portal>
</Tooltip.Root>`,
      },
    },
  },
  render: (args) => (
    <Tooltip.Provider delay={120} closeDelay={40}>
      <Tooltip.Root {...args}>
        <Tooltip.Trigger>Schema Cache</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup>Rebuild indexes to include latest model metadata.</Tooltip.Popup>
            <Tooltip.Arrow />
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Open: Story = {
  args: {
    defaultOpen: true,
  },
};
