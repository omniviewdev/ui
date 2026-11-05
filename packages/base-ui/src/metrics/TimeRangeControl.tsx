import { useState } from 'react';
import { LuCalendarClock, LuRefreshCw } from 'react-icons/lu';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Popover } from '../components/popover';
import type { TimeRangeControlProps } from './types';
import styles from './Controls.module.css';

const defaultPresets = [
  { label: '15 minutes', durationMs: 900000 },
  { label: '1 hour', durationMs: 3600000 },
  { label: '6 hours', durationMs: 21600000 },
];
function dateInput(ms: number) {
  const date = new Date(ms);
  return Number.isFinite(date.getTime())
    ? new Date(ms - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19)
    : '';
}
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
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState('');
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
              dateInput(value.mode === 'absolute' ? value.domain.startMs : now - value.durationMs),
            );
            setEnd(dateInput(value.mode === 'absolute' ? value.domain.endMs : now));
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
            <Popover.Popup>
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
                  const startMs = new Date(start).getTime();
                  const endMs = new Date(end).getTime();
                  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) {
                    setError('Enter a valid start before the end.');
                    return;
                  }
                  onChange({ mode: 'absolute', domain: { startMs, endMs } });
                  setOpen(false);
                }}
              >
                <Input.Root>
                  <Input.Label>Start (local time)</Input.Label>
                  <Input.Control
                    type="datetime-local"
                    step="1"
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                  />
                </Input.Root>
                <Input.Root>
                  <Input.Label>End (local time)</Input.Label>
                  <Input.Control
                    type="datetime-local"
                    step="1"
                    value={end}
                    onChange={(event) => setEnd(event.target.value)}
                  />
                </Input.Root>
                {error && <span role="alert">{error}</span>}
                <Button type="submit" size="sm">
                  Apply range
                </Button>
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
