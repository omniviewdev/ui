import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from '@omniviewdev/base-ui';
import { LuPlus, LuArrowUp } from 'react-icons/lu';
import { AIModelSelector } from './AIModelSelector';
import { ChatInput } from './ChatInput';
import type { AIModel } from './AIModelSelector';

const sampleModels: AIModel[] = [
  { id: 'claude-sonnet-4', name: 'Claude Sonnet', description: 'Fast and capable' },
  { id: 'claude-opus-4', name: 'Claude Opus', description: 'Most powerful' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal reasoning' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', description: 'Open source, local' },
];

const meta: Meta<typeof AIModelSelector> = {
  title: 'AI/Chat/AIModelSelector',
  component: AIModelSelector,
  tags: ['autodocs'],
  args: {
    models: sampleModels,
    value: 'claude-sonnet-4',
    size: 'sm',
    variant: 'outline',
    showIcon: true,
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'radio', options: ['ghost', 'soft', 'outline', 'solid'] },
    showIcon: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Ghost: Story = {
  name: 'Ghost Variant',
  args: {
    variant: 'ghost',
  },
};

export const Outline: Story = {
  name: 'Outline Variant',
  args: {
    variant: 'outline',
  },
};

export const Soft: Story = {
  name: 'Soft Variant',
  args: {
    variant: 'soft',
  },
};

export const NoIcon: Story = {
  name: 'Without Bot Icon',
  args: {
    showIcon: false,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <AIModelSelector models={sampleModels} value="claude-sonnet-4" size="sm" variant="outline" />
      <AIModelSelector models={sampleModels} value="claude-sonnet-4" size="md" variant="outline" />
      <AIModelSelector models={sampleModels} value="claude-sonnet-4" size="lg" variant="outline" />
    </div>
  ),
};

export const NoSelection: Story = {
  args: {
    value: undefined,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const InChatInput: Story = {
  name: 'Inside ChatInput Toolbar',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
  render: () => {
    const [value, setValue] = useState('');
    const [model, setModel] = useState('claude-sonnet-4');
    const submit = () => { setValue(''); };
    return (
      <ChatInput
        value={value}
        onChange={setValue}
        onSubmit={submit}
        placeholder="Ask for follow-up changes..."
        startActions={
          <>
            <IconButton size="sm" variant="ghost" color="neutral" aria-label="Attach file">
              <LuPlus size={16} />
            </IconButton>
            <AIModelSelector
              models={sampleModels}
              value={model}
              onChange={setModel}
              size="sm"
              variant="ghost"
              showIcon={false}
            />
          </>
        }
        endActions={
          <IconButton
            size="sm"
            variant="solid"
            color="brand"
            aria-label="Send message"
            disabled={!value.trim()}
            onClick={submit}
          >
            <LuArrowUp size={16} />
          </IconButton>
        }
      />
    );
  },
};
