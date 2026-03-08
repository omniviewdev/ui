import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import styles from './ChatInput.module.css';

export interface ChatInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSubmit'> {
  /** Current input value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Callback when user submits (Enter without Shift) */
  onSubmit: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disable input */
  disabled?: boolean;
  /** Max character length */
  maxLength?: number;
  /** Slot for action buttons (attachments, etc.) */
  actions?: ReactNode;
}

export const ChatInput = forwardRef<HTMLDivElement, ChatInputProps>(
  function ChatInput(
    {
      value,
      onChange,
      onSubmit,
      placeholder = 'Type a message...',
      disabled = false,
      maxLength,
      actions,
      className,
      ...rest
    },
    ref,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const resizeTextarea = useCallback(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
    }, []);

    useEffect(() => {
      resizeTextarea();
    }, [value, resizeTextarea]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const trimmed = value.trim();
          if (trimmed && !disabled) {
            onSubmit(trimmed);
          }
        }
      },
      [value, onSubmit, disabled],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const next = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
        onChange(next);
      },
      [onChange, maxLength],
    );

    const nearLimit = maxLength && value.length >= maxLength * 0.9;

    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-disabled={disabled ? 'true' : undefined}
        {...rest}
      >
        <textarea
          ref={textareaRef}
          className={styles.Textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Chat message input"
        />
        <div className={styles.Footer}>
          {actions && <div className={styles.Actions}>{actions}</div>}
          {maxLength && (
            <span
              className={styles.Counter}
              data-ov-near-limit={nearLimit ? 'true' : undefined}
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  },
);
