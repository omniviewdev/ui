import { Subscribe } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { DataTableColumnDef as ColumnDef } from './types';
import type {
  ExpandedState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { Select } from '../select/Select';

const meta: Meta = {
  title: 'Components/DataTable/Prepared results',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Explicit presentation fixtures, not a connected resource service. The caller supplies prepared order/groups and owns data acquisition. Detail children mount only while expanded and virtual-visible; this story counts mounts to demonstrate that policy.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;
type RecordRow = { id: string; name: string; status: string; revision: number };
const fixtureRows = Array.from(
  { length: 2000 },
  (_, index): RecordRow => ({
    id: `opaque:${index}`,
    name: `Resource ${index}`,
    status: index % 2 ? 'Available' : 'Idle',
    revision: 0,
  }),
);
const features = {
  sorting: true,
  rowExpansion: true,
  rowSelection: 'multi' as const,
  columnVisibility: true,
};
const columns: ColumnDef<RecordRow, unknown>[] = [
  {
    id: 'actions',
    header: 'Selection / details',
    enableSorting: false,
    size: 180,
    cell: ({ row, table }) => (<Subscribe source={table.store} selector={(state) => ({ selection: state.rowSelection, expanded: state.expanded })}>{(snapshot) => ((
      <>
        <Checkbox
          aria-label={`Select ${row.original.name}`}
          disabled={!row.getCanSelect()}
          checked={!!snapshot.selection[row.id]}
          onCheckedChange={() => row.toggleSelected()}
        />
        <DataTable.ExpansionToggle row={row} label={row.original.name} />
      </>
    ))}</Subscribe>),
  },
  { accessorKey: 'name', header: 'Name', size: 220, meta: { dataTableCellDependencies: 'data' } },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 180,
    meta: { dataTableCellDependencies: 'data' },
  },
  {
    accessorKey: 'revision',
    header: 'Revision',
    size: 120,
    meta: { dataTableCellDependencies: 'data' },
  },
];

function FixtureDetails({
  row,
  mode,
  onMount,
}: {
  row: RecordRow;
  mode: 'card' | 'list' | 'table';
  onMount: (delta: number) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => {
      setLoaded(true);
      setLoading(false);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [loading]);
  useEffect(() => {
    onMount(1);
    return () => onMount(-1);
  }, [onMount]);
  const child = useDataTable({
    data: [{ id: 'disk', name: 'Attached disk', state: loaded ? 'Healthy' : 'Pending' }],
    columns: [
      { accessorKey: 'name', header: 'Child' },
      { accessorKey: 'state', header: 'State' },
    ],
    getRowId: (item) => item.id,
  });
  return (
    <section aria-label={`${row.name} ${mode} details`}>
      <h3>{row.name} {mode} details</h3>
      <p>Prepared detail fixture; no resource fetching.</p>
      <Button
        disabled={loading}
        onClick={() => {
          if (loaded) setLoaded(false);
          else setLoading(true);
        }}
      >
        {loading
          ? 'Preparing detail fixture…'
          : loaded
            ? 'Shrink detail content'
            : 'Grow detail content'}
      </Button>
      {mode === 'table' ? (
        <DataTable.Root table={child}>
          <DataTable.Container>
            <DataTable.Header />
            <DataTable.Body />
          </DataTable.Container>
        </DataTable.Root>
      ) : (
        <dl style={{ display: mode === 'card' ? 'flex' : 'block', gap: 16 }}>
          <dt>State</dt><dd>{row.status}</dd>
          <dt>Revision</dt><dd>{row.revision}</dd>
        </dl>
      )}
      {loaded && (
        <ul>
          {Array.from({ length: 10 }, (_, index) => (
            <li key={index}>Additional asynchronous-height fixture detail {index + 1}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PreparedWindow() {
  const [data, setData] = useState(fixtureRows);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [mode, setMode] = useState<'card' | 'list' | 'table'>('card');
  const [mounted, setMounted] = useState(0);
  const [selectionEnabled, setSelectionEnabled] = useState(true);
  const onMount = useMemo(() => (delta: number) => setMounted((count) => count + delta), []);
  const table = useDataTable({
    data,
    columns,
    features,
    getRowId: (item) => item.id,
    getRowCanExpand: () => true,
    state: { expanded, rowSelection, sorting },
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getRowCanSelect: () => selectionEnabled,
    manualSorting: true,
    manualFiltering: true,
    manualGrouping: true,
    manualPagination: true,
  });
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p>
        2,000 prepared rows. Sort headers request a host change; they do not sort this fixture. Use
        “Apply prepared reorder” to deliver a new order. Expand Resource 0, grow content, scroll far
        away and back.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button
          onClick={() =>
            setData((previous) =>
              previous.map((row) =>
                row.id === 'opaque:0'
                  ? {
                      ...row,
                      status: row.status === 'Available' ? 'Idle' : 'Available',
                      revision: row.revision + 1,
                    }
                  : row,
              ),
            )
          }
        >
          Patch Resource 0
        </Button>
        <Button
          onClick={() =>
            setData((previous) =>
              previous.map((row) =>
                row.id === 'opaque:1000'
                  ? { ...row, status: 'Patched offscreen', revision: row.revision + 1 }
                  : row,
              ),
            )
          }
        >
          Patch offscreen Resource 1000
        </Button>
        <Button onClick={() => setData((previous) => [...previous].reverse())}>
          Apply prepared reorder
        </Button>
        <Button onClick={() => setExpanded({})}>Collapse all</Button>
        <Button onClick={() => setSelectionEnabled((enabled) => !enabled)}>
          {selectionEnabled ? 'Disable row selection' : 'Enable row selection'}
        </Button>
        <Select.Root
          value={mode}
          onValueChange={(value) => {
            if (value) setMode(value);
          }}
        >
          <Select.Trigger aria-label="Detail visualization">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.List>
                  {(['card', 'list', 'table'] as const).map((value) => (
                    <Select.Item key={value} value={value}>
                      {value}
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>
      <output aria-live="polite">
        Selected: {Object.values(rowSelection).filter(Boolean).length}; mounted details: {mounted};
        requested order:{' '}
        {sorting.map((sort) => `${sort.id}:${sort.desc ? 'desc' : 'asc'}`).join(', ') || 'none'}
      </output>
      <DataTable.Root table={table} features={features} size="sm" stickyHeader hoverable>
        <DataTable.Container height={480}>
          <DataTable.Header />
          <DataTable.VirtualBody<RecordRow>
            fixedRowHeight
            estimateRowSize={36}
            overscan={4}
            renderExpandedRow={(row) => (
              <FixtureDetails key={mode} row={row} mode={mode} onMount={onMount} />
            )}
          />
        </DataTable.Container>
      </DataTable.Root>
    </div>
  );
}
export const LivePatchesAndArbitraryDetails: Story = { render: () => <PreparedWindow /> };

type PreparedRow = {
  id: string;
  kind: 'group' | 'member';
  label: string;
  count?: number;
  groupId?: string;
};
const preparedGroups = [
  { id: 'group:missing', label: 'Missing placement', count: 3 },
  { id: 'group:numeric', label: 'Placement 12', count: 240 },
  { id: 'group:tag', label: 'Environment: production', count: 240 },
];
function PreparedGroups() {
  const [expanded, setExpanded] = useState<ExpandedState>({ 'group:numeric': true });
  const [selection, setSelection] = useState<RowSelectionState>({});
  // Verification fixture emulates host-prepared membership/order. This is not a
  // production grouping implementation and does not inspect resource objects.
  const data = useMemo(
    () =>
      preparedGroups.flatMap((group): PreparedRow[] => [
        { ...group, kind: 'group' },
        ...(expanded === true || expanded[group.id]
          ? Array.from(
              { length: group.count },
              (_, index): PreparedRow => ({
                id: `${group.id}:member:${index}`,
                kind: 'member',
                label: `Prepared member ${index + 1}`,
                groupId: group.id,
              }),
            )
          : []),
      ]),
    [expanded],
  );
  const groupColumns = useMemo<ColumnDef<PreparedRow, unknown>[]>(
    () => [
      {
        id: 'label',
        header: 'Host-prepared groups and members',
        size: 460,
        cell: ({ row, table }) => (<Subscribe source={table.store} selector={(state) => ({ selection: state.rowSelection, expanded: state.expanded })}>{(snapshot) => (row.original.kind === 'group' ? (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={(snapshot.expanded === true || !!snapshot.expanded[row.id])}
            onClick={() => row.toggleExpanded()}
          >
            {row.original.label} ({row.original.count})
          </Button>
        ) : (
          <span style={{ paddingInlineStart: 24 }}>
            <Checkbox
              aria-label={`Select ${row.id}`}
              checked={!!snapshot.selection[row.id]}
              onCheckedChange={() => row.toggleSelected()}
            />{' '}
            {row.original.label}
          </span>
        ))}</Subscribe>),
      },
    ],
    [],
  );
  const table = useDataTable({
    data,
    columns: groupColumns,
    getRowId: (row) => row.id,
    features: { rowExpansion: true, rowSelection: 'multi' },
    state: { expanded, rowSelection: selection },
    onExpandedChange: setExpanded,
    onRowSelectionChange: setSelection,
    getRowCanExpand: (row) => row.original.kind === 'group',
    getRowCanSelect: (row) => row.original.kind === 'member',
    manualSorting: true,
    manualFiltering: true,
    manualGrouping: true,
    manualPagination: true,
    manualExpanding: true,
  });
  return (
    <>
      <p>
        Counts, missing/numeric/multivalue labels and member IDs are prepared fixture input.
        Collapsing a group preserves selected keyed members.
      </p>
      <output>Selected members: {Object.values(selection).filter(Boolean).length}</output>
      <DataTable.Root table={table} features={{ rowExpansion: true }}>
        <DataTable.Container height={440}>
          <DataTable.Header />
          <DataTable.VirtualBody<PreparedRow>
            fixedRowHeight
            estimateRowSize={36}
            getRowProps={(row) => ({
              'aria-label':
                row.original.kind === 'group' ? `Group ${row.original.label}` : row.original.label,
              'data-ov-group': row.original.kind === 'group',
            })}
          />
        </DataTable.Container>
      </DataTable.Root>
    </>
  );
}
export const HostPreparedGrouping: Story = { render: () => <PreparedGroups /> };

function DetailStates() {
  const table = useDataTable({
    data: fixtureRows.slice(0, 1),
    columns,
    features,
    getRowId: (row) => row.id,
    getRowCanExpand: () => true,
    state: { expanded: { 'opaque:0': true } },
  });
  const [status, setStatus] = useState('empty');
  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBlockEnd: 12 }}>
        {(['ready', 'loading', 'empty', 'error', 'unavailable', 'denied'] as const).map((value) => (
          <Button key={value} onClick={() => setStatus(value)}>
            {value}
          </Button>
        ))}
      </div>
      <DataTable.Root table={table} features={features}>
        <DataTable.Container height={500}>
          <DataTable.Header />
          <DataTable.VirtualBody<RecordRow>
            estimateRowSize={36}
            renderExpandedRow={() => (
              <section aria-label="Related content">
                <h3>Related content</h3>
                <p role="status">Prepared fixture: {status}</p>
                <p>The parent table remains usable; this is not a live service.</p>
              </section>
            )}
          />
        </DataTable.Container>
      </DataTable.Root>
    </>
  );
}
export const IsolatedDetailStates: Story = { render: () => <DetailStates /> };

function BatchedStaticEdits() {
  const table = useDataTable({
    data: fixtureRows.slice(0, 3),
    columns,
    features,
    getRowId: (row) => row.id,
    getRowCanExpand: () => true,
  });
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p>
        Generic static table: one action composes two functional selection edits before React
        rerenders.
      </p>
      <Button
        onClick={() => {
          table.getRow('opaque:0').toggleSelected(true);
          table.getRow('opaque:1').toggleSelected(true);
        }}
      >
        Select first two together
      </Button>
      <output>
        Selected static rows: {Object.values(table.state.rowSelection).filter(Boolean).length}
      </output>
      <DataTable.Root table={table} features={features}>
        <DataTable.Container height={240}>
          <DataTable.Header />
          <DataTable.VirtualBody<RecordRow>
            fixedRowHeight
            estimateRowSize={36}
            renderExpandedRow={(row) => (
              <p>
                Static detail for {row.name}: {row.status}
              </p>
            )}
          />
        </DataTable.Container>
      </DataTable.Root>
    </div>
  );
}
export const BatchedStaticSelection: Story = { render: () => <BatchedStaticEdits /> };
