import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import styles from './EmptyState.module.css';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, description, action, size = 'md', className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.Root, className)} data-ov-size={size} {...props}>
      {icon && (
        <span className={styles.Icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <h3 className={styles.Title}>{title}</h3>
      {description && <p className={styles.Description}>{description}</p>}
      {action && <div className={styles.Action}>{action}</div>}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
