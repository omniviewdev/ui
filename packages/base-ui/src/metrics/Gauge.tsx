import { cn } from '../system/classnames';
import { formatMetricText, seriesColor, toneColor } from './format';
import { MetricValue } from './MetricValue';
import type { GaugeProps } from './types';
import styles from './Scalars.module.css';

export function Gauge({
  value,
  unit,
  min = 0,
  max,
  thresholds = [],
  color,
  label,
  className,
}: GaugeProps) {
  const valid =
    Number.isFinite(min) && Number.isFinite(max) && max > min && Number.isFinite(max - min);
  const sample = value !== null && Number.isFinite(value) ? value : null;
  const active =
    sample === null
      ? undefined
      : thresholds
          .filter((t) => Number.isFinite(t.value) && sample >= t.value)
          .sort((a, b) => b.value - a.value)[0];
  const fraction =
    valid && sample !== null ? Math.min(1, Math.max(0, (sample - min) / (max - min))) : 0;
  return (
    <div className={cn(styles.Gauge, className)} role="group" aria-label={label}>
      {valid ? (
        <>
          <svg
            viewBox="0 0 260 150"
            className={styles.GaugeSvg}
            role="img"
            aria-label={`${label}: ${formatMetricText(sample, unit)}; range ${formatMetricText(min, unit)} to ${formatMetricText(max, unit)}`}
          >
            <path
              d="M30 120 A100 100 0 0 1 230 120"
              className={styles.GaugeTrack}
              pathLength="100"
            />
            <path
              d="M30 120 A100 100 0 0 1 230 120"
              fill="none"
              stroke={active ? toneColor(active.tone) : seriesColor(label, color)}
              strokeWidth="11"
              pathLength="100"
              strokeDasharray={`${fraction * 100} 100`}
            />
            {thresholds
              .filter((t) => Number.isFinite(t.value) && t.value >= min && t.value <= max)
              .map((t, i) => {
                const angle = Math.PI * (1 - (t.value - min) / (max - min));
                return (
                  <line
                    key={i}
                    x1={130 + Math.cos(angle) * 91}
                    y1={120 - Math.sin(angle) * 91}
                    x2={130 + Math.cos(angle) * 109}
                    y2={120 - Math.sin(angle) * 109}
                    stroke={toneColor(t.tone)}
                    strokeWidth="2"
                  >
                    <title>
                      {t.label || 'Threshold'}: {formatMetricText(t.value, unit)}
                    </title>
                  </line>
                );
              })}
          </svg>
          <div className={styles.GaugeCenter}>
            <MetricValue value={sample} unit={unit} color={color} tone={active?.tone} />
            <span className={styles.Muted}>
              {sample === null
                ? 'No sample'
                : sample > max
                  ? 'Above range'
                  : sample < min
                    ? 'Below range'
                    : label}
            </span>
          </div>
          <div className={styles.Axis}>
            <span>{formatMetricText(min, unit)}</span>
            <span>{formatMetricText(max, unit)}</span>
          </div>
        </>
      ) : (
        <>
          <MetricValue value={sample} unit={unit} color={color} />
          <p className={styles.Muted}>A finite maximum greater than minimum is required</p>
        </>
      )}
    </div>
  );
}
