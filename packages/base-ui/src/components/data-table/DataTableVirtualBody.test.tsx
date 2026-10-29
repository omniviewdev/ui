import { act, fireEvent, screen } from '@testing-library/react';
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
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 400 });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 800 });
  Object.defineProperty(Element.prototype, 'clientHeight', { configurable: true, get: () => 400 });
  Object.defineProperty(Element.prototype, 'clientWidth', { configurable: true, get: () => 800 });
});

afterAll(() => {
  if (originalOffsetHeight) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
  if (originalOffsetWidth) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
  if (originalClientHeight) Object.defineProperty(Element.prototype, 'clientHeight', originalClientHeight);
  if (originalClientWidth) Object.defineProperty(Element.prototype, 'clientWidth', originalClientWidth);
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

function PodTable(bodyProps: DataTableVirtualBodyProps<Pod>) {
  const [pods, _setPods] = useState(initialPods);
  setPods = _setPods;
  const table = useDataTable({
    data: pods,
    columns,
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
});
