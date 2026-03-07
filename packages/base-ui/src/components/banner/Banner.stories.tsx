import type { Meta, StoryObj } from '@storybook/react';
import { LuInfo, LuCircleCheck, LuTriangleAlert, LuCircleX, LuSparkles, LuBell } from 'react-icons/lu';
import { Banner } from './Banner';

const colorIcons = {
  info: <LuInfo />,
  success: <LuCircleCheck />,
  warning: <LuTriangleAlert />,
  danger: <LuCircleX />,
  brand: <LuSparkles />,
  neutral: <LuBell />,
} as const;

const meta = {
  title: 'Surfaces/Banner',
  component: Banner,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'info',
    size: 'md',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => (
    <Banner {...args} style={{ maxWidth: 480 }}>
      <Banner.Icon><LuInfo /></Banner.Icon>
      <Banner.Content>
        <Banner.Title>Cluster update available</Banner.Title>
        A new version of the control plane is ready to deploy.
      </Banner.Content>
      <Banner.Close />
    </Banner>
  ),
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
      {(['success', 'warning', 'danger', 'info', 'brand', 'neutral'] as const).map((color) => (
        <Banner key={color} color={color} variant="soft">
          <Banner.Icon>{colorIcons[color]}</Banner.Icon>
          <Banner.Content>
            <Banner.Title style={{ textTransform: 'capitalize' }}>{color}</Banner.Title>
            This is a {color} banner message.
          </Banner.Content>
          <Banner.Close />
        </Banner>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
      {(['solid', 'soft', 'outline', 'ghost'] as const).map((variant) => (
        <Banner key={variant} color="danger" variant={variant}>
          <Banner.Icon><LuCircleX /></Banner.Icon>
          <Banner.Content>
            <Banner.Title style={{ textTransform: 'capitalize' }}>{variant}</Banner.Title>
            Connection to the cluster has been lost.
          </Banner.Content>
        </Banner>
      ))}
    </div>
  ),
};
