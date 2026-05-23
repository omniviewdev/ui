import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  LuBox,
  LuNetwork,
  LuCog,
  LuServer,
  LuContainer,
  LuFileCode,
  LuFileText,
  LuFile,
} from 'react-icons/lu';
import { NavList } from './NavList';
import type { Key } from '../list';

const meta: Meta = {
  title: 'Lists/NavList',
  tags: ['autodocs'],
  args: {
    size: 'md',
    density: 'compact',
    selectionMode: 'single',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Controls the overall size of list items (font size, icon size, spacing).',
      table: { defaultValue: { summary: 'md' } },
    },
    density: {
      control: 'inline-radio',
      options: ['compact', 'default', 'comfortable'],
      description: 'Controls vertical density — how tightly items are packed.',
      table: { defaultValue: { summary: 'compact' } },
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

export const ExplorerSidebar: Story = {
  render: (args) => (
    <NavList {...args} defaultSelectedKeys={['deployment-api']} style={{ width: 260 }}>
      <NavList.Viewport>
        <NavList.Group collapsible>
          <NavList.GroupHeader>Workloads</NavList.GroupHeader>
          <NavList.GroupItems>
            <NavList.Item itemKey="deployment-api" textValue="api-server">
              <NavList.ItemIcon>
                <LuContainer />
              </NavList.ItemIcon>
              <NavList.ItemLabel>api-server</NavList.ItemLabel>
              <NavList.ItemMeta>3/3</NavList.ItemMeta>
            </NavList.Item>
            <NavList.Item itemKey="deployment-web" textValue="web-frontend">
              <NavList.ItemIcon>
                <LuContainer />
              </NavList.ItemIcon>
              <NavList.ItemLabel>web-frontend</NavList.ItemLabel>
              <NavList.ItemMeta>2/2</NavList.ItemMeta>
            </NavList.Item>
            <NavList.Item itemKey="deployment-worker" textValue="bg-worker">
              <NavList.ItemIcon>
                <LuContainer />
              </NavList.ItemIcon>
              <NavList.ItemLabel>bg-worker</NavList.ItemLabel>
              <NavList.ItemMeta>1/1</NavList.ItemMeta>
            </NavList.Item>
          </NavList.GroupItems>
        </NavList.Group>
        <NavList.Group collapsible>
          <NavList.GroupHeader>Services</NavList.GroupHeader>
          <NavList.GroupItems>
            <NavList.Item itemKey="svc-api" textValue="api-service">
              <NavList.ItemIcon>
                <LuNetwork />
              </NavList.ItemIcon>
              <NavList.ItemLabel>api-service</NavList.ItemLabel>
            </NavList.Item>
            <NavList.Item itemKey="svc-web" textValue="web-service">
              <NavList.ItemIcon>
                <LuNetwork />
              </NavList.ItemIcon>
              <NavList.ItemLabel>web-service</NavList.ItemLabel>
            </NavList.Item>
          </NavList.GroupItems>
        </NavList.Group>
        <NavList.Group collapsible defaultExpanded={false}>
          <NavList.GroupHeader>Config</NavList.GroupHeader>
          <NavList.GroupItems>
            <NavList.Item itemKey="cm-env" textValue="env-config">
              <NavList.ItemIcon>
                <LuCog />
              </NavList.ItemIcon>
              <NavList.ItemLabel>env-config</NavList.ItemLabel>
            </NavList.Item>
            <NavList.Item itemKey="secret-db" textValue="db-credentials">
              <NavList.ItemIcon>
                <LuCog />
              </NavList.ItemIcon>
              <NavList.ItemLabel>db-credentials</NavList.ItemLabel>
            </NavList.Item>
          </NavList.GroupItems>
        </NavList.Group>
      </NavList.Viewport>
    </NavList>
  ),
};

// ---------------------------------------------------------------------------

export const WithIndicators: Story = {
  parameters: {
    docs: {
      source: {
        code: `<NavList selectionMode="single" style={{ width: 260 }}>
  <NavList.Viewport>
    <NavList.Item itemKey="file1" textValue="index.ts" unread>
      <NavList.ItemIcon><LuFileCode /></NavList.ItemIcon>
      <NavList.ItemLabel>index.ts</NavList.ItemLabel>
    </NavList.Item>
    <NavList.Item itemKey="file2" textValue="utils.ts" dirty>
      <NavList.ItemIcon><LuFileCode /></NavList.ItemIcon>
      <NavList.ItemLabel>utils.ts</NavList.ItemLabel>
    </NavList.Item>
    <NavList.Item itemKey="file3" textValue="App.tsx" unread dirty>
      <NavList.ItemIcon><LuFileCode /></NavList.ItemIcon>
      <NavList.ItemLabel>App.tsx</NavList.ItemLabel>
    </NavList.Item>
  </NavList.Viewport>
</NavList>`,
      },
    },
  },
  render: () => (
    <NavList selectionMode="single" style={{ width: 260 }}>
      <NavList.Viewport>
        <NavList.Item itemKey="file1" textValue="index.ts" unread>
          <NavList.ItemIcon>
            <LuFileCode />
          </NavList.ItemIcon>
          <NavList.ItemLabel>index.ts</NavList.ItemLabel>
        </NavList.Item>
        <NavList.Item itemKey="file2" textValue="utils.ts" dirty>
          <NavList.ItemIcon>
            <LuFileCode />
          </NavList.ItemIcon>
          <NavList.ItemLabel>utils.ts</NavList.ItemLabel>
        </NavList.Item>
        <NavList.Item itemKey="file3" textValue="types.ts">
          <NavList.ItemIcon>
            <LuFileCode />
          </NavList.ItemIcon>
          <NavList.ItemLabel>types.ts</NavList.ItemLabel>
        </NavList.Item>
        <NavList.Item itemKey="file4" textValue="App.tsx" unread dirty>
          <NavList.ItemIcon>
            <LuFileCode />
          </NavList.ItemIcon>
          <NavList.ItemLabel>App.tsx</NavList.ItemLabel>
        </NavList.Item>
        <NavList.Item itemKey="file5" textValue="README.md">
          <NavList.ItemIcon>
            <LuFileText />
          </NavList.ItemIcon>
          <NavList.ItemLabel>README.md</NavList.ItemLabel>
        </NavList.Item>
      </NavList.Viewport>
    </NavList>
  ),
};

// ---------------------------------------------------------------------------

function CollapsibleControlledStory() {
  const [workloadsExpanded, setWorkloadsExpanded] = useState(true);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  return (
    <div>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setWorkloadsExpanded((v) => !v)}>
          Toggle Workloads
        </button>
        <button type="button" onClick={() => setServicesExpanded((v) => !v)}>
          Toggle Services
        </button>
      </div>
      <NavList selectionMode="single" style={{ width: 260 }}>
        <NavList.Viewport>
          <NavList.Group
            collapsible
            expanded={workloadsExpanded}
            onExpandedChange={setWorkloadsExpanded}
          >
            <NavList.GroupHeader>Workloads</NavList.GroupHeader>
            <NavList.GroupItems>
              <NavList.Item itemKey="pod1" textValue="nginx-pod">
                <NavList.ItemIcon>
                  <LuBox />
                </NavList.ItemIcon>
                <NavList.ItemLabel>nginx-pod</NavList.ItemLabel>
              </NavList.Item>
              <NavList.Item itemKey="pod2" textValue="redis-pod">
                <NavList.ItemIcon>
                  <LuBox />
                </NavList.ItemIcon>
                <NavList.ItemLabel>redis-pod</NavList.ItemLabel>
              </NavList.Item>
            </NavList.GroupItems>
          </NavList.Group>
          <NavList.Group
            collapsible
            expanded={servicesExpanded}
            onExpandedChange={setServicesExpanded}
          >
            <NavList.GroupHeader>Services</NavList.GroupHeader>
            <NavList.GroupItems>
              <NavList.Item itemKey="svc1" textValue="api-svc">
                <NavList.ItemIcon>
                  <LuServer />
                </NavList.ItemIcon>
                <NavList.ItemLabel>api-svc</NavList.ItemLabel>
              </NavList.Item>
            </NavList.GroupItems>
          </NavList.Group>
        </NavList.Viewport>
      </NavList>
    </div>
  );
}

export const CollapsibleGroupsControlled: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [workloadsExpanded, setWorkloadsExpanded] = useState(true);
const [servicesExpanded, setServicesExpanded] = useState(false);

<NavList selectionMode="single" style={{ width: 260 }}>
  <NavList.Viewport>
    <NavList.Group
      collapsible
      expanded={workloadsExpanded}
      onExpandedChange={setWorkloadsExpanded}
    >
      <NavList.GroupHeader>Workloads</NavList.GroupHeader>
      <NavList.GroupItems>
        <NavList.Item itemKey="pod1" textValue="nginx-pod">
          <NavList.ItemIcon><LuBox /></NavList.ItemIcon>
          <NavList.ItemLabel>nginx-pod</NavList.ItemLabel>
        </NavList.Item>
      </NavList.GroupItems>
    </NavList.Group>
  </NavList.Viewport>
</NavList>`,
      },
    },
  },
  render: () => <CollapsibleControlledStory />,
};

// ---------------------------------------------------------------------------

function OpenFilesStory() {
  const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set(['main.go']));
  const files = [
    { id: 'main.go', label: 'main.go', dirty: true, icon: LuFileCode },
    { id: 'handler.go', label: 'handler.go', dirty: false, icon: LuFileCode },
    { id: 'config.yaml', label: 'config.yaml', dirty: true, icon: LuFile },
    { id: 'Dockerfile', label: 'Dockerfile', dirty: false, icon: LuFile },
    { id: 'README.md', label: 'README.md', dirty: false, icon: LuFileText },
  ];
  return (
    <NavList
      selectionMode="single"
      selectedKeys={selected}
      onSelectedKeysChange={setSelected}
      style={{ width: 260 }}
    >
      <NavList.Viewport>
        {files.map((f) => (
          <NavList.Item key={f.id} itemKey={f.id} textValue={f.label} dirty={f.dirty}>
            <NavList.ItemIcon>
              <f.icon />
            </NavList.ItemIcon>
            <NavList.ItemLabel>{f.label}</NavList.ItemLabel>
          </NavList.Item>
        ))}
      </NavList.Viewport>
    </NavList>
  );
}

export const OpenFiles: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set(['main.go']));

<NavList
  selectionMode="single"
  selectedKeys={selected}
  onSelectedKeysChange={setSelected}
  style={{ width: 260 }}
>
  <NavList.Viewport>
    <NavList.Item itemKey="main.go" textValue="main.go" dirty>
      <NavList.ItemIcon><LuFileCode /></NavList.ItemIcon>
      <NavList.ItemLabel>main.go</NavList.ItemLabel>
    </NavList.Item>
    <NavList.Item itemKey="handler.go" textValue="handler.go">
      <NavList.ItemIcon><LuFileCode /></NavList.ItemIcon>
      <NavList.ItemLabel>handler.go</NavList.ItemLabel>
    </NavList.Item>
    <NavList.Item itemKey="config.yaml" textValue="config.yaml" dirty>
      <NavList.ItemIcon><LuFile /></NavList.ItemIcon>
      <NavList.ItemLabel>config.yaml</NavList.ItemLabel>
    </NavList.Item>
  </NavList.Viewport>
</NavList>`,
      },
    },
  },
  render: () => <OpenFilesStory />,
};
