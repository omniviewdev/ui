import { useCallback, useId, useRef, useState } from 'react';
import { LuCalendar } from 'react-icons/lu';
import { Popover } from '../popover/Popover';
import { DateField } from '../date-field/DateField';
import styles from './DatePicker.module.css';
import { Calendar } from './Calendar';
import type { DateFormat } from './formatters';
import type { WeekStart } from './dateUtils';
import type { StyledComponentProps } from '../../system/types';

export interface DatePickerProps extends StyledComponentProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date | null) => void;
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
    // format is kept in props for API stability but not used for trigger display
    locale,
    // placeholder is kept in props for API stability but not used
    disabled,
    readOnly,
    weekStartsOn,
    className,
  } = props;

  const [current, setCurrent] = useControlled<Date | null>(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const [rangeError, setRangeError] = useState(false);

  const shellRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  const handleDateFieldChange = (next: Date | null) => {
    if (next === null) {
      setCurrent(null);
      setRangeError(false);
      return;
    }
    if (!isDateInRange(next, min, max) || isDateDisabled?.(next)) {
      setRangeError(true);
      return;
    }
    setRangeError(false);
    setCurrent(next);
  };

  const handleCalendarSelect = (next: Date) => {
    setCurrent(next);
    setRangeError(false);
    setOpen(false);
  };

  const handleIconButtonClick = () => {
    if (disabled || readOnly) return;
    setOpen((prev) => !prev);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      {/* Shell acts as the visual input container and popover anchor */}
      <div
        ref={shellRef}
        data-testid="date-picker-shell"
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
          value={current}
          onChange={handleDateFieldChange}
          locale={locale}
          min={min}
          max={max}
          disabled={disabled}
          readOnly={readOnly}
          aria-label="Date"
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
