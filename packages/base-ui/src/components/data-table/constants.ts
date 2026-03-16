import type { DataTableFeatures } from './types';

export const DEFAULT_FEATURES: DataTableFeatures = {
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
