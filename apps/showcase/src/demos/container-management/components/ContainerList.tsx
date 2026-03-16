import { useMemo, useCallback, useRef, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  DataTable,
  FilterBar,
  Meter,
  StatusDot,
  IconButton,
  Button,
  SearchInput,
  useToast,
  ROW_HEIGHT,
} from '@omniview/base-ui';
import { useDataTable, Checkbox } from '@omniview/base-ui';
import {
  LuPlay,
  LuSquare,
  LuTrash2,
  LuRefreshCw,
} from 'react-icons/lu';
import type { Container, ContainerStatus } from '../types';
import { containerStatusColor } from '../data';
import styles from './ContainerList.module.css';

// ---------------------------------------------------------------------------
// Status filter options
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: ContainerStatus[] = ['running', 'stopped', 'paused', 'restarting', 'exited'];

const STATUS_LABELS: Record<ContainerStatus, string> = {
  running: 'Running',
  stopped: 'Stopped',
  paused: 'Paused',
  restarting: 'Restarting',
  exited: 'Exited',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ContainerListProps {
  containers: Container[];
  onSelectContainer: (container: Container) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContainerList({ containers, onSelectContainer }: ContainerListProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContainerStatus | null>(null);

  // Stable refs so columns never recompute on callback identity changes
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const onSelectRef = useRef(onSelectContainer);
  onSelectRef.current = onSelectContainer;

  // Filter data client-side
  const filteredData = useMemo(() => {
    return containers.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.image.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [containers, search, statusFilter]);

  const columns = useMemo<ColumnDef<Container, unknown>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? true
                  : false
            }
            onCheckedChange={() => table.toggleAllPageRowsSelected()}
            variant="outline"
            size="sm"
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={() => row.toggleSelected()}
            variant="outline"
            size="sm"
            aria-label={`Select ${row.original.name}`}
          />
        ),
        size: 36,
        enableSorting: false,
        enableResizing: false,
        meta: { align: 'center' },
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 180,
        cell: (info) => {
          const row = info.row.original;
          return (
            <div
              className={styles.nameCell}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectRef.current(row)}
            >
              <StatusDot status={containerStatusColor(row.status)} size="sm" />
              <span>{row.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'image',
        header: 'Image',
        size: 200,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: (info) => {
          const status = info.getValue() as ContainerStatus;
          return (
            <div className={styles.statusCell}>
              <StatusDot status={containerStatusColor(status)} size="sm" />
              <span>{STATUS_LABELS[status]}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'cpu',
        header: 'CPU',
        size: 120,
        cell: (info) => {
          const val = info.getValue() as number;
          return (
            <div className={styles.meterCell}>
              <Meter
                value={val}
                min={0}
                max={100}
                high={80}
                optimum={20}
                size="sm"
                aria-label={`CPU: ${val.toFixed(1)}%`}
              />
              <span className={styles.meterLabel}>{val.toFixed(1)}%</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'memory',
        header: 'Memory',
        size: 130,
        cell: (info) => {
          const row = info.row.original;
          const pct = (row.memory / row.memoryLimit) * 100;
          return (
            <div className={styles.meterCell}>
              <Meter
                value={pct}
                min={0}
                max={100}
                high={85}
                optimum={50}
                size="sm"
                aria-label={`Memory: ${row.memory} MB / ${row.memoryLimit} MB`}
              />
              <span className={styles.meterLabel}>{row.memory} / {row.memoryLimit} MB</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'uptime',
        header: 'Uptime',
        size: 100,
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 110,
        enableSorting: false,
        enableResizing: false,
        cell: (info) => {
          const row = info.row.original;
          const isRunning = row.status === 'running';
          return (
            <div className={styles.actionsCell}>
              <IconButton
                variant="ghost"
                size="sm"
                dense
                aria-label={isRunning ? `Stop ${row.name}` : `Start ${row.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toastRef.current(`${isRunning ? 'Stopping' : 'Starting'} ${row.name}`, { severity: 'info' });
                }}
              >
                {isRunning ? <LuSquare /> : <LuPlay />}
              </IconButton>
              <IconButton
                variant="ghost"
                size="sm"
                dense
                aria-label={`Restart ${row.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toastRef.current(`Restarting ${row.name}`, { severity: 'info' });
                }}
              >
                <LuRefreshCw />
              </IconButton>
              <IconButton
                variant="ghost"
                size="sm"
                dense
                color="danger"
                aria-label={`Delete ${row.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toastRef.current(`Deleting ${row.name}`, { severity: 'warning' });
                }}
              >
                <LuTrash2 />
              </IconButton>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useDataTable({
    data: filteredData,
    columns,
    features: {
      sorting: true,
      rowSelection: 'multi',
    },
    getRowId: (row) => row.id,
  });

  const selectedCount = Object.keys(table.getState().rowSelection).length;

  const handleClearFilters = useCallback(() => {
    setStatusFilter(null);
    setSearch('');
  }, []);

  return (
    <div className={styles.root}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search containers..."
          size="sm"
          variant="outline"
          style={{ width: 220 }}
        />
        <FilterBar size="sm">
          {statusFilter && (
            <FilterBar.Chip onRemove={() => setStatusFilter(null)}>
              Status: {STATUS_LABELS[statusFilter]}
            </FilterBar.Chip>
          )}
          {!statusFilter && STATUS_OPTIONS.map((s) => (
            <FilterBar.Chip key={s} onClick={() => setStatusFilter(s)}>
              {STATUS_LABELS[s]}
            </FilterBar.Chip>
          ))}
          {(statusFilter || search) && (
            <FilterBar.Clear onClick={handleClearFilters} />
          )}
        </FilterBar>
      </div>

      {/* Bulk action toolbar */}
      {selectedCount > 0 && (
        <div className={styles.bulkToolbar}>
          <span className={styles.bulkLabel}>{selectedCount} selected</span>
          <Button
            variant="soft"
            size="sm"
            startDecorator={<LuPlay />}
            onClick={() => toast(`Starting ${selectedCount} containers`, { severity: 'info' })}
          >
            Start
          </Button>
          <Button
            variant="soft"
            size="sm"
            startDecorator={<LuSquare />}
            onClick={() => toast(`Stopping ${selectedCount} containers`, { severity: 'info' })}
          >
            Stop
          </Button>
          <Button
            variant="soft"
            size="sm"
            color="danger"
            startDecorator={<LuTrash2 />}
            onClick={() => toast(`Deleting ${selectedCount} containers`, { severity: 'warning' })}
          >
            Delete
          </Button>
          <div className={styles.spacer} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetRowSelection()}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <DataTable.Root
          table={table}
          features={{ sorting: true, rowSelection: 'multi' }}
          variant="ghost"
          hoverable
        >
          <DataTable.Container height="100%">
            <DataTable.Header />
            <DataTable.VirtualBody estimateRowSize={ROW_HEIGHT.md} overscan={5} fixedRowHeight />
            <DataTable.Empty>No containers match your filters.</DataTable.Empty>
          </DataTable.Container>
        </DataTable.Root>
      </div>
    </div>
  );
}
