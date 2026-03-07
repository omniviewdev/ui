import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import styles from './DataTable.module.css';

export interface DataTableEmptyProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title?: string;
  description?: string;
}

export const DataTableEmpty = forwardRef<HTMLDivElement, DataTableEmptyProps>(
  function DataTableEmpty({ className, icon, title, description, children, ...props }, ref) {
    return (
      <div ref={ref} className={cn(styles.Empty, className)} {...props}>
        {icon && <div className={styles.EmptyIcon}>{icon}</div>}
        {title && <div className={styles.EmptyTitle}>{title}</div>}
        {description && <div className={styles.EmptyDescription}>{description}</div>}
        {children}
      </div>
    );
  },
);

DataTableEmpty.displayName = 'DataTable.Empty';
