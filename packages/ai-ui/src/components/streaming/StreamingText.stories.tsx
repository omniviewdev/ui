import type { Meta, StoryObj } from '@storybook/react';
import { StreamingText } from './StreamingText';

async function* simulateStream(text: string, delayMs = 30): AsyncGenerator<string> {
  const words = text.split(' ');
  for (const word of words) {
    yield word + ' ';
    await new Promise(r => setTimeout(r, delayMs));
  }
}

const SAMPLE_TEXT =
  'Hello! I am an AI assistant. I can help you with various tasks like writing code, debugging issues, and explaining complex concepts. Feel free to ask me anything.';

const meta = {
  title: 'AI/Streaming/StreamingText',
  component: StreamingText,
  tags: ['autodocs'],
} satisfies Meta<typeof StreamingText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    stream: simulateStream(SAMPLE_TEXT),
    cursor: true,
  },
};

export const StaticContent: Story = {
  args: {
    content: SAMPLE_TEXT,
  },
};

export const FastStream: Story = {
  args: {
    stream: simulateStream(SAMPLE_TEXT, 10),
    cursor: true,
  },
};

export const SlowStream: Story = {
  args: {
    stream: simulateStream(SAMPLE_TEXT, 100),
    cursor: true,
  },
};
