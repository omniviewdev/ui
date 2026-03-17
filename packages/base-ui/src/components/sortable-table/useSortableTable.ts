import { useMemo, useState, useCallback, type ReactNode } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface SortableColumnDef<T> {
  id: string;
  header: ReactNode;
  accessor: (item: T) => string | number | Date | undefined;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
}

export interface UseSortableTableOptions<T> {
  data: T[];
  defaultSort?: SortConfig;
  columns: SortableColumnDef<T>[];
}

export interface UseSortableTableReturn<T> {
  sortedData: T[];
  sort: SortConfig;
  onSort: (columnId: string) => void;
  columns: SortableColumnDef<T>[];
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b));
}

export function useSortableTable<T>(
  options: UseSortableTableOptions<T>,
): UseSortableTableReturn<T> {
  const { data, columns, defaultSort } = options;

  const firstSortable = columns.find((c) => c.sortable !== false);
  const initialSort: SortConfig = defaultSort ?? {
    key: firstSortable?.id ?? columns[0]?.id ?? '',
    direction: 'asc',
  };

  const [sort, setSort] = useState<SortConfig>(initialSort);

  const onSort = useCallback(
    (columnId: string) => {
      const col = columns.find((c) => c.id === columnId);
      if (!col || col.sortable === false) return;

      setSort((prev) => {
        if (prev.key === columnId) {
          return { key: columnId, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
        }
        return { key: columnId, direction: 'asc' };
      });
    },
    [columns],
  );

  const sortedData = useMemo(() => {
    const col = columns.find((c) => c.id === sort.key);
    if (!col) return data;

    const sorted = [...data].sort((a, b) => {
      if (col.sortFn) return col.sortFn(a, b);
      const va = col.accessor(a);
      const vb = col.accessor(b);
      return defaultCompare(va, vb);
    });

    if (sort.direction === 'desc') sorted.reverse();
    return sorted;
  }, [data, sort, columns]);

  return { sortedData, sort, onSort, columns };
}
