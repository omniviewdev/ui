import type { Meta, StoryObj } from '@storybook/react';
import {
  LuCheck,
  LuChevronRight,
  LuDownload,
  LuFileCode2,
  LuFolder,
  LuTerminal,
} from 'react-icons/lu';
import { Menu } from './Menu';

const meta = {
  title: 'Components/Menu',
  component: Menu.Root,
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
    docs: {
      source: {
        code: `<Menu.Root variant="soft" color="neutral" size="md">
  <Menu.Trigger>Workspace Menu</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner sideOffset={8}>
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel>Workspace Actions</Menu.GroupLabel>
          <Menu.Item startDecorator={<LuTerminal />} endDecorator="⌘R">Run Task</Menu.Item>
          <Menu.Item startDecorator={<LuFileCode2 />} endDecorator="⌘K">Open Command Palette</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.CheckboxItem defaultChecked startDecorator={<Menu.CheckboxItemIndicator><LuCheck /></Menu.CheckboxItemIndicator>}>
          Auto save
        </Menu.CheckboxItem>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>`,
      },
    },
  },
  render: (args) => (
    <Menu.Root {...args}>
      <Menu.Trigger>Workspace Menu</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="start" sideOffset={8}>
          <Menu.Popup>
            <Menu.Group>
              <Menu.GroupLabel>Workspace Actions</Menu.GroupLabel>
              <Menu.Item startDecorator={<LuTerminal />} endDecorator="⌘R">
                Run Task
              </Menu.Item>
              <Menu.Item startDecorator={<LuFileCode2 />} endDecorator="⌘K">
                Command Palette
              </Menu.Item>
            </Menu.Group>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger startDecorator={<LuFolder />} endDecorator="→">
                Recent Projects
              </Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner sideOffset={6}>
                  <Menu.Popup>
                    <Menu.Item>omniview-core</Menu.Item>
                    <Menu.Item>omniview-ui</Menu.Item>
                    <Menu.Item endDecorator={<LuChevronRight />}>More…</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
            <Menu.Separator />
            <Menu.CheckboxItem
              closeOnClick={false}
              defaultChecked
              startDecorator={
                <Menu.CheckboxItemIndicator keepMounted>
                  <LuCheck />
                </Menu.CheckboxItemIndicator>
              }
            >
              Auto save
            </Menu.CheckboxItem>
            <Menu.RadioGroup defaultValue="comfortable">
              <Menu.RadioItem
                value="compact"
                closeOnClick={false}
                startDecorator={
                  <Menu.RadioItemIndicator keepMounted>
                    <LuCheck />
                  </Menu.RadioItemIndicator>
                }
              >
                Compact density
              </Menu.RadioItem>
              <Menu.RadioItem
                value="comfortable"
                closeOnClick={false}
                startDecorator={
                  <Menu.RadioItemIndicator keepMounted>
                    <LuCheck />
                  </Menu.RadioItemIndicator>
                }
              >
                Comfortable density
              </Menu.RadioItem>
            </Menu.RadioGroup>
            <Menu.Separator />
            <Menu.LinkItem
              closeOnClick
              href="#export"
              startDecorator={<LuDownload />}
              endDecorator="⇧⌘E"
            >
              Export Snapshot
            </Menu.LinkItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  ),
} satisfies Meta<typeof Menu.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Open: Story = {
  args: {
    defaultOpen: true,
  },
};
