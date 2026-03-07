import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: string;
  created: string;
}

const containerData: Container[] = Array.from({ length: 10 }, (_, i) => ({
  id: `ctr-${String(i + 1).padStart(3, '0')}`,
  name: `my-app-${i + 1}`,
  image: ['nginx:1.25', 'node:20-alpine', 'postgres:16', 'redis:7', 'envoy:1.28'][i % 5]!,
  status: ['running', 'exited', 'running', 'running', 'paused'][i % 5]!,
  ports: ['80/tcp', '3000/tcp', '5432/tcp', '6379/tcp', '9901/tcp'][i % 5]!,
  created: `${i + 1}h ago`,
}));

const containerColumns: ColumnDef<Container, unknown>[] = [
  { accessorKey: 'id', header: 'Container ID', size: 120 },
  { accessorKey: 'name', header: 'Name', size: 140 },
  { accessorKey: 'image', header: 'Image', size: 180 },
  { accessorKey: 'status', header: 'Status', size: 100 },
  { accessorKey: 'ports', header: 'Ports', size: 100 },
  { accessorKey: 'created', header: 'Created', size: 100 },
];

const meta: Meta = {
  title: 'Components/DataTable/Resizing',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

function ColumnResizingStory() {
  const table = useDataTable({
    data: containerData,
    columns: containerColumns,
    features: { columnResizing: true, sorting: true },
    getRowId: (row) => row.id,
  });

  return (
    <DataTable.Root
      table={table}
      features={{ columnResizing: true, sorting: true }}
      variant="soft"
      size="sm"
      hoverable
    >
      <DataTable.Container height={400}>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

export const ColumnResizing: Story = {
  render: () => <ColumnResizingStory />,
};
