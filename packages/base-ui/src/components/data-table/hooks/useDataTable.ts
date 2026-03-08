import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ExpandedState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table,
  type VisibilityState,
} from '@tanstack/react-table';
import type { UseDataTableOptions } from '../types';
import {
  DEFAULT_COLUMN_MAX_SIZE,
  DEFAULT_COLUMN_MIN_SIZE,
  DEFAULT_FEATURES,
  DEFAULT_PAGE_SIZE,
} from '../constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDataTable<TData = any>(options: UseDataTableOptions<TData>): Table<TData> {
  const {
    data,
    columns,
    features: featuresProp,
    initialState,
    getRowId,
    getSubRows,
    onRowSelectionChange: onRowSelectionChangeProp,
    onSortingChange: onSortingChangeProp,
    onColumnVisibilityChange: onColumnVisibilityChangeProp,
    onColumnOrderChange: onColumnOrderChangeProp,
    onColumnSizingChange: onColumnSizingChangeProp,
    onExpandedChange: onExpandedChangeProp,
    onPaginationChange: onPaginationChangeProp,
    onColumnPinningChange: onColumnPinningChangeProp,
    getRowCanExpand,
    defaultColumn,
    meta,
    enableMultiSort = false,
    manualSorting = false,
    manualFiltering = false,
    manualPagination = false,
    pageCount,
    globalFilterFn = 'auto',
  } = options;

  const features = { ...DEFAULT_FEATURES, ...featuresProp };

  // Internal state
  const [sorting, setSorting] = useState<SortingState>(initialState?.sorting ?? []);
  const [globalFilter, setGlobalFilter] = useState<string>(
    (initialState?.globalFilter as string) ?? '',
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialState?.columnVisibility ?? {},
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialState?.columnOrder ?? []);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(
    initialState?.columnSizing ?? {},
  );
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    initialState?.columnPinning ?? {},
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialState?.rowSelection ?? {},
  );
  const [expanded, setExpanded] = useState<ExpandedState>(initialState?.expanded ?? {});
  const [pagination, setPagination] = useState<PaginationState>(
    initialState?.pagination ?? { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
  );

  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      minSize: DEFAULT_COLUMN_MIN_SIZE,
      maxSize: DEFAULT_COLUMN_MAX_SIZE,
      ...defaultColumn,
    },
    state: {
      sorting,
      globalFilter: features.globalFilter ? globalFilter : undefined,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
      rowSelection,
      expanded,
      pagination: features.pagination ? pagination : undefined,
    },
    getRowId,
    getSubRows: features.rowExpansion ? getSubRows : undefined,
    getRowCanExpand: features.rowExpansion ? getRowCanExpand : undefined,
    meta,

    // Sorting
    enableSorting: !!features.sorting,
    enableMultiSort,
    manualSorting,
    onSortingChange: (updater) => {
      setSorting((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        onSortingChangeProp?.(next);
        return next;
      });
    },

    // Filtering
    enableFilters: !!features.filtering,
    manualFiltering,
    enableGlobalFilter: !!features.globalFilter,
    globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,

    // Column sizing
    columnResizeMode: features.columnResizing ? 'onChange' : undefined,
    onColumnSizingChange: (updater) => {
      setColumnSizing((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        onColumnSizingChangeProp?.(next);
        return next;
      });
    },

    // Column visibility
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        onColumnVisibilityChangeProp?.(next);
        return next;
      });
    },

    // Column ordering
    onColumnOrderChange: (updater) => {
      setColumnOrder((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        onColumnOrderChangeProp?.(next);
        return next;
      });
    },

    // Column pinning
    onColumnPinningChange: (updater) => {
      setColumnPinning((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        onColumnPinningChangeProp?.(next);
        return next;
      });
    },

    // Row selection
    enableRowSelection: features.rowSelection === 'multi' || features.rowSelection === 'single',
    enableMultiRowSelection: features.rowSelection === 'multi',
    onRowSelectionChange: (updater) => {
      setRowSelection((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        onRowSelectionChangeProp?.(next);
        return next;
      });
    },

    // Expansion
    onExpandedChange: (updater) => {
      setExpanded((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        onExpandedChangeProp?.(next);
        return next;
      });
    },

    // Pagination
    manualPagination,
    pageCount,
    onPaginationChange: (updater) => {
      setPagination((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        onPaginationChangeProp?.(next);
        return next;
      });
    },

    // Row models - conditionally enabled
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: features.sorting ? getSortedRowModel() : undefined,
    getFilteredRowModel:
      features.filtering || features.globalFilter ? getFilteredRowModel() : undefined,
    getPaginationRowModel: features.pagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: features.rowExpansion ? getExpandedRowModel() : undefined,
  });

  return table;
}
