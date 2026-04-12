import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import styles from './Calendar.module.css';
import {
  addDays,
  addMonths,
  addYears,
  getMonthMatrix,
  isDateInRange,
  isSameDay,
  startOfMonth,
  type WeekStart,
} from './dateUtils';
import {
  formatMonthYear,
  getWeekStartsOnForLocale,
  getWeekdayLabels,
} from './formatters';

export interface CalendarProps {
  value: Date | null;
  onChange: (value: Date) => void;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  locale?: string;
  weekStartsOn?: WeekStart;
  autoFocus?: boolean;
  className?: string;
}

function toIsoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function Calendar({
  value,
  onChange,
  min,
  max,
  isDateDisabled,
  locale,
  weekStartsOn,
  autoFocus,
  className,
}: CalendarProps) {
  const resolvedWeekStart = weekStartsOn ?? getWeekStartsOnForLocale(locale);
  const [focusedDate, setFocusedDate] = useState<Date>(() => value ?? new Date());
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(value ?? new Date()));
  const gridRef = useRef<HTMLDivElement>(null);
  const rovingRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus) rovingRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    setViewMonth((prev) =>
      prev.getMonth() === focusedDate.getMonth() &&
      prev.getFullYear() === focusedDate.getFullYear()
        ? prev
        : startOfMonth(focusedDate),
    );
  }, [focusedDate]);

  const matrix = useMemo(
    () => getMonthMatrix(viewMonth, resolvedWeekStart),
    [viewMonth, resolvedWeekStart],
  );
  const weekdayLabels = useMemo(
    () => getWeekdayLabels(locale, resolvedWeekStart),
    [locale, resolvedWeekStart],
  );
  const today = useMemo(() => new Date(), []);

  const isCellDisabled = useCallback(
    (d: Date) => {
      if (!isDateInRange(d, min, max)) return true;
      if (isDateDisabled?.(d)) return true;
      return false;
    },
    [min, max, isDateDisabled],
  );

  const moveFocus = useCallback((next: Date) => {
    setFocusedDate(next);
    // Use a microtask to wait for the re-render so the new cell exists in the DOM
    queueMicrotask(() => {
      const selector = `[data-date='${toIsoDay(next)}']`;
      gridRef.current?.querySelector<HTMLButtonElement>(selector)?.focus();
    });
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = focusedDate;
    let next: Date | null = null;
    switch (e.key) {
      case 'ArrowRight': next = addDays(current, 1); break;
      case 'ArrowLeft':  next = addDays(current, -1); break;
      case 'ArrowDown':  next = addDays(current, 7); break;
      case 'ArrowUp':    next = addDays(current, -7); break;
      case 'Home': {
        const diff = (current.getDay() - resolvedWeekStart + 7) % 7;
        next = addDays(current, -diff);
        break;
      }
      case 'End': {
        const diff = (current.getDay() - resolvedWeekStart + 7) % 7;
        next = addDays(current, 6 - diff);
        break;
      }
      case 'PageUp':
        next = e.shiftKey ? addYears(current, -1) : addMonths(current, -1);
        break;
      case 'PageDown':
        next = e.shiftKey ? addYears(current, 1) : addMonths(current, 1);
        break;
      case 'Enter':
      case ' ':
        if (!isCellDisabled(current)) onChange(current);
        e.preventDefault();
        return;
      default:
        return;
    }
    if (next) {
      e.preventDefault();
      moveFocus(next);
    }
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div className={styles.header}>
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setViewMonth((v) => addMonths(v, -1))}
        >
          ‹
        </button>
        <span
          className={styles.monthLabel}
          aria-live="polite"
          role="status"
        >
          {formatMonthYear(viewMonth, locale)}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setViewMonth((v) => addMonths(v, 1))}
        >
          ›
        </button>
      </div>
      <div role="grid" ref={gridRef} onKeyDown={onKeyDown}>
        <div role="row" className={styles.grid}>
          {weekdayLabels.map((label, i) => (
            <div key={i} role="columnheader" className={styles.weekday}>
              {label}
            </div>
          ))}
        </div>
        {matrix.map((row, ri) => (
          <div key={ri} role="row" className={styles.grid}>
            {row.map((date) => {
              const iso = toIsoDay(date);
              const disabled = isCellDisabled(date);
              const selected = value ? isSameDay(date, value) : false;
              const isToday = isSameDay(date, today);
              const inMonth = date.getMonth() === viewMonth.getMonth();
              const focused = isSameDay(date, focusedDate);
              return (
                <button
                  ref={focused ? rovingRef : undefined}
                  key={iso}
                  type="button"
                  role="gridcell"
                  data-date={iso}
                  tabIndex={focused ? 0 : -1}
                  aria-selected={selected}
                  aria-disabled={disabled ? 'true' : undefined}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={
                    !inMonth
                      ? new Intl.DateTimeFormat(locale, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        }).format(date)
                      : undefined
                  }
                  className={[styles.cell, !inMonth && styles.otherMonth]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => !disabled && onChange(date)}
                  onFocus={() => setFocusedDate(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
