import type { ReactNode } from 'react';
import type {
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table,
  TableState,
  VisibilityState,
} from '@tanstack/react-table';
import type { StyledComponentProps } from '../../system/types';

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

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface DataTableRootProps extends StyledComponentProps {
  table: Table<unknown>;
  children: ReactNode;
  className?: string;
  stickyHeader?: boolean;
  hoverable?: boolean;
  striped?: boolean;
}

export interface DataTableContainerProps {
  children: ReactNode;
  className?: string;
  height?: number | string;
  maxHeight?: number | string;
}

export interface DataTableHeaderProps {
  className?: string;
}

export interface DataTableHeaderCellProps {
  className?: string;
}

export interface DataTableBodyProps {
  className?: string;
}

export interface DataTableVirtualBodyProps {
  className?: string;
  estimateRowSize?: number;
  overscan?: number;
}

export interface DataTableRowProps {
  className?: string;
  children: ReactNode;
}

export interface DataTableCellProps {
  className?: string;
  children?: ReactNode;
}

export interface DataTableExpandedRowProps {
  className?: string;
  children: (parentRow: unknown) => ReactNode;
  colSpan?: number;
}

export interface DataTableFooterProps {
  className?: string;
}

export interface DataTablePaginationProps {
  className?: string;
}

export interface DataTableToolbarProps {
  className?: string;
  children?: ReactNode;
}

export interface DataTableColumnVisibilityProps {
  className?: string;
}

export interface DataTableEmptyProps {
  className?: string;
  children?: ReactNode;
  icon?: ReactNode;
  title?: string;
  description?: string;
}

export interface DataTableLoadingProps {
  className?: string;
  rows?: number;
}
