import { useState, type CSSProperties } from 'react';
import { Button } from '../components/button/Button';
import type { MetricLegendProps } from './types';
import { seriesColor } from './format';
import styles from './TimePlots.module.css';

export function MetricLegend({
  items,
  hiddenIds = [],
  onHiddenIdsChange,
  emphasizedId,
  onEmphasizedIdChange,
  label = 'Chart series',
  className,
}: MetricLegendProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const virtual = items.length > 80;
  const start = virtual
    ? Math.max(0, Math.min(items.length - 1, Math.floor(scrollTop / 32) - 3))
    : 0;
  const visible = virtual ? items.slice(start, start + 16) : items;
  const windowStyle = {
    '--_legend-height': `${items.length * 32}px`,
  } as CSSProperties;
  return (
    <div
      className={[styles.Legend, virtual ? styles.VirtualLegend : '', className]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={label}
      tabIndex={virtual ? 0 : undefined}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      onKeyDown={(event) => {
        if (!virtual || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const group = event.currentTarget;
        const focused = Number(
          (event.target as HTMLElement)
            .closest('[data-legend-index]')
            ?.getAttribute('data-legend-index') ?? Math.floor(scrollTop / 32),
        );
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? items.length - 1
              : Math.max(
                  0,
                  Math.min(items.length - 1, focused + (event.key === 'ArrowDown' ? 1 : -1)),
                );
        group.scrollTop = next * 32;
        setScrollTop(next * 32);
        requestAnimationFrame(() =>
          group.querySelector<HTMLElement>(`[data-legend-index="${next}"] button`)?.focus(),
        );
      }}
    >
      <div
        className={virtual ? styles.LegendWindow : styles.LegendItems}
        style={virtual ? windowStyle : undefined}
      >
        {visible.map((item, index) => {
          const itemStyle = {
            '--_legend-offset': `${(start + index) * 32}px`,
            '--_legend-color': seriesColor(item.id, item.color),
          } as CSSProperties;
          return (
            <div
              key={item.id}
              data-legend-index={start + index}
              className={styles.LegendItem}
              style={itemStyle}
            >
              {onHiddenIdsChange || onEmphasizedIdChange ? (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-pressed={
                    onHiddenIdsChange ? !hiddenIds.includes(item.id) : emphasizedId === item.id
                  }
                  onClick={() =>
                    onHiddenIdsChange
                      ? onHiddenIdsChange(
                          hiddenIds.includes(item.id)
                            ? hiddenIds.filter((id) => id !== item.id)
                            : [...hiddenIds, item.id],
                        )
                      : onEmphasizedIdChange?.(emphasizedId === item.id ? undefined : item.id)
                  }
                  onPointerEnter={() => onHiddenIdsChange && onEmphasizedIdChange?.(item.id)}
                  onPointerLeave={() => onHiddenIdsChange && onEmphasizedIdChange?.(undefined)}
                  onFocus={() => onHiddenIdsChange && onEmphasizedIdChange?.(item.id)}
                  onBlur={() => onHiddenIdsChange && onEmphasizedIdChange?.(undefined)}
                  className={styles.LegendButton}
                  data-hidden={hiddenIds.includes(item.id) || undefined}
                >
                  <span className={styles.Swatch} />
                  <span className={styles.LegendText}>{item.label}</span>
                </Button>
              ) : (
                <span
                  className={styles.LegendStatic}
                  data-emphasized={emphasizedId === item.id || undefined}
                >
                  <span className={styles.Swatch} />
                  <span className={styles.LegendText}>{item.label}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
