import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import type { DataTableRootProps } from './DataTable';
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

interface SelectionStoryArgs {
  variant: DataTableRootProps['variant'];
  color: DataTableRootProps['color'];
  size: DataTableRootProps['size'];
}

const podData: Pod[] = Array.from({ length: 8 }, (_, i) => ({
  uid: `uid-${i}`,
  name: `api-server-${String(i).padStart(2, '0')}`,
  namespace: i % 3 === 0 ? 'kube-system' : i % 3 === 1 ? 'default' : 'production',
  status: ['Running', 'Pending', 'Running', 'CrashLoopBackOff'][i % 4]!,
  restarts: i % 4 === 3 ? i * 2 : 0,
  age: `${i + 1}d`,
}));

const selectColumn: ColumnDef<Pod, unknown> = {
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
};

const baseColumns: ColumnDef<Pod, unknown>[] = [
  { accessorKey: 'name', header: 'Name', size: 180 },
  { accessorKey: 'namespace', header: 'Namespace', size: 120 },
  { accessorKey: 'status', header: 'Status', size: 140 },
  { accessorKey: 'restarts', header: 'Restarts', size: 80 },
  { accessorKey: 'age', header: 'Age', size: 60 },
];

const allColumns: ColumnDef<Pod, unknown>[] = [selectColumn, ...baseColumns];

const multiFeatures = { rowSelection: 'multi' as const, sorting: true };
const singleFeatures = { rowSelection: 'single' as const, sorting: true };

const meta: Meta<SelectionStoryArgs> = {
  title: 'Components/DataTable/Selection',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<SelectionStoryArgs>;

function MultiSelectStory({ variant, color, size }: SelectionStoryArgs) {
  const table = useDataTable({
    data: podData,
    columns: allColumns,
    features: multiFeatures,
    getRowId: (row) => row.uid,
  });

  return (
    <DataTable.Root
      table={table}
      features={multiFeatures}
      variant={variant}
      color={color}
      size={size}
      hoverable
    >
      <DataTable.Container height={400}>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

function SingleSelectStory({ variant, color, size }: SelectionStoryArgs) {
  const table = useDataTable({
    data: podData,
    columns: allColumns,
    features: singleFeatures,
    getRowId: (row) => row.uid,
  });

  return (
    <DataTable.Root
      table={table}
      features={singleFeatures}
      variant={variant}
      color={color}
      size={size}
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
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
  },
  render: (args) => <MultiSelectStory {...args} />,
};

export const SingleSelect: Story = {
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
  },
  render: (args) => <SingleSelectStory {...args} />,
};
