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

              return (
                <th
                  key={header.id}
                  className={styles.HeaderCell}
                  style={{
                    ...sizeStyles,
                    ...pinningStyles,
                  }}
                  data-ov-sortable={canSort ? 'true' : 'false'}
                  data-ov-pinned={header.column.getIsPinned() || undefined}
                  data-ov-align={align}
                  onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}

                  {canSort && sorted && (
                    <span
                      className={styles.SortIndicator}
                      data-ov-active="true"
                    >
                      {sorted === 'asc' ? '\u2191' : '\u2193'}
                    </span>
                  )}

                  {canResize && (
                    <div
                      className={styles.ResizeHandle}
                      data-ov-resizing={
                        isResizing === header.column.id ? 'true' : 'false'
                      }
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      onDoubleClick={() => header.column.resetSize()}
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
