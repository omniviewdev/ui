import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';

// ---------------------------------------------------------------------------
// Sample data types
// ---------------------------------------------------------------------------

interface Process {
  pid: string;
  name: string;
  cpu: number;
  memory: string;
  status: 'running' | 'sleeping' | 'stopped';
  uptime: string;
}

const processData: Process[] = Array.from({ length: 12 }, (_, i) => ({
  pid: `${1000 + i}`,
  name: ['nginx', 'node', 'postgres', 'redis', 'envoy', 'kubelet'][i % 6]!,
  cpu: Math.round(Math.random() * 100) / 10,
  memory: `${Math.round(Math.random() * 512)}Mi`,
  status: (['running', 'sleeping', 'stopped'] satisfies Process['status'][])[i % 3]!,
  uptime: `${Math.floor(Math.random() * 72)}h ${Math.floor(Math.random() * 60)}m`,
}));

const processColumns: ColumnDef<Process, unknown>[] = [
  { accessorKey: 'pid', header: 'PID', size: 80 },
  { accessorKey: 'name', header: 'Name', size: 140 },
  {
    accessorKey: 'cpu',
    header: 'CPU %',
    size: 80,
    cell: (info) => `${info.getValue()}%`,
  },
  { accessorKey: 'memory', header: 'Memory', size: 100 },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    cell: (info) => {
      const val = info.getValue() as string;
      return val.charAt(0).toUpperCase() + val.slice(1);
    },
  },
  { accessorKey: 'uptime', header: 'Uptime', size: 100 },
];

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Components/DataTable',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Playground: Story = {
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
  },
  render: (args) => {
    const table = useDataTable({
      data: processData,
      columns: processColumns,
      features: { sorting: true, globalFilter: true, columnVisibility: true },
      getRowId: (row) => row.pid,
    });

    return (
      <DataTable.Root table={table} features={{ sorting: true, globalFilter: true, columnVisibility: true }} {...args}>
        <DataTable.Toolbar searchPlaceholder="Search processes...">
          <DataTable.ColumnVisibility />
        </DataTable.Toolbar>
        <DataTable.Container height={400}>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => {
        const table = useDataTable({
          data: processData.slice(0, 4),
          columns: processColumns,
          getRowId: (row) => row.pid,
        });
        return (
          <div key={size}>
            <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--ov-color-fg-muted)' }}>
              size=&quot;{size}&quot;
            </div>
            <DataTable.Root table={table} size={size} variant="soft">
              <DataTable.Container>
                <DataTable.Header />
                <DataTable.Body />
              </DataTable.Container>
            </DataTable.Root>
          </div>
        );
      })}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['solid', 'soft', 'outline', 'ghost'] as const).map((variant) => {
        const table = useDataTable({
          data: processData.slice(0, 3),
          columns: processColumns,
          getRowId: (row) => row.pid,
        });
        return (
          <div key={variant}>
            <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--ov-color-fg-muted)' }}>
              variant=&quot;{variant}&quot;
            </div>
            <DataTable.Root table={table} variant={variant} color="brand">
              <DataTable.Container>
                <DataTable.Header />
                <DataTable.Body />
              </DataTable.Container>
            </DataTable.Root>
          </div>
        );
      })}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['neutral', 'brand', 'success', 'warning', 'danger'] as const).map((color) => {
        const table = useDataTable({
          data: processData.slice(0, 3),
          columns: processColumns,
          getRowId: (row) => row.pid,
        });
        return (
          <div key={color}>
            <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--ov-color-fg-muted)' }}>
              color=&quot;{color}&quot;
            </div>
            <DataTable.Root table={table} variant="soft" color={color}>
              <DataTable.Container>
                <DataTable.Header />
                <DataTable.Body />
              </DataTable.Container>
            </DataTable.Root>
          </div>
        );
      })}
    </div>
  ),
};

export const EmptyState: Story = {
  render: () => {
    const table = useDataTable({
      data: [] as Process[],
      columns: processColumns,
    });

    return (
      <DataTable.Root table={table} variant="soft">
        <DataTable.Container>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
        <DataTable.Empty title="No processes found" description="There are no matching processes to display." />
      </DataTable.Root>
    );
  },
};

export const LoadingState: Story = {
  render: () => {
    const table = useDataTable({
      data: [] as Process[],
      columns: processColumns,
    });

    return (
      <DataTable.Root table={table} variant="soft">
        <DataTable.Container>
          <DataTable.Header />
          <DataTable.Loading rows={6} />
        </DataTable.Container>
      </DataTable.Root>
    );
  },
};

export const StripedHoverable: Story = {
  render: () => {
    const table = useDataTable({
      data: processData,
      columns: processColumns,
      getRowId: (row) => row.pid,
    });

    return (
      <DataTable.Root table={table} variant="soft" striped hoverable>
        <DataTable.Container height={400}>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
    );
  },
};
