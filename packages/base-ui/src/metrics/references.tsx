import type { CSSProperties } from 'react';
import type { MetricReference, MetricUnit } from './types';
import { formatMetricText, toneColor } from './format';
import { yPosition } from './seriesGeometry';
import styles from './References.module.css';

export type NormalizedReference = MetricReference & {
  readonly lower: number;
  readonly upper: number;
};
export function normalizeReferences(
  references: readonly MetricReference[] = [],
): NormalizedReference[] {
  return references.flatMap((reference) => {
    const lower = reference.kind === 'line' ? reference.value : reference.from;
    const upper = reference.kind === 'line' ? reference.value : reference.to;
    return lower != null &&
      upper != null &&
      Number.isFinite(lower) &&
      Number.isFinite(upper) &&
      lower <= upper
      ? [{ ...reference, lower, upper }]
      : [];
  });
}
export function referenceDomain(
  domain: readonly [number, number],
  references: readonly NormalizedReference[],
): [number, number] {
  let [lower, upper] = domain;
  for (const reference of references) {
    lower = Math.min(lower, reference.lower);
    upper = Math.max(upper, reference.upper);
  }
  return [lower, upper];
}
export function referenceText(
  reference: NormalizedReference,
  unit: MetricUnit,
  domain?: readonly [number, number],
  includeSource = true,
): string {
  const value =
    reference.kind === 'line'
      ? formatMetricText(reference.lower, unit)
      : `${formatMetricText(reference.lower, unit)} – ${formatMetricText(reference.upper, unit)}`;
  const outside = domain && (reference.lower < domain[0] || reference.upper > domain[1]);
  return `${reference.label}: ${value}${includeSource && reference.source ? ` (${reference.source})` : ''}${outside ? ' · outside displayed range' : ''}`;
}
export function groupReferences(references: readonly NormalizedReference[]) {
  const groups = new Map<string, NormalizedReference[]>();
  for (const reference of references) {
    const key = `${reference.lower}:${reference.upper}`;
    const group = groups.get(key);
    if (group) group.push(reference);
    else groups.set(key, [reference]);
  }
  return [...groups.values()];
}
export function ReferenceLegend({
  references,
  unit,
  domain,
  inspection = false,
}: {
  references: readonly NormalizedReference[];
  unit: MetricUnit;
  domain?: readonly [number, number];
  inspection?: boolean;
}) {
  if (!references.length) return null;
  return (
    <div className={styles.Legend} role="group" aria-label="Current configuration references">
      {references.map((reference, index) => {
        const swatchStyle: CSSProperties = {
          color: toneColor(reference.tone),
        };
        return (
          <span
            key={`${reference.id}:${index}`}
            className={styles.Item}
            title={referenceText(reference, unit, domain)}
          >
            <span
              className={styles.Swatch}
              data-band={reference.kind === 'band' || undefined}
              data-line-style={reference.lineStyle ?? 'dashed'}
              style={swatchStyle}
            />
            {referenceText(reference, unit, domain, inspection)}
          </span>
        );
      })}
    </div>
  );
}
export function ReferenceTrack({
  references,
  unit,
  domain,
  orientation = 'horizontal',
}: {
  references: readonly NormalizedReference[];
  unit: MetricUnit;
  domain: readonly [number, number];
  orientation?: 'horizontal' | 'vertical';
}) {
  const magnitude = Math.max(Math.abs(domain[0]), Math.abs(domain[1]), 1);
  const span = domain[1] / magnitude - domain[0] / magnitude;
  if (!(span > 0)) return null;
  const position = (value: number) => ((value / magnitude - domain[0] / magnitude) / span) * 100;
  return (
    <>
      {groupReferences(references).map((group) => {
        const reference = group[0]!;
        if (reference.upper < domain[0] || reference.lower > domain[1]) return null;
        const start = position(Math.max(domain[0], reference.lower));
        const end = position(Math.min(domain[1], reference.upper));
        const markerStyle: CSSProperties &
          Record<'--reference-start' | '--reference-size', string> = {
          '--reference-start': `${start}%`,
          '--reference-size': `${end - start}%`,
          color: toneColor(reference.tone),
        };
        return (
          <span
            key={`${reference.kind}:${reference.lower}:${reference.upper}`}
            className={styles.Marker}
            data-band={reference.upper > reference.lower || undefined}
            data-orientation={orientation}
            data-line-style={reference.lineStyle ?? 'dashed'}
            style={markerStyle}
            title={group.map((item) => referenceText(item, unit, domain)).join('\n')}
          />
        );
      })}
    </>
  );
}
export function ReferencePlot({
  references,
  unit,
  domain,
  width,
  height,
}: {
  references: readonly NormalizedReference[];
  unit: MetricUnit;
  domain: readonly [number, number];
  width: number;
  height: number;
}) {
  const magnitude = Math.max(Math.abs(domain[0]), Math.abs(domain[1]), 1);
  const span = domain[1] / magnitude - domain[0] / magnitude;
  if (!(span > 0)) return null;
  return (
    <>
      {groupReferences(references).map((group) => {
        const reference = group[0]!;
        if (reference.upper < domain[0] || reference.lower > domain[1]) return null;
        const top = yPosition(reference.upper, domain, height);
        const bottom = yPosition(reference.lower, domain, height);
        return (
          <g
            key={`${reference.kind}:${reference.lower}:${reference.upper}`}
            color={toneColor(reference.tone)}
          >
            {reference.upper > reference.lower && (
              <rect
                x={0}
                y={top}
                width={width}
                height={bottom - top}
                fill="currentColor"
                opacity={0.1}
              />
            )}
            <path
              d={`M0 ${top}H${width}${reference.upper > reference.lower ? `M0 ${bottom}H${width}` : ''}`}
              fill="none"
              stroke="currentColor"
              strokeDasharray={
                reference.lineStyle === 'solid'
                  ? undefined
                  : reference.lineStyle === 'dotted'
                    ? '1 3'
                    : '4 4'
              }
            />
            <title>{group.map((item) => referenceText(item, unit, domain)).join('\n')}</title>
          </g>
        );
      })}
    </>
  );
}
