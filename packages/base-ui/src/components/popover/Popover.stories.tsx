import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Popover } from './Popover';

const meta: Meta = {
  title: 'Components/Popover',
  component: Popover.Root as Meta['component'],
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
        code: `<Popover.Root variant="soft" color="neutral" size="md">
  <Popover.Trigger>Workspace Details</Popover.Trigger>
  <Popover.Portal>
    <Popover.Backdrop />
    <Popover.Positioner sideOffset={10}>
      <Popover.Popup>
        <Popover.Arrow />
        <Popover.Title>Workspace Diagnostics</Popover.Title>
        <Popover.Description>
          Last schema sync completed 2 minutes ago. No pending migrations detected.
        </Popover.Description>
        <Popover.Close variant="solid" color="brand">Done</Popover.Close>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>`,
      },
    },
  },
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger>Workspace Details</Popover.Trigger>
      <Popover.Portal>
        <Popover.Backdrop />
        <Popover.Positioner align="start" sideOffset={10}>
          <Popover.Popup>
            <Popover.Arrow />
            <Popover.Title>Workspace Diagnostics</Popover.Title>
            <Popover.Description>
              Last schema sync completed 2 minutes ago. No pending migrations detected.
            </Popover.Description>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="ghost" color="neutral">
                Inspect
              </Button>
              <Popover.Close variant="solid" color="brand">
                Done
              </Popover.Close>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
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
