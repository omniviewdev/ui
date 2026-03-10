import type { Meta, StoryObj } from '@storybook/react';
import { AIInferenceStats } from './AIInferenceStats';

const meta = {
  title: 'AI/Content/AIInferenceStats',
  component: AIInferenceStats,
  tags: ['autodocs'],
} satisfies Meta<typeof AIInferenceStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    throughput: 26.51,
    tokenCount: 2447,
    latency: 0.7,
    stopReason: 'EOS Token Found',
  },
};

export const ThroughputAndTokens: Story = {
  name: 'Throughput + Token Count',
  args: {
    throughput: 42.3,
    tokenCount: 1024,
  },
};

export const FullBreakdown: Story = {
  name: 'Full Breakdown (Input/Output)',
  args: {
    throughput: 18.7,
    tokenCount: 3200,
    latency: 2.14,
    inputTokens: 1250,
    outputTokens: 1950,
    stopReason: 'max_tokens',
  },
};

export const LatencyOnly: Story = {
  args: {
    latency: 0.35,
    tokenCount: 128,
  },
};

export const StopReasonOnly: Story = {
  name: 'Stop Reason Only',
  args: {
    stopReason: 'length',
  },
};

export const FastInference: Story = {
  name: 'Fast Inference',
  args: {
    throughput: 95.2,
    tokenCount: 512,
    latency: 0.12,
    stopReason: 'stop',
  },
};

export const LargeGeneration: Story = {
  name: 'Large Generation',
  args: {
    throughput: 14.8,
    tokenCount: 32000,
    latency: 45.6,
    inputTokens: 4096,
    outputTokens: 27904,
    stopReason: 'max_tokens',
  },
};
