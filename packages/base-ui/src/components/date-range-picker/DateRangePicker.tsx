import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { LuCalendarRange } from 'react-icons/lu';
import { Popover } from '../popover/Popover';
import styles from './DateRangePicker.module.css';
import { Calendar } from '../date-picker/Calendar';
import { formatDate, type DateFormat } from '../date-picker/formatters';
import { isDateInRange } from '../date-picker/dateUtils';
import type { WeekStart } from '../date-picker/dateUtils';
import type { StyledComponentProps } from '../../system/types';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps extends StyledComponentProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (value: DateRange) => void;
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
  /** Separator between formatted start/end dates in the trigger display. Default: " – " (en dash with spaces). */
  rangeSeparator?: string;
}

const DEFAULT_SEPARATOR = ' \u2013 ';

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

function buildFormattedValue(
  range: DateRange,
  format: DateFormat | undefined,
  locale: string | undefined,
  separator: string,
): string {
  const { start, end } = range;
  if (!start && !end) return '';
  if (start && end) {
    return `${formatDate(start, format, locale)}${separator}${formatDate(end, format, locale)}`;
  }
  // Only start is set — trailing separator to indicate incomplete range
  if (start) {
    return `${formatDate(start, format, locale)}${separator}`;
  }
  return '';
}

export function DateRangePicker(props: DateRangePickerProps) {
  const {
    value,
    defaultValue = { start: null, end: null },
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
    rangeSeparator = DEFAULT_SEPARATOR,
  } = props;

  const [current, setCurrent] = useControlled<DateRange>(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string>('');
  const [parseError, setParseError] = useState(false);

  const hasFocusedOnce = useRef(false);
  const inputFocused = useRef(false);

  const shellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverId = useId();

  const formattedValue = useMemo(
    () => buildFormattedValue(current, format, locale, rangeSeparator),
    [current, format, locale, rangeSeparator],
  );

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

  /** Attempt to parse a range string and commit if valid. */
  function tryCommit(raw: string) {
    const trimmed = raw.trim();
    if (trimmed === '') {
      setCurrent({ start: null, end: null });
      setDraft('');
      setParseError(false);
      return;
    }

    // Split on the separator — find the first occurrence
    const sepIdx = trimmed.indexOf(rangeSeparator.trim());
    if (sepIdx === -1) {
      // No separator at all — treat as parse error (we need a range)
      setParseError(true);
      return;
    }

    const startStr = trimmed.slice(0, sepIdx).trim();
    const endStr = trimmed.slice(sepIdx + rangeSeparator.trim().length).trim();

    // Both halves must be non-empty and parseable
    if (!startStr || !endStr) {
      setParseError(true);
      return;
    }

    const parsedStart = new Date(startStr);
    const parsedEnd = new Date(endStr);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      setParseError(true);
      return;
    }

    if (parsedEnd < parsedStart) {
      setParseError(true);
      return;
    }

    if (!isDateInRange(parsedStart, min, max) || !isDateInRange(parsedEnd, min, max)) {
      setParseError(true);
      return;
    }

    if (isDateDisabled?.(parsedStart) || isDateDisabled?.(parsedEnd)) {
      setParseError(true);
      return;
    }

    const next: DateRange = { start: parsedStart, end: parsedEnd };
    setCurrent(next);
    setDraft(buildFormattedValue(next, format, locale, rangeSeparator));
    setParseError(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    setDraft(e.target.value);
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

  const handleCalendarRangeChange = (range: { start: Date | null; end: Date | null }) => {
    const next: DateRange = { start: range.start, end: range.end };
    setCurrent(next);
    setDraft(buildFormattedValue(next, format, locale, rangeSeparator));
    setParseError(false);
    // Close only when end is selected (complete range)
    if (range.start && range.end) {
      setOpen(false);
      queueMicrotask(() => inputRef.current?.focus());
    }
  };

  const handleIconButtonClick = () => {
    if (disabled || readOnly) return;
    setOpen((prev) => !prev);
  };

  const displayValue = hasFocusedOnce.current || draft !== '' ? draft : formattedValue;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
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
          placeholder={placeholder ?? 'Select a date range'}
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
          <LuCalendarRange aria-hidden="true" />
        </button>
      </div>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} align="start" anchor={shellRef}>
          <Popover.Popup id={popoverId} className={styles.popup}>
            <Calendar
              mode="range"
              startDate={current.start}
              endDate={current.end}
              onRangeChange={handleCalendarRangeChange}
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
