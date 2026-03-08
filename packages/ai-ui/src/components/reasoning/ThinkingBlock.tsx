import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './ThinkingBlock.module.css';

export interface ThinkingBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Reasoning text content */
  content: string;
  /** Start expanded (default: false) */
  defaultExpanded?: boolean;
  /** Whether content is still streaming in */
  streaming?: boolean;
  /** Thinking duration in ms */
  duration?: number;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export const ThinkingBlock = forwardRef<HTMLDivElement, ThinkingBlockProps>(
  function ThinkingBlock(
    { content, defaultExpanded = false, streaming = false, duration, className, ...rest },
    ref,
  ) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-expanded={expanded ? 'true' : 'false'}
        data-ov-streaming={streaming ? 'true' : 'false'}
        {...rest}
      >
        <button
          type="button"
          className={styles.Header}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span className={styles.Icon} aria-hidden="true">
            {expanded ? '▾' : '▸'}
          </span>
          <span className={styles.Title}>
            {streaming ? 'Thinking…' : 'Thought process'}
          </span>
          {duration != null && (
            <span className={styles.Duration}>{formatDuration(duration)}</span>
          )}
        </button>
        {expanded && (
          <div className={styles.Content}>
            <p className={styles.Text}>{content}</p>
            {streaming && (
              <span className={styles.StreamDots} aria-label="still thinking">
                <span className={styles.Dot} />
                <span className={styles.Dot} />
                <span className={styles.Dot} />
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);
