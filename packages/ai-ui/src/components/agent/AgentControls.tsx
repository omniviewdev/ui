import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { AgentStatus } from '../../system/types';
import styles from './AgentControls.module.css';

export interface AgentControlsProps extends HTMLAttributes<HTMLDivElement> {
  /** Current agent status */
  status: AgentStatus;
  onStart?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: 'Ready',
  running: 'Running',
  paused: 'Paused',
  complete: 'Complete',
  error: 'Error',
};

export const AgentControls = forwardRef<HTMLDivElement, AgentControlsProps>(
  function AgentControls(
    { status, onStart, onStop, onPause, onResume, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-status={status}
        role="toolbar"
        aria-label="Agent controls"
        {...rest}
      >
        <span className={styles.Status} data-ov-status={status}>
          <span className={styles.StatusDot} />
          {STATUS_LABELS[status]}
        </span>
        <div className={styles.Actions}>
          {status === 'idle' && onStart && (
            <button type="button" className={styles.Button} data-ov-action="start" onClick={onStart}>
              Start
            </button>
          )}
          {status === 'running' && onPause && (
            <button type="button" className={styles.Button} data-ov-action="pause" onClick={onPause}>
              Pause
            </button>
          )}
          {status === 'paused' && onResume && (
            <button type="button" className={styles.Button} data-ov-action="resume" onClick={onResume}>
              Resume
            </button>
          )}
          {(status === 'running' || status === 'paused') && onStop && (
            <button type="button" className={styles.Button} data-ov-action="stop" onClick={onStop}>
              Stop
            </button>
          )}
        </div>
      </div>
    );
  },
);
