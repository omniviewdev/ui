import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ClipboardEvent,
  type ChangeEvent,
} from 'react';
import { LuX } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import type { ComponentSize } from '../../system/types';
import styles from './TagInput.module.css';

export interface TagInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current tag values (controlled). */
  value: string[];
  /** Called whenever the tag list changes. */
  onChange: (tags: string[]) => void;
  /** Placeholder shown when there are no tags and the input is empty. */
  placeholder?: string;
  /** Character or pattern used to split input into tags. Defaults to `","`. */
  delimiter?: string | RegExp;
  /** Maximum number of tags allowed. */
  max?: number;
  /** Whether duplicate tags are permitted. Defaults to `false`. */
  allowDuplicates?: boolean;
  /** Optional validation function; only tags for which this returns `true` are added. */
  validate?: (tag: string) => boolean;
  /** Control size. */
  size?: ComponentSize;
  /** Disables the entire input. */
  disabled?: boolean;
}

export const TagInput = forwardRef<HTMLDivElement, TagInputProps>(function TagInput(
  {
    value,
    onChange,
    placeholder,
    delimiter = ',',
    max,
    allowDuplicates = false,
    validate,
    size = 'md',
    disabled = false,
    className,
    ...props
  },
  ref,
) {
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTags = useCallback(
    (raw: string[]) => {
      const next = [...value];
      for (const r of raw) {
        const tag = r.trim();
        if (tag === '') continue;
        if (max !== undefined && next.length >= max) break;
        if (!allowDuplicates && next.includes(tag)) continue;
        if (validate && !validate(tag)) continue;
        next.push(tag);
      }
      if (next.length !== value.length) {
        onChange(next);
      }
    },
    [value, onChange, max, allowDuplicates, validate],
  );

  const splitByDelimiter = useCallback(
    (text: string): string[] => text.split(delimiter),
    [delimiter],
  );

  const removeTag = useCallback(
    (index: number) => {
      if (disabled) return;
      const next = value.filter((_, i) => i !== index);
      onChange(next);
    },
    [value, onChange, disabled],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const parts = splitByDelimiter(inputValue);
        addTags(parts);
        setInputValue('');
        return;
      }

      if (event.key === 'Backspace' && inputValue === '' && value.length > 0) {
        removeTag(value.length - 1);
        return;
      }

      // Check if the key matches the delimiter (single character delimiters only)
      if (typeof delimiter === 'string' && delimiter.length === 1 && event.key === delimiter) {
        event.preventDefault();
        const parts = splitByDelimiter(inputValue);
        addTags(parts);
        setInputValue('');
      }
    },
    [inputValue, value, addTags, removeTag, splitByDelimiter, delimiter],
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const pasted = event.clipboardData.getData('text/plain');
      const parts = splitByDelimiter(pasted);
      addTags(parts);
    },
    [addTags, splitByDelimiter],
  );

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  const handleContainerClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  const showPlaceholder = value.length === 0 && inputValue === '';

  return (
    <div
      ref={ref}
      role="group"
      className={cn(styles.Root, className)}
      data-ov-size={size}
      data-ov-focused={focused ? 'true' : undefined}
      data-ov-disabled={disabled ? 'true' : undefined}
      aria-disabled={disabled || undefined}
      onClick={handleContainerClick}
      {...props}
    >
      {value.map((tag, index) => (
        <span key={`${tag}-${index}`} className={styles.Tag}>
          {tag}
          <button
            type="button"
            className={styles.TagRemove}
            aria-label={`Remove ${tag}`}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              removeTag(index);
            }}
            tabIndex={-1}
          >
            <LuX aria-hidden />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        className={styles.Input}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={showPlaceholder ? placeholder : undefined}
        size={inputValue.length > 0 ? inputValue.length + 1 : 1}
      />
    </div>
  );
});

TagInput.displayName = 'TagInput';
