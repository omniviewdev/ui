import type { Meta, StoryObj } from '@storybook/react';
import { LuKeyRound, LuServer } from 'react-icons/lu';
import type { InputControlProps, InputRootProps } from './Input';
import { Input } from './Input';

type InputStoryArgs = InputRootProps &
  Pick<InputControlProps, 'mono'> & {
    disabled?: boolean;
  };

const meta = {
  title: 'Components/Input',
  component: Input.Root,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'brand',
    size: 'md',
    mono: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    mono: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    controls: {
      include: ['variant', 'color', 'size', 'mono', 'disabled'],
    },
  },
  render: ({ mono, disabled, ...args }) => (
    <div style={{ width: 380 }}>
      <Input.Root {...args} disabled={disabled}>
        <Input.Label>Workspace ID</Input.Label>
        <Input.Control
          mono={mono}
          disabled={disabled}
          placeholder="omniview-dev"
          startDecorator={<LuServer aria-hidden />}
          endDecorator={<LuKeyRound aria-hidden />}
          required
        />
        <Input.Description>Used for runtime routing and API-scoped state.</Input.Description>
        <Input.Error match="valueMissing">Workspace ID is required.</Input.Error>
      </Input.Root>
    </div>
  ),
} satisfies Meta<InputStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ width: 380, display: 'grid', gap: 12 }}>
      <Input.Root {...args} size="sm">
        <Input.Label>Small</Input.Label>
        <Input.Control placeholder="sm input" />
      </Input.Root>
      <Input.Root {...args} size="md">
        <Input.Label>Medium</Input.Label>
        <Input.Control placeholder="md input" />
      </Input.Root>
      <Input.Root {...args} size="lg">
        <Input.Label>Large</Input.Label>
        <Input.Control placeholder="lg input" />
      </Input.Root>
    </div>
  ),
};

export const Monospace: Story = {
  args: {
    mono: true,
    color: 'neutral',
    variant: 'outline',
  },
  render: ({ mono, ...args }) => (
    <div style={{ width: 420 }}>
      <Input.Root {...args}>
        <Input.Label>Resource Selector</Input.Label>
        <Input.Control
          mono={mono}
          defaultValue="apps/v1/deployments/omniview-runtime"
          startDecorator={<LuServer aria-hidden />}
        />
      </Input.Root>
    </div>
  ),
};
