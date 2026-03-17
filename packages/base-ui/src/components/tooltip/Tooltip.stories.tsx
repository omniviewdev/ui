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
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
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

export const LazyTooltip: Story = {
  render: (args) => (
    <Tooltip.Provider delay={120} closeDelay={40}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <Tooltip.Root key={i} lazy {...args}>
            <Tooltip.Trigger>Item {i + 1}</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner sideOffset={8}>
                <Tooltip.Popup>
                  Tooltip content for item {i + 1}. This content is only rendered when the tooltip
                  first opens.
                </Tooltip.Popup>
                <Tooltip.Arrow />
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        ))}
      </div>
    </Tooltip.Provider>
  ),
};
