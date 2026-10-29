import type {
  ColumnDef,
  Column,
  Row,
  ReactTable,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ColumnFiltersState,
  ExpandedState,
  GroupingState,
  PaginationState,
  RowSelectionState,
  SortingState,
  TableState,
  ColumnVisibilityState,
  RowData,
} from '@tanstack/react-table';
import type { dataTableFeatures } from './constants';

export type DataTableFeatures = typeof dataTableFeatures;
export type DataTableRow<TData extends RowData> = Row<DataTableFeatures, TData>;
export type DataTableColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<DataTableFeatures, TData, TValue>;
export type DataTableColumn<TData extends RowData, TValue = unknown> = Column<DataTableFeatures, TData, TValue>;
export type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>;

// ---------------------------------------------------------------------------
// Feature flags
// ---------------------------------------------------------------------------

export interface DataTableFeatureFlags {
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

export interface UseDataTableOptions<TData extends RowData> {
  data: TData[];
  columns: DataTableColumnDef<TData, unknown>[];
  features?: DataTableFeatureFlags;
  initialState?: Partial<TableState<DataTableFeatures>>;
  /** Controlled slices override internal state. Callbacks request host edits. */
  state?: Partial<TableState<DataTableFeatures>>;
  getRowId?: (row: TData, index: number) => string;
  getSubRows?: (row: TData) => TData[] | undefined;
  getRowCanExpand?: (row: { original: TData; depth: number }) => boolean;
  getRowCanSelect?: (row: { original: TData; depth: number }) => boolean;
  persistenceKey?: string;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onGlobalFilterChange?: (filter: string) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onGroupingChange?: (grouping: GroupingState) => void;
  onColumnVisibilityChange?: (visibility: ColumnVisibilityState) => void;
  onColumnOrderChange?: (order: ColumnOrderState) => void;
  onColumnSizingChange?: (sizing: ColumnSizingState) => void;
  onExpandedChange?: (expanded: ExpandedState) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;
  defaultColumn?: Partial<DataTableColumnDef<TData, unknown>>;
  meta?: Record<string, unknown>;
  enableMultiSort?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  /** Host-prepared groups/subrows are never regrouped in the browser. */
  manualGrouping?: boolean;
  manualExpanding?: boolean;
  rowCount?: number;
  pageCount?: number;
  globalFilterFn?: 'auto' | 'includesString' | 'includesStringSensitive';
}
