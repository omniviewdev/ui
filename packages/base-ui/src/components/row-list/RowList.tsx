import { createContext, forwardRef, useCallback, useContext, useMemo, type CSSProperties } from 'react';
import { LuArrowUp, LuArrowDown } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import { List } from '../list';
import type {
  ColumnDef,
  SortState,
  RowListRootProps,
  RowListItemProps,
  RowListCellProps,
  RowListHeaderProps,
} from './types';
import styles from './RowList.module.css';

// ---------------------------------------------------------------------------
// Internal context
// ---------------------------------------------------------------------------

interface RowListContextValue {
  columns: readonly ColumnDef[];
  columnMap: Map<string, number>;
  sortState?: SortState | null;
  onSortChange?: (sort: SortState) => void;
}

const RowListContext = createContext<RowListContextValue>({
  columns: [],
  columnMap: new Map(),
});

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const RowListRoot = forwardRef<HTMLDivElement, RowListRootProps>(function RowListRoot(
  { className, columns, sortState, onSortChange, style, ...props },
  ref,
) {
  const columnMap = useMemo(() => {
    const map = new Map<string, number>();
    columns.forEach((col, i) => map.set(col.id, i));
    return map;
  }, [columns]);

  const gridTemplate = columns.map((c) => c.width ?? '1fr').join(' ');

  const ctx = useMemo<RowListContextValue>(
    () => ({ columns, columnMap, sortState, onSortChange }),
    [columns, columnMap, sortState, onSortChange],
  );

  return (
    <RowListContext.Provider value={ctx}>
      <List.Root
        ref={ref}
        className={cn(styles.Root, className)}
        style={
          {
            '--_ov-row-grid-columns': gridTemplate,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      />
    </RowListContext.Provider>
  );
});

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

const RowListHeader = forwardRef<HTMLDivElement, RowListHeaderProps>(function RowListHeader(
  { className, ...props },
  ref,
) {
  const { columns, sortState, onSortChange } = useContext(RowListContext);

  const handleHeaderClick = useCallback(
    (col: ColumnDef) => {
      if (!col.sortable || !onSortChange) return;

      const nextDirection =
        sortState?.columnId === col.id && sortState.direction === 'ascending'
          ? 'descending'
          : 'ascending';

      onSortChange({ columnId: col.id, direction: nextDirection });
    },
    [sortState, onSortChange],
  );

  return (
    <div ref={ref} role="row" className={cn(styles.Header, className)} {...props}>
      {columns.map((col) => {
        const isSorted = sortState?.columnId === col.id;
        const ariaSortValue = isSorted ? sortState!.direction : undefined;
        const SortIconComponent = sortState?.direction === 'descending' ? LuArrowDown : LuArrowUp;

        return (
          <div
            key={col.id}
            role="columnheader"
            className={styles.HeaderCell}
            data-sortable={col.sortable ? '' : undefined}
            aria-sort={ariaSortValue}
            style={
              {
                '--_row-header-cell-justify': col.align ?? undefined,
              } as CSSProperties
            }
            onClick={col.sortable ? () => handleHeaderClick(col) : undefined}
          >
            {col.header}
            {col.sortable && isSorted && <SortIconComponent className={styles.SortIcon} />}
          </div>
        );
      })}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const RowListItem = forwardRef<HTMLDivElement, RowListItemProps>(function RowListItem(
  { className, ...props },
  ref,
) {
  return <List.Item ref={ref} className={cn(styles.Item, className)} {...props} />;
});

// ---------------------------------------------------------------------------
// Cell
// ---------------------------------------------------------------------------

const RowListCell = forwardRef<HTMLDivElement, RowListCellProps>(function RowListCell(
  { className, column, style, ...props },
  ref,
) {
  const { columnMap, columns } = useContext(RowListContext);
  const colIndex = columnMap.get(column);
  const colDef = colIndex != null ? columns[colIndex] : undefined;

  return (
    <div
      ref={ref}
      className={cn(styles.Cell, className)}
      style={
        {
          '--_row-cell-column': colIndex != null ? colIndex + 1 : undefined,
          '--_row-cell-justify': colDef?.align ?? undefined,
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
});

// ---------------------------------------------------------------------------
// Display names
// ---------------------------------------------------------------------------

RowListRoot.displayName = 'RowList';
RowListHeader.displayName = 'RowList.Header';
RowListItem.displayName = 'RowList.Item';
RowListCell.displayName = 'RowList.Cell';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type RowListCompound = typeof RowListRoot & {
  Root: typeof RowListRoot;
  Header: typeof RowListHeader;
  Viewport: typeof List.Viewport;
  Item: typeof RowListItem;
  Cell: typeof RowListCell;
  Group: typeof List.Group;
  GroupHeader: typeof List.GroupHeader;
  Separator: typeof List.Separator;
  Empty: typeof List.Empty;
  Loading: typeof List.Loading;
};

export const RowList = Object.assign(RowListRoot, {
  Root: RowListRoot,
  Header: RowListHeader,
  Viewport: List.Viewport,
  Item: RowListItem,
  Cell: RowListCell,
  Group: List.Group,
  GroupHeader: List.GroupHeader,
  Separator: List.Separator,
  Empty: List.Empty,
  Loading: List.Loading,
}) as RowListCompound;
