import { useCallback, useId, useRef, useState } from 'react';
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

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-disabled={disabled || undefined}
    >
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
  );
}
