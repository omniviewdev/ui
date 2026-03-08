import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import styles from './AIResourceCard.module.css';

export type ResourceHealthStatus = 'healthy' | 'warning' | 'error' | 'unknown' | 'pending';

export interface AIResourceCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Resource kind (e.g. "Pod", "Service") */
  kind: string;
  /** Resource name */
  name: string;
  /** Resource namespace */
  namespace?: string;
  /** Health status */
  status?: ResourceHealthStatus;
  /** Additional detail content */
  detail?: ReactNode;
}

const STATUS_COLORS: Record<ResourceHealthStatus, string> = {
  healthy: 'success',
  warning: 'warning',
  error: 'error',
  unknown: 'muted',
  pending: 'info',
};

export const AIResourceCard = forwardRef<HTMLDivElement, AIResourceCardProps>(
  function AIResourceCard({ kind, name, namespace, status, detail, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.Root, className)} {...rest}>
        <div className={styles.Header}>
          <span className={styles.Kind}>{kind}</span>
          {status && (
            <span className={styles.Status} data-ov-health={STATUS_COLORS[status]}>
              {status}
            </span>
          )}
        </div>
        <div className={styles.Name}>{name}</div>
        {namespace && <div className={styles.Namespace}>{namespace}</div>}
        {detail && <div className={styles.Detail}>{detail}</div>}
      </div>
    );
  },
);
