import { useCallback, useId, useRef, useState } from 'react';
import { LuCalendarClock } from 'react-icons/lu';
import { Popover } from '../popover/Popover';
import { DateField } from '../date-field/DateField';
import { Calendar } from '../date-picker/Calendar';
import type { DateFormat } from '../date-picker/formatters';
import type { WeekStart } from '../date-picker/dateUtils';
import { TimePicker } from '../time-picker/TimePicker';
import pickerStyles from '../date-picker/DatePicker.module.css';
import styles from './DateTimePicker.module.css';
import type { StyledComponentProps } from '../../system/types';

export interface DateTimePickerProps extends StyledComponentProps {
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
  showSeconds?: boolean;
  hourCycle?: 12 | 24;
  minuteStep?: number;
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

export function DateTimePicker(props: DateTimePickerProps) {
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
    showSeconds,
    hourCycle,
    minuteStep,
    className,
  } = props;

  const [current, setCurrent] = useControlled<Date | null>(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const [rangeError, setRangeError] = useState(false);

  const shellRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  const handleFieldChange = (next: Date | null) => {
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

  const onDateChange = (d: Date) => {
    const base = current ?? new Date();
    const next = new Date(d);
    next.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), 0);
    setCurrent(next);
    setRangeError(false);
    setOpen(false);
  };

  const onTimeChange = (t: Date) => {
    const base = current ?? new Date();
    const next = new Date(base);
    next.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), 0);
    setCurrent(next);
    setRangeError(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      {/* Shell acts as the visual input container and popover anchor */}
      <div
        ref={shellRef}
        data-testid="date-time-picker-shell"
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
          onChange={handleFieldChange}
          mode="datetime"
          hourCycle={hourCycle}
          showSeconds={showSeconds}
          locale={locale}
          min={min}
          max={max}
          disabled={disabled}
          readOnly={readOnly}
          aria-label="Date and time"
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
          <LuCalendarClock aria-hidden="true" />
        </button>
      </div>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} align="start" anchor={shellRef}>
          <Popover.Popup id={popoverId} className={pickerStyles.popup}>
            <div className={styles.combo}>
              <Calendar
                value={current}
                onChange={onDateChange}
                min={min}
                max={max}
                isDateDisabled={isDateDisabled}
                locale={locale}
                weekStartsOn={weekStartsOn}
                autoFocus
              />
              <div className={styles.timeRow}>
                <TimePicker
                  value={current ?? new Date()}
                  onChange={onTimeChange}
                  showSeconds={showSeconds}
                  hourCycle={hourCycle}
                  disabled={disabled}
                  readOnly={readOnly}
                  {...(minuteStep !== undefined ? { minuteStep } : {})}
                />
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
