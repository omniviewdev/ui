import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { ComponentColor, ComponentSize, ComponentVariant } from '../../system/types';
import styles from './Progress.module.css';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  value?: number;
  variant?: ComponentVariant;
  color?: ComponentColor;
  size?: ComponentSize;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(
    { value, variant = 'solid', color = 'brand', size = 'md', className, ...props },
    ref,
  ) {
    const indeterminate = value === undefined;
    const clamped = indeterminate ? undefined : Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : 100}
        className={cn(styles.Root, className)}
        data-ov-variant={variant}
        data-ov-color={color}
        data-ov-size={size}
        data-ov-indeterminate={indeterminate ? 'true' : undefined}
        {...props}
      >
        <div
          className={styles.Bar}
          style={indeterminate ? undefined : { width: `${clamped}%` }}
        />
      </div>
    );
  },
);

Progress.displayName = 'Progress';
