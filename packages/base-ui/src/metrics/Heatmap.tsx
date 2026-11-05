import { useId, useMemo, useState, type CSSProperties } from 'react';
import type { HeatmapProps } from './types';
import {
  bucketLabel,
  clampIndex,
  population,
  validBuckets,
  validDomain,
} from './distributionGeometry';
import { formatMetricText } from './format';
import styles from './Distributions.module.css';

export function Heatmap({
  buckets,
  windows,
  values,
  unit,
  measure,
  height = 180,
  colorDomain,
  selectedWindowId,
  onWindowSelect,
  label,
  className,
}: HeatmapProps) {
  const id = useId();
  const [focus, setFocus] = useState({ column: 0, row: 0 });
  const [inspecting, setInspecting] = useState(false);
  const valid = useMemo(
    () =>
      validBuckets(buckets) &&
      windows.every((window, index) => {
        const previous = windows[index - 1];
        return (
          validDomain(window) &&
          (index === 0 || (previous !== undefined && window.startMs >= previous.endMs))
        );
      }) &&
      new Set(windows.map((window) => window.id)).size === windows.length,
    [buckets, windows],
  );
  const max = useMemo(() => {
    if (!valid || colorDomain !== undefined) return 0;
    let maximum = 0;
    for (let c = 0; c < windows.length; c++) {
      for (let r = 0; r < buckets.length; r++)
        maximum = Math.max(maximum, population(values[c]?.[r]) ?? 0);
    }
    return maximum;
  }, [valid, colorDomain, windows.length, buckets.length, values]);
  const [frozenMax, setFrozenMax] = useState<number | null>(max > 0 ? max : null);
  // Freeze the first nonzero extent; refreshing data must not recolor history.
  if (frozenMax === null && colorDomain === undefined && max > 0) setFrozenMax(max);
  const range: readonly [number, number] = colorDomain ?? [0, frozenMax ?? (max || 1)];
  const minimum = range[0],
    maximum = range[1];
  const validRange =
    Number.isFinite(range[0]) &&
    Number.isFinite(range[1]) &&
    range[1] > range[0] &&
    Number.isFinite(range[1] - range[0]);
  const firstWindow = windows[0];
  const lastWindow = windows[windows.length - 1];
  const durationMs = firstWindow && lastWindow ? lastWindow.endMs - firstWindow.startMs : 0;
  const drawable =
    valid && validRange && Number.isFinite(durationMs) && durationMs > 0 && buckets.length > 0;
  const column = clampIndex(focus.column, windows.length);
  const row = clampIndex(focus.row, buckets.length);
  const window = drawable ? windows[column] : undefined;
  const bucket = drawable ? buckets[row] : undefined;
  const current = population(values[column]?.[row]);
  const start = firstWindow?.startMs ?? 0;
  const duration = durationMs;
  const paths = useMemo(() => {
    const result = ['', '', '', '', '', ''];
    // Raster-sized cells bound paint work. Each pixel tile shows peak population,
    // or unknown when any contributing sample is missing. Inspection uses raw data.
    if (drawable && Number.isFinite(duration) && duration > 0) {
      const columns = Math.min(200, windows.length);
      const rows = Math.min(64, buckets.length);
      for (let x = 0; x < columns; x++)
        for (let y = 0; y < rows; y++) {
          const c0 = Math.floor((x * windows.length) / columns);
          const c1 = Math.floor(((x + 1) * windows.length) / columns);
          const r0 = Math.floor((y * buckets.length) / rows);
          const r1 = Math.floor(((y + 1) * buckets.length) / rows);
          const first = windows[c0];
          const last = windows[c1 - 1];
          if (!first || !last) continue;
          let peak = 0;
          let unknown = false;
          for (let c = c0 + 1; c < c1; c++) {
            const previous = windows[c - 1];
            const next = windows[c];
            if (!previous || !next || next.startMs > previous.endMs) unknown = true;
          }
          for (let c = c0; c < c1; c++)
            for (let r = r0; r < r1; r++) {
              const value = population(values[c]?.[r]);
              if (value === null) unknown = true;
              else peak = Math.max(peak, value);
            }
          const level = unknown
            ? 5
            : Math.min(4, Math.max(0, Math.floor(((peak - minimum) / (maximum - minimum)) * 5)));
          const left = ((first.startMs - start) / duration) * 600;
          const width = ((last.endMs - first.startMs) / duration) * 600;
          const top = 150 - (r1 / buckets.length) * 150;
          const h = ((r1 - r0) / buckets.length) * 150;
          result[level] += `M${left},${top}h${width}v${h}h${-width}Z`;
        }
    }
    return result;
  }, [drawable, duration, windows, buckets.length, values, start, minimum, maximum]);
  const axisIndices = useMemo(() => {
    const stride = Math.max(1, Math.ceil(buckets.length / 8));
    return buckets
      .map((_, index) => index)
      .filter((index) => index % stride === 0 || index === buckets.length - 1);
  }, [buckets]);
  const choose = () => {
    if (window) onWindowSelect?.(window);
  };
  return (
    <div className={`${styles.Root} ${className ?? ''}`}>
      <div className={styles.Axis}>
        <span>{measure === 'rate' ? 'Rate / s' : measure === 'count' ? 'Count' : 'Density'}</span>
        <span>
          {validRange
            ? `${range[0].toLocaleString()}–${range[1].toLocaleString()}`
            : 'Invalid color domain'}
        </span>
      </div>
      <div className={styles.HeatmapFrame}>
        <div className={styles.BucketAxis} aria-hidden="true">
          {axisIndices.map((index) => {
            const item = buckets[index]!;
            const position = {
              '--_ov-metric-bucket-y': `${(1 - (index + 0.5) / buckets.length) * 100}%`,
            } as CSSProperties;
            return (
              <span key={item.id} style={position}>
                {item.upper === null
                  ? `>${formatMetricText(item.lower, unit)}`
                  : formatMetricText(item.upper, unit)}
              </span>
            );
          })}
        </div>
        <svg
          className={styles.Plot}
          height={Number.isFinite(height) ? Math.max(80, height) : 180}
          viewBox="0 0 600 150"
          preserveAspectRatio="none"
          role="img"
          aria-label={label}
          aria-describedby={id}
          tabIndex={0}
          onFocus={() => setInspecting(true)}
          onBlur={() => setInspecting(false)}
          onPointerLeave={(event) => {
            if (document.activeElement !== event.currentTarget) setInspecting(false);
          }}
          onPointerMove={(event) => {
            if (!drawable) return;
            setInspecting(true);
            const rect = event.currentTarget.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const time = start + ((event.clientX - rect.left) / rect.width) * duration;
            const found = windows.findIndex((item) => time >= item.startMs && time < item.endMs);
            if (found >= 0)
              setFocus({
                column: found,
                row: clampIndex(
                  Math.floor((1 - (event.clientY - rect.top) / rect.height) * buckets.length),
                  buckets.length,
                ),
              });
          }}
          onClick={(event) => {
            if (!drawable) return;
            const rect = event.currentTarget.getBoundingClientRect();
            if (!rect.width) return;
            const time = start + ((event.clientX - rect.left) / rect.width) * duration;
            const clicked = windows.find((item) => time >= item.startMs && time < item.endMs);
            if (clicked) onWindowSelect?.(clicked);
          }}
          onKeyDown={(event) => {
            if (!drawable) return;
            setInspecting(true);
            if (
              [
                'ArrowRight',
                'ArrowLeft',
                'ArrowUp',
                'ArrowDown',
                'Home',
                'End',
                'Enter',
                ' ',
              ].includes(event.key)
            )
              event.preventDefault();
            if (event.key === 'ArrowRight')
              setFocus({ column: clampIndex(column + 1, windows.length), row });
            if (event.key === 'ArrowLeft')
              setFocus({ column: clampIndex(column - 1, windows.length), row });
            if (event.key === 'ArrowUp')
              setFocus({ column, row: clampIndex(row + 1, buckets.length) });
            if (event.key === 'ArrowDown')
              setFocus({ column, row: clampIndex(row - 1, buckets.length) });
            if (event.key === 'Home') setFocus({ column: 0, row });
            if (event.key === 'End') setFocus({ column: windows.length - 1, row });
            if (event.key === 'Enter' || event.key === ' ') choose();
          }}
        >
          <defs>
            <pattern id={`${id}-missing`} width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M0 6L6 0" stroke="var(--ov-color-chart-missing)" />
            </pattern>
          </defs>
          <rect width="600" height="150" fill={`url(#${id}-missing)`} />
          {paths.map((path, index) => (
            <path
              key={index}
              d={path}
              fill={
                index === 5 ? `url(#${id}-missing)` : `var(--ov-color-chart-heatmap-${index + 1})`
              }
            />
          ))}
          {inspecting && window && bucket && duration > 0 && (
            <rect
              x={((window.startMs - start) / duration) * 600}
              y={150 - ((row + 1) / buckets.length) * 150}
              width={((window.endMs - window.startMs) / duration) * 600}
              height={150 / buckets.length}
              className={styles.Inspection}
            />
          )}
          {drawable &&
            windows
              .filter((item) => item.id === selectedWindowId)
              .map((item) => (
                <rect
                  key={item.id}
                  x={((item.startMs - start) / duration) * 600}
                  y="0"
                  width={((item.endMs - item.startMs) / duration) * 600}
                  height="150"
                  className={styles.Selection}
                />
              ))}
        </svg>
      </div>
      <div className={`${styles.Axis} ${styles.TimeAxis}`}>
        {drawable && (
          <>
            <span>{new Date(start).toLocaleTimeString()}</span>
            <span>{new Date(start + duration).toLocaleTimeString()}</span>
          </>
        )}
      </div>
      <div
        id={id}
        className={`${styles.InspectionText} ${styles.HeatmapTooltip}`}
        hidden={!inspecting}
        aria-live="polite"
      >
        {window && bucket
          ? `${new Date(window.startMs).toLocaleString()}–${new Date(window.endMs).toLocaleTimeString()} · ${bucketLabel(bucket, unit)} · ${current === null ? 'Unknown' : current.toLocaleString()} ${measure}`
          : 'No drawable samples'}
      </div>
    </div>
  );
}
