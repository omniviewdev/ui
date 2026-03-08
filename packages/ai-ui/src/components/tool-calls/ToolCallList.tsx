import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import type { ToolCallStatus } from '../../system/types';
import styles from './ToolCallList.module.css';

export interface ToolCallListItem {
  id: string;
  name: string;
  arguments?: Record<string, unknown>;
  status: ToolCallStatus;
  duration?: number;
  result?: ReactNode;
  resultStatus?: 'success' | 'error';
}

export interface ToolCallListProps extends HTMLAttributes<HTMLDivElement> {
  /** List of tool calls with optional results */
  calls: ToolCallListItem[];
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

export const ToolCallList = forwardRef<HTMLDivElement, ToolCallListProps>(
  function ToolCallList({ calls, className, ...rest }, ref) {
    if (calls.length === 0) return null;

    return (
      <div ref={ref} className={cn(styles.Root, className)} role="list" {...rest}>
        {calls.map((call) => (
          <div key={call.id} className={styles.Item} role="listitem" data-ov-status={call.status}>
            <div className={styles.Header}>
              <span className={styles.StatusIcon} data-ov-status={call.status}>
                {STATUS_ICONS[call.status]}
              </span>
              <span className={styles.Name}>{call.name}</span>
              {call.duration != null && (
                <span className={styles.Duration}>{formatDuration(call.duration)}</span>
              )}
            </div>
            {call.result && (
              <div
                className={styles.Result}
                data-ov-status={call.resultStatus ?? 'success'}
              >
                {call.result}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  },
);
