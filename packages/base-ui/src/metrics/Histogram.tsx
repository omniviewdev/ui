import { useId, useState } from 'react';
import type { HistogramProps } from './types';
import { formatMetricText, seriesColor } from './format';
import { bucketLabel, clampIndex, population, validBuckets } from './distributionGeometry';
import styles from './Distributions.module.css';

export function Histogram({
  buckets,
  values,
  unit,
  measure,
  height = 180,
  selectedBucketId,
  onBucketSelect,
  label,
  className,
}: HistogramProps) {
  const [focus, setFocus] = useState(0);
  const id = useId();
  const valid = validBuckets(buckets);
  const samples = valid ? buckets.map((_, index) => population(values[index])) : [];
  const max = samples.reduce<number>((peak, value) => Math.max(peak, value ?? 0), 1);
  const index = clampIndex(focus, samples.length);
  const bucket = valid ? buckets[index] : undefined;
  const current = population(samples[index]);
  const selected = buckets.findIndex((item) => item.id === selectedBucketId);
  const barWidth = 600 / Math.max(1, buckets.length);
  // Each SVG path contains all bars of one kind; dense data does not add DOM nodes.
  let bars = '';
  let missing = '';
  samples.forEach((value, i) => {
    const x = i * barWidth;
    const h = value === null ? 145 : (value / max) * 145;
    const width = Math.max(0, barWidth - Math.min(2, barWidth / 4));
    const path = `M${x},${150 - h}h${width}v${h}h${-width}Z`;
    if (value === null) missing += path;
    else bars += path;
  });
  return (
    <div className={`${styles.Root} ${className ?? ''}`}>
      <div className={styles.Axis}>
        <span>
          {measure === 'count' ? 'Count' : measure === 'rate' ? 'Rate / second' : 'Density'}
        </span>
        <span>{max.toLocaleString()}</span>
      </div>
      <svg
        className={styles.Plot}
        height={Number.isFinite(height) ? Math.max(80, height) : 180}
        viewBox="0 0 600 174"
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        aria-describedby={id}
        tabIndex={0}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          if (rect.width)
            setFocus(
              clampIndex(
                Math.floor(((event.clientX - rect.left) / rect.width) * buckets.length),
                buckets.length,
              ),
            );
        }}
        onClick={(event) => {
          if (!valid) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (!rect.width) return;
          const clicked =
            buckets[Math.floor(((event.clientX - rect.left) / rect.width) * buckets.length)];
          if (clicked) onBucketSelect?.(clicked.id);
        }}
        onKeyDown={(event) => {
          if (['ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', ' '].includes(event.key))
            event.preventDefault();
          if (event.key === 'ArrowRight') setFocus(clampIndex(index + 1, samples.length));
          if (event.key === 'ArrowLeft') setFocus(clampIndex(index - 1, samples.length));
          if (event.key === 'Home') setFocus(0);
          if (event.key === 'End') setFocus(samples.length - 1);
          if ((event.key === 'Enter' || event.key === ' ') && bucket) onBucketSelect?.(bucket.id);
        }}
      >
        <defs>
          <pattern id={`${id}-missing`} width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M0 6L6 0" stroke="var(--ov-color-chart-missing)" />
          </pattern>
        </defs>
        <path d={missing} fill={`url(#${id}-missing)`} />
        <path d={bars} fill={seriesColor('histogram')} />
        <path d="M0 151H600" stroke="var(--ov-color-chart-axis)" />
        {bucket && (
          <rect
            x={index * barWidth}
            y="0"
            width={barWidth}
            height="151"
            className={styles.Inspection}
          />
        )}
        {selected >= 0 && valid && (
          <rect
            x={selected * barWidth}
            y="0"
            width={barWidth}
            height="151"
            className={styles.Selection}
          />
        )}
      </svg>
      <div id={id} className={styles.InspectionText} aria-live="polite">
        {bucket
          ? `${bucketLabel(bucket, unit)} · ${current === null ? 'Unknown' : formatMetricText(current, measure === 'rate' ? { kind: 'rate', numerator: 'count' } : { kind: 'number' })} ${measure}`
          : 'No drawable buckets'}
      </div>
    </div>
  );
}
