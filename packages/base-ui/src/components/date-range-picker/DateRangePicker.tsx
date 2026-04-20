import { useCallback, useId, useRef, useState } from 'react';
import { LuCalendarRange } from 'react-icons/lu';
import { Popover } from '../popover/Popover';
import { DateField } from '../date-field/DateField';
import { Button } from '../button/Button';
import styles from './DateRangePicker.module.css';
import { Calendar } from '../date-picker/Calendar';
import type { DateFormat } from '../date-picker/formatters';
import { isAfter, isBefore, isDateInRange } from '../date-picker/dateUtils';
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
  /** @deprecated Ignored for the trigger display; DateField uses Intl locale formatting. Kept for API stability. */
  format?: DateFormat;
  locale?: string;
  /** @deprecated DateField renders per-section placeholders. Kept for API stability. */
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  weekStartsOn?: WeekStart;
  className?: string;
  /** Separator rendered between the start and end DateFields. Default: " – " (en dash with spaces). */
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

export function DateRangePicker(props: DateRangePickerProps) {
  const {
    value,
    defaultValue = { start: null, end: null },
    onChange,
    min,
    max,
    isDateDisabled,
    // format kept for API stability — not used for trigger display
    locale,
    // placeholder kept for API stability — not used
    disabled,
    readOnly,
    weekStartsOn,
    className,
    rangeSeparator = DEFAULT_SEPARATOR,
  } = props;

  const [current, setCurrent] = useControlled<DateRange>(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const [rangeError, setRangeError] = useState(false);

  const shellRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  const handleStartChange = (next: Date | null) => {
    if (next === null) {
      setCurrent({ start: null, end: current.end });
      setRangeError(false);
      return;
    }
    // Validate against min/max and isDateDisabled
    if (!isDateInRange(next, min, max) || isDateDisabled?.(next)) {
      setRangeError(true);
      return;
    }
    setRangeError(false);
    if (current.end && isAfter(next, current.end)) {
      // start is after end — reset end so the user can pick a new one
      setCurrent({ start: next, end: null });
    } else {
      setCurrent({ start: next, end: current.end });
    }
  };

  const handleEndChange = (next: Date | null) => {
    if (next === null) {
      setCurrent({ start: current.start, end: null });
      setRangeError(false);
      return;
    }
    // Validate against min/max and isDateDisabled
    if (!isDateInRange(next, min, max) || isDateDisabled?.(next)) {
      setRangeError(true);
      return;
    }
    setRangeError(false);
    if (current.start && isBefore(next, current.start)) {
      // end is before start — swap them for a better UX
      setCurrent({ start: next, end: current.start });
    } else {
      setCurrent({ start: current.start, end: next });
    }
  };

  const handleRangeChange = (range: { start: Date | null; end: Date | null }) => {
    setCurrent({ start: range.start, end: range.end });
    setRangeError(false);
    // Close only when a complete range is selected
    if (range.start && range.end) {
      setOpen(false);
    }
  };

  const handleClear = () => {
    setCurrent({ start: null, end: null });
    setRangeError(false);
  };

  const handleDone = () => {
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div
        ref={shellRef}
        className={[
          styles.shell,
          rangeError ? styles.shellError : '',
          disabled ? styles.shellDisabled : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-disabled={disabled || undefined}
      >
        <DateField
          value={current.start}
          onChange={handleStartChange}
          mode="date"
          locale={locale}
          min={min}
          // Intentionally use the outer `max` (not `current.end`) so users can
          // type a start date beyond the current end; `handleStartChange` will
          // reconcile by resetting the end when start > end.
          max={max}
          disabled={disabled}
          readOnly={readOnly}
          aria-label="Start date"
          bare
        />
        <span className={styles.separator} aria-hidden="true">
          {rangeSeparator}
        </span>
        <DateField
          value={current.end}
          onChange={handleEndChange}
          mode="date"
          locale={locale}
          min={current.start ?? min}
          max={max}
          disabled={disabled}
          readOnly={readOnly}
          aria-label="End date"
          bare
        />
        <button
          type="button"
          aria-label="Open calendar"
          className={styles.iconButton}
          disabled={disabled}
          tabIndex={0}
          onClick={() => {
            if (!disabled && !readOnly) setOpen((v) => !v);
          }}
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
              onRangeChange={handleRangeChange}
              min={min}
              max={max}
              isDateDisabled={isDateDisabled}
              locale={locale}
              weekStartsOn={weekStartsOn}
              autoFocus
            />
            <div className={styles.footer}>
              <Button variant="ghost" color="neutral" size="sm" onClick={handleClear}>
                Clear
              </Button>
              <Button variant="solid" color="brand" size="sm" onClick={handleDone}>
                Done
              </Button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
