import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { ComponentColor, ComponentSize } from '../../system/types';
import styles from './Spinner.module.css';

export interface SpinnerProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'color' | 'children'> {
  size?: ComponentSize;
  color?: ComponentColor;
}

const BARS = Array.from({ length: 8 });

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    { size = 'md', color = 'neutral', className, 'aria-label': ariaLabel = 'Loading', ...props },
    ref,
  ) {
    return (
      <span
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        className={cn(styles.Root, className)}
        data-ov-size={size}
        data-ov-color={color}
        {...props}
      >
        {BARS.map((_, i) => (
          <span key={i} className={styles.Bar} />
        ))}
      </span>
    );
  },
);

Spinner.displayName = 'Spinner';
