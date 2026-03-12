import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import type { ColumnDef } from '@tanstack/react-table';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

interface Person {
  id: string;
  name: string;
  age: number;
  status: string;
}

const sampleData: Person[] = [
  { id: '1', name: 'Charlie', age: 35, status: 'active' },
  { id: '2', name: 'Alice', age: 30, status: 'inactive' },
  { id: '3', name: 'Bob', age: 25, status: 'active' },
];

const columns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'status', header: 'Status' },
];

// ---------------------------------------------------------------------------
// Bug 1: SortButton has no CSS — headers look like generic HTML buttons
// ---------------------------------------------------------------------------

describe('Bug: SortButton missing CSS reset', () => {
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

  it('sort button has a CSS class applied (not unstyled)', () => {
    renderWithTheme(<SortableTable />);
    // The sort button should have a class from the CSS module, not be classless
    const nameHeader = screen.getByRole('button', { name: /sort by name/i });
    // CSS modules generate a class name — if the class is missing from the CSS,
    // the className will be undefined/empty
    expect(nameHeader.className).not.toBe('');
    expect(nameHeader.className).toBeDefined();
    expect(nameHeader.className).toMatch(/\S/); // has at least one non-whitespace char
  });
});

// ---------------------------------------------------------------------------
// Bug 2: Sorting does not work (clicking header doesn't reorder rows)
// ---------------------------------------------------------------------------

describe('Bug: Sorting not working', () => {
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

  it('clicking a sortable header sorts rows ascending then descending', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SortableTable />);

    // Initial order: Charlie, Alice, Bob (as provided)
    const tbody = screen.getAllByRole('row').filter((row) => {
      // filter to body rows only (those with cells, not header cells)
      return row.querySelector('td') !== null;
    });
    expect(tbody[0]).toHaveTextContent('Charlie');

    // Click Name header to sort ascending
    const sortButton = screen.getByRole('button', { name: /sort by name/i });
    await user.click(sortButton);

    // After ascending sort: Alice, Bob, Charlie
    const sortedRows = screen.getAllByRole('row').filter((row) => row.querySelector('td') !== null);
    expect(sortedRows[0]).toHaveTextContent('Alice');
    expect(sortedRows[1]).toHaveTextContent('Bob');
    expect(sortedRows[2]).toHaveTextContent('Charlie');

    // Click again for descending
    await user.click(sortButton);
    const descRows = screen.getAllByRole('row').filter((row) => row.querySelector('td') !== null);
    expect(descRows[0]).toHaveTextContent('Charlie');
    expect(descRows[1]).toHaveTextContent('Bob');
    expect(descRows[2]).toHaveTextContent('Alice');
  });

  it('shows sort indicator after clicking', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SortableTable />);

    const sortButton = screen.getByRole('button', { name: /sort by name/i });
    await user.click(sortButton);

    // Should show ascending indicator (↑)
    expect(sortButton).toHaveTextContent('↑');
  });
});

// ---------------------------------------------------------------------------
// Bug 3: Search input doesn't accept characters
// ---------------------------------------------------------------------------

describe('Bug: Search input not accepting characters', () => {
  function SearchableTable() {
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
        <DataTable.Toolbar searchPlaceholder="Search..." />
        <DataTable.Container>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
    );
  }

  it('search input value updates when user types', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SearchableTable />);

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'Alice');

    // The input should reflect what was typed
    expect(searchInput).toHaveValue('Alice');
  });

  it('typing in search filters the visible rows', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SearchableTable />);

    // All rows initially visible
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'Alice');

    // Only Alice should be visible
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Bug 4: Column resizing doesn't work
// ---------------------------------------------------------------------------

describe('Bug: Column resizing not working', () => {
  function ResizableTable() {
    const table = useDataTable({
      data: sampleData,
      columns,
      features: { columnResizing: true },
      getRowId: (row) => row.id,
    });

    return (
      <DataTable.Root
        table={table}
        features={{ columnResizing: true }}
        data-testid="dt-root"
      >
        <DataTable.Container>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
    );
  }

  it('renders resize handles on column headers', () => {
    renderWithTheme(<ResizableTable />);
    const resizeHandles = screen.getAllByRole('separator');
    expect(resizeHandles.length).toBeGreaterThan(0);
  });

  it('resize handle has mouseDown handler that starts resizing', () => {
    renderWithTheme(<ResizableTable />);
    const resizeHandles = screen.getAllByRole('separator');
    const firstHandle = resizeHandles[0]!;

    // Initially not resizing
    expect(firstHandle).toHaveAttribute('data-ov-resizing', 'false');

    // Fire mouseDown to start resizing
    fireEvent.mouseDown(firstHandle, { clientX: 100 });

    // After mouseDown, should be in resizing state
    expect(firstHandle).toHaveAttribute('data-ov-resizing', 'true');
  });
});

// ---------------------------------------------------------------------------
// Bug 5: Column ordering doesn't work
// ---------------------------------------------------------------------------

describe('Bug: Column ordering not working', () => {
  function OrderableTable() {
    const table = useDataTable({
      data: sampleData,
      columns,
      features: { columnOrdering: true },
      getRowId: (row) => row.id,
    });

    return (
      <DataTable.Root
        table={table}
        features={{ columnOrdering: true }}
        data-testid="dt-root"
      >
        <DataTable.Container>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
    );
  }

  it('renders headers in initial column order', () => {
    renderWithTheme(<OrderableTable />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Name');
    expect(headers[1]).toHaveTextContent('Age');
    expect(headers[2]).toHaveTextContent('Status');
  });

  it('respects initialState.columnOrder', () => {
    function ReorderedTable() {
      const table = useDataTable({
        data: sampleData,
        columns,
        features: { columnOrdering: true },
        getRowId: (row) => row.id,
        initialState: {
          columnOrder: ['status', 'name', 'age'],
        },
      });

      return (
        <DataTable.Root
          table={table}
          features={{ columnOrdering: true }}
          data-testid="dt-root"
        >
          <DataTable.Container>
            <DataTable.Header />
            <DataTable.Body />
          </DataTable.Container>
        </DataTable.Root>
      );
    }

    renderWithTheme(<ReorderedTable />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Status');
    expect(headers[1]).toHaveTextContent('Name');
    expect(headers[2]).toHaveTextContent('Age');
  });
});

// ---------------------------------------------------------------------------
// Bug 6: Column filtering doesn't work
// ---------------------------------------------------------------------------

describe('Bug: Column filtering not working', () => {
  function FilterableTable() {
    const columnsWithFilter: ColumnDef<Person, unknown>[] = [
      { accessorKey: 'name', header: 'Name', filterFn: 'includesString' },
      { accessorKey: 'age', header: 'Age' },
      { accessorKey: 'status', header: 'Status', filterFn: 'includesString' },
    ];

    const table = useDataTable({
      data: sampleData,
      columns: columnsWithFilter,
      features: { filtering: false, globalFilter: true },
      getRowId: (row) => row.id,
    });

    return (
      <DataTable.Root
        table={table}
        features={{ filtering: false, globalFilter: true }}
        data-testid="dt-root"
      >
        <DataTable.Toolbar searchPlaceholder="Search..." />
        <DataTable.Container>
          <DataTable.Header />
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
    );
  }

  it('global filter reduces visible rows to matching entries', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FilterableTable />);

    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'active');

    // 'active' matches status column for Charlie (active) and Bob (active)
    // but not Alice (inactive) — wait, 'inactive' includes 'active' as substring
    // Let's search for something more specific
    await user.clear(searchInput);
    await user.type(searchInput, 'Charlie');

    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });
});
