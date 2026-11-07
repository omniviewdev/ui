import { useState } from 'react';
import { LuCalendarClock, LuRefreshCw } from 'react-icons/lu';
import { Button } from '../components/button';
import { DateTimePicker } from '../components/date-time-picker';
import { Popover } from '../components/popover';
import type { TimeRangeControlProps } from './types';
import styles from './Controls.module.css';

const defaultPresets = [
  { label: '15 minutes', durationMs: 900000 },
  { label: '1 hour', durationMs: 3600000 },
  { label: '6 hours', durationMs: 21600000 },
];
export function TimeRangeControl({
  value,
  onChange,
  presets = defaultPresets,
  referenceTimeMs,
  onRefresh,
  refreshing,
  className,
}: TimeRangeControlProps) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [startValid, setStartValid] = useState(false);
  const [endValid, setEndValid] = useState(false);
  const label =
    value.mode === 'relative'
      ? `Last ${presets.find((preset) => preset.durationMs === value.durationMs)?.label ?? `${value.durationMs / 60000} minutes`}`
      : 'Custom range';
  return (
    <div className={`${styles.range} ${className ?? ''}`}>
      <Popover.Root
        size="sm"
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            const now = referenceTimeMs ?? Date.now();
            setStart(
              new Date(value.mode === 'absolute' ? value.domain.startMs : now - value.durationMs),
            );
            setEnd(new Date(value.mode === 'absolute' ? value.domain.endMs : now));
            setError('');
          }
        }}
      >
        <Popover.Trigger aria-label="Time range">
          <LuCalendarClock />
          {label}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner align="end" sideOffset={6}>
            <Popover.Popup className={styles.rangePopup}>
              <Popover.Title>Time range</Popover.Title>
              <div className={styles.presets}>
                {presets
                  .filter((preset) => Number.isFinite(preset.durationMs) && preset.durationMs > 0)
                  .map((preset) => (
                    <Button
                      key={preset.durationMs}
                      size="sm"
                      variant="soft"
                      onClick={() => {
                        onChange({ mode: 'relative', durationMs: preset.durationMs });
                        setOpen(false);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
              </div>
              <form
                className={styles.form}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!startValid || !endValid) {
                    setError('Complete a valid local date and time for both Start and End.');
                    return;
                  }
                  const startMs = start?.getTime() ?? NaN;
                  const endMs = end?.getTime() ?? NaN;
                  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) {
                    setError('Enter a valid start before the end.');
                    return;
                  }
                  onChange({ mode: 'absolute', domain: { startMs, endMs } });
                  setOpen(false);
                }}
              >
                <div className={styles.rangeField}>
                  <span>Start (local date and time)</span>
                  <DateTimePicker
                    aria-label="Start (local date and time)"
                    value={start}
                    onChange={setStart}
                    onValidityChange={setStartValid}
                    showSeconds
                    hourCycle={24}
                  />
                </div>
                <div className={styles.rangeField}>
                  <span>End (local date and time)</span>
                  <DateTimePicker
                    aria-label="End (local date and time)"
                    value={end}
                    onChange={setEnd}
                    onValidityChange={setEndValid}
                    showSeconds
                    hourCycle={24}
                  />
                </div>
                {error && <span role="alert">{error}</span>}
                <div className={styles.rangeActions}>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Apply range
                  </Button>
                </div>
              </form>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {onRefresh && (
        <Button
          size="sm"
          variant="ghost"
          aria-label={refreshing ? 'Refreshing metrics' : 'Refresh metrics'}
          disabled={refreshing}
          onClick={onRefresh}
        >
          <LuRefreshCw />
          {refreshing ? 'Refreshing' : 'Refresh'}
        </Button>
      )}
    </div>
  );
}
