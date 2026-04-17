import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { LuClock } from 'react-icons/lu';
import { Popover } from '../popover/Popover';
import { DateField } from '../date-field/DateField';
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

function clampToStep(value: number, step: number, max: number): number {
  if (step <= 1) return Math.max(0, Math.min(max, value));
  const snapped = Math.floor(value / step) * step;
  return Math.max(0, Math.min(max, snapped));
}

// ─── Column component ────────────────────────────────────────────────────────

interface ColumnItem {
  value: number | string;
  label: string;
}

interface TimeColumnProps {
  label: string;
  items: ColumnItem[];
  selected: number | string;
  onSelect: (value: number | string) => void;
  disabled?: boolean;
}

function TimeColumn({ label, items, selected, onSelect, disabled }: TimeColumnProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const selectedRef = useRef<HTMLLIElement>(null);

  // Scroll selected item into center when the column mounts or selected changes
  useEffect(() => {
    const el = selectedRef.current;
    if (!el) return;
    if (typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
  }, [selected]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const list = listRef.current;
    if (!list) return;
    const options = Array.from(list.querySelectorAll<HTMLLIElement>('[role="option"]'));
    const focused = document.activeElement as HTMLLIElement | null;
    const idx = focused ? options.indexOf(focused) : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = options[Math.min(idx + 1, options.length - 1)];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = options[Math.max(idx - 1, 0)];
      prev?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focused && focused.dataset.value !== undefined) {
        const raw = focused.dataset.value;
        const parsed = Number.parseInt(raw, 10);
        onSelect(Number.isNaN(parsed) ? raw : parsed);
      }
    }
  };

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label={label}
      className={styles.column}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => {
        const isSelected = item.value === selected;
        return (
          <li
            key={item.value}
            ref={isSelected ? selectedRef : undefined}
            role="option"
            aria-selected={isSelected}
            data-value={item.value}
            tabIndex={disabled ? -1 : 0}
            className={[styles.columnItem, isSelected ? styles.columnItemSelected : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => {
              if (!disabled) onSelect(item.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) onSelect(item.value);
              }
            }}
          >
            {item.label}
          </li>
        );
      })}
    </ul>
  );
}

// ─── TimePicker ──────────────────────────────────────────────────────────────

export function TimePicker(props: TimePickerProps) {
  const {
    value,
    onChange,
    showSeconds = false,
    hourCycle = 24,
    minuteStep = 1,
    disabled = false,
    readOnly = false,
    className,
    'aria-label': ariaLabel,
  } = props;

  const current = value ?? new Date();
  const popoverId = useId();

  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  const h24 = current.getHours();
  const isPM = h24 >= 12;

  // ─── DateField change handler with minuteStep snapping ──────────────────

  const handleFieldChange = useCallback(
    (next: Date | null) => {
      if (!next) return;
      if (minuteStep > 1) {
        const snapped = new Date(next);
        const m = snapped.getMinutes();
        snapped.setMinutes(Math.floor(m / minuteStep) * minuteStep);
        onChange?.(snapped);
      } else {
        onChange?.(next);
      }
    },
    [minuteStep, onChange],
  );

  // ─── Column data ────────────────────────────────────────────────────────

  const hourItems: ColumnItem[] =
    hourCycle === 12
      ? Array.from({ length: 12 }, (_, i) => {
          const v = i + 1;
          return { value: v, label: String(v).padStart(2, '0') };
        })
      : Array.from({ length: 24 }, (_, i) => ({
          value: i,
          label: String(i).padStart(2, '0'),
        }));

  const minuteItems: ColumnItem[] = [];
  for (let m = 0; m < 60; m += Math.max(1, minuteStep)) {
    minuteItems.push({ value: m, label: String(m).padStart(2, '0') });
  }

  const secondItems: ColumnItem[] = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
  }));

  const meridiemItems: ColumnItem[] = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
  ];

  const displayedHour = hourCycle === 12 ? ((h24 + 11) % 12) + 1 : h24;

  // Currently selected values for columns
  const selectedHour = hourCycle === 12 ? displayedHour : h24;
  const selectedMinute = clampToStep(current.getMinutes(), minuteStep, 59);
  const selectedSecond = current.getSeconds();
  const selectedMeridiem = isPM ? 'PM' : 'AM';

  // ─── Column handlers ────────────────────────────────────────────────────

  const handleHourSelect = (v: number | string) => {
    if (readOnly) return;
    const parsed = Number(v);
    let hours: number;
    if (hourCycle === 12) {
      const clamped = Math.max(1, Math.min(12, parsed));
      hours = (clamped % 12) + (isPM ? 12 : 0);
    } else {
      hours = Math.max(0, Math.min(23, parsed));
    }
    const next = new Date(current);
    next.setHours(hours, current.getMinutes(), current.getSeconds(), 0);
    onChange?.(next);
  };

  const handleMinuteSelect = (v: number | string) => {
    if (readOnly) return;
    const next = new Date(current);
    next.setHours(current.getHours(), Number(v), current.getSeconds(), 0);
    onChange?.(next);
  };

  const handleSecondSelect = (v: number | string) => {
    if (readOnly) return;
    const next = new Date(current);
    next.setHours(current.getHours(), current.getMinutes(), Number(v), 0);
    onChange?.(next);
  };

  const handleMeridiemSelect = (v: number | string) => {
    if (readOnly) return;
    const wantPM = v === 'PM';
    if (wantPM === isPM) return;
    const next = new Date(current);
    next.setHours(wantPM ? h24 + 12 : h24 - 12, current.getMinutes(), current.getSeconds(), 0);
    onChange?.(next);
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
          disabled={disabled}
          tabIndex={0}
          onClick={handleIconButtonClick}
        >
          <LuClock aria-hidden="true" />
        </button>
      </div>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} align="start" anchor={shellRef}>
          <Popover.Popup id={popoverId} className={styles.popup}>
            <div className={styles.columns}>
              <TimeColumn
                label="Hours"
                items={hourItems}
                selected={selectedHour}
                onSelect={handleHourSelect}
                disabled={disabled || readOnly}
              />
              <div className={styles.columnDivider} aria-hidden="true" />
              <TimeColumn
                label="Minutes"
                items={minuteItems}
                selected={selectedMinute}
                onSelect={handleMinuteSelect}
                disabled={disabled || readOnly}
              />
              {showSeconds && (
                <>
                  <div className={styles.columnDivider} aria-hidden="true" />
                  <TimeColumn
                    label="Seconds"
                    items={secondItems}
                    selected={selectedSecond}
                    onSelect={handleSecondSelect}
                    disabled={disabled || readOnly}
                  />
                </>
              )}
              {hourCycle === 12 && (
                <>
                  <div className={styles.columnDivider} aria-hidden="true" />
                  <TimeColumn
                    label="AM/PM"
                    items={meridiemItems}
                    selected={selectedMeridiem}
                    onSelect={handleMeridiemSelect}
                    disabled={disabled || readOnly}
                  />
                </>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
