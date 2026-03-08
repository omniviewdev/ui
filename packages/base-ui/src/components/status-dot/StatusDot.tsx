import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './StatusDot.module.css';

export type StatusDotStatus = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending';

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusDotStatus;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot(
  { status = 'neutral', label, pulse = false, size = 'md', className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(styles.Root, className)}
      data-ov-status={status}
      data-ov-size={size}
      data-ov-pulse={pulse ? 'true' : 'false'}
      role={pulse ? 'status' : undefined}
      {...props}
    >
      <span className={styles.Dot} />
      {label ? <span className={styles.Label}>{label}</span> : null}
    </span>
  );
});

StatusDot.displayName = 'StatusDot';
