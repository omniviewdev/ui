import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { LuEllipsisVertical } from 'react-icons/lu';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import { Checkbox } from '../checkbox';
import { IconButton } from '../icon-button';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
}

// Fixed base timestamp for deterministic story output (2025-01-01T00:00:00Z)
const BASE_TIMESTAMP = 1735689600000;

function generateLogData(count: number): LogEntry[] {
  const services = ['api-gateway', 'auth-svc', 'user-svc', 'billing-svc', 'notification-svc'];
  const levels: LogEntry['level'][] = ['info', 'warn', 'error', 'debug'];
  const messages = [
    'Request processed successfully',
    'Connection pool exhausted, retrying',
    'Failed to authenticate token',
    'Cache miss for key user:1234',
    'Rate limit exceeded for client 10.0.0.5',
    'Graceful shutdown initiated',
    'Health check passed',
    'Database query timeout after 30s',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `log-${i}`,
    timestamp: new Date(BASE_TIMESTAMP - i * 1000).toISOString(),
    level: levels[i % levels.length]!,
    service: services[i % services.length]!,
    message: messages[i % messages.length]!,
  }));
}

const baseLogColumns: ColumnDef<LogEntry, unknown>[] = [
  { accessorKey: 'timestamp', header: 'Timestamp', size: 220 },
  {
    accessorKey: 'level',
    header: 'Level',
    size: 80,
    cell: (info) => {
      const val = info.getValue() as string;
      return val.toUpperCase();
    },
  },
  { accessorKey: 'service', header: 'Service', size: 160 },
  { accessorKey: 'message', header: 'Message', size: 320 },
];

const selectColumn: ColumnDef<LogEntry, unknown> = {
  id: 'select',
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onCheckedChange={() => table.toggleAllRowsSelected()}
      size="sm"
      variant="soft"
      aria-label="Select all rows"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={() => row.toggleSelected()}
      size="sm"
      variant="soft"
      aria-label={`Select row ${row.index + 1}`}
    />
  ),
  size: 36,
  enableSorting: false,
  enableResizing: false,
  meta: { align: 'center' },
};

const actionsColumn: ColumnDef<LogEntry, unknown> = {
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
};

const meta: Meta = {
  title: 'Components/DataTable/Virtualized',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const virtualizedFeatures = {
  sorting: true,
  globalFilter: true,
  columnResizing: true,
  rowSelection: 'multi' as const,
  columnPinning: true,
};

const tenKData = generateLogData(10_000);

const tenKColumns: ColumnDef<LogEntry, unknown>[] = [
  selectColumn,
  ...baseLogColumns,
  actionsColumn,
];

function TenThousandRowsStory() {
  const table = useDataTable({
    data: tenKData,
    columns: tenKColumns,
    features: virtualizedFeatures,
    getRowId: (row) => row.id,
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
      features={virtualizedFeatures}
      variant="soft"
      size="sm"
      hoverable
    >
      <DataTable.Toolbar searchPlaceholder="Search 10,000 log entries..." />
      <DataTable.Container height={600}>
        <DataTable.Header />
        <DataTable.VirtualBody estimateRowSize={30} overscan={15} />
      </DataTable.Container>
    </DataTable.Root>
  );
}

const fiftyKData = generateLogData(50_000);

const fiftyKColumns: ColumnDef<LogEntry, unknown>[] = [
  selectColumn,
  ...baseLogColumns,
  actionsColumn,
];

function FiftyThousandRowsStory() {
  const table = useDataTable({
    data: fiftyKData,
    columns: fiftyKColumns,
    features: virtualizedFeatures,
    getRowId: (row) => row.id,
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
      features={virtualizedFeatures}
      variant="soft"
      size="sm"
      hoverable
    >
      <DataTable.Toolbar searchPlaceholder="Search 50,000 log entries..." />
      <DataTable.Container height={600}>
        <DataTable.Header />
        <DataTable.VirtualBody estimateRowSize={30} overscan={20} />
      </DataTable.Container>
    </DataTable.Root>
  );
}

export const TenThousandRows: Story = {
  render: () => <TenThousandRowsStory />,
};

export const FiftyThousandRows: Story = {
  render: () => <FiftyThousandRowsStory />,
};
