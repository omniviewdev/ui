import { Tooltip } from '../components/tooltip';
import { normalizeReferences, referenceText, ReferenceLegend, ReferenceTrack } from './references';
import type { CSSProperties } from 'react';
import { Skeleton } from '../components/skeleton/Skeleton';
import { cn } from '../system/classnames';
import { formatMetric, formatMetricText, seriesColor, toneColor } from './format';
import { MetricValue } from './MetricValue';
import type { CapacityBarProps } from './types';
import styles from './Scalars.module.css';

type CapacityStyle = CSSProperties & {
  '--_ov-metric-color'?: string;
  '--_ov-metric-fill-size'?: string;
  '--_ov-metric-marker-position'?: string;
};

/**
 * A scrolling table mounts hundreds of loading cells and most are answered within a few frames.
 * A running pulse costs a compositor layer, a style update and an `animationstart` event the
 * moment it starts, for motion nobody lives long enough to see. The placeholder shows at once and
 * begins pulsing only when the wait is long enough to notice. Reduced motion never pulses.
 */
const CELL_PULSE_DELAY_MS = 500;

/**
 * Starts the pulse by writing the attribute directly. A state update would give every placeholder
 * an extra component, hook and render at mount, for the many that are gone before it could fire.
 * The timer is cancelled with the element, so an answered cell never pulses.
 */
function pulseWhenSlow(node: HTMLElement | null) {
  if (node === null) return undefined;
  const timer = setTimeout(
    () => node.setAttribute('data-ov-animation', 'pulse'),
    CELL_PULSE_DELAY_MS,
  );
  return () => clearTimeout(timer);
}

export function CapacityBar({
  value,
  unit,
  bound,
  references,
  thresholds = [],
  color,
  label = 'Usage',
  showValue = true,
  variant = 'full',
  className,
  orientation = 'horizontal',
  loading = false,
}: CapacityBarProps) {
  if (loading && variant === 'cell') {
    return (
      <div
        className={cn(styles.Capacity, className)}
        data-variant="cell"
        data-orientation={orientation}
        aria-busy="true"
        role="group"
        aria-label={`${label}: Loading`}
      >
        <Skeleton
          ref={pulseWhenSlow}
          width="100%"
          height="0.75em"
          variant="rounded"
          animation="none"
          aria-hidden="true"
        />
      </div>
    );
  }
  const sample = !loading && value !== null && Number.isFinite(value) ? value : null;
  const formatted = formatMetric(sample, unit, { maximumFractionDigits: 2 });
  const sampleText = formatMetricText(sample, unit);
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
  const normalizedReferences = normalizeReferences(references);
  const referenceSummary = normalizedReferences
    .map((reference) => referenceText(reference, unit, maximum === null ? undefined : [0, maximum]))
    .join('; ');
  const fillStyle: CapacityStyle = {
    '--_ov-metric-fill-size':
      sample !== null && maximum !== null
        ? `${Math.min(1, Math.max(0, sample / maximum)) * 100}%`
        : '0%',
    '--_ov-metric-color': fill,
  };
  return (
    <div
      className={cn(styles.Capacity, className)}
      data-variant={variant}
      data-orientation={orientation}
      aria-busy={loading || undefined}
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
            aria-label={`${label}: ${sampleText}; ${bound?.kind}: ${formatMetricText(maximum, unit)}${referenceSummary ? `; ${referenceSummary}` : ''}`}
            title={referenceSummary || undefined}
          >
            {sample !== null && <span className={styles.Fill} style={fillStyle} />}
            {variant !== 'cell' &&
              markers
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
            <ReferenceTrack
              references={normalizedReferences}
              unit={unit}
              domain={[0, maximum]}
              orientation={variant === 'cell' ? orientation : 'horizontal'}
            />
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
          aria-label={`${label}: ${sampleText}; bound unknown; absolute usage; ${referenceSummary}`}
          title={referenceSummary || undefined}
        />
      ) : (
        <p className={styles.Muted}>
          {bound ? 'Invalid bound' : 'No bound supplied'} · Absolute usage
        </p>
      )}
      {variant === 'cell' && showValue && (
        <Tooltip.Root>
          <Tooltip.Trigger
            render={<div />}
            className={styles.CellValue}
            tabIndex={0}
            aria-label={`${sampleText}${referenceSummary ? `; ${referenceSummary}` : ''}`}
          >
            <span className={styles.CellNumber}>{formatted.value}</span>
            <span className={styles.CellUnit}>{formatted.unit}</span>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={4}>
              <Tooltip.Popup>
                <div>{sampleText}</div>
                <ReferenceLegend
                  references={normalizedReferences}
                  unit={unit}
                  domain={maximum === null ? undefined : [0, maximum]}
                  inspection
                />
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      )}
      {variant === 'full' && (
        <div className={styles.Details}>
          {sample === null && <span>No sample</span>}
          {sample !== null && sample < 0 && <span>Below zero</span>}
          {sample !== null && maximum !== null && sample > maximum && (
            <span>Above {bound?.kind}</span>
          )}
          <ReferenceLegend
            references={normalizedReferences}
            unit={unit}
            domain={maximum === null ? undefined : [0, maximum]}
          />
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
      {variant === 'compact' && (
        <ReferenceLegend
          references={normalizedReferences}
          unit={unit}
          domain={maximum === null ? undefined : [0, maximum]}
        />
      )}
    </div>
  );
}
