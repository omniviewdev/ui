import { forwardRef, useCallback, useState, type HTMLAttributes } from 'react';
import { LuCheck, LuCopy } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import styles from './ClipboardText.module.css';

export interface ClipboardTextProps extends HTMLAttributes<HTMLElement> {
  /** The text to display and copy. */
  value: string;
  /** Use monospace font (default: false). */
  mono?: boolean;
  /** Truncate with ellipsis (default: false). */
  truncate?: boolean;
  /** Milliseconds to show success state (default: 1500). */
  feedbackDuration?: number;
}

export const ClipboardText = forwardRef<HTMLSpanElement, ClipboardTextProps>(function ClipboardText(
  { value, mono = false, truncate = false, feedbackDuration = 1500, className, children, ...props },
  ref,
) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), feedbackDuration);
    });
  }, [value, feedbackDuration]);

  return (
    <span
      ref={ref}
      className={cn(styles.Root, className)}
      data-ov-mono={mono ? 'true' : undefined}
      data-ov-truncate={truncate ? 'true' : undefined}
      data-ov-copied={copied ? 'true' : undefined}
      {...props}
    >
      <span className={styles.Text}>{children ?? value}</span>
      <button
        type="button"
        className={styles.CopyButton}
        onClick={handleCopy}
        aria-label="Copy to clipboard"
      >
        {copied ? <LuCheck aria-hidden size={14} /> : <LuCopy aria-hidden size={14} />}
      </button>
    </span>
  );
});

ClipboardText.displayName = 'ClipboardText';
