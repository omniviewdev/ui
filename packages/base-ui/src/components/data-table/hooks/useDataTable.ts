import { useRef, useState } from 'react';
import {
  useTable,
  functionalUpdate,
  type TableState,
  type Updater,
  type RowData,
} from '@tanstack/react-table';
import type { DataTableFeatures, DataTableInstance, UseDataTableOptions } from '../types';
import {
  dataTableFeatures,
  DEFAULT_COLUMN_MAX_SIZE,
  DEFAULT_COLUMN_MIN_SIZE,
  DEFAULT_FEATURES,
  DEFAULT_PAGE_SIZE,
} from '../constants';

type DataTableState = TableState<DataTableFeatures>;

export function useDataTable<TData extends RowData = RowData>(options: UseDataTableOptions<TData>): DataTableInstance<TData> {
  const features = { ...DEFAULT_FEATURES, ...options.features };
  const [internalState, setInternalState] = useState<Partial<DataTableState>>(() => ({
    sorting: [],
    grouping: [],
    globalFilter: '',
    columnFilters: [],
    columnVisibility: {},
    columnOrder: [],
    columnSizing: {},
    columnPinning: { start: [], end: [] },
    rowSelection: {},
    expanded: {},
    pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
    ...options.initialState,
  }));
  const pendingState = useRef(internalState);

  // Notify outside a state updater: React may replay updaters in Strict Mode.
  // Controlled edits never mutate local state or optimistically alter host order.
  function change<K extends keyof DataTableState>(
    key: K,
    updater: Updater<DataTableState[K]>,
    notify?: (value: DataTableState[K]) => void,
  ) {
    const controlled = options.state?.[key] !== undefined;
    const current =
      !controlled && Object.hasOwn(pendingState.current, key)
        ? (pendingState.current[key] as DataTableState[K])
        : table.atoms[key].get();
    const next = functionalUpdate(updater, current);
    if (!controlled) {
      // Advance synchronously so batched edits compose before React rerenders.
      pendingState.current = { ...pendingState.current, [key]: next };
      setInternalState(pendingState.current);
    }
    notify?.(next);
  }

  const table = useTable<DataTableFeatures, TData>({
    features: dataTableFeatures,
    data: options.data,
    columns: options.columns,
    initialState: options.initialState,
    defaultColumn: {
      minSize: DEFAULT_COLUMN_MIN_SIZE,
      maxSize: DEFAULT_COLUMN_MAX_SIZE,
      ...options.defaultColumn,
    },
    state: { ...internalState, ...options.state },
    getRowId: options.getRowId,
    getSubRows: features.rowExpansion ? options.getSubRows : undefined,
    getRowCanExpand: features.rowExpansion ? options.getRowCanExpand : undefined,
    meta: options.meta,
    enableSorting: !!features.sorting,
    enableMultiSort: options.enableMultiSort ?? false,
    enableFilters: !!(features.filtering || features.globalFilter),
    enableGlobalFilter: !!features.globalFilter,
    globalFilterFn: options.globalFilterFn ?? 'auto',
    columnResizeMode: features.columnResizing ? 'onChange' : undefined,
    enableRowSelection:
      features.rowSelection === 'multi' || features.rowSelection === 'single'
        ? (options.getRowCanSelect ?? true)
        : false,
    enableMultiRowSelection: features.rowSelection === 'multi',
    enableRowRangeSelection: false,
    manualSorting: options.manualSorting || !features.sorting,
    manualFiltering: options.manualFiltering || !(features.filtering || features.globalFilter),
    manualPagination: options.manualPagination || !features.pagination,
    manualGrouping: options.manualGrouping,
    manualExpanding: options.manualExpanding || !features.rowExpansion,
    pageCount: options.pageCount,
    rowCount: options.rowCount,
    // Stable keyed expansion/selection survive immutable host patches/reorders.
    autoResetExpanded: false,
    onSortingChange: (updater) => change('sorting', updater, options.onSortingChange),
    onGroupingChange: (updater) => change('grouping', updater, options.onGroupingChange),
    onGlobalFilterChange: (updater) =>
      change('globalFilter', updater, options.onGlobalFilterChange),
    onColumnFiltersChange: (updater) =>
      change('columnFilters', updater, options.onColumnFiltersChange),
    onColumnSizingChange: (updater) =>
      change('columnSizing', updater, options.onColumnSizingChange),
    onColumnVisibilityChange: (updater) =>
      change('columnVisibility', updater, options.onColumnVisibilityChange),
    onColumnOrderChange: (updater) => change('columnOrder', updater, options.onColumnOrderChange),
    onColumnPinningChange: (updater) =>
      change('columnPinning', updater, options.onColumnPinningChange),
    onRowSelectionChange: (updater) =>
      change('rowSelection', updater, options.onRowSelectionChange),
    onExpandedChange: (updater) => change('expanded', updater, options.onExpandedChange),
    onPaginationChange: (updater) => change('pagination', updater, options.onPaginationChange),
  });

  return table;
}
