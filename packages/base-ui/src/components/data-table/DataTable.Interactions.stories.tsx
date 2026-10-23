import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef, ExpandedState } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';

const meta: Meta = {
  title: 'Components/DataTable/Interactions',
  parameters: {
    docs: {
      description: {
        component:
          'Prepared cloud/container/hypervisor-style fixtures, not live backend integration. Native table and Tab navigation; no grid keyboard contract. Host fixture commands deliver order/removal after two seconds so focus can remain inside the table.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;
type Resource = { id: string; name: string; kind: string };
const kinds = ['Cloud instance', 'Container', 'Hypervisor VM'];
const fixtures: Resource[] = Array.from({ length: 2000 }, (_, index) => ({
  id: `fixture:${index}`,
  name: `${kinds[index % kinds.length]} ${index}`,
  kind: kinds[index % kinds.length]!,
}));
const columns: ColumnDef<Resource, unknown>[] = [
  {
    id: 'actions',
    header: 'Selection / details',
    size: 160,
    cell: ({ row }) => (
      <>
        <input
          type="checkbox"
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
        <DataTable.ExpansionToggle row={row} label={row.original.name} />
      </>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Resource',
    size: 260,
    meta: { dataTableCellDependencies: 'data' },
  },
  { accessorKey: 'kind', header: 'Kind', size: 180, meta: { dataTableCellDependencies: 'data' } },
  {
    id: 'link',
    header: 'Independent action',
    size: 200,
    cell: ({ row }) => (
      <a href="#fixture-notes" onClick={(event) => event.preventDefault()}>
        Inspect {row.original.name}
      </a>
    ),
  },
];
const disks = [{ id: 'disk:0', name: 'Prepared disk' }];
const diskColumns: ColumnDef<(typeof disks)[number], unknown>[] = [
  { accessorKey: 'name', header: 'Nested table resource' },
  {
    id: 'select',
    header: 'Nested selection',
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label="Select prepared disk"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  },
];

function Details({ resource, close }: { resource: Resource; close: () => void }) {
  const child = useDataTable({
    data: disks,
    columns: diskColumns,
    getRowId: (disk) => disk.id,
    features: { rowSelection: 'multi' },
  });
  const [grown, setGrown] = useState(false);
  return (
    <section aria-label={`Details ${resource.name}`} style={{ padding: 12 }}>
      <h3>{resource.name} — prepared details</h3>
      <label>
        Detail note{' '}
        <input aria-label={`Note ${resource.name}`} defaultValue={`Note for ${resource.id}`} />
      </label>{' '}
      <button onClick={() => setGrown((value) => !value)}>
        {grown ? 'Shrink details' : 'Grow details'}
      </button>{' '}
      <button onClick={close}>Close {resource.name} details</button>
      <DataTable.Root table={child}>
        <DataTable.Container height="auto" aria-label={`Nested disks ${resource.name}`}>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
      {grown && <p style={{ paddingBlock: 100 }}>Additional arbitrary-height fixture content</p>}
    </section>
  );
}

function KeyboardAndFocus() {
  const [data, setData] = useState(fixtures);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowActions, setRowActions] = useState(0);
  const [pending, setPending] = useState<'reorder' | 'remove' | 'collapse' | null>(null);
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      if (pending === 'reorder')
        setData((previous) => [previous[1]!, previous[0]!, ...previous.slice(2)]);
      if (pending === 'remove')
        setData((previous) => previous.filter((row) => row.id !== 'fixture:0'));
      if (pending === 'collapse') setExpanded({});
      setPending(null);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [pending]);
  const features = { rowExpansion: true, rowSelection: 'multi' as const };
  const table = useDataTable({
    data,
    columns,
    features,
    getRowId: (row) => row.id,
    getRowCanExpand: () => true,
    state: { expanded },
    onExpandedChange: setExpanded,
    manualSorting: true,
    manualFiltering: true,
    manualGrouping: true,
    manualPagination: true,
  });
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p id="fixture-notes">
        2,000 prepared fixtures. Tab to a disclosure; Enter/Space toggles it. Row actions only count
        plain-cell clicks. Notes and nested selection survive mounted reorder, not collapse or
        scrolling out of range.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setPending('reorder')}>Schedule prepared reorder</button>
        <button onClick={() => setPending('remove')}>Schedule removal of Cloud instance 0</button>
        <button onClick={() => setPending('collapse')}>Schedule collapse all</button>
        <button onClick={() => setExpanded(true)}>Expand all fixtures</button>
        <button onClick={() => setExpanded({})}>Collapse all</button>
        <button
          onClick={() => {
            setData(fixtures);
            setExpanded({});
          }}
        >
          Reset fixtures
        </button>
      </div>
      <output aria-live="polite">
        {pending ? `Prepared ${pending} in two seconds. ` : ''}Parent row actions: {rowActions}
      </output>
      <DataTable.Root table={table} features={features} size="sm" stickyHeader hoverable>
        <DataTable.Container height={420} aria-label="Prepared resources viewport">
          <DataTable.Header />
          <DataTable.VirtualBody<Resource>
            fixedRowHeight
            estimateRowSize={36}
            overscan={3}
            onRowClick={() => setRowActions((value) => value + 1)}
            renderExpandedRow={(resource) => (
              <Details
                resource={resource}
                close={() => table.getRow(resource.id).toggleExpanded(false)}
              />
            )}
          />
        </DataTable.Container>
      </DataTable.Root>
      <button>After table</button>
    </div>
  );
}
export const KeyboardAndVirtualDetails: Story = { render: () => <KeyboardAndFocus /> };
