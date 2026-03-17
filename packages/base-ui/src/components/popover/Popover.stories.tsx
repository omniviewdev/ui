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
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
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

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {(['soft', 'solid', 'outline', 'ghost'] as const).map((variant) => (
        <Popover.Root key={variant} defaultOpen variant={variant} color="brand">
          <Popover.Trigger>{variant}</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner sideOffset={10}>
              <Popover.Popup>
                <Popover.Arrow />
                <Popover.Title>{variant} variant</Popover.Title>
                <Popover.Description>
                  This popover uses the {variant} variant styling.
                </Popover.Description>
                <Popover.Close variant="ghost" color="neutral">
                  Close
                </Popover.Close>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Popover.Root key={size} defaultOpen size={size}>
          <Popover.Trigger>{size}</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner sideOffset={10}>
              <Popover.Popup>
                <Popover.Arrow />
                <Popover.Title>Size: {size}</Popover.Title>
                <Popover.Description>
                  Popover content at {size} size with appropriate spacing.
                </Popover.Description>
                <Popover.Close>Done</Popover.Close>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      ))}
    </div>
  ),
};

export const Positioning: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', padding: 80 }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover.Root key={side} defaultOpen>
          <Popover.Trigger>{side}</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side={side} sideOffset={10}>
              <Popover.Popup>
                <Popover.Arrow />
                <Popover.Title>Side: {side}</Popover.Title>
                <Popover.Description>Positioned on the {side}.</Popover.Description>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      ))}
    </div>
  ),
};

export const WithBackdrop: Story = {
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger>Open with backdrop</Popover.Trigger>
      <Popover.Portal>
        <Popover.Backdrop />
        <Popover.Positioner sideOffset={10}>
          <Popover.Popup>
            <Popover.Arrow />
            <Popover.Title>Modal-like Popover</Popover.Title>
            <Popover.Description>
              This popover has a backdrop that dims the rest of the page.
            </Popover.Description>
            <Popover.Close variant="solid" color="brand">
              Dismiss
            </Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  ),
};

export const WithoutArrow: Story = {
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger>No arrow</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6}>
          <Popover.Popup>
            <Popover.Title>No Arrow</Popover.Title>
            <Popover.Description>
              This popover omits the arrow for a cleaner look.
            </Popover.Description>
            <Popover.Close>OK</Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  ),
};
