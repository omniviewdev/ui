import { forwardRef, type HTMLAttributes } from 'react';
import { Chip, Separator } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import styles from './AIStepDivider.module.css';

export interface AIStepDividerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Step number (1-based). If omitted, renders as a plain divider. */
  step?: number;
  /** Custom label (overrides default "Step N" text) */
  label?: string;
  /** Timestamp for when this step started */
  timestamp?: Date;
  /** Visual variant */
  variant?: 'line' | 'pill';
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const AIStepDivider = forwardRef<HTMLDivElement, AIStepDividerProps>(
  function AIStepDivider(
    {
      step,
      label,
      timestamp,
      variant = 'line',
      className,
      ...rest
    },
    ref,
  ) {
    const text = label ?? (step != null ? `Step ${step}` : undefined);
    const hasLabel = text != null;

    // Plain separator — no label, no timestamp
    if (!hasLabel && !timestamp) {
      return (
        <Separator
          ref={ref as React.Ref<HTMLHRElement>}
          className={className}
          data-ov-variant={variant}
        />
      );
    }

    if (variant === 'pill') {
      return (
        <div
          ref={ref}
          className={cn(styles.Root, className)}
          role="separator"
          data-ov-variant={variant}
          {...rest}
        >
          <span className={styles.Line} />
          {hasLabel && <Chip size="sm">{text}</Chip>}
          {timestamp && (
            <span className={styles.Timestamp}>{formatTime(timestamp)}</span>
          )}
          <span className={styles.Line} />
        </div>
      );
    }

    // line variant (default)
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        role="separator"
        data-ov-variant={variant}
        {...rest}
      >
        <span className={styles.Line} />
        {hasLabel && <span className={styles.Label}>{text}</span>}
        {timestamp && (
          <span className={styles.Timestamp}>{formatTime(timestamp)}</span>
        )}
        <span className={styles.Line} />
      </div>
    );
  },
);
