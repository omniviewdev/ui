import {
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createAdaptiveSortedRowModel } from './createAdaptiveSortedRowModel';

interface Item { id: string; name: string; score: number }
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createAdaptiveSortedRowModel(),
});
const columns: ColumnDef<typeof features, Item>[] = [
  { accessorKey: 'name', sortFn: sortFn_alphanumeric },
  { accessorKey: 'score', sortFn: (a, b) => a.original.score - b.original.score },
];
const source: Item[] = [
  { id: 'a', name: 'pod-10', score: 1 },
  { id: 'b', name: 'pod-2', score: 1 },
  { id: 'c', name: 'pod-1', score: 2 },
];
function make(data = source, sorting: SortingState = [{ id: 'name', desc: false }]) {
  const { result, rerender } = renderHook(
    ({ data, enabled }) => useTable({
      features, columns, data, getRowId: (row) => row.id,
      enableSorting: enabled, initialState: { sorting },
    }),
    { initialProps: { data, enabled: true } },
  );
  return {
    model: () => result.current.getRowModel(),
    setData: (data: Item[], enabled = true) => rerender({ data, enabled }),
    setSorting: (sorting: SortingState) => act(() => result.current.setSorting(sorting)),
  };
}
const ids = (table: ReturnType<typeof make>) => table.model().rows.map((row) => row.id);

describe('adaptive sorted input', () => {
  it('uses current rows after updates, removals and recreated identities', () => {
    const table = make();
    expect(ids(table)).toEqual(['c', 'b', 'a']);
    const updated = { ...source[0]!, score: 9 };
    const next = [updated, { id: 'b-new', name: 'pod-2', score: 3 }, { id: 'd', name: 'pod-3', score: 4 }];
    table.setData(next);
    expect(ids(table)).toEqual(['b-new', 'd', 'a']);
    expect(table.model().rowsById.a!.original).toBe(updated);
    expect(table.model().rowsById.b).toBeUndefined();
    expect(table.model().rowsById.c).toBeUndefined();
    table.setData([{ ...updated, name: 'pod-0' }, ...next.slice(1)]);
    expect(ids(table)).toEqual(['a', 'b-new', 'd']);
  });

  it('restores source order when sorting is cleared or no selected column can sort', () => {
    const table = make();
    expect(ids(table)).toEqual(['c', 'b', 'a']);
    table.setSorting([]);
    expect(ids(table)).toEqual(['a', 'b', 'c']);
    table.setSorting([{ id: 'name', desc: true }]);
    expect(ids(table)).toEqual(['a', 'b', 'c']);
    table.setData([source[1]!, source[2]!, source[0]!], false);
    expect(ids(table)).toEqual(['b', 'c', 'a']);
  });

  it('preserves multi-sort, custom comparators and source-index tie ordering', () => {
    const table = make(source, [{ id: 'score', desc: false }, { id: 'name', desc: false }]);
    expect(ids(table)).toEqual(['b', 'a', 'c']);
    table.setData([source[2]!, source[0]!, source[1]!]);
    table.setSorting([{ id: 'score', desc: false }]);
    expect(ids(table)).toEqual(['a', 'b', 'c']);
    table.setData([source[1]!, source[0]!, source[2]!]);
    expect(ids(table)).toEqual(['b', 'a', 'c']);
  });

  it('does not carry rows between table instances or disjoint replacements', () => {
    const first = make();
    const other = [{ id: 'a', name: 'pod-0', score: 7 }, { id: 'b', name: 'pod-20', score: 8 }];
    const second = make(other);
    expect(ids(first)).toEqual(['c', 'b', 'a']);
    expect(ids(second)).toEqual(['a', 'b']);
    expect(second.model().rows[0]!.original).toBe(other[0]);
    const replacement = [{ id: 'z', name: 'pod-30', score: 0 }];
    first.setData(replacement);
    expect(ids(first)).toEqual(['z']);
    expect(first.model().rows[0]!.original).toBe(replacement[0]);
    expect(ids(second)).toEqual(['a', 'b']);
  });
});
