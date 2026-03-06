import type { Meta, StoryObj } from '@storybook/react';
import type { TextAreaControlProps, TextAreaRootProps } from './TextArea';
import { TextArea } from './TextArea';

type TextAreaStoryArgs = TextAreaRootProps & Pick<TextAreaControlProps, 'mono' | 'resize'>;

const meta = {
  title: 'Components/TextArea',
  component: TextArea.Root,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    mono: false,
    resize: 'vertical',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    mono: { control: 'boolean' },
    resize: { control: 'inline-radio', options: ['none', 'vertical', 'horizontal', 'both'] },
    disabled: { control: 'boolean' },
  },
  parameters: {
    controls: {
      include: ['variant', 'color', 'size', 'mono', 'resize', 'disabled'],
    },
  },
  render: ({ mono, resize, disabled, ...args }) => (
    <div style={{ width: 420 }}>
      <TextArea.Root {...args} disabled={disabled}>
        <TextArea.Label>Runtime Notes</TextArea.Label>
        <TextArea.Control
          disabled={disabled}
          mono={mono}
          resize={resize}
          rows={5}
          placeholder="Paste logs, notes, or command snippets..."
          defaultValue={
            mono
              ? 'kubectl get pods -A\nhelm ls --all-namespaces\n./omniview runtime status'
              : ''
          }
        />
        <TextArea.Description>Supports markdown-like notes and multiline command drafts.</TextArea.Description>
      </TextArea.Root>
    </div>
  ),
} satisfies Meta<TextAreaStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ width: 420, display: 'grid', gap: 12 }}>
      <TextArea.Root {...args} size="sm">
        <TextArea.Label>Small</TextArea.Label>
        <TextArea.Control rows={3} placeholder="Small textarea" />
      </TextArea.Root>
      <TextArea.Root {...args} size="md">
        <TextArea.Label>Medium</TextArea.Label>
        <TextArea.Control rows={4} placeholder="Medium textarea" />
      </TextArea.Root>
      <TextArea.Root {...args} size="lg">
        <TextArea.Label>Large</TextArea.Label>
        <TextArea.Control rows={5} placeholder="Large textarea" />
      </TextArea.Root>
    </div>
  ),
};

export const Monospace: Story = {
  args: {
    mono: true,
    variant: 'outline',
  },
};
