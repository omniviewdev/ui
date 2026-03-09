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
import { Chip } from '../chip';
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
  /** Props forwarded to the inner `<input>` element (e.g. id, name, aria-*, autoComplete). */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
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
    inputProps: inputPropsProp,
    className,
    ...props
  },
  ref,
) {
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Attempts to add tags; returns the number actually added. */
  const addTags = useCallback(
    (raw: string[]): number => {
      const next = [...value];
      for (const r of raw) {
        const tag = r.trim();
        if (tag === '') continue;
        if (max !== undefined && next.length >= max) break;
        if (!allowDuplicates && next.includes(tag)) continue;
        if (validate && !validate(tag)) continue;
        next.push(tag);
      }
      const added = next.length - value.length;
      if (added > 0) {
        onChange(next);
      }
      return added;
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
      if (event.nativeEvent.isComposing) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        const parts = splitByDelimiter(inputValue);
        if (addTags(parts) > 0) {
          setInputValue('');
        }
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
        if (addTags(parts) > 0) {
          setInputValue('');
        }
      }
    },
    [inputValue, value, addTags, removeTag, splitByDelimiter, delimiter],
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      const pasted = event.clipboardData.getData('text/plain');
      const parts = splitByDelimiter(pasted);
      if (addTags(parts) > 0) {
        event.preventDefault();
      }
    },
    [addTags, splitByDelimiter],
  );

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  const handleContainerClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        inputRef.current?.focus();
      }
      props.onClick?.(event);
    },
    [disabled, props.onClick],
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      inputPropsProp?.onFocus?.(event);
    },
    [inputPropsProp?.onFocus],
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      inputPropsProp?.onBlur?.(event);
    },
    [inputPropsProp?.onBlur],
  );

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
        <Chip
          key={`${tag}-${index}`}
          size={size}
          variant="soft"
          color="neutral"
          endDecorator={
            <button
              type="button"
              className={styles.TagRemove}
              aria-label={`Remove ${tag}`}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
            >
              <LuX aria-hidden />
            </button>
          }
        >
          {tag}
        </Chip>
      ))}
      <input
        {...inputPropsProp}
        ref={inputRef}
        className={cn(styles.Input, inputPropsProp?.className)}
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
