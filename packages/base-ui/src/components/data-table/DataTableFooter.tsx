import { forwardRef, useMemo, type CSSProperties, type HTMLAttributes } from 'react';
import { flexRender } from '@tanstack/react-table';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import styles from './DataTable.module.css';

export type DataTableFooterProps = HTMLAttributes<HTMLTableSectionElement>;

export const DataTableFooter = forwardRef<HTMLTableSectionElement, DataTableFooterProps>(
  function DataTableFooter({ className, ...props }, ref) {
    const { table, state, options } = useDataTableContext();
    const footerGroups = useMemo(() => table.getFooterGroups().map((group) => ({
      ...group,
      headers: group.headers.map((header) => ({
        header,
        content: header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext()),
      })),
    })), [table, state, options]);

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
                style={{
                  '--_dt-cell-size': `var(--col-${header.column.id}-size)`,
                } as CSSProperties}
              >
                {content}
              </td>
            ))}
          </tr>
        ))}
      </tfoot>
    );
  },
);

DataTableFooter.displayName = 'DataTable.Footer';
