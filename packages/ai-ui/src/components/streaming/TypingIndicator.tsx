import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './TypingIndicator.module.css';

export interface TypingIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** Optional label text beside the dots (e.g. "Claude is thinking...") */
  label?: string;
}

export const TypingIndicator = forwardRef<HTMLSpanElement, TypingIndicatorProps>(
  function TypingIndicator({ label, className, ...rest }, ref) {
    return (
      <span ref={ref} className={cn(styles.Root, className)} role="status" {...rest}>
        {label && <span className={styles.Label}>{label}</span>}
        <span className={styles.Dots} aria-label="typing">
          <span className={styles.Dot} />
          <span className={styles.Dot} />
          <span className={styles.Dot} />
        </span>
      </span>
    );
  },
);
