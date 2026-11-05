import type { SparklineProps } from './types';
import { seriesColor } from './format';
import { linePath, samplePoints, validDomain, valueDomain } from './seriesGeometry';
import styles from './TimePlots.module.css';

export function Sparkline({
  series,
  domain,
  yDomain,
  height = 40,
  label,
  className,
}: SparklineProps) {
  const size = Number.isFinite(height) ? Math.max(16, Math.min(200, height)) : 40;
  const points = samplePoints(series.points, domain, 160);
  const validBounds =
    !yDomain ||
    (Number.isFinite(yDomain[0]) &&
      Number.isFinite(yDomain[1]) &&
      yDomain[1] > yDomain[0] &&
      Number.isFinite(yDomain[1] - yDomain[0]));
  const path =
    validDomain(domain) && validBounds
      ? linePath(points, domain, valueDomain([series], domain, yDomain), size)
      : '';
  return (
    <svg
      className={[styles.Sparkline, className].filter(Boolean).join(' ')}
      role="img"
      aria-label={`${label}${path ? '' : ': No drawable samples'}`}
      viewBox={`0 0 640 ${size}`}
      height={size}
      preserveAspectRatio="none"
    >
      <title>{label}</title>
      <path
        d={path}
        fill="none"
        stroke={seriesColor(series.id, series.color)}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
