import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { LuChevronRight, LuFolder, LuFile, LuEllipsisVertical } from 'react-icons/lu';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import { Checkbox } from '../checkbox';
import { IconButton } from '../icon-button';
import styles from './DataTable.module.css';

// ---------------------------------------------------------------------------
// Homogeneous tree (same columns at every level)
// ---------------------------------------------------------------------------

interface FileEntry {
  id: string;
  name: string;
  type: 'file' | 'directory';
  size: string;
  modified: string;
  children?: FileEntry[];
}

const fileTree: FileEntry[] = [
  {
    id: '1',
    name: 'src',
    type: 'directory',
    size: '-',
    modified: '2h ago',
    children: [
      {
        id: '1-1',
        name: 'components',
        type: 'directory',
        size: '-',
        modified: '2h ago',
        children: [
          { id: '1-1-1', name: 'DataTable.tsx', type: 'file', size: '8.2 KB', modified: '1h ago' },
          { id: '1-1-2', name: 'DataTable.module.css', type: 'file', size: '4.1 KB', modified: '2h ago' },
        ],
      },
      { id: '1-2', name: 'index.ts', type: 'file', size: '0.3 KB', modified: '3h ago' },
    ],
  },
  {
    id: '2',
    name: 'package.json',
    type: 'file',
    size: '1.2 KB',
    modified: '1d ago',
  },
  {
    id: '3',
    name: 'docs',
    type: 'directory',
    size: '-',
    modified: '5d ago',
    children: [
      { id: '3-1', name: 'README.md', type: 'file', size: '3.4 KB', modified: '5d ago' },
    ],
  },
];

const fileColumns: ColumnDef<FileEntry, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 280,
    cell: ({ row, getValue }) => (
      <div style={{ paddingLeft: `${row.depth * 24}px`, display: 'flex', alignItems: 'center', gap: 6 }}>
        {row.getCanExpand() ? (
          <button
            type="button"
            className={styles.ExpandToggle}
            data-ov-expanded={row.getIsExpanded() ? 'true' : 'false'}
            onClick={row.getToggleExpandedHandler()}
            aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
          >
            <LuChevronRight size={14} />
          </button>
        ) : (
          <span style={{ width: 20 }} />
        )}
        {row.original.type === 'directory' ? (
          <LuFolder size={14} style={{ color: 'var(--ov-color-fg-muted)', flexShrink: 0 }} />
        ) : (
          <LuFile size={14} style={{ color: 'var(--ov-color-fg-subtle)', flexShrink: 0 }} />
        )}
        <span>{getValue() as string}</span>
      </div>
    ),
  },
  { accessorKey: 'type', header: 'Type', size: 100 },
  { accessorKey: 'size', header: 'Size', size: 100 },
  { accessorKey: 'modified', header: 'Modified', size: 120 },
];

// ---------------------------------------------------------------------------
// Heterogeneous nested: Ingress -> Service -> Pod (K8s pattern)
// ---------------------------------------------------------------------------

interface Ingress {
  uid: string;
  name: string;
  host: string;
  paths: number;
  age: string;
}

interface Service {
  uid: string;
  name: string;
  port: number;
  protocol: string;
  clusterIP: string;
  age: string;
}

interface Pod {
  uid: string;
  name: string;
  status: string;
  restarts: number;
  node: string;
  age: string;
}

const ingressData: Ingress[] = [
  { uid: 'ing-1', name: 'api-ingress', host: 'api.example.com', paths: 3, age: '7d' },
  { uid: 'ing-2', name: 'web-ingress', host: 'www.example.com', paths: 2, age: '14d' },
];

const serviceData: Record<string, Service[]> = {
  'ing-1': [
    { uid: 'svc-1', name: 'api-server', port: 8080, protocol: 'TCP', clusterIP: '10.96.0.12', age: '7d' },
    { uid: 'svc-2', name: 'auth-server', port: 8081, protocol: 'TCP', clusterIP: '10.96.0.34', age: '5d' },
  ],
  'ing-2': [
    { uid: 'svc-3', name: 'web-frontend', port: 3000, protocol: 'TCP', clusterIP: '10.96.0.56', age: '14d' },
  ],
};

const podData: Record<string, Pod[]> = {
  'svc-1': [
    { uid: 'pod-1', name: 'api-server-abc12', status: 'Running', restarts: 0, node: 'node-1', age: '2d' },
    { uid: 'pod-2', name: 'api-server-def34', status: 'Running', restarts: 0, node: 'node-2', age: '2d' },
    { uid: 'pod-3', name: 'api-server-ghi56', status: 'Running', restarts: 1, node: 'node-1', age: '1d' },
  ],
  'svc-2': [
    { uid: 'pod-4', name: 'auth-server-jkl78', status: 'Running', restarts: 0, node: 'node-3', age: '5d' },
    { uid: 'pod-5', name: 'auth-server-mno90', status: 'CrashLoopBackOff', restarts: 12, node: 'node-2', age: '3d' },
  ],
  'svc-3': [
    { uid: 'pod-6', name: 'web-frontend-pqr12', status: 'Running', restarts: 0, node: 'node-1', age: '14d' },
    { uid: 'pod-7', name: 'web-frontend-stu34', status: 'Running', restarts: 0, node: 'node-3', age: '14d' },
    { uid: 'pod-8', name: 'web-frontend-vwx56', status: 'Pending', restarts: 0, node: 'node-2', age: '1h' },
    { uid: 'pod-9', name: 'web-frontend-yza78', status: 'Running', restarts: 0, node: 'node-1', age: '14d' },
  ],
};

// --- Ingress columns ---

const ingressColumns: ColumnDef<Ingress, unknown>[] = [
  {
    id: 'expand',
    header: '',
    size: 36,
    enableSorting: false,
    enableResizing: false,
    meta: { align: 'center' },
    cell: ({ row }) => (
      <button
        type="button"
        className={styles.ExpandToggle}
        data-ov-expanded={row.getIsExpanded() ? 'true' : 'false'}
        onClick={row.getToggleExpandedHandler()}
        aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
      >
        <LuChevronRight size={14} />
      </button>
    ),
  },
  { accessorKey: 'name', header: 'Ingress', size: 180 },
  { accessorKey: 'host', header: 'Host', size: 200 },
  { accessorKey: 'paths', header: 'Paths', size: 80 },
  { accessorKey: 'age', header: 'Age', size: 80 },
];

// --- Service columns ---

const serviceColumns: ColumnDef<Service, unknown>[] = [
  {
    id: 'expand',
    header: '',
    size: 36,
    enableSorting: false,
    enableResizing: false,
    meta: { align: 'center' },
    cell: ({ row }) => (
      <button
        type="button"
        className={styles.ExpandToggle}
        data-ov-expanded={row.getIsExpanded() ? 'true' : 'false'}
        onClick={row.getToggleExpandedHandler()}
        aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
      >
        <LuChevronRight size={14} />
      </button>
    ),
  },
  { accessorKey: 'name', header: 'Service', size: 160 },
  { accessorKey: 'port', header: 'Port', size: 80 },
  { accessorKey: 'protocol', header: 'Protocol', size: 80 },
  { accessorKey: 'clusterIP', header: 'Cluster IP', size: 120 },
  { accessorKey: 'age', header: 'Age', size: 60 },
];

// --- Pod columns (innermost, with select + actions) ---

const podColumns: ColumnDef<Pod, unknown>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onCheckedChange={() => table.toggleAllRowsSelected()}
        size="sm"
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={() => row.toggleSelected()}
        size="sm"
        aria-label={`Select row ${row.index + 1}`}
      />
    ),
    size: 40,
    enableSorting: false,
    enableResizing: false,
    meta: { align: 'center' },
  },
  { accessorKey: 'name', header: 'Pod', size: 200 },
  { accessorKey: 'status', header: 'Status', size: 140 },
  { accessorKey: 'restarts', header: 'Restarts', size: 80 },
  { accessorKey: 'node', header: 'Node', size: 100 },
  { accessorKey: 'age', header: 'Age', size: 60 },
  {
    id: 'actions',
    header: '',
    size: 36,
    enableSorting: false,
    enableResizing: false,
    meta: { align: 'center' },
    cell: () => (
      <IconButton dense variant="ghost" color="neutral" size="sm" aria-label="Pod actions">
        <LuEllipsisVertical />
      </IconButton>
    ),
  },
];

// --- Nested table components ---

function NestedPodTable({ serviceUid }: { serviceUid: string }) {
  const data = podData[serviceUid] ?? [];
  const table = useDataTable({
    data,
    columns: podColumns,
    features: { rowSelection: 'multi', sorting: true },
    getRowId: (row) => row.uid,
  });

  return (
    <DataTable.Root
      table={table}
      features={{ rowSelection: 'multi', sorting: true }}
      variant="ghost"
      size="sm"
      hoverable
      data-ov-depth="2"
    >
      <DataTable.Container>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

function NestedServiceTable({ ingressUid }: { ingressUid: string }) {
  const data = serviceData[ingressUid] ?? [];
  const table = useDataTable({
    data,
    columns: serviceColumns,
    features: { rowExpansion: true, sorting: true },
    getRowId: (row) => row.uid,
    getRowCanExpand: () => true,
  });

  return (
    <DataTable.Root
      table={table}
      features={{ rowExpansion: true, sorting: true }}
      variant="ghost"
      size="sm"
      hoverable
      data-ov-depth="1"
    >
      <DataTable.Container>
        <DataTable.Header />
        <DataTable.Body
          renderExpandedRow={(parentRow) => {
            const service = parentRow as Service;
            return <NestedPodTable serviceUid={service.uid} />;
          }}
        />
      </DataTable.Container>
    </DataTable.Root>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Components/DataTable/Nested',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Story components
// ---------------------------------------------------------------------------

function HomogeneousTreeStory() {
  const table = useDataTable({
    data: fileTree,
    columns: fileColumns,
    features: { rowExpansion: true },
    getRowId: (row) => row.id,
    getSubRows: (row) => row.children,
  });

  return (
    <DataTable.Root table={table} features={{ rowExpansion: true }} variant="soft" hoverable>
      <DataTable.Container height={400}>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

function IngressServicePodStory() {
  const table = useDataTable({
    data: ingressData,
    columns: ingressColumns,
    features: { rowExpansion: true, sorting: true },
    getRowId: (row) => row.uid,
    getRowCanExpand: () => true,
  });

  return (
    <DataTable.Root
      table={table}
      features={{ rowExpansion: true, sorting: true }}
      variant="soft"
      hoverable
    >
      <DataTable.Container height={500}>
        <DataTable.Header />
        <DataTable.Body
          renderExpandedRow={(parentRow) => {
            const ingress = parentRow as Ingress;
            return <NestedServiceTable ingressUid={ingress.uid} />;
          }}
        />
      </DataTable.Container>
    </DataTable.Root>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const HomogeneousTree: Story = {
  render: () => <HomogeneousTreeStory />,
};

export const IngressServicePod: Story = {
  render: () => <IngressServicePodStory />,
};
