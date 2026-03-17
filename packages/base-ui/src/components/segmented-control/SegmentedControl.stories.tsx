import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LuList, LuLayoutGrid, LuTable } from 'react-icons/lu';
import { SegmentedControl } from './SegmentedControl';

const meta = {
  title: 'Inputs/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    'aria-label': 'View mode',
    defaultValue: 'list',
    children: null,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <SegmentedControl {...args} defaultValue="list">
      <SegmentedControl.Item value="list">List</SegmentedControl.Item>
      <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
    </SegmentedControl>
  ),
};

export const WithIcons: Story = {
  name: 'With icons',
  render: (args) => (
    <SegmentedControl {...args} defaultValue="list">
      <SegmentedControl.Item value="list"><LuList /> List</SegmentedControl.Item>
      <SegmentedControl.Item value="grid"><LuLayoutGrid /> Grid</SegmentedControl.Item>
      <SegmentedControl.Item value="table"><LuTable /> Table</SegmentedControl.Item>
    </SegmentedControl>
  ),
};

export const Controlled: Story = {
  name: 'Controlled',
  render: (args) => {
    const [value, setValue] = useState('yaml');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <SegmentedControl {...args} value={value} onValueChange={setValue} aria-label="Format">
          <SegmentedControl.Item value="yaml">YAML</SegmentedControl.Item>
          <SegmentedControl.Item value="form">Form</SegmentedControl.Item>
        </SegmentedControl>
        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Selected: {value}</span>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: (args) => (
    <SegmentedControl {...args} defaultValue="a" disabled aria-label="Disabled">
      <SegmentedControl.Item value="a">Option A</SegmentedControl.Item>
      <SegmentedControl.Item value="b">Option B</SegmentedControl.Item>
    </SegmentedControl>
  ),
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
            size=&quot;{size}&quot;
          </div>
          <SegmentedControl defaultValue="a" size={size} aria-label={`Size ${size}`}>
            <SegmentedControl.Item value="a">Alpha</SegmentedControl.Item>
            <SegmentedControl.Item value="b">Beta</SegmentedControl.Item>
            <SegmentedControl.Item value="c">Gamma</SegmentedControl.Item>
          </SegmentedControl>
        </div>
      ))}
    </div>
  ),
};
