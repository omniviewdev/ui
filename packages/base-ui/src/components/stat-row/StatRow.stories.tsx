import type { Meta, StoryObj } from '@storybook/react';
import {
  LuZap,
  LuClock,
  LuGauge,
  LuHardDrive,
  LuWifi,
  LuCpu,
  LuMemoryStick,
  LuThermometer,
  LuActivity,
  LuDownload,
  LuUpload,
  LuCircleCheck,
  LuCircleX,
} from 'react-icons/lu';
import { StatRow, type StatRowProps } from './StatRow';

const meta = {
  title: 'Data Display/StatRow',
  component: StatRow,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    separator: { control: 'text' },
  },
} satisfies Meta<StatRowProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <StatRow {...args}>
      <StatRow.Item icon={<LuZap />}>26.51 tok/sec</StatRow.Item>
      <StatRow.Item icon={<LuGauge />}>2,447 tokens</StatRow.Item>
      <StatRow.Item icon={<LuClock />}>0.70s</StatRow.Item>
      <StatRow.Item>Stop: EOS Token Found</StatRow.Item>
    </StatRow>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <StatRow size="sm">
        <StatRow.Item icon={<LuZap />}>95.20 tok/sec</StatRow.Item>
        <StatRow.Item icon={<LuGauge />}>512 tokens</StatRow.Item>
        <StatRow.Item icon={<LuClock />}>0.12s</StatRow.Item>
      </StatRow>
      <StatRow size="md">
        <StatRow.Item icon={<LuZap />}>95.20 tok/sec</StatRow.Item>
        <StatRow.Item icon={<LuGauge />}>512 tokens</StatRow.Item>
        <StatRow.Item icon={<LuClock />}>0.12s</StatRow.Item>
      </StatRow>
      <StatRow size="lg">
        <StatRow.Item icon={<LuZap />}>95.20 tok/sec</StatRow.Item>
        <StatRow.Item icon={<LuGauge />}>512 tokens</StatRow.Item>
        <StatRow.Item icon={<LuClock />}>0.12s</StatRow.Item>
      </StatRow>
    </div>
  ),
};

export const WithColors: Story = {
  name: 'Color Variants',
  render: () => (
    <StatRow size="md">
      <StatRow.Item icon={<LuCircleCheck />} color="success">Healthy</StatRow.Item>
      <StatRow.Item icon={<LuCpu />}>4 cores</StatRow.Item>
      <StatRow.Item icon={<LuThermometer />} color="warning">78°C</StatRow.Item>
      <StatRow.Item icon={<LuCircleX />} color="danger">2 errors</StatRow.Item>
    </StatRow>
  ),
};

export const SystemMetrics: Story = {
  name: 'System Metrics',
  render: () => (
    <StatRow size="sm">
      <StatRow.Item icon={<LuCpu />}>CPU 42%</StatRow.Item>
      <StatRow.Item icon={<LuMemoryStick />}>RAM 6.2 GB</StatRow.Item>
      <StatRow.Item icon={<LuHardDrive />}>Disk 128 GB free</StatRow.Item>
      <StatRow.Item icon={<LuWifi />}>Ping 12ms</StatRow.Item>
    </StatRow>
  ),
};

export const NetworkStats: Story = {
  name: 'Network Stats',
  render: () => (
    <StatRow size="sm">
      <StatRow.Item icon={<LuDownload />}>12.4 MB/s</StatRow.Item>
      <StatRow.Item icon={<LuUpload />}>3.2 MB/s</StatRow.Item>
      <StatRow.Item icon={<LuActivity />}>240 req/s</StatRow.Item>
      <StatRow.Item>Latency: 42ms</StatRow.Item>
    </StatRow>
  ),
};

export const CustomSeparator: Story = {
  name: 'Custom Separator',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <StatRow separator="|">
        <StatRow.Item>CPU 42%</StatRow.Item>
        <StatRow.Item>RAM 6.2 GB</StatRow.Item>
        <StatRow.Item>Disk 128 GB</StatRow.Item>
      </StatRow>
      <StatRow separator="/">
        <StatRow.Item>1,250 in</StatRow.Item>
        <StatRow.Item>1,950 out</StatRow.Item>
        <StatRow.Item>3,200 total</StatRow.Item>
      </StatRow>
      <StatRow separator={null}>
        <StatRow.Item icon={<LuZap />}>95.20 tok/sec</StatRow.Item>
        <StatRow.Item icon={<LuClock />}>0.12s</StatRow.Item>
      </StatRow>
    </div>
  ),
};

export const TextOnly: Story = {
  name: 'Text Only (No Icons)',
  render: () => (
    <StatRow size="sm">
      <StatRow.Item>1,250 input</StatRow.Item>
      <StatRow.Item>3,400 output</StatRow.Item>
      <StatRow.Item>4,650 tokens</StatRow.Item>
    </StatRow>
  ),
};

export const SingleItem: Story = {
  name: 'Single Item (No Dividers)',
  render: () => (
    <StatRow size="sm">
      <StatRow.Item icon={<LuClock />}>Last updated 2m ago</StatRow.Item>
    </StatRow>
  ),
};
