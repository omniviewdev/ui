import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { AgentStatus } from '../../system/types';
import styles from './AgentStatusItem.module.css';

export interface AgentStatusItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Task label */
  label: string;
  /** Current status */
  status: AgentStatus;
  /** Optional detail text */
  detail?: string;
}

const STATUS_ICONS: Record<AgentStatus, string> = {
  idle: '○',
  running: '◌',
  paused: '⏸',
  complete: '✓',
  error: '✗',
};

export const AgentStatusItem = forwardRef<HTMLDivElement, AgentStatusItemProps>(
  function AgentStatusItem({ label, status, detail, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-status={status}
        {...rest}
      >
        <span className={styles.Icon} data-ov-status={status}>
          {STATUS_ICONS[status]}
        </span>
        <span className={styles.Label}>{label}</span>
        {detail && <span className={styles.Detail}>{detail}</span>}
      </div>
    );
  },
);
