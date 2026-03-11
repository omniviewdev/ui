import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import type { ComponentColor, ComponentSize } from '../../system/types';
import styles from './Meter.module.css';

export interface MeterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  value: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
  size?: ComponentSize;
  color?: ComponentColor;
  label?: ReactNode;
}

/**
 * Determine the color zone based on HTML meter semantics.
 *
 * When optimum is defined, the zone where optimum lives is "good",
 * the adjacent zone is "medium", and the far zone is "high" (danger).
 */
function computeZone(
  value: number,
  min: number,
  max: number,
  low?: number,
  high?: number,
  optimum?: number,
): 'low' | 'medium' | 'high' {
  const lo = low ?? min;
  const hi = high ?? max;

  // Which region is the value in?
  const valueRegion = value <= lo ? 'low' : value >= hi ? 'high' : 'medium';

  if (optimum === undefined) return valueRegion;

  // Which region is optimum in?
  const optimumRegion = optimum <= lo ? 'low' : optimum >= hi ? 'high' : 'medium';

  if (valueRegion === optimumRegion) return 'medium'; // "good" state
  if (
    (valueRegion === 'low' && optimumRegion === 'high') ||
    (valueRegion === 'high' && optimumRegion === 'low')
  ) {
    return 'high'; // far from optimum = danger
  }
  return 'low'; // adjacent zone = warning
}

export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    value,
    min = 0,
    max = 100,
    low,
    high,
    optimum,
    size = 'md',
    color,
    label,
    className,
    ...props
  },
  ref,
) {
  const clamped = Math.min(max, Math.max(min, value));
  const percentage = max === min ? 0 : ((clamped - min) / (max - min)) * 100;
  const zone = color ? undefined : computeZone(clamped, min, max, low, high, optimum);

  return (
    <div
      ref={ref}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={typeof label === 'string' ? label : undefined}
      className={cn(styles.Root, className)}
      data-ov-size={size}
      data-ov-color={color ?? undefined}
      data-ov-zone={zone ?? undefined}
      {...props}
    >
      {label && <span className={styles.Label}>{label}</span>}
      <div className={styles.Track}>
        <div
          className={styles.Fill}
          style={{ '--_meter-fill-width': `${percentage}%` } as CSSProperties}
        />
      </div>
    </div>
  );
});

Meter.displayName = 'Meter';
