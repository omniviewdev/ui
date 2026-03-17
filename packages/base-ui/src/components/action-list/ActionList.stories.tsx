import type { Meta, StoryObj } from '@storybook/react';
import { LuBan, LuRefreshCw, LuWaypoints } from 'react-icons/lu';
import { ActionList } from './ActionList';

const meta = {
  title: 'Components/ActionList',
  component: ActionList,
  tags: ['autodocs'],
  args: {
    color: 'neutral',
    size: 'md',
    itemVariant: 'ghost',
  },
  argTypes: {
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    itemVariant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
  },
  parameters: {
    controls: {
      include: ['color', 'size', 'itemVariant'],
    },
    docs: {
      source: {
        code: `<ActionList color="neutral" size="md" itemVariant="ghost" style={{ width: 360 }}>
  <ActionList.GroupLabel>Workspace Actions</ActionList.GroupLabel>
  <ActionList.Item leadingIcon={<LuRefreshCw />} trailingContent="⌘R" description="Reload runtime and refresh sessions">
    Restart Runtime
  </ActionList.Item>
  <ActionList.Item leadingIcon={<LuWaypoints />} trailingContent="⌘K" description="Open command palette">
    Command Palette
  </ActionList.Item>
  <ActionList.Separator />
  <ActionList.Item color="danger" leadingIcon={<LuBan />} description="Terminate active session">
    Stop Session
  </ActionList.Item>
</ActionList>`,
      },
    },
  },
  render: (args) => (
    <ActionList {...args} style={{ width: 360 }}>
      <ActionList.GroupLabel>Workspace Actions</ActionList.GroupLabel>
      <ActionList.Item
        leadingIcon={<LuRefreshCw />}
        trailingContent="⌘R"
        description="Reload runtime and refresh sessions"
      >
        Restart Runtime
      </ActionList.Item>
      <ActionList.Item
        leadingIcon={<LuWaypoints />}
        trailingContent="⌘K"
        description="Open command palette"
      >
        Command Palette
      </ActionList.Item>
      <ActionList.Separator />
      <ActionList.Item
        color="danger"
        leadingIcon={<LuBan />}
        description="Terminate active session"
      >
        Stop Session
      </ActionList.Item>
    </ActionList>
  ),
} satisfies Meta<typeof ActionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
