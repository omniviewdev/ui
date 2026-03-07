import type {
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  PaginationState,
  RowSelectionState,
  SortingState,
  TableState,
  VisibilityState,
} from '@tanstack/react-table';

// ---------------------------------------------------------------------------
// Feature flags
// ---------------------------------------------------------------------------

export interface DataTableFeatures {
  sorting?: boolean;
  filtering?: boolean;
  globalFilter?: boolean;
  columnResizing?: boolean;
  columnOrdering?: boolean;
  columnPinning?: boolean;
  columnVisibility?: boolean;
  rowSelection?: false | 'single' | 'multi';
  rowExpansion?: boolean;
  pagination?: boolean;
}

// ---------------------------------------------------------------------------
// useDataTable options
// ---------------------------------------------------------------------------

export interface UseDataTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  features?: DataTableFeatures;
  initialState?: Partial<TableState>;
  getRowId?: (row: TData, index: number) => string;
  getSubRows?: (row: TData) => TData[] | undefined;
  getRowCanExpand?: (row: { original: TData; depth: number }) => boolean;
  persistenceKey?: string;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  onColumnOrderChange?: (order: ColumnOrderState) => void;
  onColumnSizingChange?: (sizing: ColumnSizingState) => void;
  onExpandedChange?: (expanded: ExpandedState) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;
  defaultColumn?: Partial<ColumnDef<TData, unknown>>;
  meta?: Record<string, unknown>;
  enableMultiSort?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  pageCount?: number;
  globalFilterFn?: 'auto' | 'includesString' | 'includesStringSensitive';
}

