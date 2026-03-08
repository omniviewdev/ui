import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  LuBox,
  LuNetwork,
  LuRocket,
  LuSettings,
  LuLock,
  LuGlobe,
  LuLayers,
  LuServer,
  LuShield,
  LuPlug,
} from 'react-icons/lu';
import { SelectableList } from './SelectableList';
import type { Key } from '../list';

const meta: Meta = {
  title: 'Lists/SelectableList',
  tags: ['autodocs'],
  args: {
    density: 'default',
  },
  argTypes: {
    density: {
      control: 'inline-radio',
      options: ['compact', 'default', 'comfortable'],
      description: 'Controls vertical density.',
      table: { defaultValue: { summary: 'default' } },
    },
  },
  parameters: {
    controls: {
      include: ['density'],
    },
  },
};

export default meta;

type Story = StoryObj;

// ---------------------------------------------------------------------------
// 1. BasicCheckboxList
// ---------------------------------------------------------------------------

export const BasicCheckboxList: Story = {
  render: (args) => (
    <SelectableList
      selectionMode="multiple"
      {...args}
      style={{ width: 320 }}
    >
      <SelectableList.Viewport>
        <SelectableList.Item itemKey="pods" textValue="Pods">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuBox /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>Pods</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="services" textValue="Services">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuNetwork /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>Services</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="deployments" textValue="Deployments">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuRocket /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>Deployments</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="configmaps" textValue="ConfigMaps">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuSettings /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>ConfigMaps</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="secrets" textValue="Secrets">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuLock /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>Secrets</SelectableList.ItemLabel>
        </SelectableList.Item>
      </SelectableList.Viewport>
    </SelectableList>
  ),
};

// ---------------------------------------------------------------------------
// 2. SingleSelectRadio
// ---------------------------------------------------------------------------

export const SingleSelectRadio: Story = {
  render: (args) => (
    <SelectableList
      selectionMode="single"
      {...args}
      style={{ width: 320 }}
    >
      <SelectableList.Viewport>
        <SelectableList.Item itemKey="dev" textValue="Development">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemLabel>Development</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="staging" textValue="Staging">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemLabel>Staging</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="production" textValue="Production">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemLabel>Production</SelectableList.ItemLabel>
        </SelectableList.Item>
      </SelectableList.Viewport>
    </SelectableList>
  ),
};

// ---------------------------------------------------------------------------
// 3. GroupedWithSelectAll
// ---------------------------------------------------------------------------

export const GroupedWithSelectAll: Story = {
  render: (args) => (
    <SelectableList
      selectionMode="multiple"
      {...args}
      style={{ width: 360 }}
    >
      <SelectableList.SelectAll>Select all</SelectableList.SelectAll>
      <SelectableList.Viewport>
        <SelectableList.Group>
          <SelectableList.GroupSelectAll groupKeys={['pods', 'deployments']}>
            Workloads
          </SelectableList.GroupSelectAll>
          <SelectableList.Item itemKey="pods" textValue="Pods">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemIcon><LuBox /></SelectableList.ItemIcon>
            <SelectableList.ItemLabel>Pods</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="deployments" textValue="Deployments">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemIcon><LuRocket /></SelectableList.ItemIcon>
            <SelectableList.ItemLabel>Deployments</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Group>
        <SelectableList.Separator />
        <SelectableList.Group>
          <SelectableList.GroupSelectAll groupKeys={['configmaps', 'secrets']}>
            Configuration
          </SelectableList.GroupSelectAll>
          <SelectableList.Item itemKey="configmaps" textValue="ConfigMaps">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemIcon><LuSettings /></SelectableList.ItemIcon>
            <SelectableList.ItemLabel>ConfigMaps</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="secrets" textValue="Secrets">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemIcon><LuLock /></SelectableList.ItemIcon>
            <SelectableList.ItemLabel>Secrets</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Group>
      </SelectableList.Viewport>
    </SelectableList>
  ),
};

// ---------------------------------------------------------------------------
// 4. DisabledItems
// ---------------------------------------------------------------------------

export const DisabledItems: Story = {
  render: (args) => (
    <SelectableList
      selectionMode="multiple"
      disabledKeys={['secrets', 'nodes']}
      {...args}
      style={{ width: 320 }}
    >
      <SelectableList.Viewport>
        <SelectableList.Item itemKey="pods" textValue="Pods">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuBox /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>Pods</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="services" textValue="Services">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuNetwork /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>Services</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="secrets" textValue="Secrets">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuLock /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>Secrets (disabled)</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="nodes" textValue="Nodes">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuServer /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>Nodes (disabled)</SelectableList.ItemLabel>
        </SelectableList.Item>
      </SelectableList.Viewport>
    </SelectableList>
  ),
};

// ---------------------------------------------------------------------------
// 5. ControlledSelection
// ---------------------------------------------------------------------------

function ControlledSelectionStory() {
  const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set(['pods']));

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <SelectableList
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        style={{ width: 320 }}
      >
        <SelectableList.Viewport>
          <SelectableList.Item itemKey="pods" textValue="Pods">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemIcon><LuBox /></SelectableList.ItemIcon>
            <SelectableList.ItemLabel>Pods</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="services" textValue="Services">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemIcon><LuNetwork /></SelectableList.ItemIcon>
            <SelectableList.ItemLabel>Services</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="deployments" textValue="Deployments">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemIcon><LuRocket /></SelectableList.ItemIcon>
            <SelectableList.ItemLabel>Deployments</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Viewport>
      </SelectableList>
      <div style={{ fontSize: 13, color: 'var(--ov-color-fg-subtle)' }}>
        <strong>Selected:</strong>
        <pre>{JSON.stringify([...selected], null, 2)}</pre>
      </div>
    </div>
  );
}

export const ControlledSelection: Story = {
  render: () => <ControlledSelectionStory />,
};

// ---------------------------------------------------------------------------
// 6. DensityVariants
// ---------------------------------------------------------------------------

function DensityDemo({ density }: { density: 'compact' | 'default' | 'comfortable' }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--ov-color-fg-muted)' }}>
        {density}
      </div>
      <SelectableList
        selectionMode="multiple"
        density={density}
        style={{ width: 280 }}
      >
        <SelectableList.Viewport>
          <SelectableList.Item itemKey="a" textValue="Alpha">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>Alpha</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="b" textValue="Bravo">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>Bravo</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="c" textValue="Charlie">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>Charlie</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Viewport>
      </SelectableList>
    </div>
  );
}

export const DensityVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <DensityDemo density="compact" />
      <DensityDemo density="default" />
      <DensityDemo density="comfortable" />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 7. WithDescription
// ---------------------------------------------------------------------------

export const WithDescription: Story = {
  render: (args) => (
    <SelectableList
      selectionMode="multiple"
      {...args}
      style={{ width: 400 }}
    >
      <SelectableList.Viewport>
        <SelectableList.Item itemKey="read" textValue="Read">
          <SelectableList.ItemIndicator />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <SelectableList.ItemLabel>Read</SelectableList.ItemLabel>
            <SelectableList.ItemDescription>View resources and their details</SelectableList.ItemDescription>
          </div>
        </SelectableList.Item>
        <SelectableList.Item itemKey="write" textValue="Write">
          <SelectableList.ItemIndicator />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <SelectableList.ItemLabel>Write</SelectableList.ItemLabel>
            <SelectableList.ItemDescription>Create and update resources</SelectableList.ItemDescription>
          </div>
        </SelectableList.Item>
        <SelectableList.Item itemKey="delete" textValue="Delete">
          <SelectableList.ItemIndicator />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <SelectableList.ItemLabel>Delete</SelectableList.ItemLabel>
            <SelectableList.ItemDescription>Remove resources permanently</SelectableList.ItemDescription>
          </div>
        </SelectableList.Item>
        <SelectableList.Item itemKey="admin" textValue="Admin">
          <SelectableList.ItemIndicator />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <SelectableList.ItemLabel>Admin</SelectableList.ItemLabel>
            <SelectableList.ItemDescription>Full cluster administration access</SelectableList.ItemDescription>
          </div>
        </SelectableList.Item>
      </SelectableList.Viewport>
    </SelectableList>
  ),
};

// ---------------------------------------------------------------------------
// 8. SelectionSummary
// ---------------------------------------------------------------------------

export const WithSelectionSummary: Story = {
  render: (args) => (
    <SelectableList
      selectionMode="multiple"
      {...args}
      style={{ width: 320 }}
    >
      <SelectableList.SelectAll>Select all plugins</SelectableList.SelectAll>
      <SelectableList.Viewport>
        <SelectableList.Item itemKey="helm" textValue="Helm">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuPlug /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>Helm</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="kustomize" textValue="Kustomize">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuLayers /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>Kustomize</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="istio" textValue="Istio">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuGlobe /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>Istio</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="opa" textValue="OPA">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemIcon><LuShield /></SelectableList.ItemIcon>
          <SelectableList.ItemLabel>OPA</SelectableList.ItemLabel>
        </SelectableList.Item>
      </SelectableList.Viewport>
      <SelectableList.SelectionSummary />
    </SelectableList>
  ),
};

// ---------------------------------------------------------------------------
// 9. LargeVirtualized (placeholder — virtualized not yet integrated)
// ---------------------------------------------------------------------------

function LargeListStory(args: Record<string, unknown>) {
  const items = useMemo(
    () =>
      Array.from({ length: 200 }, (_, i) => ({
        id: `item-${i}`,
        label: `Resource ${i + 1}`,
      })),
    [],
  );

  return (
    <SelectableList
      selectionMode="multiple"
      {...args}
      style={{ width: 320 }}
    >
      <SelectableList.SelectAll>Select all</SelectableList.SelectAll>
      <SelectableList.Viewport style={{ maxHeight: 400 }}>
        {items.map((item) => (
          <SelectableList.Item key={item.id} itemKey={item.id} textValue={item.label}>
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>{item.label}</SelectableList.ItemLabel>
          </SelectableList.Item>
        ))}
      </SelectableList.Viewport>
      <SelectableList.SelectionSummary />
    </SelectableList>
  );
}

export const LargeList: Story = {
  render: (args) => <LargeListStory {...args} />,
};
