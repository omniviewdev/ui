import { forwardRef, memo, type CSSProperties, type HTMLAttributes } from 'react';
import { flexRender, type RowData } from '@tanstack/react-table';
import { cn } from '../../system/classnames';
import { useDataTableContext, type DataTableContextValue } from './context/DataTableContext';
import styles from './DataTable.module.css';
import { getSizeVariable } from './utils/getCellSizeStyles';

export type DataTableFooterProps = HTMLAttributes<HTMLTableSectionElement>;

type DataTableFooterRenderProps = DataTableFooterProps & {
  context: DataTableContextValue<RowData>;
};

export const DataTableFooter = forwardRef<HTMLTableSectionElement, DataTableFooterProps>(
  function DataTableFooter(props, ref) {
    const context = useDataTableContext<RowData>();
    return <DataTableFooterRender {...props} context={context} ref={ref} />;
  },
);

// The subscribed context snapshot is a changing prop at this memo boundary.
const DataTableFooterRender = memo(
  forwardRef<HTMLTableSectionElement, DataTableFooterRenderProps>(function DataTableFooterRender(
    { className, context, ...props },
    ref,
  ) {
    const { table } = context;
    const footerGroups = table.getFooterGroups().map((group) => ({
      ...group,
      headers: group.headers.map((header) => ({
        header,
        content: header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.footer, header.getContext()),
      })),
    }));

    const hasFooterContent = footerGroups.some((group) =>
      group.headers.some(({ header }) => header.column.columnDef.footer),
    );
    if (!hasFooterContent) return null;

    return (
      <tfoot ref={ref} className={cn(styles.Footer, className)} {...props}>
        {footerGroups.map((footerGroup) => (
          <tr key={footerGroup.id} className={styles.FooterRow}>
            {footerGroup.headers.map(({ header, content }) => (
              <td
                key={header.id}
                className={styles.FooterCell}
                style={
                  {
                    '--_dt-cell-size': `var(${getSizeVariable(header.column.id)})`,
                  } as CSSProperties
                }
              >
                {content}
              </td>
            ))}
          </tr>
        ))}
      </tfoot>
    );
  }),
);

DataTableFooter.displayName = 'DataTable.Footer';
