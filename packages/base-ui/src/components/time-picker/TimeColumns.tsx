import { useEffect, useRef } from 'react';
import styles from './TimePicker.module.css';

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface ColumnItem {
  value: number | string;
  label: string;
}

// ─── TimeColumn sub-component ─────────────────────────────────────────────────

interface TimeColumnProps {
  label: string;
  items: ColumnItem[];
  selected: number | string;
  onSelect: (value: number | string) => void;
  disabled?: boolean;
}

export function TimeColumn({ label, items, selected, onSelect, disabled }: TimeColumnProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const selectedRef = useRef<HTMLLIElement>(null);
  const suppressScrollRef = useRef(false);

  // Scroll selected item into center when the column mounts or selected changes
  // from an external source. Skip when the change came from a user click in
  // this column (the clicked item is already visible; extra scroll causes
  // a jittery double-jump).
  useEffect(() => {
    if (suppressScrollRef.current) {
      suppressScrollRef.current = false;
      return;
    }
    const el = selectedRef.current;
    const list = listRef.current;
    if (!el || !list) return;

    // If the selected element is already fully within the list's viewport,
    // skip the scroll. This avoids re-centering on every click even when the
    // click handler didn't set the suppress flag (e.g. external mutations).
    const listRect = list.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const fullyVisible = elRect.top >= listRect.top && elRect.bottom <= listRect.bottom;
    if (fullyVisible) return;

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
        // Keyboard select: the focused item is already visible; don't re-center.
        suppressScrollRef.current = true;
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
              if (disabled) return;
              // The clicked item is already visible; don't re-center on the
              // resulting `selected` change.
              suppressScrollRef.current = true;
              onSelect(item.value);
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

// ─── TimeColumns public API ───────────────────────────────────────────────────

export interface TimeColumnsProps {
  value: Date;
  onChange: (next: Date) => void;
  hourCycle?: 12 | 24;
  showSeconds?: boolean;
  minuteStep?: number;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  /** Auto-scroll columns so selected item is visible on mount. Default true. */
  autoScroll?: boolean;
}

function clampToStep(value: number, step: number, max: number): number {
  if (step <= 1) return Math.max(0, Math.min(max, value));
  const snapped = Math.floor(value / step) * step;
  return Math.max(0, Math.min(max, snapped));
}

export function TimeColumns({
  value,
  onChange,
  hourCycle = 24,
  showSeconds = false,
  minuteStep = 1,
  disabled = false,
  readOnly = false,
  className,
}: TimeColumnsProps) {
  const h24 = value.getHours();
  const isPM = h24 >= 12;

  // ─── Column data ──────────────────────────────────────────────────────────

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
  const selectedHour = hourCycle === 12 ? displayedHour : h24;
  const selectedMinute = clampToStep(value.getMinutes(), minuteStep, 59);
  const selectedSecond = value.getSeconds();
  const selectedMeridiem = isPM ? 'PM' : 'AM';

  // ─── Column handlers ──────────────────────────────────────────────────────

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
    const next = new Date(value);
    next.setHours(hours, value.getMinutes(), value.getSeconds(), 0);
    onChange(next);
  };

  const handleMinuteSelect = (v: number | string) => {
    if (readOnly) return;
    const next = new Date(value);
    next.setHours(value.getHours(), Number(v), value.getSeconds(), 0);
    onChange(next);
  };

  const handleSecondSelect = (v: number | string) => {
    if (readOnly) return;
    const next = new Date(value);
    next.setHours(value.getHours(), value.getMinutes(), Number(v), 0);
    onChange(next);
  };

  const handleMeridiemSelect = (v: number | string) => {
    if (readOnly) return;
    const wantPM = v === 'PM';
    if (wantPM === isPM) return;
    const next = new Date(value);
    next.setHours(wantPM ? h24 + 12 : h24 - 12, value.getMinutes(), value.getSeconds(), 0);
    onChange(next);
  };

  const isInteractionDisabled = disabled || readOnly;

  return (
    <div className={[styles.columns, className].filter(Boolean).join(' ')}>
      <TimeColumn
        label="Hours"
        items={hourItems}
        selected={selectedHour}
        onSelect={handleHourSelect}
        disabled={isInteractionDisabled}
      />
      <div className={styles.columnDivider} aria-hidden="true" />
      <TimeColumn
        label="Minutes"
        items={minuteItems}
        selected={selectedMinute}
        onSelect={handleMinuteSelect}
        disabled={isInteractionDisabled}
      />
      {showSeconds && (
        <>
          <div className={styles.columnDivider} aria-hidden="true" />
          <TimeColumn
            label="Seconds"
            items={secondItems}
            selected={selectedSecond}
            onSelect={handleSecondSelect}
            disabled={isInteractionDisabled}
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
            disabled={isInteractionDisabled}
          />
        </>
      )}
    </div>
  );
}
