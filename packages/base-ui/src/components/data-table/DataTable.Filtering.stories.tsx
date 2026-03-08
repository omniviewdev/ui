import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';

interface Service {
  id: string;
  name: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  clusterIP: string;
  ports: string;
  age: string;
}

const serviceData: Service[] = [
  {
    id: '1',
    name: 'kubernetes',
    type: 'ClusterIP',
    clusterIP: '10.96.0.1',
    ports: '443/TCP',
    age: '30d',
  },
  {
    id: '2',
    name: 'kube-dns',
    type: 'ClusterIP',
    clusterIP: '10.96.0.10',
    ports: '53/UDP,53/TCP',
    age: '30d',
  },
  {
    id: '3',
    name: 'api-gateway',
    type: 'LoadBalancer',
    clusterIP: '10.96.1.20',
    ports: '80/TCP,443/TCP',
    age: '7d',
  },
  {
    id: '4',
    name: 'frontend',
    type: 'NodePort',
    clusterIP: '10.96.2.15',
    ports: '3000:31234/TCP',
    age: '5d',
  },
  {
    id: '5',
    name: 'redis-master',
    type: 'ClusterIP',
    clusterIP: '10.96.3.44',
    ports: '6379/TCP',
    age: '12d',
  },
  {
    id: '6',
    name: 'postgres',
    type: 'ClusterIP',
    clusterIP: '10.96.4.55',
    ports: '5432/TCP',
    age: '12d',
  },
  {
    id: '7',
    name: 'metrics-server',
    type: 'ClusterIP',
    clusterIP: '10.96.5.66',
    ports: '443/TCP',
    age: '20d',
  },
  {
    id: '8',
    name: 'ingress-nginx',
    type: 'LoadBalancer',
    clusterIP: '10.96.6.77',
    ports: '80/TCP,443/TCP',
    age: '15d',
  },
];

const serviceColumns: ColumnDef<Service, unknown>[] = [
  { accessorKey: 'name', header: 'Name', size: 160 },
  { accessorKey: 'type', header: 'Type', size: 120 },
  { accessorKey: 'clusterIP', header: 'Cluster IP', size: 140 },
  { accessorKey: 'ports', header: 'Ports', size: 180 },
  { accessorKey: 'age', header: 'Age', size: 80 },
];

const meta: Meta = {
  title: 'Components/DataTable/Filtering',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

function GlobalFilterStory() {
  const table = useDataTable({
    data: serviceData,
    columns: serviceColumns,
    features: { sorting: true, globalFilter: true, filtering: true, columnVisibility: true },
    getRowId: (row) => row.id,
  });

  return (
    <DataTable.Root
      table={table}
      features={{ sorting: true, globalFilter: true, filtering: true, columnVisibility: true }}
      variant="soft"
      hoverable
    >
      <DataTable.Toolbar searchPlaceholder="Filter services...">
        <DataTable.ColumnVisibility />
      </DataTable.Toolbar>
      <DataTable.Container height={400}>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

export const GlobalFilter: Story = {
  render: () => <GlobalFilterStory />,
};
