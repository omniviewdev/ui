import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from './AspectRatio';

const meta = {
  title: 'Layout/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  args: { ratio: 16 / 9 },
  argTypes: {
    ratio: { control: { type: 'number', min: 0.25, max: 4, step: 0.05 } },
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <AspectRatio {...args}>
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=720&h=405&fit=crop"
          alt="Landscape valley with mountains and river"
          style={{ borderRadius: 'var(--ov-radius-surface)' }}
        />
      </AspectRatio>
    </div>
  ),
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const CommonRatios: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
      {[
        { label: '16:9', ratio: 16 / 9, src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=480&h=270&fit=crop' },
        { label: '4:3', ratio: 4 / 3, src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=480&h=360&fit=crop' },
        { label: '1:1', ratio: 1, src: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=480&h=480&fit=crop' },
        { label: '21:9', ratio: 21 / 9, src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=630&h=270&fit=crop' },
      ].map(({ label, ratio, src }) => (
        <div key={label} style={{ width: 180 }}>
          <AspectRatio ratio={ratio}>
            <img
              src={src}
              alt={`${label} ratio landscape`}
              style={{ borderRadius: 'var(--ov-radius-control)' }}
            />
          </AspectRatio>
          <p style={{ margin: '6px 0 0', textAlign: 'center', fontSize: 'var(--ov-font-size-caption)', color: 'var(--ov-color-fg-muted)' }}>
            {label}
          </p>
        </div>
      ))}
    </div>
  ),
};

export const Portrait: Story = {
  args: { ratio: 3 / 4 },
  render: (args) => (
    <div style={{ width: 240 }}>
      <AspectRatio {...args}>
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=360&h=480&fit=crop"
          alt="Portrait photo"
          style={{ borderRadius: 'var(--ov-radius-surface)' }}
        />
      </AspectRatio>
    </div>
  ),
};
