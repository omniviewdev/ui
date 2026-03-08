import type { HTMLAttributes, ReactNode } from 'react';
import type { ListRootProps, ListItemProps } from '../list';

export type SortDirection = 'ascending' | 'descending';

export interface ColumnDef {
  /** Unique column identifier, used for Cell matching and sort callbacks */
  id: string;
  /** Header label */
  header: ReactNode;
  /** CSS grid column width — e.g. '1fr', '120px', 'minmax(80px, 1fr)' */
  width?: string;
  /** Column content alignment */
  align?: 'start' | 'center' | 'end';
  /** Whether this column is sortable */
  sortable?: boolean;
}

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface RowListRootProps extends ListRootProps {
  /** Column definitions drive the grid layout and header rendering */
  columns: readonly ColumnDef[];
  /** Current sort state (visual only — consumer sorts data) */
  sortState?: SortState | null;
  /** Called when a sortable column header is clicked */
  onSortChange?: (sort: SortState) => void;
}

export type RowListItemProps = ListItemProps;

export interface RowListCellProps extends HTMLAttributes<HTMLDivElement> {
  /** Which column this cell belongs to (matches ColumnDef.id) */
  column: string;
  children?: ReactNode;
}

export interface RowListHeaderProps extends HTMLAttributes<HTMLDivElement> {}
