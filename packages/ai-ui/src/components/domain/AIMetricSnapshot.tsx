import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './AIMetricSnapshot.module.css';

export interface AIMetricSnapshotProps extends HTMLAttributes<HTMLDivElement> {
  /** Metric label (e.g. "CPU Usage") */
  label: string;
  /** Current value (e.g. "72%") */
  value: string;
  /** Optional unit suffix */
  unit?: string;
  /** Trend direction */
  trend?: 'up' | 'down' | 'stable';
  /** Status level */
  status?: 'normal' | 'warning' | 'critical';
}

const TREND_ICONS: Record<string, string> = {
  up: '↑',
  down: '↓',
  stable: '→',
};

export const AIMetricSnapshot = forwardRef<HTMLDivElement, AIMetricSnapshotProps>(
  function AIMetricSnapshot(
    { label, value, unit, trend, status = 'normal', className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-status={status}
        {...rest}
      >
        <span className={styles.Label}>{label}</span>
        <span className={styles.Value}>
          {value}
          {unit && <span className={styles.Unit}>{unit}</span>}
          {trend && (
            <span className={styles.Trend} data-ov-trend={trend}>
              {TREND_ICONS[trend]}
            </span>
          )}
        </span>
      </div>
    );
  },
);
