import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { LuCalendar } from 'react-icons/lu';
import { Popover } from '../popover/Popover';
import styles from './DatePicker.module.css';
import { Calendar } from './Calendar';
import { formatDate, type DateFormat } from './formatters';
import type { WeekStart } from './dateUtils';
import type { StyledComponentProps } from '../../system/types';

export interface DatePickerProps extends StyledComponentProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date | null) => void;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  format?: DateFormat;
  locale?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  weekStartsOn?: WeekStart;
  className?: string;
}

function useControlled<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<T>(defaultValue);
  const current = isControlled ? (value as T) : internal;
  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [current, set];
}

function isDateInRange(date: Date, min?: Date, max?: Date): boolean {
  if (min && date < min) return false;
  if (max && date > max) return false;
  return true;
}

export function DatePicker(props: DatePickerProps) {
  const {
    value,
    defaultValue = null,
    onChange,
    min,
    max,
    isDateDisabled,
    format,
    locale,
    placeholder,
    disabled,
    readOnly,
    weekStartsOn,
    className,
  } = props;

  const [current, setCurrent] = useControlled<Date | null>(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string>('');
  const [parseError, setParseError] = useState(false);

  // draft is initialised lazily from current on first focus
  const hasFocusedOnce = useRef(false);

  const shellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverId = useId();

  const formattedValue = useMemo(
    () => (current ? formatDate(current, format, locale) : ''),
    [current, format, locale],
  );

  // Keep draft in sync whenever the committed value changes externally (controlled mode)
  // but only when the input is not actively being edited (not focused).
  const inputFocused = useRef(false);

  function syncDraft(formatted: string) {
    if (!inputFocused.current) {
      setDraft(formatted);
      setParseError(false);
    }
  }

  // Sync draft when formattedValue changes and input isn't focused
  useMemo(() => {
    syncDraft(formattedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedValue]);

  /** Attempt to parse a string and commit if valid */
  function tryCommit(raw: string) {
    const trimmed = raw.trim();
    if (trimmed === '') {
      setCurrent(null);
      setDraft('');
      setParseError(false);
      return;
    }
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) {
      setParseError(true);
      return;
    }
    if (!isDateInRange(parsed, min, max)) {
      setParseError(true);
      return;
    }
    if (isDateDisabled?.(parsed)) {
      setParseError(true);
      return;
    }
    setCurrent(parsed);
    setDraft(formatDate(parsed, format, locale));
    setParseError(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const raw = e.target.value;
    setDraft(raw);
    // Clear error state while typing so it doesn't flicker
    setParseError(false);
  };

  const handleInputBlur = () => {
    inputFocused.current = false;
    tryCommit(draft);
  };

  const handleInputFocus = () => {
    inputFocused.current = true;
    hasFocusedOnce.current = true;
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryCommit(draft);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDraft(formattedValue);
      setParseError(false);
      inputRef.current?.blur();
    }
  };

  const handleCalendarSelect = (next: Date) => {
    setCurrent(next);
    setDraft(next ? formatDate(next, format, locale) : '');
    setParseError(false);
    setOpen(false);
    queueMicrotask(() => inputRef.current?.focus());
  };

  const handleIconButtonClick = () => {
    if (disabled || readOnly) return;
    setOpen((prev) => !prev);
  };

  const displayValue = hasFocusedOnce.current || draft !== '' ? draft : formattedValue;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      {/* Shell acts as the visual input container and popover anchor */}
      <div
        ref={shellRef}
        className={[
          styles.shell,
          parseError ? styles.shellError : '',
          disabled ? styles.shellDisabled : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-disabled={disabled || undefined}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          className={styles.input}
          value={displayValue}
          placeholder={placeholder ?? 'Select a date'}
          disabled={disabled}
          readOnly={readOnly}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autoComplete="off"
        />
        <button
          type="button"
          aria-label="Open calendar"
          className={styles.iconButton}
          disabled={disabled}
          tabIndex={0}
          onClick={handleIconButtonClick}
        >
          <LuCalendar aria-hidden="true" />
        </button>
      </div>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} align="start" anchor={shellRef}>
          <Popover.Popup id={popoverId} className={styles.popup}>
            <Calendar
              value={current}
              onChange={handleCalendarSelect}
              min={min}
              max={max}
              isDateDisabled={isDateDisabled}
              locale={locale}
              weekStartsOn={weekStartsOn}
              autoFocus
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

DatePicker.Calendar = Calendar;
