import { forwardRef, useEffect, type HTMLAttributes, type ReactNode } from 'react';
import { flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../system/classnames';
import { useDataTableContext, useScrollElement } from './context/DataTableContext';
import { getPinningStyles } from './utils/getPinningStyles';
import { getCellSizeStyles } from './utils/getCellSizeStyles';
import { DEFAULT_ESTIMATE_ROW_SIZE, DEFAULT_OVERSCAN } from './constants';
import styles from './DataTable.module.css';

export interface DataTableVirtualBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  estimateRowSize?: number;
  overscan?: number;
  renderExpandedRow?: (row: unknown) => ReactNode;
}

export const DataTableVirtualBody = forwardRef<HTMLTableSectionElement, DataTableVirtualBodyProps>(
  function DataTableVirtualBody(
    {
      className,
      estimateRowSize = DEFAULT_ESTIMATE_ROW_SIZE,
      overscan = DEFAULT_OVERSCAN,
      renderExpandedRow,
      ...props
    },
    ref,
  ) {
    const { table } = useDataTableContext();
    const scrollElement = useScrollElement();
    const { rows } = table.getRowModel();

    // Virtualizer follows the exact TanStack pattern:
    // - getScrollElement returns the Container div (via context)
    // - measureElement for dynamic row heights (disabled in Firefox)
    const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
      count: rows.length,
      estimateSize: () => estimateRowSize,
      getScrollElement: () => scrollElement,
      measureElement:
        typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
          ? (element) => element.getBoundingClientRect().height
          : undefined,
      overscan,
    });

    // Re-measure when data changes
    useEffect(() => {
      rowVirtualizer.measure();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows.length]);

    if (rows.length === 0) return null;

    return (
      <tbody
        ref={ref}
        className={cn(styles.Body, className)}
        style={{
          display: 'grid',
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
        {...props}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;

          const isSelected = row.getIsSelected();
          const isExpanded = row.getIsExpanded();

          return (
            <tr
              key={row.id}
              data-index={virtualRow.index}
              ref={(node) => rowVirtualizer.measureElement(node)}
              className={styles.Row}
              data-ov-selected={isSelected ? 'true' : 'false'}
              data-ov-expanded={isExpanded ? 'true' : 'false'}
              style={{
                display: 'flex',
                position: 'absolute',
                transform: `translateY(${virtualRow.start}px)`,
                width: '100%',
              }}
            >
              {row.getVisibleCells().map((cell) => {
                const pinningStyles = getPinningStyles(cell.column);
                const sizeStyles = getCellSizeStyles(cell.column);
                const meta = cell.column.columnDef.meta as Record<string, unknown> | undefined;
                const align = meta?.align as string | undefined;

                return (
                  <td
                    key={cell.id}
                    className={styles.Cell}
                    style={{
                      ...sizeStyles,
                      ...pinningStyles,
                    }}
                    data-ov-pinned={cell.column.getIsPinned() || undefined}
                    data-ov-align={align}
                  >
                    <span className={styles.CellContent}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    );
  },
);

DataTableVirtualBody.displayName = 'DataTable.VirtualBody';
