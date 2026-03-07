import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';

// ---------------------------------------------------------------------------
// K8s Pods
// ---------------------------------------------------------------------------

interface KubePod {
  uid: string;
  name: string;
  namespace: string;
  status: 'Running' | 'Pending' | 'Succeeded' | 'Failed' | 'CrashLoopBackOff';
  restarts: number;
  node: string;
  ageMinutes: number;
  cpuMilli: number;
  memoryMi: number;
}

const podData: KubePod[] = Array.from({ length: 40 }, (_, i) => ({
  uid: `pod-${i}`,
  name: `${['api', 'web', 'worker', 'scheduler', 'proxy'][i % 5]}-${String(i).padStart(3, '0')}`,
  namespace: ['default', 'kube-system', 'production', 'staging'][i % 4]!,
  status: (['Running', 'Pending', 'Succeeded', 'Failed', 'CrashLoopBackOff'] as const)[i % 5]!,
  restarts: i % 5 === 4 ? i : 0,
  node: `node-${(i % 3) + 1}`,
  ageMinutes: (Math.floor(i / 2) + 1) * 60,
  cpuMilli: (i * 73 + 17) % 500,
  memoryMi: (i * 41 + 23) % 256,
}));

const podColumns: ColumnDef<KubePod, unknown>[] = [
  { accessorKey: 'name', header: 'Name', size: 200 },
  { accessorKey: 'namespace', header: 'Namespace', size: 120 },
  { accessorKey: 'status', header: 'Status', size: 140 },
  { accessorKey: 'restarts', header: 'Restarts', size: 80 },
  { accessorKey: 'node', header: 'Node', size: 100 },
  {
    accessorKey: 'cpuMilli',
    header: 'CPU',
    size: 80,
    cell: (info) => `${info.getValue() as number}m`,
  },
  {
    accessorKey: 'memoryMi',
    header: 'Memory',
    size: 80,
    cell: (info) => `${info.getValue() as number}Mi`,
  },
  {
    accessorKey: 'ageMinutes',
    header: 'Age',
    size: 60,
    cell: (info) => {
      const mins = info.getValue() as number;
      return mins >= 60 ? `${Math.floor(mins / 60)}h` : `${mins}m`;
    },
  },
];

// ---------------------------------------------------------------------------
// EC2 Instances
// ---------------------------------------------------------------------------

interface EC2Instance {
  id: string;
  instanceId: string;
  type: string;
  state: 'running' | 'stopped' | 'terminated' | 'pending';
  az: string;
  publicIp: string;
  privateIp: string;
  launchDays: number;
}

const ec2Data: EC2Instance[] = Array.from({ length: 20 }, (_, i) => ({
  id: `i-${String(i).padStart(8, '0')}`,
  instanceId: `i-${(i * 2654435761 >>> 0).toString(16).padStart(8, '0')}`,
  type: ['t3.micro', 't3.small', 'm5.large', 'c5.xlarge', 'r5.2xlarge'][i % 5]!,
  state: (['running', 'stopped', 'terminated', 'pending'] as const)[i % 4]!,
  az: `us-east-1${String.fromCharCode(97 + (i % 3))}`,
  publicIp: `34.${200 + i}.${i}.${100 + i}`,
  privateIp: `10.0.${i}.${100 + i}`,
  launchDays: i + 1,
}));

const ec2Columns: ColumnDef<EC2Instance, unknown>[] = [
  { accessorKey: 'instanceId', header: 'Instance ID', size: 160 },
  { accessorKey: 'type', header: 'Type', size: 120 },
  { accessorKey: 'state', header: 'State', size: 100 },
  { accessorKey: 'az', header: 'AZ', size: 120 },
  { accessorKey: 'publicIp', header: 'Public IP', size: 140 },
  { accessorKey: 'privateIp', header: 'Private IP', size: 120 },
  {
    accessorKey: 'launchDays',
    header: 'Launch Time',
    size: 100,
    cell: (info) => `${info.getValue() as number}d ago`,
  },
];

// ---------------------------------------------------------------------------
// Docker Containers
// ---------------------------------------------------------------------------

interface DockerContainer {
  id: string;
  containerId: string;
  image: string;
  command: string;
  uptimeHours: number;
  ports: string;
  names: string;
}

const dockerData: DockerContainer[] = Array.from({ length: 15 }, (_, i) => ({
  id: `docker-${i}`,
  containerId: ((i * 2654435761 >>> 0).toString(16) + (i * 340573321 >>> 0).toString(16)).padStart(12, '0').slice(0, 12),
  image: ['nginx:latest', 'postgres:16', 'redis:7-alpine', 'node:20', 'traefik:v3'][i % 5]!,
  command: ['"nginx -g…"', '"docker-entrypoint…"', '"redis-server"', '"node server.js"', '"traefik --api…"'][i % 5]!,
  uptimeHours: i + 1,
  ports: ['0.0.0.0:80->80/tcp', '5432/tcp', '6379/tcp', '0.0.0.0:3000->3000/tcp', '0.0.0.0:8080->8080/tcp'][i % 5]!,
  names: `container-${i + 1}`,
}));

const dockerColumns: ColumnDef<DockerContainer, unknown>[] = [
  { accessorKey: 'containerId', header: 'Container ID', size: 140 },
  { accessorKey: 'image', header: 'Image', size: 160 },
  { accessorKey: 'command', header: 'Command', size: 180 },
  {
    accessorKey: 'uptimeHours',
    header: 'Status',
    size: 120,
    cell: (info) => `Up ${info.getValue() as number} hours`,
  },
  { accessorKey: 'ports', header: 'Ports', size: 200 },
  { accessorKey: 'names', header: 'Names', size: 120 },
];

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Components/DataTable/DevOps',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Shared feature configs
// ---------------------------------------------------------------------------

const podFeatures = { sorting: true, globalFilter: true, columnResizing: true, columnVisibility: true } as const;
const ec2Features = { sorting: true, globalFilter: true, columnResizing: true } as const;
const dockerFeatures = { sorting: true, globalFilter: true } as const;

// ---------------------------------------------------------------------------
// Story components
// ---------------------------------------------------------------------------

function KubernetesPodsStory() {
  const table = useDataTable({
    data: podData,
    columns: podColumns,
    features: podFeatures,
    getRowId: (row) => row.uid,
  });

  return (
    <DataTable.Root
      table={table}
      features={podFeatures}
      variant="soft"
      size="sm"
      hoverable
    >
      <DataTable.Toolbar searchPlaceholder="Search pods...">
        <DataTable.ColumnVisibility />
      </DataTable.Toolbar>
      <DataTable.Container height={500}>
        <DataTable.Header />
        <DataTable.VirtualBody estimateRowSize={30} />
      </DataTable.Container>
    </DataTable.Root>
  );
}

function EC2InstancesStory() {
  const table = useDataTable({
    data: ec2Data,
    columns: ec2Columns,
    features: ec2Features,
    getRowId: (row) => row.id,
  });

  return (
    <DataTable.Root
      table={table}
      features={ec2Features}
      variant="soft"
      color="brand"
      size="sm"
      hoverable
    >
      <DataTable.Toolbar searchPlaceholder="Search instances..." />
      <DataTable.Container height={500}>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

function DockerContainersStory() {
  const table = useDataTable({
    data: dockerData,
    columns: dockerColumns,
    features: dockerFeatures,
    getRowId: (row) => row.id,
  });

  return (
    <DataTable.Root
      table={table}
      features={dockerFeatures}
      variant="outline"
      size="sm"
      hoverable
    >
      <DataTable.Toolbar searchPlaceholder="Search containers..." />
      <DataTable.Container height={500}>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const KubernetesPods: Story = {
  render: () => <KubernetesPodsStory />,
};

export const EC2Instances: Story = {
  render: () => <EC2InstancesStory />,
};

export const DockerContainers: Story = {
  render: () => <DockerContainersStory />,
};
