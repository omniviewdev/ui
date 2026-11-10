import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import type { DataTableColumnDef as ColumnDef } from './types';
import { renderWithTheme } from '../../test/render';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import type { DataTableVirtualBodyProps } from './DataTableVirtualBody';

// jsdom has no layout, so the virtualizer would see a 0px viewport and render
// nothing. Give every element a fixed size so a handful of rows are visible.
const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
const originalClientHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight');
const originalClientWidth = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth');

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get: () => 400,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => 800,
  });
  Object.defineProperty(Element.prototype, 'clientHeight', { configurable: true, get: () => 400 });
  Object.defineProperty(Element.prototype, 'clientWidth', { configurable: true, get: () => 800 });
});

afterAll(() => {
  if (originalOffsetHeight)
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
  if (originalOffsetWidth)
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
  if (originalClientHeight)
    Object.defineProperty(Element.prototype, 'clientHeight', originalClientHeight);
  if (originalClientWidth)
    Object.defineProperty(Element.prototype, 'clientWidth', originalClientWidth);
});

interface Pod {
  uid: string;
  name: string;
  phase: string;
}

const pod0: Pod = { uid: 'a', name: 'api-0', phase: 'Pending' };
const pod1: Pod = { uid: 'b', name: 'api-1', phase: 'Running' };
const initialPods: Pod[] = [pod0, pod1];

const columns: ColumnDef<Pod, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'phase', header: 'Phase' },
];

let setPods: (pods: Pod[]) => void = () => {};

function PodTable({ columns: columnDefs = columns, ...bodyProps }: DataTableVirtualBodyProps<Pod> & {
  columns?: ColumnDef<Pod, unknown>[];
}) {
  const [pods, _setPods] = useState(initialPods);
  setPods = _setPods;
  const table = useDataTable({
    data: pods,
    columns: columnDefs,
    getRowId: (row) => row.uid,
  });

  return (
    <DataTable.Root table={table}>
      <DataTable.Container>
        <DataTable.Header />
        <DataTable.VirtualBody<Pod> fixedRowHeight estimateRowSize={32} {...bodyProps} />
      </DataTable.Container>
    </DataTable.Root>
  );
}

describe('DataTable.VirtualBody', () => {
  it('re-renders cells when a row is updated in place with a stable row id', async () => {
    renderWithTheme(<PodTable />);
    expect(screen.getByText('Pending')).toBeInTheDocument();

    await act(async () => {
      setPods([{ ...pod0, phase: 'Running' }, pod1]);
    });

    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
    expect(screen.getAllByText('Running')).toHaveLength(2);
  });

  it('keeps editor state and focus with its record when fixed-height slots reorder', async () => {
    const editableColumns: ColumnDef<Pod, unknown>[] = [{
      accessorKey: 'name',
      cell: (cell) => (
        <input aria-label={`Edit ${cell.row.original.uid}`} defaultValue={cell.getValue<string>()} />
      ),
    }];
    function EditableTable() {
      const [pods, updatePods] = useState(initialPods);
      setPods = updatePods;
      const table = useDataTable({
        data: pods,
        columns: editableColumns,
        getRowId: (row) => row.uid,
      });
      return (
        <DataTable.Root table={table}>
          <DataTable.Container>
            <DataTable.VirtualBody fixedRowHeight estimateRowSize={32} />
          </DataTable.Container>
        </DataTable.Root>
      );
    }
    renderWithTheme(<EditableTable />);
    const editor = screen.getByRole('textbox', { name: 'Edit a' });
    fireEvent.change(editor, { target: { value: 'unsaved edit' } });
    editor.focus();

    await act(async () => setPods([pod1, { ...pod0, phase: 'Running' }]));

    expect(screen.getByRole('textbox', { name: 'Edit a' })).toBe(editor);
    expect(editor).toHaveValue('unsaved edit');
    expect(editor).toHaveFocus();
    expect(screen.getByRole('textbox', { name: 'Edit b' })).toHaveValue('api-1');

    await act(async () => setPods([pod1, { ...pod0, uid: 'replacement' }]));

    expect(screen.queryByRole('textbox', { name: 'Edit a' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Edit replacement' })).toHaveValue('api-0');
  });

  it('updates index-based cells when the same records reorder', async () => {
    const indexColumns: ColumnDef<Pod, unknown>[] = [{
      accessorKey: 'name',
      meta: { dataTableCellDependencies: 'data' },
      cell: ({ row }) => `${row.original.name}: ${row.index}`,
    }];
    renderWithTheme(<PodTable columns={indexColumns} />);

    await act(async () => setPods([pod1, pod0]));

    expect(screen.getByText('api-1: 0')).toBeInTheDocument();
    expect(screen.getByText('api-0: 1')).toBeInTheDocument();
  });

  it('keeps the viewport covered when a fixed row height changes', async () => {
    const { rerender } = renderWithTheme(<PodTable estimateRowSize={32} overscan={2} />);
    await act(async () => setPods(Array.from({ length: 100 }, (_, index) => ({
      uid: `p${index}`, name: `pod-${index}`, phase: 'Running',
    }))));
    fireEvent.scroll(screen.getByRole('table').parentElement!, {
      target: { scrollTop: 32 * 60 },
    });
    await waitFor(() => expect(screen.getByText('pod-60')).toBeInTheDocument());

    rerender(<PodTable estimateRowSize={64} overscan={2} />);

    await waitFor(() => {
      expect(screen.getByText('pod-30')).toBeInTheDocument();
      expect(screen.queryByText('pod-60')).not.toBeInTheDocument();
    });
  });

  it('re-renders cells when the cell renderer changes', () => {
    function Table({ suffix }: { suffix: string }) {
      const table = useDataTable({
        data: initialPods,
        columns: [{ accessorKey: 'name', header: 'Name', cell: (c) => `${c.getValue()}${suffix}` }],
        getRowId: (row) => row.uid,
      });
      return (
        <DataTable.Root table={table}>
          <DataTable.Container>
            <DataTable.VirtualBody fixedRowHeight estimateRowSize={32} />
          </DataTable.Container>
        </DataTable.Root>
      );
    }

    const { rerender } = renderWithTheme(<Table suffix="" />);
    expect(screen.getByText('api-0')).toBeInTheDocument();
    rerender(<Table suffix="!" />);
    expect(screen.getByText('api-0!')).toBeInTheDocument();
  });

  it('calls onRowClick with the clicked row', () => {
    const onRowClick = vi.fn();
    renderWithTheme(<PodTable onRowClick={onRowClick} />);

    fireEvent.click(screen.getByText('api-1'));

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0]?.[0].original).toEqual(pod1);
  });

  it('applies getRowProps to each row and keeps internal positioning', () => {
    const onClick = vi.fn();
    const onRowClick = vi.fn();
    renderWithTheme(
      <PodTable
        onRowClick={onRowClick}
        getRowProps={(row) => ({
          className: 'custom-row',
          'aria-label': `pod ${row.original.name}`,
          style: { cursor: 'pointer', position: 'static' },
          onClick,
        })}
      />,
    );

    const row = screen.getByLabelText('pod api-0');
    expect(row).toHaveClass('custom-row');
    expect(row.style.cursor).toBe('pointer');

    fireEvent.click(row);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it('keeps the scrolled viewport covered when measured rows become fixed-height rows', async () => {
    const { rerender } = renderWithTheme(<PodTable fixedRowHeight={false} overscan={2} />);
    await act(async () => {
      setPods(
        Array.from({ length: 100 }, (_, index) => ({
          uid: `p${index}`,
          name: `pod-${index}`,
          phase: 'Running',
        })),
      );
    });
    await waitFor(() => {
      expect(screen.getByText('pod-0')).toBeInTheDocument();
      expect(screen.queryByText('pod-10')).not.toBeInTheDocument();
    });

    rerender(<PodTable fixedRowHeight overscan={2} />);
    fireEvent.scroll(screen.getByRole('table').parentElement!, {
      target: { scrollTop: 32 * 50 },
    });

    await waitFor(() => expect(screen.getByText('pod-50')).toBeInTheDocument());
  });

  describe('slot keys and stripes', () => {
    function ExpandableTable({
      items = initialPods,
      expandAll = false,
      withDetails = true,
      striped = false,
      overscan,
    }: {
      items?: Pod[];
      expandAll?: boolean;
      withDetails?: boolean;
      striped?: boolean;
      overscan?: number;
    }) {
      const table = useDataTable({
        data: items,
        columns,
        getRowId: (row) => row.uid,
        features: { rowExpansion: true },
        getRowCanExpand: () => true,
        initialState: expandAll ? { expanded: true } : undefined,
      });
      return (
        <DataTable.Root table={table} features={{ rowExpansion: true }} striped={striped}>
          <DataTable.Container>
            <DataTable.VirtualBody<Pod>
              fixedRowHeight
              estimateRowSize={32}
              overscan={overscan}
              renderExpandedRow={
                withDetails ? (pod) => <span>detail of {pod.name}</span> : undefined
              }
            />
          </DataTable.Container>
        </DataTable.Root>
      );
    }

    it('keeps rows and details distinct for ids that resemble internal item keys', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const items = ['x', 'r:x', 'd:x'].map((uid) => ({
        uid,
        name: `pod ${uid}`,
        phase: 'Running',
      }));

      try {
        const { container } = renderWithTheme(<ExpandableTable items={items} expandAll />);

        expect(container.querySelectorAll('tr[data-ov-row-id]')).toHaveLength(3);
        expect(
          [...container.querySelectorAll('[data-ov-detail-for]')].map((row) =>
            row.getAttribute('data-ov-detail-for'),
          ),
        ).toEqual(['x', 'r:x', 'd:x']);
        expect(error.mock.calls.some(([message]) => String(message).includes('same key'))).toBe(
          false,
        );
      } finally {
        error.mockRestore();
      }
    });

    it('keeps mounted rows when expandable details are enabled', () => {
      const { rerender } = renderWithTheme(<ExpandableTable withDetails={false} />);
      const row = screen.getByText('api-0').closest('tr');

      rerender(<ExpandableTable withDetails />);

      expect(screen.getByText('api-0').closest('tr')).toBe(row);
    });

    it('stripes rows by their order, not their position in the mounted window', async () => {
      const many = Array.from({ length: 200 }, (_, index) => ({
        uid: `p${index}`,
        name: `pod-${index}`,
        phase: 'Running',
      }));
      const { container } = renderWithTheme(
        <ExpandableTable items={many} withDetails={false} striped overscan={3} />,
      );

      fireEvent.scroll(screen.getByRole('table').parentElement!, {
        target: { scrollTop: 32 * 50 },
      });

      await waitFor(() => expect(container.querySelector('tr[data-index="47"]')).not.toBeNull());
      const rows = [...container.querySelectorAll<HTMLElement>('tbody tr[data-index]')];
      expect(rows.length).toBeGreaterThan(2);
      for (const row of rows) {
        expect(row.hasAttribute('data-ov-stripe')).toBe(Number(row.dataset.index) % 2 === 1);
      }
    });

    it('keeps stripe order while expanded details sit between rows', () => {
      const { container } = renderWithTheme(<ExpandableTable striped expandAll />);

      expect(
        [...container.querySelectorAll('tr[data-ov-row-id]')].map((row) =>
          row.hasAttribute('data-ov-stripe'),
        ),
      ).toEqual([false, true]);
    });
  });
});
