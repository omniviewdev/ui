import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { LuEllipsisVertical } from 'react-icons/lu';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import { Checkbox } from '../checkbox';
import { IconButton } from '../icon-button';

interface Pod {
  uid: string;
  name: string;
  namespace: string;
  node: string;
  status: string;
  restarts: number;
  cpu: string;
  memory: string;
  age: string;
}

const podData: Pod[] = Array.from({ length: 20 }, (_, i) => ({
  uid: `uid-${i}`,
  name: `api-server-${String(i).padStart(2, '0')}`,
  namespace: ['kube-system', 'default', 'production', 'staging', 'monitoring'][i % 5]!,
  node: `node-${(i % 4) + 1}`,
  status: ['Running', 'Pending', 'Running', 'CrashLoopBackOff', 'Running'][i % 5]!,
  restarts: i % 5 === 3 ? i * 2 : 0,
  cpu: `${((i * 73 + 17) % 500)}m`,
  memory: `${((i * 41 + 23) % 512)}Mi`,
  age: `${i + 1}d`,
}));

const meta: Meta = {
  title: 'Components/DataTable/Pinning',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

function PinnedLeftRightStory() {
  const columns: ColumnDef<Pod, unknown>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onCheckedChange={() => table.toggleAllRowsSelected()}
          size="sm"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={() => row.toggleSelected()}
          size="sm"
        />
      ),
      size: 40,
      enableSorting: false,
      enableResizing: false,
      meta: { align: 'center' },
    },
    { accessorKey: 'name', header: 'Name', size: 180 },
    { accessorKey: 'namespace', header: 'Namespace', size: 120 },
    { accessorKey: 'node', header: 'Node', size: 120 },
    { accessorKey: 'status', header: 'Status', size: 140 },
    { accessorKey: 'restarts', header: 'Restarts', size: 80 },
    { accessorKey: 'cpu', header: 'CPU', size: 80 },
    { accessorKey: 'memory', header: 'Memory', size: 100 },
    { accessorKey: 'age', header: 'Age', size: 60 },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <IconButton
          dense
          variant="ghost"
          color="neutral"
          size="sm"
          aria-label="Row actions"
        >
          <LuEllipsisVertical />
        </IconButton>
      ),
      size: 36,
      enableSorting: false,
      enableResizing: false,
      meta: { align: 'center' },
    },
  ];

  const table = useDataTable({
    data: podData,
    columns,
    features: {
      rowSelection: 'multi',
      sorting: true,
      columnResizing: true,
      columnPinning: true,
    },
    getRowId: (row) => row.uid,
    initialState: {
      columnPinning: {
        left: ['select'],
        right: ['actions'],
      },
    },
  });

  return (
    <DataTable.Root
      table={table}
      features={{
        rowSelection: 'multi',
        sorting: true,
        columnResizing: true,
        columnPinning: true,
      }}
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

function PinnedWithToolbarStory() {
  const columns: ColumnDef<Pod, unknown>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onCheckedChange={() => table.toggleAllRowsSelected()}
          size="sm"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={() => row.toggleSelected()}
          size="sm"
        />
      ),
      size: 40,
      enableSorting: false,
      enableResizing: false,
      enableHiding: false,
    },
    { accessorKey: 'name', header: 'Name', size: 180 },
    { accessorKey: 'namespace', header: 'Namespace', size: 120 },
    { accessorKey: 'node', header: 'Node', size: 120 },
    { accessorKey: 'status', header: 'Status', size: 140 },
    { accessorKey: 'restarts', header: 'Restarts', size: 80 },
    { accessorKey: 'cpu', header: 'CPU', size: 80 },
    { accessorKey: 'memory', header: 'Memory', size: 100 },
    { accessorKey: 'age', header: 'Age', size: 60 },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <IconButton
          dense
          variant="ghost"
          color="neutral"
          size="sm"
          aria-label="Row actions"
        >
          <LuEllipsisVertical />
        </IconButton>
      ),
      size: 40,
      enableSorting: false,
      enableResizing: false,
      enableHiding: false,
    },
  ];

  const table = useDataTable({
    data: podData,
    columns,
    features: {
      rowSelection: 'multi',
      sorting: true,
      columnResizing: true,
      columnPinning: true,
      globalFilter: true,
      columnVisibility: true,
    },
    getRowId: (row) => row.uid,
    initialState: {
      columnPinning: {
        left: ['select'],
        right: ['actions'],
      },
    },
  });

  return (
    <DataTable.Root
      table={table}
      features={{
        rowSelection: 'multi',
        sorting: true,
        columnResizing: true,
        columnPinning: true,
        globalFilter: true,
        columnVisibility: true,
      }}
      variant="soft"
      hoverable
    >
      <DataTable.Toolbar searchPlaceholder="Search pods...">
        <DataTable.ColumnVisibility />
      </DataTable.Toolbar>
      <DataTable.Container height={400}>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

export const PinnedLeftRight: Story = {
  render: () => <PinnedLeftRightStory />,
};

export const PinnedWithToolbar: Story = {
  render: () => <PinnedWithToolbarStory />,
};
