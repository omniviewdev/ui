import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import styles from './ToolResult.module.css';

export interface ToolResultProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  /** Result content */
  content: ReactNode;
  /** Result status */
  status: 'success' | 'error';
  /** Whether the content is truncated */
  truncated?: boolean;
  /** Callback to expand truncated content */
  onExpand?: () => void;
}

export const ToolResult = forwardRef<HTMLDivElement, ToolResultProps>(
  function ToolResult(
    { content, status, truncated = false, onExpand, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-status={status}
        {...rest}
      >
        <div className={styles.Content}>{content}</div>
        {truncated && onExpand && (
          <button type="button" className={styles.ExpandButton} onClick={onExpand}>
            Show more
          </button>
        )}
      </div>
    );
  },
);
