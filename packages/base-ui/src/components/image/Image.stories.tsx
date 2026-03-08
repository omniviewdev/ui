import type { Meta, StoryObj } from '@storybook/react';
import { Image } from './Image';

const meta = {
  title: 'Surfaces/Image',
  component: Image,
  tags: ['autodocs'],
  args: {
    src: 'https://picsum.photos/400/300',
    alt: 'Demo image',
    objectFit: 'cover',
    borderRadius: 'none',
    width: 400,
    height: 300,
  },
  argTypes: {
    objectFit: {
      control: 'inline-radio',
      options: ['contain', 'cover', 'fill', 'none', 'scale-down'],
    },
    borderRadius: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md', 'lg', 'full'],
    },
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ObjectFit: Story = {
  name: 'Object Fit',
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {(['contain', 'cover', 'fill', 'none', 'scale-down'] as const).map((fit) => (
        <div key={fit}>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 'var(--ov-font-size-caption)',
              color: 'var(--ov-color-fg-muted)',
            }}
          >
            {fit}
          </p>
          <Image
            src="https://picsum.photos/400/300"
            alt={`${fit} example`}
            objectFit={fit}
            width={200}
            height={150}
            style={{ border: '1px solid var(--ov-color-border-muted)' }}
          />
        </div>
      ))}
    </div>
  ),
};

export const BorderRadius: Story = {
  name: 'Border Radius',
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {(['none', 'sm', 'md', 'lg', 'full'] as const).map((radius) => (
        <div key={radius}>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 'var(--ov-font-size-caption)',
              color: 'var(--ov-color-fg-muted)',
            }}
          >
            {radius}
          </p>
          <Image
            src="https://picsum.photos/200/200"
            alt={`${radius} radius`}
            borderRadius={radius}
            width={200}
            height={200}
          />
        </div>
      ))}
    </div>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Image
      src="https://broken-url.invalid/image.jpg"
      alt="Missing image"
      fallback={<span>Image not found</span>}
      width={300}
      height={200}
      borderRadius="md"
    />
  ),
};
