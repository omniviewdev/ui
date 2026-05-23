import type { Meta, StoryObj } from '@storybook/react';
import { LuBot, LuCode, LuUser } from 'react-icons/lu';
import type { AvatarProps } from './Avatar';
import { Avatar } from './Avatar';

type FallbackIconOption = 'none' | 'user' | 'bot' | 'code';

type AvatarStoryArgs = Omit<AvatarProps, 'fallbackIcon' | 'src'> & {
  fallbackIconName: FallbackIconOption;
  useImage: boolean;
};

const FALLBACK_ICON_OPTIONS: FallbackIconOption[] = ['none', 'user', 'bot', 'code'];

const DEMO_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" fill="none">
    <defs>
      <linearGradient id="avatarGradient" x1="8" y1="8" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop stop-color="#7092e8" />
        <stop offset="1" stop-color="#4f5968" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="128" height="128" fill="url(#avatarGradient)" />
    <circle cx="64" cy="48" r="20" fill="#eef2f7" fill-opacity="0.9" />
    <rect x="28" y="78" width="72" height="36" rx="18" fill="#eef2f7" fill-opacity="0.9" />
  </svg>`,
)}`;

function renderFallbackIcon(icon: FallbackIconOption) {
  switch (icon) {
    case 'user':
      return <LuUser aria-hidden />;
    case 'bot':
      return <LuBot aria-hidden />;
    case 'code':
      return <LuCode aria-hidden />;
    default:
      return undefined;
  }
}

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    shape: 'circle',
    deterministic: true,
    name: 'Joshua Pare',
    alt: 'Joshua Pare',
    fallbackIconName: 'none',
    useImage: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'inline-radio', options: ['circle', 'rounded'] },
    deterministic: { control: 'boolean' },
    name: { control: 'text' },
    seed: { control: 'text' },
    paletteIndex: { control: { type: 'number', min: 1, max: 12, step: 1 } },
    useImage: { control: 'boolean' },
    fallbackIconName: { control: 'select', options: FALLBACK_ICON_OPTIONS },
    children: { control: false, table: { disable: true } },
    fallback: { control: false, table: { disable: true } },
    imageProps: { control: false, table: { disable: true } },
    fallbackProps: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: {
      include: [
        'variant',
        'color',
        'size',
        'shape',
        'deterministic',
        'name',
        'seed',
        'paletteIndex',
        'useImage',
        'fallbackIconName',
      ],
    },
  },
  render: ({ fallbackIconName, useImage, ...args }) => (
    <Avatar
      {...args}
      src={useImage ? DEMO_IMAGE : undefined}
      fallbackIcon={renderFallbackIcon(fallbackIconName)}
    />
  ),
} satisfies Meta<AvatarStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ShapesAndSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Avatar name="Joshua Pare" size="sm" shape="circle" />
      <Avatar name="Joshua Pare" size="md" shape="circle" />
      <Avatar name="Joshua Pare" size="lg" shape="circle" />
      <Avatar name="Joshua Pare" size="sm" shape="rounded" />
      <Avatar name="Joshua Pare" size="md" shape="rounded" />
      <Avatar name="Joshua Pare" size="lg" shape="rounded" />
    </div>
  ),
};

export const DeterministicFallbackPalette: Story = {
  render: () => {
    const names = [
      'Joshua Pare',
      'Olivia Chen',
      'Miguel Alvarez',
      'Alicia Kim',
      'Sam Patel',
      'Rina Ito',
      'Noah Lee',
      'Priya Singh',
    ];

    return (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {names.map((name) => (
          <Avatar key={name} name={name} title={name} />
        ))}
      </div>
    );
  },
};

export const IconFallbackAndImage: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar size="lg" fallbackIcon={<LuBot aria-hidden />} aria-label="Bot avatar" />
      <Avatar
        size="lg"
        fallbackIcon={<LuCode aria-hidden />}
        shape="rounded"
        aria-label="Code avatar"
      />
      <Avatar size="lg" name="Mia Torres" src={DEMO_IMAGE} aria-label="Image avatar" />
    </div>
  ),
};
