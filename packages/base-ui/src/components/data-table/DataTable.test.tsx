import { Subscribe } from '@tanstack/react-table';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import { useTable } from '@tanstack/react-table';
import { dataTableFeatures } from './constants';
import type { DataTableColumnDef as ColumnDef } from './types';

interface Person {
  id: string;
  name: string;
  age: number;
  status: string;
}

const sampleData: Person[] = [
  { id: '1', name: 'Alice', age: 30, status: 'active' },
  { id: '2', name: 'Bob', age: 25, status: 'inactive' },
  { id: '3', name: 'Charlie', age: 35, status: 'active' },
];

const columns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'status', header: 'Status' },
];

describe('DataTable features', () => {
  function FilterableTable() {
    const table = useDataTable({
      data: sampleData,
      columns,
      features: { globalFilter: true, filtering: true },
      getRowId: (row) => row.id,
    });

    return (
      <DataTable.Root
        table={table}
        features={{ globalFilter: true, filtering: true }}
        data-testid="dt-root"
      >
        <DataTable.Toolbar />
        <DataTable.Container>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
    );
  }

  it('filters rows when global filter is applied', async () => {
    renderWithTheme(<FilterableTable />);
    // All rows visible initially
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();

    // Type in the search input
    const searchInput = screen.getByPlaceholderText('Search...');
    await userEvent.type(searchInput, 'Alice');

    // Only Alice should remain
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });
});

const reactivePeople = [...sampleData].reverse();
const reactiveFeatures = {
  sorting: true,
  globalFilter: true,
  filtering: true,
  pagination: true,
};

function ReactiveTable({ rows = reactivePeople, pageSize = 1 }: { rows?: Person[]; pageSize?: number }) {
  const table = useTable({
    features: dataTableFeatures,
    data: rows,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  return (
    <DataTable.Root table={table} features={reactiveFeatures}>
      <DataTable.Toolbar />
      <DataTable.Container>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
      <DataTable.Pagination />
    </DataTable.Root>
  );
}

const layoutColumns: ColumnDef<Person, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row, table }) => (<Subscribe source={table.store} selector={(state) => ({ selection: state.rowSelection, expanded: state.expanded })}>{(snapshot) => ((
      <button aria-pressed={!!snapshot.selection[row.id]} onClick={() => row.toggleSelected()}>
        {row.original.name}
      </button>
    ))}</Subscribe>),
  },
  ...columns.slice(1),
];
const layoutDefaults = { size: 120 };

function LayoutTable() {
  const table = useTable({
    features: dataTableFeatures,
    data: sampleData,
    columns: layoutColumns,
    defaultColumn: layoutDefaults,
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <>
      <button onClick={() => table.setColumnPinning({ start: ['name', 'age'], end: [] })}>Pin details</button>
      <button onClick={() => table.setColumnSizing({ name: 240 })}>Widen name</button>
      <button onClick={() => table.getColumn('name')?.toggleVisibility()}>Toggle name</button>
      <button onClick={() => table.setColumnPinning({ start: ['age', 'name'], end: [] })}>Pin age first</button>
      <button onClick={() => table.setColumnPinning({ start: [], end: [] })}>Unpin details</button>
      <DataTable.Root table={table}>
        <DataTable.Container>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
    </>
  );
}

describe('stable table controller reactivity', () => {
  it('replaces visible rows when the caller supplies filtered data', () => {
    const { rerender } = renderWithTheme(<ReactiveTable pageSize={3} />);

    rerender(<ReactiveTable rows={sampleData.slice(1, 2)} pageSize={3} />);

    expect(screen.getByRole('cell', { name: 'Bob' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Alice' })).not.toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Charlie' })).not.toBeInTheDocument();
    expect(screen.getByText('1 rows')).toBeInTheDocument();
  });

  it('filters and restores visible rows and page controls through the toolbar', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ReactiveTable />);

    const search = screen.getByPlaceholderText('Search...');
    await user.type(search, 'Bob');

    expect(screen.getByRole('cell', { name: 'Bob' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Charlie' })).not.toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();

    await user.clear(search);

    expect(screen.getByRole('cell', { name: 'Charlie' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Bob' })).not.toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });

  it('updates row order and the accessible sort direction on repeated header activation', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ReactiveTable pageSize={3} />);

    await user.click(screen.getByRole('button', { name: 'Sort by Name' }));

    expect(
      within(screen.getByRole('table')).getAllByRole('cell', { name: /^(Alice|Bob|Charlie)$/ })
        .map((cell) => cell.textContent),
    ).toEqual(['Alice', 'Bob', 'Charlie']);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');

    await user.click(screen.getByRole('button', { name: 'Sort by Name' }));

    expect(
      within(screen.getByRole('table')).getAllByRole('cell', { name: /^(Alice|Bob|Charlie)$/ })
        .map((cell) => cell.textContent),
    ).toEqual(['Charlie', 'Bob', 'Alice']);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending');
  });

  it('moves between page windows and updates navigation availability', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ReactiveTable />);

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(screen.getByRole('cell', { name: 'Bob' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Charlie' })).not.toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Last page' }));

    expect(screen.getByRole('cell', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'First page' }));

    expect(screen.getByRole('cell', { name: 'Charlie' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('keeps custom cell renderers live when selection changes on existing rows', async () => {
    const user = userEvent.setup();
    renderWithTheme(<LayoutTable />);

    await user.click(screen.getByRole('button', { name: 'Bob' }));
    expect(screen.getByRole('button', { name: 'Bob' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Bob' }));
    expect(screen.getByRole('button', { name: 'Bob' })).toHaveAttribute('aria-pressed', 'false');
  });
});

type AutomaticRow = {
  name: string;
  label: string;
  replicas: number;
  enabled: boolean;
  tags: string[];
  created: Date;
  metadata: { group: string };
};

const automaticRows: AutomaticRow[] = [
  { name: 'pod-10', label: 'Zulu', replicas: 10, enabled: true, tags: ['ops'], created: new Date('2026-01-10'), metadata: { group: 'ten' } },
  { name: 'Pod-2', label: 'alpha', replicas: 2, enabled: false, tags: ['dev'], created: new Date('2026-01-02'), metadata: { group: 'two' } },
  { name: 'pod-1', label: 'bravo', replicas: 0, enabled: false, tags: ['ops', 'dev'], created: new Date('2026-01-01'), metadata: { group: 'zero' } },
];

const automaticColumns: ColumnDef<AutomaticRow, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'label', header: 'Label' },
  { accessorKey: 'replicas', header: 'Replicas' },
  { accessorKey: 'enabled', header: 'Enabled' },
  { accessorKey: 'tags', header: 'Tags', cell: (info) => String(info.getValue()) },
  { accessorKey: 'created', header: 'Created', cell: (info) => String(info.getValue()) },
  { accessorKey: 'metadata', header: 'Metadata', cell: (info) => String(info.getValue()) },
];

function AutomaticTable({ filter }: { filter?: { id: string; value: unknown } }) {
  const table = useDataTable({
    data: automaticRows,
    columns: automaticColumns,
    features: { sorting: true, filtering: true },
    getRowId: (row) => row.name,
  });

  return (
    <DataTable.Root table={table} features={{ sorting: true, filtering: true }}>
      {filter && (
        <button type="button" onClick={() => table.setColumnFilters([{ id: filter.id, value: filter.value }])}>
          Apply filter
        </button>
      )}
      <DataTable.Container>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

function automaticNames() {
  return screen.getAllByRole('cell', { name: /^(pod-10|Pod-2|pod-1)$/ }).map((cell) => cell.textContent);
}

describe('automatic value behavior', () => {
  it.each([
    { column: 'Name', expected: ['pod-1', 'Pod-2', 'pod-10'] },
    { column: 'Label', expected: ['Pod-2', 'pod-1', 'pod-10'] },
  ])('sorts $column naturally without case-sensitive fallback', async ({ column, expected }) => {
    const user = userEvent.setup();
    renderWithTheme(<AutomaticTable />);
    await user.click(screen.getByRole('button', { name: `Sort by ${column}` }));
    expect(automaticNames()).toEqual(expected);
  });

  it.each([
    { kind: 'numeric ranges including zero', filter: { id: 'replicas', value: [0, 2] }, expected: ['Pod-2', 'pod-1'] },
    { kind: 'false booleans', filter: { id: 'enabled', value: false }, expected: ['Pod-2', 'pod-1'] },
    { kind: 'array membership', filter: { id: 'tags', value: ['ops'] }, expected: ['pod-10', 'pod-1'] },
    { kind: 'date ranges', filter: { id: 'created', value: [new Date('2026-01-01'), new Date('2026-01-02')] }, expected: ['Pod-2', 'pod-1'] },
    { kind: 'object identity', filter: { id: 'metadata', value: automaticRows[1]!.metadata }, expected: ['Pod-2'] },
  ])('filters $kind through the column API', async ({ filter, expected }) => {
    const user = userEvent.setup();
    renderWithTheme(<AutomaticTable filter={filter} />);
    await user.click(screen.getByRole('button', { name: 'Apply filter' }));
    expect(automaticNames()).toEqual(expected);
  });
});
