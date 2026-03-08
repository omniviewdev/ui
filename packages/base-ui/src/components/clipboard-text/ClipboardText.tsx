import { forwardRef, useCallback, useState, type HTMLAttributes } from 'react';
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

function CopyIcon() {
  return (
    <svg
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
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
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </span>
  );
});

ClipboardText.displayName = 'ClipboardText';
