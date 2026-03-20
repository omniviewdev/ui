import type { Meta, StoryObj } from '@storybook/react';
import { Meter } from './Meter';

const meta = {
  title: 'Data Display/Meter',
  component: Meter,
  tags: ['autodocs'],
  args: {
    value: 65,
    min: 0,
    max: 100,
    size: 'md',
    'aria-label': 'Usage',
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    color: { control: 'select', options: [undefined, 'neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
  },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithLabel: Story = {
  name: 'With label',
  args: {
    value: 73,
    label: 'CPU: 73%',
  },
};

export const ColorZones: Story = {
  name: 'Automatic color zones',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 300 }}>
      <Meter value={20} low={25} high={75} optimum={50} label="Low (good zone)" aria-label="Low" />
      <Meter value={50} low={25} high={75} optimum={50} label="Medium (optimal)" aria-label="Med" />
      <Meter value={90} low={25} high={75} optimum={50} label="High (danger zone)" aria-label="High" />
    </div>
  ),
};

export const ExplicitColors: Story = {
  name: 'Explicit color overrides',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 300 }}>
      <Meter value={40} color="brand" label="Brand" aria-label="Brand" />
      <Meter value={60} color="success" label="Success" aria-label="Success" />
      <Meter value={80} color="warning" label="Warning" aria-label="Warning" />
      <Meter value={95} color="danger" label="Danger" aria-label="Danger" />
      <Meter value={50} color="info" label="Info" aria-label="Info" />
    </div>
  ),
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 300 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Meter key={size} value={65} size={size} color="brand" label={`size="${size}"`} aria-label={size} />
      ))}
    </div>
  ),
};

export const ResourceMetrics: Story = {
  name: 'K8s resource metrics',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 250 }}>
      <Meter value={42} low={30} high={80} optimum={50} label="CPU: 42%" size="sm" aria-label="CPU" />
      <Meter value={78} low={30} high={80} optimum={50} label="Memory: 78%" size="sm" aria-label="Memory" />
      <Meter value={91} low={30} high={80} optimum={50} label="Disk: 91%" size="sm" aria-label="Disk" />
    </div>
  ),
};
