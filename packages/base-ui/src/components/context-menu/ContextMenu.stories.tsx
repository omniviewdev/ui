import type { Meta, StoryObj } from '@storybook/react';
import { LuCheck, LuCopy, LuFolderOpen, LuScissors, LuTrash2 } from 'react-icons/lu';
import { ContextMenu } from './ContextMenu';

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu.Root,
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
  render: (args) => (
    <ContextMenu.Root {...args}>
      <ContextMenu.Trigger
        style={{
          width: 420,
          padding: '18px 16px',
          border: '1px solid var(--ov-color-border-default)',
          borderRadius: 'var(--ov-radius-surface)',
          background: 'var(--ov-color-bg-surface)',
          color: 'var(--ov-color-fg-muted)',
          fontFamily: 'var(--ov-font-sans)',
        }}
      >
        Right click this surface
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.Item startDecorator={<LuCopy />} endDecorator="⌘C">
              Copy
            </ContextMenu.Item>
            <ContextMenu.Item startDecorator={<LuScissors />} endDecorator="⌘X">
              Cut
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.CheckboxItem
              defaultChecked
              closeOnClick={false}
              startDecorator={
                <ContextMenu.CheckboxItemIndicator keepMounted>
                  <LuCheck />
                </ContextMenu.CheckboxItemIndicator>
              }
            >
              Auto format on save
            </ContextMenu.CheckboxItem>
            <ContextMenu.SubmenuRoot>
              <ContextMenu.SubmenuTrigger startDecorator={<LuFolderOpen />}>
                Move to…
              </ContextMenu.SubmenuTrigger>
              <ContextMenu.Portal>
                <ContextMenu.Positioner sideOffset={6}>
                  <ContextMenu.Popup>
                    <ContextMenu.Item>Workspace</ContextMenu.Item>
                    <ContextMenu.Item>Archive</ContextMenu.Item>
                  </ContextMenu.Popup>
                </ContextMenu.Positioner>
              </ContextMenu.Portal>
            </ContextMenu.SubmenuRoot>
            <ContextMenu.Separator />
            <ContextMenu.Item color="danger" startDecorator={<LuTrash2 />}>
              Delete
            </ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  ),
} satisfies Meta<typeof ContextMenu.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
