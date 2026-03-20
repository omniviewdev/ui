import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: {
    children: 'Auto save',
    description: 'Persist workspace edits every 5 seconds.',
    variant: 'soft',
    color: 'brand',
    size: 'md',
    defaultChecked: true,
    labelPosition: 'end',
    layout: 'inline',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    defaultChecked: { control: 'boolean' },
    labelPosition: { control: 'inline-radio', options: ['start', 'end'] },
    layout: { control: 'inline-radio', options: ['inline', 'spread'] },
    disabled: { control: 'boolean' },
    checked: { control: false, table: { disable: true } },
    thumb: { control: false, table: { disable: true } },
    thumbProps: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Switch {...args} />,
};

export const TrackStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Switch color="brand" variant="soft" defaultChecked={false}>
        Runtime disabled
      </Switch>
      <Switch color="brand" variant="soft" defaultChecked>
        Runtime enabled
      </Switch>
      <Switch color="neutral" variant="soft" defaultChecked={false}>
        Neutral off
      </Switch>
      <Switch color="neutral" variant="soft" defaultChecked>
        Neutral on
      </Switch>
    </div>
  ),
};

export const SettingsRow: Story = {
  args: {
    labelPosition: 'start',
    layout: 'spread',
    defaultChecked: true,
    children: 'Auto save workspace',
    description: 'Persist editor and runtime state continuously.',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Switch size="sm" defaultChecked>
        Small switch
      </Switch>
      <Switch size="md" defaultChecked>
        Medium switch
      </Switch>
      <Switch size="lg" defaultChecked>
        Large switch
      </Switch>
    </div>
  ),
};
