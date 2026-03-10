import type { Meta, StoryObj } from '@storybook/react';
import { AIContextIndicator } from './AIContextIndicator';

const meta = {
  title: 'AI/Chat/AIContextIndicator',
  component: AIContextIndicator,
  tags: ['autodocs'],
} satisfies Meta<typeof AIContextIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    items: [
      { type: 'file', label: 'deployment.yaml' },
      { type: 'tool', label: 'kubectl' },
      { type: 'database', label: 'metrics-db' },
    ],
  },
};

export const Overflow: Story = {
  args: {
    maxVisible: 3,
    items: [
      { type: 'file', label: 'deployment.yaml' },
      { type: 'tool', label: 'kubectl' },
      { type: 'database', label: 'metrics-db' },
      { type: 'file', label: 'service.yaml' },
      { type: 'tool', label: 'helm' },
      { type: 'file', label: 'configmap.yaml' },
    ],
  },
};

export const SingleItem: Story = {
  args: {
    items: [
      { type: 'file', label: 'pod-spec.yaml' },
    ],
  },
};
