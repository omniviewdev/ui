import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IconButton, Button, Separator } from '@omniviewdev/base-ui';
import { LuPlus, LuArrowUp, LuSquare, LuMic, LuPaperclip, LuChevronDown } from 'react-icons/lu';
import { ChatInput } from './ChatInput';
import { AIModelSelector } from './AIModelSelector';
import type { AIModel } from './AIModelSelector';

const sampleModels: AIModel[] = [
  { id: 'claude-sonnet-4', name: 'Claude Sonnet', description: 'Fast and capable' },
  { id: 'claude-opus-4', name: 'Claude Opus', description: 'Most powerful' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal reasoning' },
];

const meta: Meta<typeof ChatInput> = {
  title: 'AI/Chat/ChatInput',
  component: ChatInput,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    const submit = () => {
      if (value.trim()) {
        alert(`Submitted: ${value}`);
        setValue('');
      }
    };
    return (
      <ChatInput
        {...args}
        value={value}
        onChange={setValue}
        onSubmit={submit}
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
  args: {
    value: '',
    onChange: () => {},
    onSubmit: () => {},
    placeholder: 'Send a message...',
    disabled: false,
  },
};

export const WithSendButton: Story = {
  name: 'With Send Button',
  render: (args) => {
    const [value, setValue] = useState('');
    const submit = () => {
      if (value.trim()) {
        alert(`Submitted: ${value}`);
        setValue('');
      }
    };
    return (
      <ChatInput
        {...args}
        value={value}
        onChange={setValue}
        onSubmit={submit}
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
  args: {
    value: '',
    onChange: () => {},
    onSubmit: () => {},
    placeholder: 'Send a message...',
  },
};

export const FullToolbar: Story = {
  name: 'Full Toolbar (Attach + Send/Stop)',
  render: (args) => {
    const [value, setValue] = useState('');
    const [streaming, setStreaming] = useState(false);
    const submit = () => {
      if (value.trim()) {
        setStreaming(true);
        setValue('');
        setTimeout(() => setStreaming(false), 2000);
      }
    };
    return (
      <ChatInput
        {...args}
        value={value}
        onChange={setValue}
        onSubmit={submit}
        startActions={
          <>
            <IconButton size="sm" variant="ghost" color="neutral" aria-label="Attach file">
              <LuPlus size={16} />
            </IconButton>
            <IconButton size="sm" variant="ghost" color="neutral" aria-label="Attach from context">
              <LuPaperclip size={16} />
            </IconButton>
          </>
        }
        endActions={
          <>
            {value.length > 0 && (
              <span style={{ fontSize: 'var(--ov-font-size-xs)', color: 'var(--ov-color-fg-subtle)', fontVariantNumeric: 'tabular-nums' }}>
                ~{Math.ceil(value.length / 4)} tokens
              </span>
            )}
            <IconButton
              size="sm"
              variant="solid"
              color={streaming ? 'danger' : 'brand'}
              aria-label={streaming ? 'Stop generation' : 'Send message'}
              disabled={!streaming && !value.trim()}
              onClick={streaming ? () => setStreaming(false) : submit}
            >
              {streaming ? <LuSquare size={14} /> : <LuArrowUp size={16} />}
            </IconButton>
          </>
        }
      />
    );
  },
  args: {
    value: '',
    onChange: () => {},
    onSubmit: () => {},
    placeholder: 'Send a message...',
  },
};

export const WithModelSelector: Story = {
  name: 'With Model Selector',
  render: (args) => {
    const [value, setValue] = useState('');
    const [model, setModel] = useState('claude-sonnet-4');
    const submit = () => { setValue(''); };
    return (
      <ChatInput
        {...args}
        value={value}
        onChange={setValue}
        onSubmit={submit}
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
            <Button size="sm" variant="ghost" color="neutral" endDecorator={<LuChevronDown size={12} />}>
              High
            </Button>
          </>
        }
        endActions={
          <>
            <IconButton size="sm" variant="ghost" color="neutral" aria-label="Voice input">
              <LuMic size={16} />
            </IconButton>
            <Separator orientation="vertical" decorative style={{ height: 20 }} />
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
          </>
        }
      />
    );
  },
  args: {
    value: '',
    onChange: () => {},
    onSubmit: () => {},
    placeholder: 'Ask for follow-up changes...',
  },
};

export const Streaming: Story = {
  name: 'Streaming State (Stop Button)',
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <ChatInput
        {...args}
        value={value}
        onChange={setValue}
        onSubmit={() => {}}
        startActions={
          <>
            <IconButton size="sm" variant="ghost" color="neutral" aria-label="Attach file">
              <LuPlus size={16} />
            </IconButton>
            <IconButton size="sm" variant="ghost" color="neutral" aria-label="Attach from context">
              <LuPaperclip size={16} />
            </IconButton>
          </>
        }
        endActions={
          <IconButton size="sm" variant="solid" color="danger" aria-label="Stop generation">
            <LuSquare size={14} />
          </IconButton>
        }
      />
    );
  },
  args: {
    value: '',
    onChange: () => {},
    onSubmit: () => {},
    placeholder: 'Waiting for response...',
    disabled: true,
  },
};

export const Multiline: Story = {
  name: 'Multiline Content',
  render: (args) => {
    const [value, setValue] = useState('Can you help me refactor this function?\n\nIt currently has too many parameters and the logic is hard to follow.\n\nHere is the code:\nfunction process(a, b, c, d, e) { ... }');
    const submit = () => { setValue(''); };
    return (
      <ChatInput
        {...args}
        value={value}
        onChange={setValue}
        onSubmit={submit}
        startActions={
          <IconButton size="sm" variant="ghost" color="neutral" aria-label="Attach file">
            <LuPlus size={16} />
          </IconButton>
        }
        endActions={
          <IconButton
            size="sm"
            variant="solid"
            color="brand"
            aria-label="Send message"
            onClick={submit}
          >
            <LuArrowUp size={16} />
          </IconButton>
        }
      />
    );
  },
  args: {
    value: '',
    onChange: () => {},
    onSubmit: () => {},
  },
};

export const Disabled: Story = {
  render: (args) => (
    <ChatInput
      {...args}
      endActions={
        <IconButton size="sm" variant="solid" color="brand" aria-label="Send message" disabled>
          <LuArrowUp size={16} />
        </IconButton>
      }
    />
  ),
  args: {
    value: '',
    onChange: () => {},
    onSubmit: () => {},
    disabled: true,
    placeholder: 'Input disabled...',
  },
};
