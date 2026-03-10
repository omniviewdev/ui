import { forwardRef, type HTMLAttributes } from 'react';
import { Button } from '@omniview/base-ui';
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
            <Button size="sm" variant="solid" color="brand" onClick={onStart}>
              Start
            </Button>
          )}
          {status === 'running' && onPause && (
            <Button size="sm" variant="outline" color="neutral" onClick={onPause}>
              Pause
            </Button>
          )}
          {status === 'paused' && onResume && (
            <Button size="sm" variant="solid" color="brand" onClick={onResume}>
              Resume
            </Button>
          )}
          {(status === 'running' || status === 'paused') && onStop && (
            <Button size="sm" variant="soft" color="danger" onClick={onStop}>
              Stop
            </Button>
          )}
        </div>
      </div>
    );
  },
);
