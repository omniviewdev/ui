import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { ResourceHealthStatus } from './AIResourceCard';
import styles from './AIHealthSummary.module.css';

export interface HealthCount {
  status: ResourceHealthStatus;
  count: number;
}

export interface AIHealthSummaryProps extends HTMLAttributes<HTMLDivElement> {
  /** Title (e.g. "Namespace health") */
  title: string;
  /** Count per status */
  counts: HealthCount[];
  /** Total number of resources */
  total?: number;
}

const STATUS_COLORS: Record<ResourceHealthStatus, string> = {
  healthy: 'success',
  warning: 'warning',
  error: 'error',
  unknown: 'muted',
  pending: 'info',
};

export const AIHealthSummary = forwardRef<HTMLDivElement, AIHealthSummaryProps>(
  function AIHealthSummary({ title, counts, total, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.Root, className)} {...rest}>
        <div className={styles.Header}>
          <span className={styles.Title}>{title}</span>
          {total != null && <span className={styles.Total}>{total} total</span>}
        </div>
        <div className={styles.Counts}>
          {counts.map((c) => (
            <div key={c.status} className={styles.CountItem} data-ov-health={STATUS_COLORS[c.status]}>
              <span className={styles.CountValue}>{c.count}</span>
              <span className={styles.CountLabel}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
