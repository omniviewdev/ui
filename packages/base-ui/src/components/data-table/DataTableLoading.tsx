import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import styles from './DataTable.module.css';
import { getSizeVariable } from './utils/getCellSizeStyles';

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
                style={
                  {
                    '--_dt-cell-size': `var(${getSizeVariable(col.id)})`,
                  } as CSSProperties
                }
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
