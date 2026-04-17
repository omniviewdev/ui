import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { LuClock } from 'react-icons/lu';
import { Popover } from '../popover/Popover';
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

type FieldName = 'hour' | 'minute' | 'second';

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
  } = props;

  const current = value ?? new Date();
  const id = useId();
  const popoverId = useId();

  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  const h24 = current.getHours();
  const isPM = h24 >= 12;
  const displayedHour = hourCycle === 12 ? ((h24 + 11) % 12) + 1 : h24;

  // Draft state: tracks what the user is currently typing, null = use canonical value
  const [draft, setDraft] = useState<Partial<Record<FieldName, string>>>({});

  const emitHour = useCallback(
    (text: string) => {
      if (readOnly) return;
      const parsed = Number.parseInt(text, 10);
      if (Number.isNaN(parsed)) return;
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
    },
    [readOnly, hourCycle, isPM, current, onChange],
  );

  const emitMinute = useCallback(
    (text: string) => {
      if (readOnly) return;
      const parsed = Number.parseInt(text, 10);
      if (Number.isNaN(parsed)) return;
      const next = new Date(current);
      next.setHours(current.getHours(), clampToStep(parsed, minuteStep, 59), current.getSeconds(), 0);
      onChange?.(next);
    },
    [readOnly, current, minuteStep, onChange],
  );

  const emitSecond = useCallback(
    (text: string) => {
      if (readOnly) return;
      const parsed = Number.parseInt(text, 10);
      if (Number.isNaN(parsed)) return;
      const next = new Date(current);
      next.setHours(current.getHours(), current.getMinutes(), Math.max(0, Math.min(59, parsed)), 0);
      onChange?.(next);
    },
    [readOnly, current, onChange],
  );

  const toggleMeridiem = () => {
    if (readOnly) return;
    const next = isPM ? h24 - 12 : h24 + 12;
    const d = new Date(current);
    d.setHours(next, current.getMinutes(), current.getSeconds(), 0);
    onChange?.(d);
  };

  const hourDisplay = draft.hour ?? String(displayedHour).padStart(2, '0');
  const minuteDisplay = draft.minute ?? String(current.getMinutes()).padStart(2, '0');
  const secondDisplay = draft.second ?? String(current.getSeconds()).padStart(2, '0');

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

  // Alt+Down inside a field opens the popover
  const handleFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      if (!disabled && !readOnly) setOpen(true);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <div
        ref={shellRef}
        className={[styles.root, className].filter(Boolean).join(' ')}
        data-disabled={disabled || undefined}
      >
        <div className={styles.fields}>
          <input
            id={`${id}-h`}
            aria-label="Hour"
            className={styles.field}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            readOnly={readOnly}
            value={hourDisplay}
            onChange={(e) => {
              setDraft((d) => ({ ...d, hour: e.target.value }));
            }}
            onBlur={(e) => {
              emitHour(e.target.value);
              setDraft((d) => { const n = { ...d }; delete n.hour; return n; });
            }}
            onKeyDown={handleFieldKeyDown}
          />
          <span className={styles.separator} aria-hidden="true">:</span>
          <input
            id={`${id}-m`}
            aria-label="Minute"
            className={styles.field}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            readOnly={readOnly}
            value={minuteDisplay}
            onChange={(e) => {
              setDraft((d) => ({ ...d, minute: e.target.value }));
            }}
            onBlur={(e) => {
              emitMinute(e.target.value);
              setDraft((d) => { const n = { ...d }; delete n.minute; return n; });
            }}
            onKeyDown={handleFieldKeyDown}
          />
          {showSeconds && (
            <>
              <span className={styles.separator} aria-hidden="true">:</span>
              <input
                id={`${id}-s`}
                aria-label="Second"
                className={styles.field}
                type="text"
                inputMode="numeric"
                disabled={disabled}
                readOnly={readOnly}
                value={secondDisplay}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, second: e.target.value }));
                }}
                onBlur={(e) => {
                  emitSecond(e.target.value);
                  setDraft((d) => { const n = { ...d }; delete n.second; return n; });
                }}
                onKeyDown={handleFieldKeyDown}
              />
            </>
          )}
          {hourCycle === 12 && (
            <button
              type="button"
              className={styles.meridiem}
              disabled={disabled}
              onClick={toggleMeridiem}
              aria-pressed={isPM}
            >
              {isPM ? 'PM' : 'AM'}
            </button>
          )}
        </div>
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
