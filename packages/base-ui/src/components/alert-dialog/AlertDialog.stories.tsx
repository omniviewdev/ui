import type { Meta, StoryObj } from '@storybook/react';
import { AlertDialog } from './AlertDialog';

const meta = {
  title: 'Components/AlertDialog',
  component: AlertDialog.Root,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'brand',
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
  },
  render: (args) => (
    <AlertDialog.Root {...args}>
      <AlertDialog.Trigger>Delete Workspace</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Popup>
          <AlertDialog.Title>Delete workspace?</AlertDialog.Title>
          <AlertDialog.Description>
            This permanently removes local state, runtime settings, and recent session metadata.
          </AlertDialog.Description>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <AlertDialog.Close variant="ghost" color="neutral">
              Cancel
            </AlertDialog.Close>
            <AlertDialog.Close variant="solid" color="danger">
              Delete
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  ),
} satisfies Meta<typeof AlertDialog.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Open: Story = {
  args: {
    defaultOpen: true,
  },
};
