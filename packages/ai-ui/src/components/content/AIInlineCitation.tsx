import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './AIInlineCitation.module.css';

export interface AIInlineCitationProps extends HTMLAttributes<HTMLSpanElement> {
  /** Citation index number */
  index: number;
  /** Source label (shown in tooltip) */
  source?: string;
  /** Click handler to navigate to source */
  onNavigate?: () => void;
}

export const AIInlineCitation = forwardRef<HTMLSpanElement, AIInlineCitationProps>(
  function AIInlineCitation({ index, source, onNavigate, className, ...rest }, ref) {
    return (
      <span
        ref={ref}
        className={cn(styles.Root, className)}
        role="button"
        tabIndex={0}
        title={source}
        onClick={onNavigate}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onNavigate) {
            e.preventDefault();
            onNavigate();
          }
        }}
        {...rest}
      >
        [{index}]
      </span>
    );
  },
);
