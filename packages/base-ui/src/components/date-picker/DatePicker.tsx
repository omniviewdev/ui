import { useCallback, useMemo, useRef, useState } from 'react';
import { LuCalendar } from 'react-icons/lu';
import { Popover } from '../popover/Popover';
import styles from './DatePicker.module.css';
import { Calendar, type CalendarProps } from './Calendar';
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
  const triggerRef = useRef<HTMLButtonElement>(null);

  const label = useMemo(
    () => (current ? formatDate(current, format, locale) : null),
    [current, format, locale],
  );

  const handleSelect: CalendarProps['onChange'] = (next) => {
    setCurrent(next);
    setOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-readonly={readOnly || undefined}
        className={[styles.trigger, className].filter(Boolean).join(' ')}
      >
        <span className={styles.triggerValue} data-placeholder={!label || undefined}>
          {label ?? (placeholder ?? 'Select a date')}
        </span>
        <span className={styles.triggerIcon} aria-hidden="true">
          <LuCalendar />
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} align="start">
          <Popover.Popup className={styles.popup}>
            <Calendar
              value={current}
              onChange={handleSelect}
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

DatePicker.Root = Popover.Root;
DatePicker.Trigger = Popover.Trigger;
DatePicker.Popup = Popover.Popup;
DatePicker.Calendar = Calendar;
