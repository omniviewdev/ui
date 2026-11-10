import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from 'react';
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
  {
    value,
    mono = false,
    truncate = false,
    feedbackDuration = 1500,
    className,
    children,
    onPointerEnter,
    onFocus,
    ...props
  },
  ref,
) {
  const [copied, setCopied] = useState(false);
  // The glyph is invisible until the control is hovered or focused. Tables mount many
  // values, so its SVG is built on first intent; the labelled button is always present
  // for keyboard and assistive-technology users.
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), feedbackDuration);
      },
      () => {
        // Clipboard write failed — silently ignore
      },
    );
  }, [value, feedbackDuration]);

  const handlePointerEnter = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      onPointerEnter?.(event);
      setRevealed(true);
    },
    [onPointerEnter],
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLSpanElement>) => {
      onFocus?.(event);
      setRevealed(true);
    },
    [onFocus],
  );

  let glyph: ReactNode = null;
  if (copied) glyph = <LuCheck aria-hidden size={14} />;
  else if (revealed) glyph = <LuCopy aria-hidden size={14} />;

  return (
    <span
      ref={ref}
      className={cn(styles.Root, className)}
      data-ov-mono={mono ? 'true' : undefined}
      data-ov-truncate={truncate ? 'true' : undefined}
      data-ov-copied={copied ? 'true' : undefined}
      onPointerEnter={handlePointerEnter}
      onFocus={handleFocus}
      {...props}
    >
      <span className={styles.Text}>{children ?? value}</span>
      <button
        type="button"
        className={styles.CopyButton}
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      >
        {glyph}
      </button>
    </span>
  );
});

ClipboardText.displayName = 'ClipboardText';
