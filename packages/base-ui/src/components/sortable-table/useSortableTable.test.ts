import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSortableTable } from './useSortableTable';
import type { SortableColumnDef } from './useSortableTable';

interface TestItem {
  id: string;
  name: string;
  size: number;
  date: string;
}

const items: TestItem[] = [
  { id: '1', name: 'banana', size: 200, date: '2026-01-02' },
  { id: '2', name: 'apple', size: 100, date: '2026-01-03' },
  { id: '3', name: 'cherry', size: 150, date: '2026-01-01' },
];

const columns: SortableColumnDef<TestItem>[] = [
  { id: 'name', header: 'Name', accessor: (i) => i.name },
  { id: 'size', header: 'Size', accessor: (i) => i.size },
  { id: 'date', header: 'Date', accessor: (i) => i.date },
];

describe('useSortableTable', () => {
  it('sorts ascending by default sort key', () => {
    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns,
        defaultSort: { key: 'name', direction: 'asc' },
      }),
    );

    expect(result.current.sortedData.map((i) => i.name)).toEqual([
      'apple', 'banana', 'cherry',
    ]);
    expect(result.current.sort).toEqual({ key: 'name', direction: 'asc' });
  });

  it('toggles direction when clicking same column', () => {
    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns,
        defaultSort: { key: 'name', direction: 'asc' },
      }),
    );

    act(() => result.current.onSort('name'));

    expect(result.current.sort.direction).toBe('desc');
    expect(result.current.sortedData.map((i) => i.name)).toEqual([
      'cherry', 'banana', 'apple',
    ]);
  });

  it('switches to ascending when clicking a different column', () => {
    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns,
        defaultSort: { key: 'name', direction: 'desc' },
      }),
    );

    act(() => result.current.onSort('size'));

    expect(result.current.sort).toEqual({ key: 'size', direction: 'asc' });
    expect(result.current.sortedData.map((i) => i.size)).toEqual([100, 150, 200]);
  });

  it('sorts numerically for number accessors', () => {
    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns,
        defaultSort: { key: 'size', direction: 'desc' },
      }),
    );

    expect(result.current.sortedData.map((i) => i.size)).toEqual([200, 150, 100]);
  });

  it('uses custom sortFn when provided', () => {
    const customColumns: SortableColumnDef<TestItem>[] = [
      {
        id: 'name',
        header: 'Name',
        accessor: (i) => i.name,
        sortFn: (a, b) => b.name.length - a.name.length,
      },
    ];

    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns: customColumns,
        defaultSort: { key: 'name', direction: 'asc' },
      }),
    );

    // 'cherry' (6) > 'banana' (6) > 'apple' (5) — custom sort by length
    expect(result.current.sortedData[2].name).toBe('apple');
  });

  it('sorts undefined values last', () => {
    const itemsWithUndefined = [
      ...items,
      { id: '4', name: 'date-less', size: 0, date: '' },
    ];
    const colsWithUndef: SortableColumnDef<typeof itemsWithUndefined[0]>[] = [
      { id: 'date', header: 'Date', accessor: (i) => i.date || undefined },
    ];

    const { result } = renderHook(() =>
      useSortableTable({
        data: itemsWithUndefined,
        columns: colsWithUndef,
        defaultSort: { key: 'date', direction: 'asc' },
      }),
    );

    expect(result.current.sortedData[result.current.sortedData.length - 1].id).toBe('4');
  });

  it('skips sorting for non-sortable columns', () => {
    const colsNonSortable: SortableColumnDef<TestItem>[] = [
      { id: 'name', header: 'Name', accessor: (i) => i.name, sortable: false },
    ];

    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns: colsNonSortable,
        defaultSort: { key: 'name', direction: 'asc' },
      }),
    );

    act(() => result.current.onSort('name'));

    expect(result.current.sort).toEqual({ key: 'name', direction: 'asc' });
  });

  it('defaults to first sortable column when no defaultSort given', () => {
    const { result } = renderHook(() =>
      useSortableTable({ data: items, columns }),
    );

    expect(result.current.sort.key).toBe('name');
    expect(result.current.sort.direction).toBe('asc');
  });
});
