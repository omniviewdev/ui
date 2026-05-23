import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './StatusDot.module.css';

export type StatusDotStatus = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending';
export type StatusDotPulseIntensity = 'subtle' | 'default' | 'strong';

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusDotStatus;
  label?: string;
  pulse?: boolean;
  /** Controls the visual intensity of the pulse animation. */
  pulseIntensity?: StatusDotPulseIntensity;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot(
  {
    status = 'neutral',
    label,
    pulse = false,
    pulseIntensity = 'default',
    size = 'md',
    className,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(styles.Root, className)}
      data-ov-status={status}
      data-ov-size={size}
      data-ov-pulse={pulse ? 'true' : 'false'}
      data-ov-pulse-intensity={pulse ? pulseIntensity : undefined}
      role={pulse ? 'status' : undefined}
      {...props}
    >
      <span className={styles.Dot} />
      {label ? <span className={styles.Label}>{label}</span> : null}
    </span>
  );
});

StatusDot.displayName = 'StatusDot';
