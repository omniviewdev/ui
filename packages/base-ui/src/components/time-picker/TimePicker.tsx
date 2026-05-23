import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { LuClock } from 'react-icons/lu';
import { Popover } from '../popover/Popover';
import { DateField } from '../date-field/DateField';
import { TimeColumns } from './TimeColumns';
import { Button } from '../button/Button';
import styles from './TimePicker.module.css';
import type { StyledComponentProps } from '../../system/types';

export interface TimePickerProps extends StyledComponentProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date) => void;
  showSeconds?: boolean;
  hourCycle?: 12 | 24;
  minuteStep?: number;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  'aria-label'?: string;
}

// ─── TimePicker ──────────────────────────────────────────────────────────────

export function TimePicker(props: TimePickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    showSeconds = false,
    hourCycle = 24,
    minuteStep = 1,
    disabled = false,
    readOnly = false,
    className,
    'aria-label': ariaLabel,
  } = props;

  // Internal state for uncontrolled usage — tracks the most recent value so
  // the DateField reflects clears, typed edits, and column selections even
  // when the parent does not pass `value`.
  const [internalValue, setInternalValue] = useState<Date | null>(
    value ?? defaultValue ?? null,
  );
  // Prefer the controlled `value` when the parent provides it.
  const current = value !== undefined ? value : internalValue;
  // Stable fallback for TimeColumns when current is null — avoids creating
  // a fresh Date on every render.
  const fallbackNow = useMemo(() => new Date(), []);

  const popoverId = useId();

  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  // ─── DateField change handler with minuteStep snapping ──────────────────

  const handleFieldChange = useCallback(
    (next: Date | null) => {
      if (!next) return;
      let snapped: Date;
      if (minuteStep > 1) {
        snapped = new Date(next);
        const m = snapped.getMinutes();
        snapped.setMinutes(Math.floor(m / minuteStep) * minuteStep);
      } else {
        snapped = next;
      }
      setInternalValue(snapped);
      onChange?.(snapped);
    },
    [minuteStep, onChange],
  );

  const handleColumnsChange = useCallback(
    (next: Date) => {
      setInternalValue(next);
      onChange?.(next);
    },
    [onChange],
  );

  const handleClear = () => {
    // Midnight on the same calendar day as the current value (or today if unset).
    const base = current ?? new Date();
    const midnight = new Date(base);
    midnight.setHours(0, 0, 0, 0);
    setInternalValue(midnight);
    onChange?.(midnight);
  };

  const handleDone = () => {
    setOpen(false);
  };

  const handleIconButtonClick = () => {
    if (disabled || readOnly) return;
    setOpen((prev) => !prev);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      queueMicrotask(() => iconButtonRef.current?.focus());
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <div
        ref={shellRef}
        className={[styles.root, className].filter(Boolean).join(' ')}
        data-disabled={disabled || undefined}
      >
        <DateField
          value={current}
          onChange={handleFieldChange}
          mode="time"
          hourCycle={hourCycle}
          showSeconds={showSeconds}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel ?? 'Time'}
          bare
        />
        <button
          ref={iconButtonRef}
          type="button"
          aria-label="Open time picker"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          className={styles.iconButton}
          disabled={disabled || readOnly}
          aria-disabled={readOnly || undefined}
          tabIndex={0}
          onClick={readOnly ? undefined : handleIconButtonClick}
        >
          <LuClock aria-hidden="true" />
        </button>
      </div>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} align="start" anchor={shellRef}>
          <Popover.Popup id={popoverId} className={styles.popup}>
            <TimeColumns
              value={current ?? fallbackNow}
              onChange={handleColumnsChange}
              hourCycle={hourCycle}
              showSeconds={showSeconds}
              minuteStep={minuteStep}
              disabled={disabled}
              readOnly={readOnly}
              autoScroll
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
