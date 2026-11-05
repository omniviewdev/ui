import type { CSSProperties } from 'react';
import { cn } from '../system/classnames';
import { formatMetric, seriesColor, toneColor } from './format';
import type { MetricValueProps } from './types';
import styles from './Scalars.module.css';

type ValueStyle = CSSProperties & { '--_ov-metric-color'?: string };

export function MetricValue({
  value,
  unit,
  color,
  tone,
  size = 'lg',
  format,
  className,
  'aria-label': label,
}: MetricValueProps) {
  const formatted = formatMetric(value, unit, format);
  const valueStyle: ValueStyle = {
    '--_ov-metric-color': tone ? toneColor(tone) : color ? seriesColor('value', color) : undefined,
  };
  return (
    <span
      className={cn(styles.Value, className)}
      data-size={size}
      aria-label={label}
      style={valueStyle}
    >
      <span>{formatted.value}</span>
      {formatted.unit && <span className={styles.Unit}>{formatted.unit}</span>}
    </span>
  );
}
