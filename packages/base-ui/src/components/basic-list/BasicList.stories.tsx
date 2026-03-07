import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LuBox, LuNetwork, LuRocket, LuSettings, LuLock, LuGlobe, LuLayers, LuServer } from 'react-icons/lu';
import { BasicList } from './BasicList';

const meta: Meta = {
  title: 'Lists/BasicList',
  tags: ['autodocs'],
  args: {
    size: 'md',
    density: 'default',
    selectionMode: 'single',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Controls the overall size of list items (font size, icon size, spacing).',
      table: { defaultValue: { summary: 'md' } },
    },
    density: {
      control: 'inline-radio',
      options: ['compact', 'default', 'comfortable'],
      description: 'Controls vertical density — how tightly items are packed.',
      table: { defaultValue: { summary: 'default' } },
    },
    selectionMode: {
      control: 'inline-radio',
      options: ['none', 'single', 'multiple'],
      description: 'Whether items are selectable and how many can be selected at once.',
      table: { defaultValue: { summary: 'single' } },
    },
  },
  parameters: {
    controls: {
      include: ['size', 'density', 'selectionMode'],
    },
  },
};

export default meta;

type Story = StoryObj;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const ResourcePicker: Story = {
  render: (args) => (
    <BasicList {...args} defaultSelectedKeys={['pods']} style={{ width: 320 }}>
      <BasicList.Viewport>
        <BasicList.Item itemKey="pods" textValue="Pods">
          <BasicList.ItemIcon><LuBox /></BasicList.ItemIcon>
          <BasicList.ItemLabel>Pods</BasicList.ItemLabel>
          <BasicList.ItemBadge>12</BasicList.ItemBadge>
        </BasicList.Item>
        <BasicList.Item itemKey="services" textValue="Services">
          <BasicList.ItemIcon><LuNetwork /></BasicList.ItemIcon>
          <BasicList.ItemLabel>Services</BasicList.ItemLabel>
          <BasicList.ItemBadge>8</BasicList.ItemBadge>
        </BasicList.Item>
        <BasicList.Item itemKey="deployments" textValue="Deployments">
          <BasicList.ItemIcon><LuRocket /></BasicList.ItemIcon>
          <BasicList.ItemLabel>Deployments</BasicList.ItemLabel>
          <BasicList.ItemBadge>5</BasicList.ItemBadge>
        </BasicList.Item>
        <BasicList.Item itemKey="configmaps" textValue="ConfigMaps">
          <BasicList.ItemIcon><LuSettings /></BasicList.ItemIcon>
          <BasicList.ItemLabel>ConfigMaps</BasicList.ItemLabel>
          <BasicList.ItemBadge>23</BasicList.ItemBadge>
        </BasicList.Item>
        <BasicList.Item itemKey="secrets" textValue="Secrets">
          <BasicList.ItemIcon><LuLock /></BasicList.ItemIcon>
          <BasicList.ItemLabel>Secrets</BasicList.ItemLabel>
          <BasicList.ItemBadge>14</BasicList.ItemBadge>
        </BasicList.Item>
        <BasicList.Item itemKey="ingresses" textValue="Ingresses">
          <BasicList.ItemIcon><LuGlobe /></BasicList.ItemIcon>
          <BasicList.ItemLabel>Ingresses</BasicList.ItemLabel>
          <BasicList.ItemBadge>3</BasicList.ItemBadge>
        </BasicList.Item>
        <BasicList.Item itemKey="namespaces" textValue="Namespaces">
          <BasicList.ItemIcon><LuLayers /></BasicList.ItemIcon>
          <BasicList.ItemLabel>Namespaces</BasicList.ItemLabel>
          <BasicList.ItemBadge>4</BasicList.ItemBadge>
        </BasicList.Item>
        <BasicList.Item itemKey="nodes" textValue="Nodes">
          <BasicList.ItemIcon><LuServer /></BasicList.ItemIcon>
          <BasicList.ItemLabel>Nodes</BasicList.ItemLabel>
          <BasicList.ItemBadge>6</BasicList.ItemBadge>
        </BasicList.Item>
      </BasicList.Viewport>
    </BasicList>
  ),
};

// ---------------------------------------------------------------------------

const resources = [
  { id: 'pods', label: 'Pods', count: 12, description: 'Running workload instances' },
  { id: 'services', label: 'Services', count: 8, description: 'Network endpoints' },
  { id: 'deployments', label: 'Deployments', count: 5, description: 'Managed rollouts' },
  { id: 'configmaps', label: 'ConfigMaps', count: 23, description: 'Configuration data' },
  { id: 'secrets', label: 'Secrets', count: 14, description: 'Sensitive data' },
];

export const WithDescriptions: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BasicList selectionMode="single" style={{ width: 360 }}>
  <BasicList.Viewport>
    <BasicList.Item itemKey="pods" textValue="Pods">
      <BasicList.ItemIcon><LuBox /></BasicList.ItemIcon>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <BasicList.ItemLabel>Pods</BasicList.ItemLabel>
        <BasicList.ItemDescription>Running workload instances</BasicList.ItemDescription>
      </div>
      <BasicList.ItemBadge>12</BasicList.ItemBadge>
    </BasicList.Item>
  </BasicList.Viewport>
</BasicList>`,
      },
    },
  },
  render: () => (
    <BasicList selectionMode="single" style={{ width: 360 }}>
      <BasicList.Viewport>
        {resources.map((r) => (
          <BasicList.Item key={r.id} itemKey={r.id} textValue={r.label}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <BasicList.ItemLabel>{r.label}</BasicList.ItemLabel>
              <BasicList.ItemDescription>{r.description}</BasicList.ItemDescription>
            </div>
            <BasicList.ItemBadge>{r.count}</BasicList.ItemBadge>
          </BasicList.Item>
        ))}
      </BasicList.Viewport>
    </BasicList>
  ),
};

// ---------------------------------------------------------------------------

export const WithChevrons: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BasicList selectionMode="single" style={{ width: 320 }}>
  <BasicList.Viewport>
    <BasicList.Item itemKey="pods" textValue="Pods">
      <BasicList.ItemIcon><LuBox /></BasicList.ItemIcon>
      <BasicList.ItemLabel>Pods</BasicList.ItemLabel>
      <BasicList.ItemChevron />
    </BasicList.Item>
  </BasicList.Viewport>
</BasicList>`,
      },
    },
  },
  render: () => (
    <BasicList selectionMode="single" style={{ width: 320 }}>
      <BasicList.Viewport>
        <BasicList.Item itemKey="pods" textValue="Pods">
          <BasicList.ItemIcon><LuBox /></BasicList.ItemIcon>
          <BasicList.ItemLabel>Pods</BasicList.ItemLabel>
          <BasicList.ItemChevron />
        </BasicList.Item>
        <BasicList.Item itemKey="services" textValue="Services">
          <BasicList.ItemIcon><LuNetwork /></BasicList.ItemIcon>
          <BasicList.ItemLabel>Services</BasicList.ItemLabel>
          <BasicList.ItemChevron />
        </BasicList.Item>
        <BasicList.Item itemKey="deployments" textValue="Deployments">
          <BasicList.ItemIcon><LuRocket /></BasicList.ItemIcon>
          <BasicList.ItemLabel>Deployments</BasicList.ItemLabel>
          <BasicList.ItemChevron />
        </BasicList.Item>
        <BasicList.Item itemKey="configmaps" textValue="ConfigMaps">
          <BasicList.ItemIcon><LuSettings /></BasicList.ItemIcon>
          <BasicList.ItemLabel>ConfigMaps</BasicList.ItemLabel>
          <BasicList.ItemChevron />
        </BasicList.Item>
        <BasicList.Item itemKey="secrets" textValue="Secrets">
          <BasicList.ItemIcon><LuLock /></BasicList.ItemIcon>
          <BasicList.ItemLabel>Secrets</BasicList.ItemLabel>
          <BasicList.ItemChevron />
        </BasicList.Item>
      </BasicList.Viewport>
    </BasicList>
  ),
};

// ---------------------------------------------------------------------------

export const WithGroups: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BasicList selectionMode="single" style={{ width: 320 }}>
  <BasicList.Viewport>
    <BasicList.Group>
      <BasicList.GroupHeader>Workloads</BasicList.GroupHeader>
      <BasicList.Item itemKey="pods" textValue="Pods">
        <BasicList.ItemIcon><LuBox /></BasicList.ItemIcon>
        <BasicList.ItemLabel>Pods</BasicList.ItemLabel>
        <BasicList.ItemBadge>12</BasicList.ItemBadge>
      </BasicList.Item>
    </BasicList.Group>
    <BasicList.Separator />
    <BasicList.Group>
      <BasicList.GroupHeader>Configuration</BasicList.GroupHeader>
      <BasicList.Item itemKey="configmaps" textValue="ConfigMaps">
        <BasicList.ItemIcon><LuSettings /></BasicList.ItemIcon>
        <BasicList.ItemLabel>ConfigMaps</BasicList.ItemLabel>
        <BasicList.ItemBadge>23</BasicList.ItemBadge>
      </BasicList.Item>
    </BasicList.Group>
  </BasicList.Viewport>
</BasicList>`,
      },
    },
  },
  render: () => (
    <BasicList selectionMode="single" style={{ width: 320 }}>
      <BasicList.Viewport>
        <BasicList.Group>
          <BasicList.GroupHeader>Workloads</BasicList.GroupHeader>
          <BasicList.Item itemKey="pods" textValue="Pods">
            <BasicList.ItemIcon><LuBox /></BasicList.ItemIcon>
            <BasicList.ItemLabel>Pods</BasicList.ItemLabel>
            <BasicList.ItemBadge>12</BasicList.ItemBadge>
          </BasicList.Item>
          <BasicList.Item itemKey="deployments" textValue="Deployments">
            <BasicList.ItemIcon><LuRocket /></BasicList.ItemIcon>
            <BasicList.ItemLabel>Deployments</BasicList.ItemLabel>
            <BasicList.ItemBadge>5</BasicList.ItemBadge>
          </BasicList.Item>
        </BasicList.Group>
        <BasicList.Separator />
        <BasicList.Group>
          <BasicList.GroupHeader>Configuration</BasicList.GroupHeader>
          <BasicList.Item itemKey="configmaps" textValue="ConfigMaps">
            <BasicList.ItemIcon><LuSettings /></BasicList.ItemIcon>
            <BasicList.ItemLabel>ConfigMaps</BasicList.ItemLabel>
            <BasicList.ItemBadge>23</BasicList.ItemBadge>
          </BasicList.Item>
          <BasicList.Item itemKey="secrets" textValue="Secrets">
            <BasicList.ItemIcon><LuLock /></BasicList.ItemIcon>
            <BasicList.ItemLabel>Secrets</BasicList.ItemLabel>
            <BasicList.ItemBadge>14</BasicList.ItemBadge>
          </BasicList.Item>
        </BasicList.Group>
      </BasicList.Viewport>
    </BasicList>
  ),
};

// ---------------------------------------------------------------------------

function SearchResultsStory() {
  const [query, setQuery] = useState('');
  const allResources = [
    { id: 'pods', label: 'Pods', count: 12 },
    { id: 'services', label: 'Services', count: 8 },
    { id: 'deployments', label: 'Deployments', count: 5 },
    { id: 'configmaps', label: 'ConfigMaps', count: 23 },
    { id: 'secrets', label: 'Secrets', count: 14 },
    { id: 'ingresses', label: 'Ingresses', count: 3 },
    { id: 'namespaces', label: 'Namespaces', count: 4 },
    { id: 'nodes', label: 'Nodes', count: 6 },
  ];
  const filtered = allResources.filter((r) =>
    r.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div style={{ width: 320 }}>
      <input
        type="text"
        placeholder="Search resources..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 10px',
          marginBottom: 8,
          border: '1px solid var(--ov-color-border-muted)',
          borderRadius: 'var(--ov-radius-control)',
          background: 'var(--ov-color-bg-surface)',
          color: 'var(--ov-color-fg-default)',
          fontSize: 'var(--ov-font-size-body)',
          fontFamily: 'var(--ov-font-sans)',
          boxSizing: 'border-box',
        }}
      />
      <BasicList selectionMode="single">
        <BasicList.Viewport>
          {filtered.length === 0 ? (
            <BasicList.Empty>No matching resources</BasicList.Empty>
          ) : (
            filtered.map((r) => (
              <BasicList.Item key={r.id} itemKey={r.id} textValue={r.label}>
                <BasicList.ItemLabel>{r.label}</BasicList.ItemLabel>
                <BasicList.ItemBadge>{r.count}</BasicList.ItemBadge>
              </BasicList.Item>
            ))
          )}
        </BasicList.Viewport>
      </BasicList>
    </div>
  );
}

export const SearchResults: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [query, setQuery] = useState('');
const filtered = resources.filter((r) =>
  r.label.toLowerCase().includes(query.toLowerCase()),
);

<BasicList selectionMode="single">
  <BasicList.Viewport>
    {filtered.length === 0 ? (
      <BasicList.Empty>No matching resources</BasicList.Empty>
    ) : (
      filtered.map((r) => (
        <BasicList.Item key={r.id} itemKey={r.id} textValue={r.label}>
          <BasicList.ItemLabel>{r.label}</BasicList.ItemLabel>
          <BasicList.ItemBadge>{r.count}</BasicList.ItemBadge>
        </BasicList.Item>
      ))
    )}
  </BasicList.Viewport>
</BasicList>`,
      },
    },
  },
  render: () => <SearchResultsStory />,
};
