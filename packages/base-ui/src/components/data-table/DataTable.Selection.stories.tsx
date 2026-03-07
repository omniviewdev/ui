import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import { Checkbox } from '../checkbox';

interface Pod {
  uid: string;
  name: string;
  namespace: string;
  status: string;
  restarts: number;
  age: string;
}

const podData: Pod[] = Array.from({ length: 8 }, (_, i) => ({
  uid: `uid-${i}`,
  name: `api-server-${String(i).padStart(2, '0')}`,
  namespace: i % 3 === 0 ? 'kube-system' : i % 3 === 1 ? 'default' : 'production',
  status: ['Running', 'Pending', 'Running', 'CrashLoopBackOff'][i % 4]!,
  restarts: i % 4 === 3 ? i * 2 : 0,
  age: `${i + 1}d`,
}));

const podColumns: ColumnDef<Pod, unknown>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onCheckedChange={() => table.toggleAllRowsSelected()}
        size="sm"
        variant="soft"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={() => row.toggleSelected()}
        size="sm"
        variant="soft"
      />
    ),
    size: 36,
    enableSorting: false,
    enableResizing: false,
    meta: { align: 'center' },
  },
  { accessorKey: 'name', header: 'Name', size: 180 },
  { accessorKey: 'namespace', header: 'Namespace', size: 120 },
  { accessorKey: 'status', header: 'Status', size: 140 },
  { accessorKey: 'restarts', header: 'Restarts', size: 80 },
  { accessorKey: 'age', header: 'Age', size: 60 },
];

const meta: Meta = {
  title: 'Components/DataTable/Selection',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

function MultiSelectStory() {
  const table = useDataTable({
    data: podData,
    columns: podColumns,
    features: { rowSelection: 'multi', sorting: true },
    getRowId: (row) => row.uid,
  });

  return (
    <DataTable.Root
      table={table}
      features={{ rowSelection: 'multi', sorting: true }}
      variant="soft"
      hoverable
    >
      <DataTable.Container height={400}>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

function SingleSelectStory() {
  const table = useDataTable({
    data: podData,
    columns: podColumns.filter((c) => c.id !== 'select'),
    features: { rowSelection: 'single', sorting: true },
    getRowId: (row) => row.uid,
  });

  return (
    <DataTable.Root
      table={table}
      features={{ rowSelection: 'single', sorting: true }}
      variant="soft"
      hoverable
    >
      <DataTable.Container height={400}>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

export const MultiSelect: Story = {
  render: () => <MultiSelectStory />,
};

export const SingleSelect: Story = {
  render: () => <SingleSelectStory />,
};
