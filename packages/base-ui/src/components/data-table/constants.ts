import {
  tableFeatures,
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  columnGroupingFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnResizingFeature,
  rowSelectionFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  createSortedRowModel,
  createFilteredRowModel,
  createGroupedRowModel,
  createExpandedRowModel,
  createPaginatedRowModel,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  filterFn_arrIncludes,
  filterFn_equals,
  filterFn_inDateRange,
  filterFn_inNumberRange,
  filterFn_includesString,
  filterFn_includesStringSensitive,
  filterFn_weakEquals,
} from '@tanstack/react-table';
import type { DataTableFeatureFlags } from './types';

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  columnGroupingFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnResizingFeature,
  rowSelectionFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  filterFns: {
    arrIncludes: filterFn_arrIncludes,
    equals: filterFn_equals,
    inDateRange: filterFn_inDateRange,
    inNumberRange: filterFn_inNumberRange,
    includesString: filterFn_includesString,
    includesStringSensitive: filterFn_includesStringSensitive,
    weakEquals: filterFn_weakEquals,
  },
});

export const DEFAULT_FEATURES: DataTableFeatureFlags = {
  sorting: false,
  filtering: false,
  globalFilter: false,
  columnResizing: false,
  columnOrdering: false,
  columnPinning: false,
  columnVisibility: false,
  rowSelection: false,
  rowExpansion: false,
  pagination: false,
};

export const DEFAULT_COLUMN_MIN_SIZE = 40;
export const DEFAULT_COLUMN_MAX_SIZE = 800;
export const DEFAULT_ESTIMATE_ROW_SIZE = 36;
export const DEFAULT_OVERSCAN = 10;
export const DEFAULT_PAGE_SIZE = 50;

/**
 * Pre-computed row heights for each DataTable size variant.
 * Use with `fixedRowHeight` + `estimateRowSize` for optimal virtual scrolling.
 * These match the CSS `--ov-size-table-row-height-{size}` tokens.
 */
export const ROW_HEIGHT = {
  sm: 30,
  md: 36,
  lg: 44,
} as const;
