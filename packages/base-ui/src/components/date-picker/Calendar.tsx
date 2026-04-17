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

type CalendarBaseProps = {
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  locale?: string;
  weekStartsOn?: WeekStart;
  autoFocus?: boolean;
  className?: string;
};

type CalendarSingleProps = CalendarBaseProps & {
  mode?: 'single';
  value: Date | null;
  onChange: (value: Date) => void;
};

type CalendarRangeProps = CalendarBaseProps & {
  mode: 'range';
  startDate: Date | null;
  endDate: Date | null;
  onRangeChange: (range: { start: Date | null; end: Date | null }) => void;
};

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

function toIsoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Returns true if `d` is strictly between `a` and `b` (order-independent). */
function isStrictlyBetween(d: Date, a: Date, b: Date): boolean {
  const t = d.getTime();
  const lo = Math.min(a.getTime(), b.getTime());
  const hi = Math.max(a.getTime(), b.getTime());
  return t > lo && t < hi;
}

export function Calendar(props: CalendarProps) {
  const {
    min,
    max,
    isDateDisabled,
    locale,
    weekStartsOn,
    autoFocus,
    className,
  } = props;

  const isRangeMode = props.mode === 'range';

  // Derive the "anchor" date for initial focus/view.
  const anchorDate = isRangeMode
    ? (props.startDate ?? new Date())
    : (props.value ?? new Date());

  const resolvedWeekStart = weekStartsOn ?? getWeekStartsOnForLocale(locale);
  const [focusedDate, setFocusedDate] = useState<Date>(() => anchorDate);
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(anchorDate));
  // Hover state for range preview (range mode only)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
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
    queueMicrotask(() => {
      const selector = `[data-date='${toIsoDay(next)}']`;
      gridRef.current?.querySelector<HTMLButtonElement>(selector)?.focus();
    });
  }, []);

  /** Handle a cell selection in single mode. */
  const handleSingleSelect = useCallback(
    (date: Date) => {
      if (!isRangeMode) {
        (props as CalendarSingleProps).onChange(date);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRangeMode, props],
  );

  /** Handle a cell selection in range mode. */
  const handleRangeSelect = useCallback(
    (date: Date) => {
      if (!isRangeMode) return;
      const rangeProps = props as CalendarRangeProps;
      const { startDate, endDate, onRangeChange } = rangeProps;

      if (!startDate || (startDate && endDate)) {
        // No start yet, or both already set → start a fresh range
        onRangeChange({ start: date, end: null });
      } else {
        // Start is set, end is null
        if (date.getTime() >= startDate.getTime()) {
          onRangeChange({ start: startDate, end: date });
        } else {
          // Clicked before start → reset with new start
          onRangeChange({ start: date, end: null });
        }
      }
      setHoveredDate(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRangeMode, props],
  );

  const handleCellClick = useCallback(
    (date: Date) => {
      if (isCellDisabled(date)) return;
      if (isRangeMode) {
        handleRangeSelect(date);
      } else {
        handleSingleSelect(date);
      }
    },
    [isCellDisabled, isRangeMode, handleRangeSelect, handleSingleSelect],
  );

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
        handleCellClick(current);
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

  // Derived range endpoints for rendering
  const selectedStart = isRangeMode ? (props as CalendarRangeProps).startDate : null;
  const selectedEnd = isRangeMode ? (props as CalendarRangeProps).endDate : null;

  // Effective preview end: actual end if set, otherwise hovered date (range mode only)
  const previewEnd = isRangeMode
    ? (selectedEnd ?? (selectedStart ? hoveredDate : null))
    : null;

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
              const isToday = isSameDay(date, today);
              const inMonth = date.getMonth() === viewMonth.getMonth();
              const focused = isSameDay(date, focusedDate);

              // Selection & range state
              let selected: boolean;
              let isInRange = false;
              let isRangeStart = false;
              let isRangeEnd = false;

              if (isRangeMode) {
                const isStart = selectedStart ? isSameDay(date, selectedStart) : false;
                const isEnd = selectedEnd ? isSameDay(date, selectedEnd) : false;
                selected = isStart || isEnd;
                isRangeStart = isStart;
                isRangeEnd = isEnd;

                // In-range: strictly between effective start and preview/actual end
                if (selectedStart && previewEnd && !isSameDay(selectedStart, previewEnd)) {
                  isInRange = isStrictlyBetween(date, selectedStart, previewEnd);
                  // Also update range start/end markers for preview direction
                  if (!selectedEnd) {
                    // Preview mode: determine visual start/end based on order
                    const lo = selectedStart.getTime() < previewEnd.getTime() ? selectedStart : previewEnd;
                    const hi = selectedStart.getTime() < previewEnd.getTime() ? previewEnd : selectedStart;
                    isRangeStart = isSameDay(date, lo);
                    isRangeEnd = isSameDay(date, hi);
                    selected = isRangeStart || isRangeEnd;
                  }
                }
              } else {
                selected = (props as CalendarSingleProps).value
                  ? isSameDay(date, (props as CalendarSingleProps).value!)
                  : false;
              }

              const classNames = [
                styles.cell,
                !inMonth && styles.otherMonth,
                isInRange && styles.cellInRange,
                isRangeStart && !isRangeEnd && styles.cellRangeStart,
                isRangeEnd && !isRangeStart && styles.cellRangeEnd,
              ]
                .filter(Boolean)
                .join(' ');

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
                  className={classNames}
                  onClick={() => handleCellClick(date)}
                  onFocus={() => setFocusedDate(date)}
                  onMouseEnter={() => {
                    if (isRangeMode && selectedStart && !selectedEnd) {
                      setHoveredDate(date);
                    }
                  }}
                  onMouseLeave={() => {
                    if (isRangeMode) setHoveredDate(null);
                  }}
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
