import { forwardRef, Fragment, memo, useMemo, type HTMLAttributes, type ReactNode } from 'react';
import { flexRender } from '@tanstack/react-table';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import { getPinningStyles } from './utils/getPinningStyles';
import { getCellSizeStyles } from './utils/getCellSizeStyles';
import styles from './DataTable.module.css';

export interface DataTableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** Use DataTable.ExpansionToggle, or mark a custom disclosure with data-ov-expansion-toggle="". */
  renderExpandedRow?: (row: unknown) => ReactNode;
}

export const DataTableBody = forwardRef<HTMLTableSectionElement, DataTableBodyProps>(
  function DataTableBody({ className, renderExpandedRow, ...props }, ref) {
    const { table, features, state, options } = useDataTableContext();
    const rows = useMemo(() => table.getRowModel().rows, [table, state, options]);
    const isResizing = state.columnResizing.isResizingColumn;
    // Column layout is shared by every row and does not change with row data.
    // Keep live row/cell rendering outside this cache: renderers can read state.
    const columnLayouts = useMemo(
      () => new Map(table.getVisibleLeafColumns().map((column) => {
        const meta = column.columnDef.meta as Record<string, unknown> | undefined;
        return [column, {
          style: {
            ...getCellSizeStyles(column),
            ...getPinningStyles(column),
          },
          pinned: column.getIsPinned() || undefined,
          align: meta?.align as string | undefined,
        }];
      })),
      [
        table,
        options.columns,
        options.enableColumnResizing,
        options.defaultColumn?.enableResizing,
        options.defaultColumn?.size,
        options.defaultColumn?.minSize,
        options.defaultColumn?.maxSize,
        options.groupedColumnMode,
        state.grouping,
        state.columnVisibility,
        state.columnOrder,
        state.columnPinning,
        state.columnSizing,
      ],
    );


    const rowElements = useMemo(() => rows.map((row) => {
      const isSelected = row.getIsSelected();
      const isExpanded = row.getIsExpanded();

      return (
        <Fragment key={row.id}>
          <tr
            className={styles.Row}
            data-ov-row-id={row.id}
            data-ov-selected={isSelected ? 'true' : 'false'}
            data-ov-expanded={isExpanded ? 'true' : 'false'}
          >
            {row.getVisibleCells().map((cell) => {
              // Visible cells and layout entries use the same current column objects.
              const layout = columnLayouts.get(cell.column)!;

              return (
                <td
                  key={cell.id}
                  className={styles.Cell}
                  style={layout.style}
                  data-ov-pinned={layout.pinned}
                  data-ov-align={layout.align}
                >
                  <span className={styles.CellContent}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </span>
                </td>
              );
            })}
          </tr>
          {features.rowExpansion && isExpanded && renderExpandedRow && (
            <tr className={styles.ExpandedRow} data-ov-detail-for={row.id}>
              <td className={styles.ExpandedRowContent} colSpan={row.getVisibleCells().length}>
                {renderExpandedRow(row.original)}
              </td>
            </tr>
          )}
        </Fragment>
      );
    }), [rows, state, options, columnLayouts, features.rowExpansion, renderExpandedRow]);
    if (rows.length === 0) return null;

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
