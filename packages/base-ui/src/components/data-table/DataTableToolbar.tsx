import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import { SearchInput } from '../search-input';
import styles from './DataTable.module.css';

export interface DataTableToolbarProps extends HTMLAttributes<HTMLDivElement> {
  searchPlaceholder?: string;
}

export const DataTableToolbar = forwardRef<HTMLDivElement, DataTableToolbarProps>(
  function DataTableToolbar({ className, searchPlaceholder = 'Search...', children, ...props }, ref) {
    const { table, features } = useDataTableContext();

    return (
      <div ref={ref} className={cn(styles.Toolbar, className)} {...props}>
        {features.globalFilter && (
          <SearchInput
            className={styles.ToolbarSearch}
            value={(table.getState().globalFilter as string) ?? ''}
            onValueChange={(value) => table.setGlobalFilter(value)}
            placeholder={searchPlaceholder}
            variant="ghost"
            size="sm"
          />
        )}
        <div className={styles.ToolbarSpacer} />
        {children}
      </div>
    );
  },
);

DataTableToolbar.displayName = 'DataTable.Toolbar';
