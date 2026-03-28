import { forwardRef, type HTMLAttributes } from 'react';
import { Banner, Button } from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';
import { LuTriangleAlert, LuRefreshCw } from '../../system/icons';
import styles from './AIErrorMessage.module.css';

export interface AIErrorMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Error title (default: "Generation failed") */
  title?: string;
  /** Error message/description */
  message: string;
  /** Retry callback */
  onRetry?: () => void;
}

export const AIErrorMessage = forwardRef<HTMLDivElement, AIErrorMessageProps>(
  function AIErrorMessage(
    { title = 'Generation failed', message, onRetry, className, ...rest },
    ref,
  ) {
    return (
      <Banner
        ref={ref}
        color="danger"
        className={cn(styles.Root, className)}
        {...rest}
      >
        <Banner.Icon>
          <LuTriangleAlert size={16} />
        </Banner.Icon>
        <Banner.Content>
          <Banner.Title>{title}</Banner.Title>
          {message}
        </Banner.Content>
        {onRetry && (
          <Banner.Actions>
            <Button
              size="sm"
              variant="soft"
              color="danger"
              onClick={onRetry}
              startDecorator={<LuRefreshCw size={14} />}
            >
              Retry
            </Button>
          </Banner.Actions>
        )}
      </Banner>
    );
  },
);
