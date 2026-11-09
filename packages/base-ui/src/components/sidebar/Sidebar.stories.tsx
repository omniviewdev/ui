import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  LuActivity,
  LuBlocks,
  LuBox,
  LuBoxes,
  LuCalendarClock,
  LuClipboard,
  LuDatabase,
  LuGauge,
  LuLayers,
  LuLock,
  LuNetwork,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuRocket,
  LuServer,
  LuShare2,
  LuTicket,
} from 'react-icons/lu';
import { SiHelm } from 'react-icons/si';
import { IconButton } from '../icon-button';
import { Spinner } from '../spinner';
import { StatusDot } from '../status-dot';
import { TreeList } from '../tree-list';
import type { Key } from '../tree-list/types';
import { Text } from '../typography';
import { useSidebarController, useSidebarTrigger } from './context';
import type { SidebarController } from './controller';
import { Sidebar } from './Sidebar';
import type { SidebarRootProps } from './types';

// ---------------------------------------------------------------------------
// Fixture: illustrative resource navigation with three levels.
// ---------------------------------------------------------------------------

type Status = 'error' | 'sync';

interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  status?: Status;
  /** A group that is also a destination. */
  selectable?: boolean;
  children?: NavItem[];
}

const leaf = (id: string, label: string, icon: ReactNode, status?: Status): NavItem => ({
  id,
  label,
  icon,
  status,
});

function apiGroup(index: number, name: string, resources: number): NavItem {
  return {
    id: `api-${index}`,
    label: name,
    children: Array.from({ length: resources }, (_, resource) =>
      leaf(`api-${index}-r${resource}`, `Resource ${resource + 1}`, <LuBlocks />),
    ),
  };
}

const API_GROUP_NAMES = [
  'gateway.networking.k8s.io',
  'monitoring.coreos.com',
  'snapshot.storage.k8s.io',
  'keda.sh',
  'external-secrets.io',
  'traefik.io',
  'velero.io',
  'karpenter.sh',
  'istio.io',
  'longhorn.io',
];

function createNavigation(extraGroups: number, resourcesPerGroup: number): NavItem[] {
  const apiGroups: NavItem[] = [
    {
      id: 'api-cert',
      label: 'cert-manager.io',
      children: [
        leaf('cert-1', 'Certificates', <LuBlocks />),
        leaf('cert-2', 'CertificateRequests', <LuBlocks />),
        leaf('cert-3', 'Issuers', <LuBlocks />),
        leaf('cert-4', 'ClusterIssuers', <LuBlocks />),
      ],
    },
    {
      id: 'api-argo',
      label: 'argoproj.io',
      children: [
        leaf('argo-1', 'Applications', <LuBlocks />),
        leaf('argo-2', 'AppProjects', <LuBlocks />),
        leaf('argo-3', 'ApplicationSets', <LuBlocks />),
      ],
    },
    ...Array.from({ length: extraGroups }, (_, index) =>
      apiGroup(
        index,
        API_GROUP_NAMES[index] ?? `group-${index + 1}.example.io`,
        index < API_GROUP_NAMES.length ? 3 : resourcesPerGroup,
      ),
    ),
  ];
  return [
    leaf('dashboard', 'Dashboard', <LuGauge />),
    leaf('nodes', 'Nodes', <LuServer />),
    leaf('events', 'Events', <LuActivity />, 'error'),
    leaf('namespaces', 'Namespaces', <LuLayers />),
    {
      id: 'workload',
      label: 'Workload',
      icon: <LuBoxes />,
      children: [
        leaf('pods', 'Pods', <LuBox />, 'sync'),
        leaf('deployments', 'Deployments', <LuRocket />),
        leaf('statefulsets', 'StatefulSets', <LuDatabase />),
        leaf('daemonsets', 'DaemonSets', <LuNetwork />),
        leaf('jobs', 'Jobs', <LuClipboard />),
        leaf('cronjobs', 'CronJobs', <LuCalendarClock />),
      ],
    },
    {
      id: 'config',
      label: 'Config',
      icon: <LuClipboard />,
      children: [
        leaf('configmaps', 'ConfigMaps', <LuClipboard />),
        leaf('secrets', 'Secrets', <LuLock />),
      ],
    },
    {
      id: 'networking',
      label: 'Networking',
      icon: <LuNetwork />,
      children: [
        leaf('services', 'Services', <LuShare2 />),
        leaf('ingresses', 'Ingresses', <LuNetwork />),
        leaf('networkpolicies', 'NetworkPolicies', <LuLock />),
      ],
    },
    {
      id: 'storage',
      label: 'Storage',
      icon: <LuDatabase />,
      children: [
        leaf('pvc', 'PersistentVolumeClaims', <LuDatabase />),
        leaf('pv', 'PersistentVolumes', <LuDatabase />),
      ],
    },
    {
      id: 'access',
      label: 'Access Control',
      icon: <LuLock />,
      children: [
        leaf('serviceaccounts', 'ServiceAccounts', <LuLock />),
        leaf('roles', 'Roles', <LuLock />),
      ],
    },
    {
      id: 'admission',
      label: 'Admission Control',
      icon: <LuTicket />,
      children: [
        leaf('validating', 'ValidatingWebhookConfigurations', <LuTicket />),
        leaf('mutating', 'MutatingWebhookConfigurations', <LuTicket />),
      ],
    },
    {
      id: 'helm',
      label: 'Helm',
      icon: <SiHelm />,
      selectable: true,
      children: [leaf('releases', 'Releases', <SiHelm />)],
    },
    // No icon: the rail falls back to the label's initial.
    { id: 'other', label: 'Other API Groups', children: apiGroups },
  ];
}

const itemKey = (item: NavItem): Key => item.id;
const getChildren = (item: NavItem) => item.children;
const getTextValue = (item: NavItem) => item.label;
const getIcon = (item: NavItem) => item.icon;
const isSelectable = (item: NavItem) => !item.children?.length || item.selectable === true;

const statusCache = new WeakMap<NavItem, Status | undefined>();

/** A group reports the worst status among its descendants. */
function statusOf(item: NavItem): Status | undefined {
  if (statusCache.has(item)) return statusCache.get(item);
  let status: Status | undefined = item.status;
  for (const child of item.children ?? []) {
    const childStatus = statusOf(child);
    if (childStatus === 'error') {
      status = 'error';
      break;
    }
    if (childStatus === 'sync') status = 'sync';
  }
  statusCache.set(item, status);
  return status;
}

/** Renders nothing while idle: the sidebar reserves no space for it. */
function StatusBadge({ status }: { status: Status | undefined }) {
  if (status === 'error') {
    return <StatusDot status="danger" size="xs" role="img" aria-label="Has errors" />;
  }
  if (status === 'sync') return <Spinner size="xs" color="brand" aria-label="Syncing" />;
  return null;
}

const getBadge = (item: NavItem) => <StatusBadge status={statusOf(item)} />;

function collectGroups(items: NavItem[], out: NavItem[] = []): NavItem[] {
  for (const item of items) {
    if (item.children?.length) {
      out.push(item);
      collectGroups(item.children, out);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Expanded presentation: the consumer's own TreeList, retained while collapsed.
// ---------------------------------------------------------------------------

function DemoTree({
  items,
  selected,
  onSelect,
}: {
  items: NavItem[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const groups = useMemo(() => collectGroups(items), [items]);
  const [expanded, setExpanded] = useState<ReadonlySet<Key>>(() => new Set<Key>(['workload']));
  const selectedKeys = useMemo(() => new Set<Key>([selected]), [selected]);

  const handleAction = (key: Key) => {
    const group = groups.find((item) => item.id === key);
    if (group) {
      setExpanded((previous) => {
        const next = new Set(previous);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      if (group.selectable) onSelect(group.id);
      return;
    }
    onSelect(String(key));
  };

  return (
    <TreeList.Root
      aria-label="Example destinations"
      items={items}
      itemKey={itemKey}
      getChildren={getChildren}
      getTextValue={getTextValue}
      isItemSelectable={isSelectable}
      selectedKeys={selectedKeys}
      expandedKeys={expanded}
      onExpandedKeysChange={setExpanded}
      onAction={handleAction}
      selectionMode="single"
      density="compact"
      indentation={14}
      indentGuide="rail"
      virtualized
      animateExpansion
      style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      renderItem={(item, node) => (
        <TreeList.Item
          itemKey={item.id}
          textValue={item.label}
          selectable={isSelectable(item)}
          aria-label={item.label}
        >
          <TreeList.ItemIndent
            depth={node.depth}
            ancestorIsLast={node.ancestorIsLast}
            isLastChild={node.isLastChild}
          />
          <TreeList.ItemToggle itemKey={item.id} />
          {item.icon ? <TreeList.ItemIcon>{item.icon}</TreeList.ItemIcon> : null}
          <TreeList.ItemLabel>{item.label}</TreeList.ItemLabel>
          <StatusBadge status={statusOf(item)} />
        </TreeList.Item>
      )}
    >
      <TreeList.Viewport
        style={{ flex: 1, minHeight: 0, overflow: 'auto', scrollbarWidth: 'none' }}
      />
    </TreeList.Root>
  );
}

// ---------------------------------------------------------------------------
// Page frame
// ---------------------------------------------------------------------------

const frameStyle = (height: number): CSSProperties => ({
  display: 'flex',
  blockSize: height,
  inlineSize: '100%',
  overflow: 'hidden',
  border: '1px solid var(--ov-color-border-default)',
  borderRadius: 'var(--ov-radius-surface)',
  background: 'var(--ov-color-bg-base)',
});

const contentStyle: CSSProperties = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  minInlineSize: 0,
  gap: 'var(--ov-space-stack-md)',
  padding: 'var(--ov-space-stack-md)',
};

const toolbarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ov-space-stack-sm)',
};

function Page({
  title,
  leading,
  children,
}: {
  title: string;
  leading?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <main style={contentStyle}>
      <div style={toolbarStyle}>
        {leading}
        <Text weight="semibold">{title}</Text>
      </div>
      {children}
    </main>
  );
}

interface NavigationDemoProps extends Omit<SidebarRootProps, 'onSelect'> {
  items: NavItem[];
  selected: string;
  onSelect: (id: string) => void;
  /** Built-in edge handle and footer toggle. A consumer-owned handle turns both off. */
  builtInControls?: boolean;
  header?: ReactNode;
}

function NavigationDemo({
  items,
  selected,
  onSelect,
  builtInControls = true,
  header,
  ...rootProps
}: NavigationDemoProps) {
  return (
    <Sidebar.Root aria-label="Example navigation" {...rootProps}>
      {header}
      <Sidebar.Content>
        <Sidebar.Navigation
          aria-label="Example destinations"
          items={items}
          itemKey={itemKey}
          getChildren={getChildren}
          getTextValue={getTextValue}
          getIcon={getIcon}
          getBadge={getBadge}
          isItemSelectable={isSelectable}
          selectedKey={selected}
          onAction={(key) => onSelect(String(key))}
        >
          <DemoTree items={items} selected={selected} onSelect={onSelect} />
        </Sidebar.Navigation>
      </Sidebar.Content>
      {builtInControls ? (
        <Sidebar.Footer>
          <Sidebar.Toggle />
        </Sidebar.Footer>
      ) : null}
      {builtInControls ? <Sidebar.Handle /> : null}
    </Sidebar.Root>
  );
}

let defaultCatalog: NavItem[] | undefined;
let largeCatalog: NavItem[] | undefined;
const getDefaultCatalog = () => (defaultCatalog ??= createNavigation(10, 3));
const getLargeCatalog = () => (largeCatalog ??= createNavigation(100, 100));

function Demo({
  height = 560,
  catalog,
  initialSelected = 'pods',
  header,
  ...rootProps
}: SidebarRootProps & {
  height?: number;
  catalog?: NavItem[];
  initialSelected?: string;
  header?: ReactNode;
}) {
  const items = useMemo(() => catalog ?? getDefaultCatalog(), [catalog]);
  const [selected, setSelected] = useState(initialSelected);
  return (
    <div style={frameStyle(height)}>
      <NavigationDemo
        key={rootProps.defaultMode}
        items={items}
        selected={selected}
        header={header}
        expandedWidth={260}
        {...rootProps}
        onSelect={setSelected}
      />
      <Page title={selected} />
    </div>
  );
}

const meta: Meta<typeof Sidebar.Root> = {
  title: 'Components/Sidebar',
  component: Sidebar.Root,
  tags: ['autodocs'],
  args: { shortcut: true },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Collapsible sidebar. `Sidebar.Root` reserves the sidebar width (not the whole layout). ' +
          'Header, identity and actions are optional caller content, not part of the navigation data. ' +
          'The examples use illustrative data; application actions and reordering belong to the ' +
          'owning view. Rail icons use shared tooltips and Menu flyouts. Built-in and custom ' +
          'triggers share state; motion uses the existing theme tokens.',
      },
    },
  },
  argTypes: {
    defaultMode: { control: 'inline-radio', options: ['expanded', 'rail'] },
    hoverPeek: { control: 'boolean' },
    shortcut: { control: 'boolean' },
  },
  render: (args) => <Demo {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Expanded with the built-in edge handle (hover the right border) and footer toggle. */
export const Expanded: Story = {};

/** Widths accept native CSS lengths and can be adjusted independently of the navigation data. */
export const RelativeWidth: Story = {
  args: { expandedWidth: '32vmin', railWidth: '3rem' },
  argTypes: {
    expandedWidth: { control: 'text' },
    railWidth: { control: 'text' },
  },
};

/** Rail mode: hover or focus rows for labels; groups open flyouts, including nested ones. */
export const Rail: Story = { args: { defaultMode: 'rail' } };

/** Header content belongs to the caller and is not required for collapsed navigation. */
export const CustomHeader: Story = {
  render: (args) => (
    <Demo
      {...args}
      aria-label="Example workspace"
      header={
        <Sidebar.Header>
          <LuLayers size={24} aria-hidden="true" />
          <Sidebar.Expanded>
            <Text weight="semibold" size="sm">
              Example workspace
            </Text>
          </Sidebar.Expanded>
        </Sidebar.Header>
      }
    />
  ),
};

/**
 * Three levels: Other API Groups contains API groups, which contain resources. Open the last
 * rail icon; groups expand in place and the flyout stays bounded and scrollable. The selection
 * (Certificates) keeps the rail icon accented and starts expanded inside the flyout.
 */
export const NestedFlyouts: Story = {
  args: { defaultMode: 'rail' },
  render: (args) => <Demo {...args} initialSelected="cert-1" />,
};

/** Hover the rail for 280ms: the panel overlays the page without reflowing it. Pin with the handle. */
export const HoverPeek: Story = { args: { defaultMode: 'rail', hoverPeek: true } };

function ToolbarToggle({ controller }: { controller: SidebarController }) {
  const trigger = useSidebarTrigger(controller);
  return (
    <IconButton {...trigger.props} variant="ghost" size="sm">
      {trigger.expanded ? <LuPanelLeftClose /> : <LuPanelLeftOpen />}
    </IconButton>
  );
}

function CustomHandleDemo(props: SidebarRootProps) {
  const controller = useSidebarController();
  const items = getDefaultCatalog();
  const [selected, setSelected] = useState('pods');
  return (
    <div style={frameStyle(560)}>
      <NavigationDemo
        items={items}
        selected={selected}
        expandedWidth={260}
        controller={controller}
        builtInControls={false}
        {...props}
        onSelect={setSelected}
      />
      <Page title={selected} leading={<ToolbarToggle controller={controller} />} />
    </div>
  );
}

/**
 * The toggle lives in the page toolbar, outside the sidebar subtree. A controller registers it:
 * pass the same controller to `Sidebar.Root` and to the trigger or hook.
 */
export const CustomHandle: Story = { render: (args) => <CustomHandleDemo {...args} /> };

/** Short window: only the navigation scrolls; the footer toggle stays reachable. */
export const ShortWindow: Story = {
  render: (args) => <Demo {...args} height={320} />,
};

/** About ten thousand resources. Closed flyouts render nothing; the tree stays virtualized. */
export const LargeCatalog: Story = {
  render: (args) => <Demo {...args} catalog={getLargeCatalog()} />,
};
