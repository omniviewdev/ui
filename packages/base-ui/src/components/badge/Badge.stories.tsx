import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LuBell, LuMail, LuMessageSquare, LuShoppingCart } from 'react-icons/lu';
import type { BadgeProps } from './Badge';
import { Badge } from './Badge';

const meta = {
  title: 'Data Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    content: 5,
    variant: 'standard',
    color: 'danger',
    position: 'top-right',
    max: 99,
    invisible: false,
    pulse: false,
    size: 'md',
    overlap: 'rectangular',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['standard', 'dot'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    overlap: { control: 'inline-radio', options: ['rectangular', 'circular'] },
    max: { control: 'number' },
    content: { control: 'text' },
    invisible: { control: 'boolean' },
    pulse: { control: 'boolean' },
  },
} as Meta<BadgeProps>;

export default meta;
type Story = StoryObj<BadgeProps>;

const IconBox = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: 8,
      background: 'var(--ov-color-bg-surface-raised)',
      color: 'var(--ov-color-fg-default)',
      fontSize: 20,
    }}
  >
    {children}
  </span>
);

const Avatar = ({ initials, size = 48 }: { initials: string; size?: number }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'var(--ov-color-brand-500)',
      color: 'var(--ov-color-fg-inverse)',
      fontWeight: 600,
      fontSize: size * 0.35,
    }}
  >
    {initials}
  </span>
);

export const Playground: Story = {
  render: (args) => (
    <Badge {...args}>
      <IconBox>
        <LuMail />
      </IconBox>
    </Badge>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {(['neutral', 'brand', 'success', 'warning', 'danger'] as const).map((color) => (
        <Badge key={color} content={3} color={color}>
          <IconBox>
            <LuBell />
          </IconBox>
        </Badge>
      ))}
    </div>
  ),
};

export const DotVariant: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {(['brand', 'success', 'warning', 'danger'] as const).map((color) => (
        <Badge key={color} variant="dot" color={color}>
          <IconBox>
            <LuMail />
          </IconBox>
        </Badge>
      ))}
    </div>
  ),
};

export const SizeVariants: Story = {
  name: 'Size variants',
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Badge content={3} color="danger" size="sm">
          <IconBox>
            <LuBell />
          </IconBox>
        </Badge>
        <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--ov-color-fg-muted)' }}>
          sm
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Badge content={3} color="danger" size="md">
          <IconBox>
            <LuBell />
          </IconBox>
        </Badge>
        <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--ov-color-fg-muted)' }}>
          md
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Badge content={3} color="danger" size="lg">
          <IconBox>
            <LuBell />
          </IconBox>
        </Badge>
        <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--ov-color-fg-muted)' }}>
          lg
        </div>
      </div>
    </div>
  ),
};

export const PulsingBadge: Story = {
  name: 'Pulsing (connected indicator)',
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Badge variant="dot" color="success" pulse overlap="circular">
        <Avatar initials="JP" />
      </Badge>
      <Badge variant="dot" color="danger" pulse overlap="circular">
        <Avatar initials="AL" />
      </Badge>
      <Badge variant="dot" color="brand" pulse>
        <IconBox>
          <LuBell />
        </IconBox>
      </Badge>
    </div>
  ),
};

export const OnAvatar: Story = {
  name: 'On avatar (circular overlap)',
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Badge content={3} color="danger" overlap="circular">
        <Avatar initials="JP" />
      </Badge>
      <Badge variant="dot" color="success" overlap="circular">
        <Avatar initials="AL" size={56} />
      </Badge>
      <Badge content="new" color="brand" overlap="circular" size="lg">
        <Avatar initials="MK" size={56} />
      </Badge>
    </div>
  ),
};

export const PositionVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map((position) => (
        <div key={position} style={{ textAlign: 'center' }}>
          <Badge content={1} color="danger" position={position}>
            <IconBox>
              <LuBell />
            </IconBox>
          </Badge>
          <div
            style={{
              marginTop: 8,
              fontSize: '0.75rem',
              color: 'var(--ov-color-fg-muted)',
            }}
          >
            {position}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const MaxCap: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Badge content={99} max={99} color="danger">
        <IconBox>
          <LuMail />
        </IconBox>
      </Badge>
      <Badge content={100} max={99} color="danger">
        <IconBox>
          <LuMail />
        </IconBox>
      </Badge>
      <Badge content={1000} max={999} color="danger">
        <IconBox>
          <LuMail />
        </IconBox>
      </Badge>
    </div>
  ),
};

export const OnAvatarAndIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Badge content={3} color="danger">
        <IconBox>
          <LuShoppingCart />
        </IconBox>
      </Badge>
      <Badge variant="dot" color="success" overlap="circular" pulse>
        <Avatar initials="JP" />
      </Badge>
      <Badge content="new" color="brand">
        <IconBox>
          <LuMessageSquare />
        </IconBox>
      </Badge>
    </div>
  ),
};
