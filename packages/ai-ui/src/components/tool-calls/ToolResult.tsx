import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Button, Card } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import styles from './ToolResult.module.css';

export interface ToolResultProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'color'> {
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
      <Card
        ref={ref as React.Ref<HTMLElement>}
        as="div"
        className={cn(styles.Root, className)}
        data-ov-status={status}
        {...rest}
      >
        <Card.Body>{content}</Card.Body>
        {truncated && onExpand && (
          <Card.Footer>
            <Button variant="ghost" onClick={onExpand}>
              Show more
            </Button>
          </Card.Footer>
        )}
      </Card>
    );
  },
);
