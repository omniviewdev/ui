import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar } from './FilterBar';

const meta = {
  title: 'Data Display/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  args: {
    size: 'md',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [filters, setFilters] = useState([
      'Namespace: default',
      'Status: Running',
      'Label: app=nginx',
    ]);

    const remove = (f: string) => setFilters((prev) => prev.filter((x) => x !== f));

    return (
      <FilterBar {...args}>
        {filters.map((f) => (
          <FilterBar.Chip key={f} onRemove={() => remove(f)}>
            {f}
          </FilterBar.Chip>
        ))}
        <FilterBar.Add />
        {filters.length > 0 && <FilterBar.Clear onClick={() => setFilters([])} />}
      </FilterBar>
    );
  },
};

export const KubernetesFilters: Story = {
  name: 'Kubernetes resource filters',
  render: (args) => {
    const allFilters = [
      { key: 'ns', label: 'Namespace: default' },
      { key: 'status', label: 'Status: Running' },
      { key: 'kind', label: 'Kind: Pod' },
      { key: 'label', label: 'Label: tier=frontend' },
      { key: 'node', label: 'Node: worker-03' },
    ];

    const [active, setActive] = useState(allFilters.map((f) => f.key));

    const remove = (key: string) => setActive((prev) => prev.filter((k) => k !== key));
    const add = () => {
      const available = allFilters.find((f) => !active.includes(f.key));
      if (available) setActive((prev) => [...prev, available.key]);
    };

    const activeFilters = allFilters.filter((f) => active.includes(f.key));
    const canAdd = active.length < allFilters.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FilterBar {...args}>
          {activeFilters.map((f) => (
            <FilterBar.Chip key={f.key} onRemove={() => remove(f.key)}>
              {f.label}
            </FilterBar.Chip>
          ))}
          {canAdd && <FilterBar.Add onClick={add} />}
          {active.length > 0 && <FilterBar.Clear onClick={() => setActive([])} />}
        </FilterBar>
        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
          {active.length} of {allFilters.length} filters active
        </span>
      </div>
    );
  },
};

export const ReadOnly: Story = {
  name: 'Read-only chips (no remove)',
  render: (args) => (
    <FilterBar {...args}>
      <FilterBar.Chip>Cluster: production</FilterBar.Chip>
      <FilterBar.Chip>Region: us-east-1</FilterBar.Chip>
    </FilterBar>
  ),
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
            size=&quot;{size}&quot;
          </div>
          <FilterBar size={size}>
            <FilterBar.Chip onRemove={() => {}}>Namespace: default</FilterBar.Chip>
            <FilterBar.Chip onRemove={() => {}}>Status: Running</FilterBar.Chip>
            <FilterBar.Add />
            <FilterBar.Clear onClick={() => {}} />
          </FilterBar>
        </div>
      ))}
    </div>
  ),
};
