import { useMemo } from 'react';
import { Button } from '../components/button/Button';
import type { SmallMultiplesProps } from './types';
import { formatMetricText } from './format';
import { valueDomain } from './seriesGeometry';
import { Sparkline } from './Sparkline';
import styles from './TimePlots.module.css';

export function SmallMultiples({
  items,
  unit,
  domain,
  yDomain,
  page = 0,
  pageSize = 6,
  onPageChange,
  onSelect,
  label,
  className,
}: SmallMultiplesProps) {
  const size = Number.isFinite(pageSize) ? Math.max(1, Math.min(24, Math.floor(pageSize))) : 6;
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Number.isFinite(page) ? Math.max(0, Math.min(pages - 1, Math.floor(page))) : 0;
  const { startMs, endMs } = domain;
  const lower = yDomain?.[0];
  const upper = yDomain?.[1];
  const bounds = useMemo(
    () =>
      valueDomain(
        items.map((item) => item.series),
        { startMs, endMs },
        lower !== undefined && upper !== undefined ? [lower, upper] : undefined,
      ),
    [items, startMs, endMs, lower, upper],
  );
  return (
    <section className={[styles.Multiples, className].filter(Boolean).join(' ')} aria-label={label}>
      <div className={styles.MultipleGrid}>
        {items.slice(current * size, (current + 1) * size).map((item) => {
          const content = (
            <>
              <span className={styles.MultipleLabel}>{item.label}</span>
              <strong className={styles.MultipleValue}>{formatMetricText(item.value, unit)}</strong>
              <Sparkline
                series={item.series}
                domain={domain}
                yDomain={bounds}
                label={`${item.label} trend`}
              />
            </>
          );
          return onSelect ? (
            <Button
              key={item.id}
              variant="outline"
              className={styles.MultipleCard}
              onClick={() => onSelect(item.id)}
            >
              {content}
            </Button>
          ) : (
            <div key={item.id} className={styles.MultipleCard}>
              {content}
            </div>
          );
        })}
      </div>
      {!items.length && <div className={styles.Empty}>No series available</div>}
      {pages > 1 && (
        <div className={styles.Paging}>
          <Button
            size="sm"
            variant="ghost"
            disabled={!onPageChange || current === 0}
            onClick={() => onPageChange?.(current - 1)}
          >
            Previous
          </Button>
          <span>
            {current + 1} / {pages}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={!onPageChange || current === pages - 1}
            onClick={() => onPageChange?.(current + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
