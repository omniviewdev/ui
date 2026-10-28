import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';

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

function TestTable(props: {
  variant?: 'solid' | 'soft' | 'outline' | 'ghost';
  color?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'discovery' | 'secondary';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  stickyHeader?: boolean;
  striped?: boolean;
}) {
  const table = useDataTable({
    data: sampleData,
    columns,
    getRowId: (row) => row.id,
  });

  return (
    <DataTable.Root table={table} data-testid="dt-root" {...props}>
      <DataTable.Container>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

describe('DataTable', () => {
  it('renders with default data attributes', () => {
    renderWithTheme(<TestTable />);
    const root = screen.getByTestId('dt-root');
    expect(root).toHaveAttribute('data-ov-variant', 'soft');
    expect(root).toHaveAttribute('data-ov-color', 'neutral');
    expect(root).toHaveAttribute('data-ov-size', 'md');
  });

  it('renders themed root attributes', () => {
    renderWithTheme(<TestTable variant="outline" color="success" size="sm" />);
    const root = screen.getByTestId('dt-root');
    expect(root).toHaveAttribute('data-ov-variant', 'outline');
    expect(root).toHaveAttribute('data-ov-color', 'success');
    expect(root).toHaveAttribute('data-ov-size', 'sm');
  });

  it('applies xs size data attribute', () => {
    renderWithTheme(<TestTable size="xs" />);
    expect(screen.getByTestId('dt-root')).toHaveAttribute('data-ov-size', 'xs');
  });

  it('applies xl size data attribute', () => {
    renderWithTheme(<TestTable size="xl" />);
    expect(screen.getByTestId('dt-root')).toHaveAttribute('data-ov-size', 'xl');
  });

  it('applies discovery color data attribute', () => {
    renderWithTheme(<TestTable color="discovery" />);
    expect(screen.getByTestId('dt-root')).toHaveAttribute('data-ov-color', 'discovery');
  });

  it('applies secondary color data attribute', () => {
    renderWithTheme(<TestTable color="secondary" />);
    expect(screen.getByTestId('dt-root')).toHaveAttribute('data-ov-color', 'secondary');
  });

  it('supports hoverable, stickyHeader, and striped flags', () => {
    renderWithTheme(<TestTable hoverable stickyHeader striped />);
    const root = screen.getByTestId('dt-root');
    expect(root).toHaveAttribute('data-ov-hoverable', 'true');
    expect(root).toHaveAttribute('data-ov-sticky-header', 'true');
    expect(root).toHaveAttribute('data-ov-striped', 'true');
  });

  it('renders header cells with column names', () => {
    renderWithTheme(<TestTable />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    renderWithTheme(<TestTable />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });
});

describe('DataTable features', () => {
  function SortableTable() {
    const table = useDataTable({
      data: sampleData,
      columns,
      features: { sorting: true },
      getRowId: (row) => row.id,
    });

    return (
      <DataTable.Root table={table} features={{ sorting: true }} data-testid="dt-root">
        <DataTable.Container>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
    );
  }

  it('renders sortable header cells', () => {
    renderWithTheme(<SortableTable />);
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveAttribute('data-ov-sortable', 'true');
  });

  function EmptyTable() {
    const table = useDataTable({
      data: [] as Person[],
      columns,
    });

    return (
      <DataTable.Root table={table} data-testid="dt-root">
        <DataTable.Container>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
        <DataTable.Empty title="No data" description="Nothing to show" />
      </DataTable.Root>
    );
  }

  it('renders empty state', () => {
    renderWithTheme(<EmptyTable />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });

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
  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    cell: ({ row }) => (
      <button aria-pressed={row.getIsSelected()} onClick={() => row.toggleSelected()}>
        {row.original.name}
      </button>
    ),
  },
  ...columns.slice(1),
];
const layoutDefaults = { size: 120 };

function LayoutTable() {
  const table = useReactTable({
    data: sampleData,
    columns: layoutColumns,
    defaultColumn: layoutDefaults,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });

  return (
    <>
      <button onClick={() => table.setColumnPinning({ left: ['name', 'age'] })}>Pin details</button>
      <button onClick={() => table.setColumnSizing({ name: 240 })}>Widen name</button>
      <button onClick={() => table.getColumn('name')?.toggleVisibility()}>Toggle name</button>
      <button onClick={() => table.setColumnPinning({ left: ['age', 'name'] })}>Pin age first</button>
      <button onClick={() => table.setColumnPinning({ left: [] })}>Unpin details</button>
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

  it('reflows pinned cells after sizing, visibility, and pin-order changes', async () => {
    const user = userEvent.setup();
    renderWithTheme(<LayoutTable />);

    await user.click(screen.getByRole('button', { name: 'Pin details' }));
    expect(screen.getByRole('cell', { name: '25' })).toHaveStyle({ position: 'sticky', left: '120px' });

    await user.click(screen.getByRole('button', { name: 'Widen name' }));
    expect(screen.getByRole('cell', { name: '25' })).toHaveStyle({ left: '240px' });

    await user.click(screen.getByRole('button', { name: 'Toggle name' }));
    expect(screen.queryByRole('button', { name: 'Bob' })).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '25' })).toHaveStyle({ left: '0px' });

    await user.click(screen.getByRole('button', { name: 'Toggle name' }));
    expect(screen.getByRole('cell', { name: '25' })).toHaveStyle({ left: '240px' });

    await user.click(screen.getByRole('button', { name: 'Pin age first' }));
    expect(screen.getByRole('cell', { name: '25' })).toHaveStyle({ left: '0px' });
    expect(screen.getByRole('cell', { name: 'Bob' })).toHaveStyle({ left: '120px' });

    await user.click(screen.getByRole('button', { name: 'Unpin details' }));
    expect(screen.getByRole('cell', { name: '25' })).not.toHaveStyle({ position: 'sticky' });
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
