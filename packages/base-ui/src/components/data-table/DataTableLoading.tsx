import { forwardRef, useMemo, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import styles from './DataTable.module.css';

export interface DataTableLoadingProps extends HTMLAttributes<HTMLTableSectionElement> {
  rows?: number;
}

export const DataTableLoading = forwardRef<HTMLTableSectionElement, DataTableLoadingProps>(
  function DataTableLoading({ className, rows = 8, ...props }, ref) {
    const { table, state, options } = useDataTableContext();
    const visibleColumns = useMemo(() => table.getVisibleLeafColumns(), [table, state, options]);

    return (
      <tbody ref={ref} className={cn(styles.Loading, className)} {...props}>
        {Array.from({ length: rows }, (_, i) => (
          <tr key={`skel-${i}`} className={styles.SkeletonRow}>
            {visibleColumns.map((col) => (
              <td
                key={col.id}
                className={styles.SkeletonCell}
                style={{
                  '--_dt-cell-size': `var(--col-${col.id}-size)`,
                } as CSSProperties}
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
