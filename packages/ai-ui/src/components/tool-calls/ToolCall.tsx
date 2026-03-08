import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { ToolCallStatus } from '../../system/types';
import styles from './ToolCall.module.css';

export interface ToolCallProps extends HTMLAttributes<HTMLDivElement> {
  /** Tool function name */
  name: string;
  /** Tool arguments */
  arguments?: Record<string, unknown>;
  /** Current execution status */
  status: ToolCallStatus;
  /** Execution duration in ms */
  duration?: number;
}

const STATUS_ICONS: Record<ToolCallStatus, string> = {
  pending: '○',
  running: '◌',
  success: '✓',
  error: '✗',
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export const ToolCall = forwardRef<HTMLDivElement, ToolCallProps>(
  function ToolCall(
    { name, arguments: args, status, duration, className, ...rest },
    ref,
  ) {
    const [expanded, setExpanded] = useState(false);

    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-status={status}
        {...rest}
      >
        <button
          type="button"
          className={styles.Header}
          onClick={() => args && setExpanded((v) => !v)}
          aria-expanded={args ? expanded : undefined}
          disabled={!args}
        >
          <span className={styles.StatusIcon} data-ov-status={status}>
            {STATUS_ICONS[status]}
          </span>
          <span className={styles.Name}>{name}</span>
          {duration != null && (
            <span className={styles.Duration}>{formatDuration(duration)}</span>
          )}
          {args && (
            <span className={styles.Chevron} aria-hidden="true">
              {expanded ? '▾' : '▸'}
            </span>
          )}
        </button>
        {expanded && args && (
          <pre className={styles.Arguments}>
            <code>{JSON.stringify(args, null, 2)}</code>
          </pre>
        )}
      </div>
    );
  },
);
