import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import styles from './DataTable.module.css';

export interface DataTableLoadingProps extends HTMLAttributes<HTMLTableSectionElement> {
  rows?: number;
}

export const DataTableLoading = forwardRef<HTMLTableSectionElement, DataTableLoadingProps>(
  function DataTableLoading({ className, rows = 8, ...props }, ref) {
    const { table } = useDataTableContext();
    const visibleColumns = table.getVisibleLeafColumns();

    return (
      <tbody ref={ref} className={cn(styles.Loading, className)} {...props}>
        {Array.from({ length: rows }, (_, i) => (
          <tr key={`skel-${i}`} className={styles.SkeletonRow}>
            {visibleColumns.map((col) => (
              <td
                key={col.id}
                className={styles.SkeletonCell}
                style={{ // eslint-disable-line react/forbid-component-props -- TanStack Table column size CSS variable injection
                  flex: `var(--col-${col.id}-size) 0 0px`,
                  width: `calc(var(--col-${col.id}-size) * 1px)`,
                }}
              >
                <div className={styles.SkeletonBar} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  },
);

DataTableLoading.displayName = 'DataTable.Loading';
