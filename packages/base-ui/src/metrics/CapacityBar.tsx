import type { CSSProperties } from 'react';
import { cn } from '../system/classnames';
import { formatMetricText, seriesColor, toneColor } from './format';
import { MetricValue } from './MetricValue';
import type { CapacityBarProps } from './types';
import styles from './Scalars.module.css';

type CapacityStyle = CSSProperties & {
  '--_ov-metric-color'?: string;
  '--_ov-metric-fill-size'?: string;
  '--_ov-metric-marker-position'?: string;
};

export function CapacityBar({
  value,
  unit,
  bound,
  request,
  thresholds = [],
  color,
  label = 'Usage',
  showValue = true,
  variant = 'full',
  className,
  orientation = 'horizontal',
}: CapacityBarProps) {
  const sample = value !== null && Number.isFinite(value) ? value : null;
  const maximum = bound && Number.isFinite(bound.value) && bound.value > 0 ? bound.value : null;
  const markers = thresholds.filter((t) => Number.isFinite(t.value));
  let active: (typeof markers)[number] | undefined;
  if (sample !== null) {
    for (const marker of markers) {
      if (marker.value <= sample && (!active || marker.value > active.value)) active = marker;
    }
  }
  const fill = active ? toneColor(active.tone) : seriesColor(label, color);
  const percent = sample !== null && maximum !== null ? sample / maximum : null;
  const requestKnown = request != null && Number.isFinite(request);
  const fillStyle: CapacityStyle = {
    '--_ov-metric-fill-size':
      sample !== null && maximum !== null
        ? `${Math.min(1, Math.max(0, sample / maximum)) * 100}%`
        : '0%',
    '--_ov-metric-color': fill,
  };
  const requestStyle: CapacityStyle = {
    '--_ov-metric-marker-position':
      requestKnown && maximum !== null && request >= 0 && request <= maximum
        ? `${(request / maximum) * 100}%`
        : undefined,
  };
  return (
    <div
      className={cn(styles.Capacity, className)}
      data-variant={variant}
      data-orientation={orientation}
      role="group"
      aria-label={label}
    >
      {variant === 'cell' ? null : variant === 'compact' ? (
        showValue && (
          <MetricValue value={sample} unit={unit} size="sm" color={color} tone={active?.tone} />
        )
      ) : (
        <div className={styles.MetricLine}>
          {showValue && (
            <MetricValue value={sample} unit={unit} color={color} tone={active?.tone} />
          )}
          {percent !== null && Number.isFinite(percent) && (
            <span className={styles.Muted}>
              {formatMetricText(percent, { kind: 'ratio' })} of {bound?.kind}
            </span>
          )}
        </div>
      )}
      {maximum !== null ? (
        <>
          <div
            className={styles.Track}
            data-missing={sample === null || undefined}
            role="img"
            aria-label={`${label}: ${formatMetricText(sample, unit)}; ${bound?.kind}: ${formatMetricText(maximum, unit)}`}
          >
            {sample !== null && <span className={styles.Fill} style={fillStyle} />}
            {markers
              .filter((t) => t.value >= 0 && t.value <= maximum)
              .map((t, i) => {
                const markerStyle: CapacityStyle = {
                  '--_ov-metric-marker-position': `${(t.value / maximum) * 100}%`,
                  '--_ov-metric-color': toneColor(t.tone),
                };
                return (
                  <span
                    key={i}
                    className={styles.Marker}
                    style={markerStyle}
                    title={`${t.label || 'Threshold'}: ${formatMetricText(t.value, unit)}`}
                  />
                );
              })}
            {requestKnown && request >= 0 && request <= maximum && (
              <span
                className={styles.Request}
                style={requestStyle}
                title={`Request: ${formatMetricText(request, unit)}`}
              />
            )}
          </div>
          {variant === 'full' && (
            <div className={styles.Axis}>
              <span>{formatMetricText(0, unit)}</span>
              <span>
                {formatMetricText(maximum, unit)} {bound?.kind}
              </span>
            </div>
          )}
        </>
      ) : variant === 'cell' ? (
        <div
          className={styles.Track}
          data-missing="true"
          role="img"
          aria-label={`${label}: ${formatMetricText(sample, unit)}; bound unknown; absolute usage`}
        />
      ) : (
        <p className={styles.Muted}>
          {bound ? 'Invalid bound' : 'No bound supplied'} · Absolute usage
        </p>
      )}
      {variant === 'cell' && showValue && (
        <MetricValue value={sample} unit={unit} size="xs" />
      )}
      {variant === 'full' && (
        <div className={styles.Details}>
          {sample === null && <span>No sample</span>}
          {sample !== null && sample < 0 && <span>Below zero</span>}
          {sample !== null && maximum !== null && sample > maximum && (
            <span>Above {bound?.kind}</span>
          )}
          {requestKnown && <span>Request {formatMetricText(request, unit)}</span>}
          {markers.map((t, i) => {
            const thresholdStyle: CapacityStyle = { '--_ov-metric-color': toneColor(t.tone) };
            return (
              <span key={i} className={styles.Colored} style={thresholdStyle}>
                {t.label || 'Threshold'} {formatMetricText(t.value, unit)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
