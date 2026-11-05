import type { CSSProperties } from 'react';
import { Button } from '../components/button';
import { cn } from '../system/classnames';
import { formatMetricText, seriesColor } from './format';
import type { RankedBarsProps } from './types';
import styles from './Scalars.module.css';

type RankStyle = CSSProperties & {
  '--_ov-metric-zero-position': string;
  '--_ov-metric-fill-start': string;
  '--_ov-metric-fill-size': string;
  '--_ov-metric-color': string;
};

export function RankedBars({
  items,
  unit,
  limit = 5,
  selectedId,
  onSelect,
  className,
  label,
}: RankedBarsProps) {
  const count = Number.isFinite(limit) ? Math.min(100, Math.max(0, Math.floor(limit))) : 5;
  const rows: RankedBarsProps['items'][number][] = [];
  if (count > 0) {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      const value = item.value !== null && Number.isFinite(item.value) ? item.value : null;
      let start = 0;
      let end = rows.length;
      while (start < end) {
        const middle = Math.floor((start + end) / 2);
        const current = rows[middle]!.value;
        const currentValue = current !== null && Number.isFinite(current) ? current : null;
        if (value !== null && (currentValue === null || value > currentValue)) end = middle;
        else start = middle + 1;
      }
      if (start >= count) continue;
      rows.splice(start, 0, item);
      if (rows.length > count) rows.pop();
    }
  }
  let low = 0;
  let high = 0;
  for (const row of rows)
    if (row.value !== null && Number.isFinite(row.value)) {
      low = Math.min(low, row.value);
      high = Math.max(high, row.value);
    }
  // Normalize before subtraction to preserve finite geometry at extreme magnitudes.
  const magnitude = Math.max(Math.abs(low), Math.abs(high), 1);
  const lower = low / magnitude;
  const upper = high / magnitude;
  const span = upper - lower || 1;
  const zero = (-lower / span) * 100;
  return (
    <div className={cn(styles.Ranking, className)} role="group" aria-label={label}>
      {rows.length === 0 ? (
        <p className={styles.Muted}>No items</p>
      ) : (
        rows.map((item) => {
          const known = item.value !== null && Number.isFinite(item.value);
          const end = known ? ((item.value! / magnitude - lower) / span) * 100 : zero;
          const trackStyle: RankStyle = {
            '--_ov-metric-zero-position': `${zero}%`,
            '--_ov-metric-fill-start': `${Math.min(zero, end)}%`,
            '--_ov-metric-fill-size': `${Math.abs(end - zero)}%`,
            '--_ov-metric-color': seriesColor(item.id, item.color),
          };
          const content = (
            <>
              <div className={styles.RankMain}>
                <span className={styles.RankLabel}>{item.label}</span>
                <span className={styles.RankTrack} style={trackStyle} aria-hidden="true">
                  <span className={styles.Zero} />
                  {known && <span className={styles.Fill} />}
                </span>
              </div>
              <span className={styles.RankValue}>
                {known ? formatMetricText(item.value, unit) : 'No sample'}
              </span>
            </>
          );
          return onSelect ? (
            <Button
              key={item.id}
              variant="ghost"
              className={styles.RankRow}
              aria-pressed={selectedId === item.id}
              onClick={() => onSelect(item.id)}
            >
              {content}
            </Button>
          ) : (
            <div
              key={item.id}
              className={styles.RankRow}
              data-selected={selectedId === item.id || undefined}
            >
              {content}
            </div>
          );
        })
      )}
    </div>
  );
}
