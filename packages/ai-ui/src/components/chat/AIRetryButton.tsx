import { forwardRef, type HTMLAttributes } from 'react';
import { Button } from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';
import { LuRefreshCw } from '../../system/icons';
import styles from './AIRetryButton.module.css';

export interface AIRetryButtonProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Retry callback */
  onRetry: () => void;
  /** Whether retry is in progress */
  retrying?: boolean;
  /** Label (default: "Retry") */
  label?: string;
}

export const AIRetryButton = forwardRef<HTMLButtonElement, AIRetryButtonProps>(
  function AIRetryButton(
    { onRetry, retrying = false, label = 'Retry', className, ...rest },
    ref,
  ) {
    return (
      <Button
        ref={ref}
        className={cn(styles.Root, className)}
        variant="outline"
        color="neutral"
        size="sm"
        disabled={retrying}
        onClick={onRetry}
        startDecorator={<LuRefreshCw size={14} />}
        {...rest}
      >
        {retrying ? 'Retrying...' : label}
      </Button>
    );
  },
);
