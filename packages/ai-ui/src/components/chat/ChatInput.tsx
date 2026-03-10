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
  /** Left-aligned toolbar items (e.g. attachment button, model selector, capability chips) */
  startActions?: ReactNode;
  /** Right-aligned toolbar items (e.g. token counter, send/stop button) */
  endActions?: ReactNode;
}

export const ChatInput = forwardRef<HTMLDivElement, ChatInputProps>(
  function ChatInput(
    {
      value,
      onChange,
      onSubmit,
      placeholder = 'Send a message...',
      disabled = false,
      startActions,
      endActions,
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
        onChange(e.target.value);
      },
      [onChange],
    );

    const hasToolbar = startActions != null || endActions != null;

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
        {hasToolbar && (
          <div className={styles.Toolbar}>
            {startActions && <div className={styles.ToolbarStart}>{startActions}</div>}
            {endActions && <div className={styles.ToolbarEnd}>{endActions}</div>}
          </div>
        )}
      </div>
    );
  },
);
