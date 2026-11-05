import type { DistributionBucket, StateInterval, TimeDomain } from './types';
import { formatMetricText } from './format';
import type { MetricUnit } from './types';

export function validDomain(domain: TimeDomain): boolean {
  return (
    Number.isFinite(domain.startMs) &&
    Number.isFinite(domain.endMs) &&
    domain.endMs > domain.startMs &&
    Number.isFinite(domain.endMs - domain.startMs)
  );
}
export function validBuckets(buckets: readonly DistributionBucket[]): boolean {
  const ids = new Set<string>();
  return buckets.every((bucket, index) => {
    if (ids.has(bucket.id)) return false;
    ids.add(bucket.id);
    const { lower, upper } = bucket;
    const previous = buckets[index - 1];
    return (
      (lower === null ? index === 0 : Number.isFinite(lower)) &&
      (upper === null ? index === buckets.length - 1 : Number.isFinite(upper)) &&
      !(lower === null && upper === null) &&
      (lower === null || upper === null || lower < upper) &&
      (index === 0 || (previous !== undefined && lower !== null && previous.upper === lower))
    );
  });
}
export function population(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
export function bucketLabel(bucket: DistributionBucket, unit: MetricUnit): string {
  const bounds =
    bucket.lower === null
      ? bucket.upper === null
        ? 'Invalid bounds'
        : `≤ ${formatMetricText(bucket.upper, unit)} (underflow)`
      : bucket.upper === null
        ? `> ${formatMetricText(bucket.lower, unit)} (overflow)`
        : `(${formatMetricText(bucket.lower, unit)}, ${formatMetricText(bucket.upper, unit)}]`;
  return bucket.label ? `${bucket.label}: ${bounds}` : bounds;
}
export interface TimelineSegment extends TimeDomain {
  readonly interval: StateInterval | null;
}
/** Overlapping intervals are ambiguous, so their intersection remains unknown. */
export function timelineSegments(
  intervals: readonly StateInterval[],
  domain: TimeDomain,
): TimelineSegment[] {
  if (!validDomain(domain)) return [];
  const events = new Map<number, { add: StateInterval[]; remove: StateInterval[] }>();
  const event = (time: number) => {
    let value = events.get(time);
    if (!value) {
      value = { add: [], remove: [] };
      events.set(time, value);
    }
    return value;
  };
  event(domain.startMs);
  event(domain.endMs);
  for (const interval of intervals) {
    if (!validDomain(interval)) continue;
    const start = Math.max(domain.startMs, interval.startMs);
    const end = Math.min(domain.endMs, interval.endMs);
    if (end <= start) continue;
    event(start).add.push(interval);
    event(end).remove.push(interval);
  }
  const active = new Map<StateInterval, number>();
  const times = [...events.keys()].sort((a, b) => a - b);
  const segments: TimelineSegment[] = [];
  for (let i = 0; i < times.length - 1; i++) {
    const time = times[i];
    const end = times[i + 1];
    if (time === undefined || end === undefined) continue;
    const changes = events.get(time);
    if (!changes) continue;
    changes.remove.forEach((interval) => {
      const count = active.get(interval);
      if (count === undefined || count <= 1) active.delete(interval);
      else active.set(interval, count - 1);
    });
    changes.add.forEach((interval) => active.set(interval, (active.get(interval) ?? 0) + 1));
    const only = active.size === 1 ? active.entries().next().value : undefined;
    const interval = only && only[1] === 1 ? only[0] : null;
    const previous = segments[segments.length - 1];
    if (previous && previous.interval === interval)
      segments[segments.length - 1] = { ...previous, endMs: end };
    else segments.push({ startMs: time, endMs: end, interval });
  }
  return segments;
}
export function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(length - 1, index));
}
