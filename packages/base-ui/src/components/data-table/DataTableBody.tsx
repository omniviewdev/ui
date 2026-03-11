import { forwardRef, Fragment, memo, type HTMLAttributes, type ReactNode } from 'react';
import { flexRender } from '@tanstack/react-table';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import { getPinningStyles } from './utils/getPinningStyles';
import { getCellSizeStyles } from './utils/getCellSizeStyles';
import styles from './DataTable.module.css';

export interface DataTableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  renderExpandedRow?: (row: unknown) => ReactNode;
}

export const DataTableBody = forwardRef<HTMLTableSectionElement, DataTableBodyProps>(
  function DataTableBody({ className, renderExpandedRow, ...props }, ref) {
    const { table, features } = useDataTableContext();
    const rows = table.getRowModel().rows;
    const isResizing = table.getState().columnSizingInfo.isResizingColumn;

    if (rows.length === 0) return null;

    const rowElements = rows.map((row) => {
      const isSelected = row.getIsSelected();
      const isExpanded = row.getIsExpanded();

      return (
        <Fragment key={row.id}>
          <tr
            className={styles.Row}
            data-ov-selected={isSelected ? 'true' : 'false'}
            data-ov-expanded={isExpanded ? 'true' : 'false'}
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
          {features.rowExpansion && isExpanded && renderExpandedRow && (
            <tr className={styles.ExpandedRow}>
              <td className={styles.ExpandedRowContent} colSpan={row.getVisibleCells().length}>
                {renderExpandedRow(row.original)}
              </td>
            </tr>
          )}
        </Fragment>
      );
    });

    if (isResizing) {
      return (
        <MemoizedTbody ref={ref} className={cn(styles.Body, className)} {...props}>
          {rowElements}
        </MemoizedTbody>
      );
    }

    return (
      <tbody ref={ref} className={cn(styles.Body, className)} {...props}>
        {rowElements}
      </tbody>
    );
  },
);

DataTableBody.displayName = 'DataTable.Body';

const MemoizedTbody = memo(
  forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    function MemoizedTbody({ children, ...props }, ref) {
      return (
        <tbody ref={ref} {...props}>
          {children}
        </tbody>
      );
    },
  ),
  (prev, next) => prev.children === next.children,
);
