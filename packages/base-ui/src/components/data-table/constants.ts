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
