import { forwardRef, type HTMLAttributes } from 'react';
import { Button } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import { LuSquare } from '../../system/icons';
import styles from './AIStopButton.module.css';

export interface AIStopButtonProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Click handler to stop generation */
  onStop: () => void;
  /** Whether stop is in progress */
  stopping?: boolean;
  /** Button label (default: "Stop generating") */
  label?: string;
}

export const AIStopButton = forwardRef<HTMLButtonElement, AIStopButtonProps>(
  function AIStopButton(
    { onStop, stopping = false, label, className, ...rest },
    ref,
  ) {
    return (
      <Button
        ref={ref}
        variant="outline"
        color="neutral"
        size="sm"
        disabled={stopping}
        onClick={onStop}
        startDecorator={<LuSquare size={14} />}
        className={cn(styles.Root, className)}
        {...rest}
      >
        {stopping ? 'Stopping...' : (label ?? 'Stop generating')}
      </Button>
    );
  },
);
