import { forwardRef, Fragment, memo, type HTMLAttributes, type ReactNode } from 'react';
import { flexRender, type RowData } from '@tanstack/react-table';
import { cn } from '../../system/classnames';
import { useDataTableContext, type DataTableContextValue } from './context/DataTableContext';
import { getPinningStyles } from './utils/getPinningStyles';
import { getCellSizeStyles } from './utils/getCellSizeStyles';
import styles from './DataTable.module.css';

export interface DataTableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** Use DataTable.ExpansionToggle, or mark a custom disclosure with data-ov-expansion-toggle="". */
  renderExpandedRow?: (row: unknown) => ReactNode;
}

type DataTableBodyRenderProps = DataTableBodyProps & {
  context: DataTableContextValue<RowData>;
};

// Read mutable table getters at the subscribed context boundary, not a stable table identity.
function readBodySnapshot({ table }: DataTableContextValue<RowData>) {
  return {
    rows: table.getRowModel().rows,
    columnLayouts: new Map(
      table.getVisibleLeafColumns().map((column) => {
        const meta = column.columnDef.meta as Record<string, unknown> | undefined;
        return [
          column,
          {
            style: {
              ...getCellSizeStyles(column),
              ...getPinningStyles(column),
            },
            pinned: column.getIsPinned() || undefined,
            align: meta?.align as string | undefined,
          },
        ];
      }),
    ),
  };
}

export const DataTableBody = forwardRef<HTMLTableSectionElement, DataTableBodyProps>(
  function DataTableBody(props, ref) {
    const context = useDataTableContext<RowData>();
    return <DataTableBodyRender {...props} context={context} ref={ref} />;
  },
);

// A subscribed snapshot prop invalidates cached output when table state or options change.
const DataTableBodyRender = memo(
  forwardRef<HTMLTableSectionElement, DataTableBodyRenderProps>(function DataTableBodyRender(
    { className, renderExpandedRow, context, ...props },
    ref,
  ) {
    const { features, state } = context;
    const { rows, columnLayouts } = readBodySnapshot(context);
    const isResizing = state.columnResizing.isResizingColumn;

    const rowElements = rows.map((row) => {
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
    });
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
  }),
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
