import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AIImageGeneration } from './AIImageGeneration';

const SAMPLE_IMAGE = 'https://picsum.photos/seed/omniview/512/512';

const meta: Meta<typeof AIImageGeneration> = {
  title: 'AI/Content/AIImageGeneration',
  component: AIImageGeneration,
  tags: ['autodocs'],
  args: {
    alt: 'Generated image',
    aspectRatio: 1,
  },
  argTypes: {
    loading: { control: 'boolean' },
    aspectRatio: { control: { type: 'number', min: 0.25, max: 4, step: 0.25 } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    src: SAMPLE_IMAGE,
    prompt: 'A serene landscape with mountains and a clear lake at sunrise',
  },
};

export const Generating: Story = {
  name: 'Generating (Loading)',
  args: {
    loading: true,
    prompt: 'A futuristic Kubernetes dashboard in cyberpunk style',
  },
};

export const GeneratingWide: Story = {
  name: 'Generating (16:9)',
  args: {
    loading: true,
    aspectRatio: 16 / 9,
    prompt: 'Wide landscape panorama of a mountain range',
  },
};

export const SimulatedGeneration: Story = {
  name: 'Simulated Generation Flow',
  render: () => {
    const [loading, setLoading] = useState(true);
    const [src, setSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
        setSrc(SAMPLE_IMAGE);
      }, 3000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AIImageGeneration
          alt="Generated artwork"
          src={src}
          loading={loading}
          prompt="A futuristic city skyline at sunset with flying cars"
        />
        <p style={{ fontSize: 'var(--ov-font-size-xs)', color: 'var(--ov-color-fg-subtle)', margin: 0 }}>
          {loading ? 'Generating image… (3s simulation)' : 'Generation complete — image faded in'}
        </p>
      </div>
    );
  },
};

export const WithPrompt: Story = {
  args: {
    src: 'https://picsum.photos/seed/landscape/512/512',
    prompt: 'A serene landscape with mountains and a clear lake at sunrise',
  },
};

export const NoPrompt: Story = {
  name: 'Without Prompt',
  args: {
    src: 'https://picsum.photos/seed/abstract/512/512',
  },
};

export const Portrait: Story = {
  name: 'Portrait (3:4)',
  args: {
    src: 'https://picsum.photos/seed/portrait/384/512',
    aspectRatio: 3 / 4,
    prompt: 'Portrait of a cyberpunk character',
  },
};

export const Wide: Story = {
  name: 'Wide (16:9)',
  args: {
    src: 'https://picsum.photos/seed/wide/512/288',
    aspectRatio: 16 / 9,
    prompt: 'Panoramic mountain landscape',
  },
};
