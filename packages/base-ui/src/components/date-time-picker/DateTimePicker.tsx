import { Popover } from '@base-ui/react/popover';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Calendar } from '../date-picker/Calendar';
import { formatDate, type DateFormat } from '../date-picker/formatters';
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
  format?: DateFormat;
  locale?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  weekStartsOn?: WeekStart;
  showSeconds?: boolean;
  hourCycle?: 12 | 24;
  minuteStep?: number;
  className?: string;
}

export function DateTimePicker(props: DateTimePickerProps) {
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
    showSeconds,
    hourCycle,
    minuteStep,
    className,
  } = props;

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<Date | null>(defaultValue);
  const current = isControlled ? (value as Date | null) : internal;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const emit = useCallback(
    (next: Date | null) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const onDateChange = (d: Date) => {
    const base = current ?? new Date();
    const next = new Date(d);
    next.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), 0);
    emit(next);
  };

  const onTimeChange = (t: Date) => {
    const base = current ?? new Date();
    const next = new Date(base);
    next.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), 0);
    emit(next);
  };

  const label = useMemo(
    () =>
      current
        ? formatDate(current, format ?? { dateStyle: 'short', timeStyle: 'short' }, locale)
        : null,
    [current, format, locale],
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-readonly={readOnly || undefined}
        className={[pickerStyles.trigger, className].filter(Boolean).join(' ')}
      >
        {label ?? (
          <span className={pickerStyles.placeholder}>
            {placeholder ?? 'Select date and time'}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4}>
          <Popover.Popup className={pickerStyles.popup}>
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
