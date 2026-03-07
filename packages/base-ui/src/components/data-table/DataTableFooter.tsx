import { forwardRef, type HTMLAttributes } from 'react';
import { flexRender } from '@tanstack/react-table';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import styles from './DataTable.module.css';

export type DataTableFooterProps = HTMLAttributes<HTMLTableSectionElement>;

export const DataTableFooter = forwardRef<HTMLTableSectionElement, DataTableFooterProps>(
  function DataTableFooter({ className, ...props }, ref) {
    const { table } = useDataTableContext();
    const footerGroups = table.getFooterGroups();

    const hasFooterContent = footerGroups.some((group) =>
      group.headers.some((header) => header.column.columnDef.footer),
    );
    if (!hasFooterContent) return null;

    return (
      <tfoot ref={ref} className={cn(styles.Footer, className)} {...props}>
        {footerGroups.map((footerGroup) => (
          <tr key={footerGroup.id} className={styles.FooterRow}>
            {footerGroup.headers.map((header) => (
              <td
                key={header.id}
                className={styles.FooterCell}
                style={{
                  flex: `var(--col-${header.column.id}-size) 0 0px`,
                  width: `calc(var(--col-${header.column.id}-size) * 1px)`,
                }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.footer, header.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tfoot>
    );
  },
);

DataTableFooter.displayName = 'DataTable.Footer';
