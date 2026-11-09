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
  /** Outline keeps the same outer size while leaving the centre transparent. */
  variant?: 'solid' | 'outline';
}

export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot(
  {
    status = 'neutral',
    label,
    pulse = false,
    pulseIntensity = 'default',
    size = 'md',
    variant = 'solid',
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
      data-ov-variant={variant}
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
