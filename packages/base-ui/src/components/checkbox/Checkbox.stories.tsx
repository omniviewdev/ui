import type { Meta, StoryObj } from '@storybook/react';
import { LuShieldCheck, LuTerminal } from 'react-icons/lu';
import { CheckboxGroup } from '../checkbox-group';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox.Item,
  tags: ['autodocs'],
  args: {
    children: 'Enable local server',
    description: 'Automatically restore sessions after restart.',
    variant: 'soft',
    color: 'brand',
    size: 'md',
    defaultChecked: true,
    indeterminate: false,
    labelPosition: 'end',
    layout: 'inline',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    defaultChecked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    labelPosition: { control: 'inline-radio', options: ['start', 'end'] },
    layout: { control: 'inline-radio', options: ['inline', 'spread'] },
    disabled: { control: 'boolean' },
    checked: { control: false, table: { disable: true } },
    onCheckedChange: { action: 'checked changed' },
  },
} satisfies Meta<typeof Checkbox.Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Checkbox.Item {...args} />,
};

export const Grouped: Story = {
  render: () => (
    <CheckboxGroup defaultValue={['runtime', 'security']} color="brand" variant="soft" size="md">
      <CheckboxGroup.Item
        value="runtime"
        description="Keep the runtime process alive while the workspace is active."
      >
        Runtime persistence
      </CheckboxGroup.Item>
      <CheckboxGroup.Item
        value="security"
        description="Require confirmed signature verification for plugin updates."
      >
        Secure plugin updates
      </CheckboxGroup.Item>
      <CheckboxGroup.Item
        value="terminal"
        description="Restore terminal scrollback from previous sessions."
      >
        Terminal history
      </CheckboxGroup.Item>
    </CheckboxGroup>
  ),
};

export const SettingsRow: Story = {
  args: {
    children: 'Enable plugin auto-update',
    description: 'Download and apply verified updates in the background.',
    labelPosition: 'start',
    layout: 'spread',
    defaultChecked: true,
    variant: 'soft',
    color: 'brand',
    size: 'md',
  },
  render: (args) => <Checkbox.Item {...args} />,
};

export const CustomIndicator: Story = {
  render: () => (
    <CheckboxGroup defaultValue={['network']} color="success" variant="outline" size="md">
      <CheckboxGroup.Item
        value="network"
        indicator={<LuShieldCheck aria-hidden />}
        description="Allow local API traffic for the active session only."
      >
        Network sandbox
      </CheckboxGroup.Item>
      <CheckboxGroup.Item
        value="shell"
        indicator={<LuTerminal aria-hidden />}
        description="Permit command execution from task recipes."
      >
        Shell execution
      </CheckboxGroup.Item>
    </CheckboxGroup>
  ),
};
