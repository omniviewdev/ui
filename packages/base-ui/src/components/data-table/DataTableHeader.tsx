import { forwardRef, type HTMLAttributes } from 'react';
import { flexRender } from '@tanstack/react-table';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import { getPinningStyles } from './utils/getPinningStyles';
import { getHeaderSizeStyles } from './utils/getCellSizeStyles';
import styles from './DataTable.module.css';

export type DataTableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

export const DataTableHeader = forwardRef<HTMLTableSectionElement, DataTableHeaderProps>(
  function DataTableHeader({ className, ...props }, ref) {
    const { table, features } = useDataTableContext();
    const isResizing = table.getState().columnSizingInfo.isResizingColumn;

    return (
      <thead ref={ref} className={cn(styles.Header, className)} {...props}>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className={styles.HeaderRow}>
            {headerGroup.headers.map((header) => {
              const canSort = features.sorting && header.column.getCanSort();
              const sorted = header.column.getIsSorted();
              const canResize = features.columnResizing && header.column.getCanResize();
              const pinningStyles = getPinningStyles(header.column);
              const sizeStyles = getHeaderSizeStyles(header.id, header.column);
              const meta = header.column.columnDef.meta as Record<string, unknown> | undefined;
              const align = meta?.align as string | undefined;

              const ariaSortValue =
                sorted === 'asc'
                  ? ('ascending' as const)
                  : sorted === 'desc'
                    ? ('descending' as const)
                    : undefined;

              const sortAriaLabel =
                (typeof meta?.sortAriaLabel === 'string' ? meta.sortAriaLabel : undefined) ??
                (typeof header.column.columnDef.header === 'string'
                  ? header.column.columnDef.header
                  : undefined);

              if (process.env.NODE_ENV !== 'production' && canSort && !sortAriaLabel) {
                console.warn(
                  `DataTable: sortable column "${header.column.id}" has a non-string header ` +
                  `but no meta.sortAriaLabel — the sort button will lack an accessible name.`,
                );
              }

              return (
                <th
                  key={header.id}
                  className={styles.HeaderCell}
                  style={{
                    ...sizeStyles,
                    ...pinningStyles,
                  }}
                  aria-sort={ariaSortValue}
                  data-ov-sortable={canSort ? 'true' : 'false'}
                  data-ov-pinned={header.column.getIsPinned() || undefined}
                  data-ov-align={align}
                >
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      type="button"
                      className={styles.SortButton}
                      onClick={header.column.getToggleSortingHandler()}
                      aria-label={sortAriaLabel ? `Sort by ${sortAriaLabel}` : undefined}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}

                      {/* Intentional: only render the sort indicator when actively sorted.
                          Sortable-but-unsorted columns rely on the cursor/hover style
                          (via data-ov-sortable) rather than a persistent muted glyph,
                          keeping the header row visually clean. */}
                      {sorted && (
                        <span className={styles.SortIndicator} data-ov-active="true">
                          {sorted === 'asc' ? '\u2191' : '\u2193'}
                        </span>
                      )}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}

                  {canResize && (
                    <div
                      role="separator"
                      aria-orientation="vertical"
                      tabIndex={0}
                      className={styles.ResizeHandle}
                      data-ov-resizing={isResizing === header.column.id ? 'true' : 'false'}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      onDoubleClick={() => header.column.resetSize()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') header.column.resetSize();
                      }}
                    />
                  )}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
    );
  },
);

DataTableHeader.displayName = 'DataTable.Header';
