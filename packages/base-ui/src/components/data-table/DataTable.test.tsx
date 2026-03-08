import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import type { ColumnDef } from '@tanstack/react-table';

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
  color?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
