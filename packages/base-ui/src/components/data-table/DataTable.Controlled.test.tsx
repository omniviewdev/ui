import { act, fireEvent, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useEffect, useState } from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ColumnDef, ExpandedState, TableState } from '@tanstack/react-table';
import { renderWithTheme } from '../../test/render';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';

type Item = { id: string; name: string };
const data: Item[] = [
  { id: 'b', name: 'Beta' },
  { id: 'a', name: 'Alpha' },
];
const columns: ColumnDef<Item, unknown>[] = [{ accessorKey: 'name', header: 'Name' }];
const height = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get: () => 400,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => 800,
  });
});
afterAll(() => {
  if (height) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', height);
  if (width) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', width);
});

describe('host-prepared table state', () => {
  it('requests grouping changes while retaining host-prepared rows and group state', () => {
    const onGroupingChange = vi.fn();
    const { result } = renderHook(() =>
      useDataTable({
        data,
        columns,
        manualGrouping: true,
        state: { grouping: [] },
        onGroupingChange,
      }),
    );
    act(() => result.current.setGrouping(['name']));
    expect(onGroupingChange).toHaveBeenCalledWith(['name']);
    expect(result.current.getState().grouping).toEqual([]);
    expect(result.current.getRowModel().rows.map((row) => row.original.id)).toEqual(['b', 'a']);
  });
  it('preserves host order and window despite active sort, filter and pagination state', () => {
    const { result } = renderHook(() =>
      useDataTable({
        data,
        columns,
        getRowId: (row) => row.id,
        features: { sorting: true, globalFilter: true, pagination: true },
        manualSorting: true,
        manualFiltering: true,
        manualPagination: true,
        manualGrouping: true,
        state: {
          sorting: [{ id: 'name', desc: false }],
          globalFilter: 'not present',
          pagination: { pageIndex: 4, pageSize: 1 },
        },
        rowCount: 100,
      }),
    );
    expect(result.current.getRowModel().rows.map((row) => row.id)).toEqual(['b', 'a']);
    expect(result.current.getPageCount()).toBe(100);
  });

  it('composes batched functional edits and notifies once per edit in Strict Mode', () => {
    const onRowSelectionChange = vi.fn();
    const { result } = renderHook(
      () =>
        useDataTable({
          data,
          columns,
          getRowId: (row) => row.id,
          features: { rowSelection: 'multi' },
          onRowSelectionChange,
        }),
      { wrapper: StrictMode },
    );
    act(() => {
      result.current.getRow('b').toggleSelected(true);
      result.current.getRow('a').toggleSelected(true);
      result.current.setColumnVisibility((previous) => ({ ...previous, name: false }));
      result.current.setColumnVisibility((previous) => ({ ...previous, another: false }));
    });
    expect(result.current.getState().rowSelection).toEqual({ b: true, a: true });
    expect(result.current.getState().columnVisibility).toEqual({ name: false, another: false });
    expect(onRowSelectionChange.mock.calls).toEqual([[{ b: true }], [{ b: true, a: true }]]);
  });

  it('updates virtual selection eligibility when only the predicate or feature changes', () => {
    const eligibleColumns: ColumnDef<Item, unknown>[] = [
      {
        id: 'choice',
        cell: ({ row }) => (
          <button disabled={!row.getCanSelect()}>Select {row.original.name}</button>
        ),
      },
    ];
    function EligibilityTable({ allowed, enabled }: { allowed: boolean; enabled: boolean }) {
      const table = useDataTable({
        data,
        columns: eligibleColumns,
        getRowId: (row) => row.id,
        features: { rowSelection: enabled ? 'multi' : false },
        getRowCanSelect: () => allowed,
      });
      return (
        <DataTable.Root table={table}>
          <DataTable.Container>
            <DataTable.VirtualBody<Item> fixedRowHeight estimateRowSize={32} />
          </DataTable.Container>
        </DataTable.Root>
      );
    }
    const { rerender } = renderWithTheme(<EligibilityTable allowed={false} enabled />);
    expect(screen.getByRole('button', { name: 'Select Beta' })).toBeDisabled();
    rerender(<EligibilityTable allowed enabled />);
    expect(screen.getByRole('button', { name: 'Select Beta' })).toBeEnabled();
    rerender(<EligibilityTable allowed enabled={false} />);
    expect(screen.getByRole('button', { name: 'Select Beta' })).toBeDisabled();
  });

  it('emits controlled edits without changing state until the host replaces it', () => {
    const onExpandedChange = vi.fn();
    const onGlobalFilterChange = vi.fn();
    const onColumnFiltersChange = vi.fn();
    const initial: Partial<TableState> = { expanded: {}, globalFilter: '', columnFilters: [] };
    const { result, rerender } = renderHook(
      ({ state }) =>
        useDataTable({
          data,
          columns,
          state,
          features: { rowExpansion: true, globalFilter: true, filtering: true },
          getRowId: (row) => row.id,
          getRowCanExpand: () => true,
          onExpandedChange,
          onGlobalFilterChange,
          onColumnFiltersChange,
        }),
      { initialProps: { state: initial } },
    );
    act(() => {
      result.current.getRow('b').toggleExpanded();
      result.current.setGlobalFilter('Beta');
      result.current.getColumn('name')?.setFilterValue('Beta');
    });
    expect(onExpandedChange).toHaveBeenCalledWith({ b: true });
    expect(onGlobalFilterChange).toHaveBeenCalledWith('Beta');
    expect(onColumnFiltersChange).toHaveBeenCalledWith([{ id: 'name', value: 'Beta' }]);
    expect(result.current.getRow('b').getIsExpanded()).toBe(false);
    rerender({ state: { ...initial, expanded: { b: true } } });
    expect(result.current.getRow('b').getIsExpanded()).toBe(true);
  });

  it('keeps host group counts and member selection while prepared groups collapse and return', async () => {
    type Prepared = Item & { group: boolean; count?: number };
    const group: Prepared = { id: 'group', name: 'Placement 12', group: true, count: 17 };
    const members: Prepared[] = [{ id: 'member', name: 'Volume', group: false }];
    const preparedColumns: ColumnDef<Prepared, unknown>[] = [
      {
        id: 'content',
        cell: ({ row }) =>
          row.original.group ? (
            <button aria-expanded={row.getIsExpanded()} onClick={() => row.toggleExpanded()}>
              {row.original.name} ({row.original.count})
            </button>
          ) : (
            <button aria-pressed={row.getIsSelected()} onClick={() => row.toggleSelected()}>
              Select {row.original.name}
            </button>
          ),
      },
    ];
    function PreparedGroups() {
      const [expanded, setExpanded] = useState<ExpandedState>({ group: true });
      const table = useDataTable({
        data: expanded === true || expanded.group ? [group, ...members] : [group],
        columns: preparedColumns,
        getRowId: (row) => row.id,
        state: { expanded },
        onExpandedChange: setExpanded,
        features: { rowExpansion: true, rowSelection: 'multi' },
        getRowCanExpand: (row) => row.original.group,
        getRowCanSelect: (row) => !row.original.group,
        manualGrouping: true,
        manualExpanding: true,
      });
      return (
        <>
          <output>
            Selected: {Object.values(table.getState().rowSelection).filter(Boolean).length}
          </output>
          <DataTable.Root table={table}>
            <DataTable.Container>
              <DataTable.VirtualBody<Prepared> fixedRowHeight estimateRowSize={32} />
            </DataTable.Container>
          </DataTable.Root>
        </>
      );
    }
    renderWithTheme(<PreparedGroups />);
    await userEvent.click(screen.getByRole('button', { name: 'Select Volume' }));
    await userEvent.click(screen.getByRole('button', { name: 'Placement 12 (17)' }));
    expect(screen.queryByRole('button', { name: 'Select Volume' })).not.toBeInTheDocument();
    expect(screen.getByText('Selected: 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Placement 12 (17)' }));
    expect(screen.getByRole('button', { name: 'Select Volume' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

function Detail({ name, onLifetime }: { name: string; onLifetime: (mounted: boolean) => void }) {
  const [more, setMore] = useState(false);
  useEffect(() => {
    onLifetime(true);
    return () => onLifetime(false);
  }, [onLifetime]);
  return (
    <section aria-label={`Detail ${name}`}>
      <button onClick={() => setMore(true)}>Load details</button>
      {more && (
        <ul>
          <li>Asynchronously available detail</li>
          <li>Second line</li>
        </ul>
      )}
    </section>
  );
}

const interactiveColumns: ColumnDef<Item, unknown>[] = [
  {
    id: 'controls',
    cell: ({ row }) => (
      <>
        <button
          aria-label={`Expand ${row.original.name}`}
          aria-expanded={row.getIsExpanded()}
          onClick={() => row.toggleExpanded()}
        >
          Details
        </button>
        <button
          aria-label={`Select ${row.original.name}`}
          aria-pressed={row.getIsSelected()}
          onClick={() => row.toggleSelected()}
        >
          Select
        </button>
      </>
    ),
  },
  ...columns,
];

function InteractiveTable({
  items = data,
  onLifetime = () => {},
}: {
  items?: Item[];
  onLifetime?: (mounted: boolean) => void;
}) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const table = useDataTable({
    data: items,
    columns: interactiveColumns,
    getRowId: (row) => row.id,
    getRowCanExpand: () => true,
    features: { rowExpansion: true, rowSelection: 'multi' },
    state: { expanded },
    onExpandedChange: setExpanded,
  });
  return (
    <DataTable.Root table={table} features={{ rowExpansion: true }}>
      <DataTable.Container height={400}>
        <DataTable.VirtualBody<Item>
          fixedRowHeight
          estimateRowSize={32}
          renderExpandedRow={(item) => <Detail name={item.name} onLifetime={onLifetime} />}
        />
      </DataTable.Container>
    </DataTable.Root>
  );
}

describe('virtual arbitrary details', () => {
  it('operates with keyboard, updates cells not named select, and releases details on collapse', async () => {
    const user = userEvent.setup();
    const lifetime = vi.fn();
    renderWithTheme(<InteractiveTable onLifetime={lifetime} />);
    expect(screen.queryByRole('region', { name: 'Detail Beta' })).not.toBeInTheDocument();
    const expand = screen.getByRole('button', { name: 'Expand Beta' });
    expand.focus();
    await user.keyboard('{Enter}');
    expect(expand).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'Detail Beta' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Load details' }));
    expect(screen.getByText('Asynchronously available detail')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Select Beta' }));
    expect(screen.getByRole('button', { name: 'Select Beta' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(expand);
    expect(screen.queryByRole('region', { name: 'Detail Beta' })).not.toBeInTheDocument();
    expect(lifetime.mock.calls.map(([mounted]) => mounted)).toEqual([true, false]);
  });

  it('retains expanded identity across host reorder and immutable updates', () => {
    const { rerender } = renderWithTheme(<InteractiveTable />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand Beta' }));
    rerender(<InteractiveTable items={[data[1]!, { id: 'b', name: 'Beta patched' }]} />);
    expect(screen.getByRole('region', { name: 'Detail Beta patched' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand Beta patched' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const rows = screen.getAllByRole('row');
    expect(rows[0]).toHaveTextContent('Alpha');
    expect(rows[1]).toHaveTextContent('Beta patched');
    expect(rows[2]).toHaveTextContent('Load details');
  });

  it('bounds DOM, unmounts details offscreen, and restores expansion and patched data on return', async () => {
    const lifetime = vi.fn();
    const many = [
      data[0]!,
      ...Array.from({ length: 1000 }, (_, index) => ({
        id: `item-${index}`,
        name: `Item ${index}`,
      })),
    ];
    const { rerender } = renderWithTheme(<InteractiveTable items={many} onLifetime={lifetime} />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand Beta' }));
    expect(screen.getByRole('region', { name: 'Detail Beta' })).toBeInTheDocument();
    const scroller = screen.getByRole('table').parentElement!;
    fireEvent.scroll(scroller, { target: { scrollTop: 16000 } });
    await waitFor(() =>
      expect(screen.queryByRole('region', { name: 'Detail Beta' })).not.toBeInTheDocument(),
    );
    expect(screen.getAllByRole('row').length).toBeLessThan(50);
    rerender(
      <InteractiveTable
        items={[{ id: 'b', name: 'Beta offscreen patch' }, ...many.slice(1)]}
        onLifetime={lifetime}
      />,
    );
    fireEvent.scroll(scroller, { target: { scrollTop: 0 } });
    await waitFor(() =>
      expect(
        screen.getByRole('region', { name: 'Detail Beta offscreen patch' }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Expand Beta offscreen patch' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(lifetime.mock.calls.map(([mounted]) => mounted)).toEqual([true, false, true]);
  });
});
