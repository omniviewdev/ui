import type { NumericPoint, NumericSeries, StackedFrame, TimeDomain } from './types';

export const PLOT_WIDTH = 640;
export function validDomain(domain: TimeDomain): boolean {
  return (
    Number.isFinite(domain.startMs) &&
    Number.isFinite(domain.endMs) &&
    domain.endMs > domain.startMs &&
    Number.isFinite(domain.endMs - domain.startMs)
  );
}
export function validPoints(points: readonly NumericPoint[]): boolean {
  let previous = -Infinity;
  for (const point of points) {
    if (
      !Number.isFinite(point.timeMs) ||
      point.timeMs <= previous ||
      (point.value !== null && !Number.isFinite(point.value))
    )
      return false;
    previous = point.timeMs;
  }
  return true;
}
export function lowerBound(points: readonly NumericPoint[], time: number): number {
  let lo = 0;
  let hi = points.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    // mid is inside the nonempty search interval.
    if (points[mid]!.timeMs < time) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
/** Each pixel keeps first/last and extrema. Unknown pixels break paths conservatively. */
export function samplePoints(
  points: readonly NumericPoint[],
  domain: TimeDomain,
  pixels = PLOT_WIDTH,
  maxGapMs?: number,
): NumericPoint[] {
  if (!validDomain(domain) || !validPoints(points)) return [];
  const width = Number.isFinite(pixels)
    ? Math.max(1, Math.min(4096, Math.floor(pixels)))
    : PLOT_WIDTH;
  const result: NumericPoint[] = [];
  const start = lowerBound(points, domain.startMs);
  let i = start;
  while (i < points.length) {
    const first = points[i]!;
    if (first.timeMs > domain.endMs) break;
    const bucket = Math.floor(xPosition(first.timeMs, domain, width));
    let minimum = first;
    let maximum = first;
    let last = first;
    let unknown = false;
    let gap = false;
    while (i < points.length) {
      const point = points[i]!;
      if (
        point.timeMs > domain.endMs ||
        Math.floor(xPosition(point.timeMs, domain, width)) !== bucket
      )
        break;
      if (point.value === null) unknown = true;
      else {
        if (minimum.value === null || point.value < minimum.value) minimum = point;
        if (maximum.value === null || point.value > maximum.value) maximum = point;
      }
      const previous = i > start ? points[i - 1]! : undefined;
      if (previous && maxGapMs !== undefined && point.timeMs - previous.timeMs > maxGapMs)
        gap = true;
      last = point;
      i++;
    }
    if (gap || unknown) result.push({ timeMs: first.timeMs, value: null });
    const retained = [...new Set([first, minimum, maximum, last])].sort(
      (a, b) => a.timeMs - b.timeMs,
    );
    for (const point of retained) {
      // A bucket containing a gap cannot safely connect retained extrema.
      if ((unknown || gap) && result[result.length - 1]?.value !== null)
        result.push({ timeMs: point.timeMs, value: null });
      result.push(point);
    }
    if (unknown) result.push({ timeMs: last.timeMs, value: null });
  }
  return result;
}
export function valueDomain(
  series: readonly NumericSeries[],
  domain: TimeDomain,
  explicit?: readonly [number, number],
): readonly [number, number] {
  if (explicit)
    return Number.isFinite(explicit[0]) &&
      Number.isFinite(explicit[1]) &&
      explicit[1] > explicit[0] &&
      Number.isFinite(explicit[1] - explicit[0])
      ? explicit
      : [0, 1];
  let min = 0;
  let max = 0;
  for (const item of series)
    if (validPoints(item.points))
      for (const p of item.points)
        if (p.timeMs >= domain.startMs && p.timeMs <= domain.endMs && p.value !== null) {
          min = Math.min(min, p.value);
          max = Math.max(max, p.value);
        }
  if (min === max)
    return min === 0 ? [0, 1] : [min - Math.abs(min) * 0.1, max + Math.abs(max) * 0.1];
  return Number.isFinite(max - min) ? [min, max] : [0, 1];
}
export function xPosition(time: number, domain: TimeDomain, width = PLOT_WIDTH): number {
  return ((time - domain.startMs) / (domain.endMs - domain.startMs)) * width;
}
export function yPosition(
  value: number,
  bounds: readonly [number, number],
  height: number,
): number {
  return (
    height -
    ((Math.max(bounds[0], Math.min(bounds[1], value)) - bounds[0]) / (bounds[1] - bounds[0])) *
      height
  );
}
export function linePath(
  points: readonly NumericPoint[],
  domain: TimeDomain,
  bounds: readonly [number, number],
  height: number,
  maxGapMs?: number,
): string {
  let path = '';
  let previous: NumericPoint | undefined;
  for (const p of points) {
    if (p.value === null) {
      previous = undefined;
      continue;
    }
    const x = xPosition(p.timeMs, domain);
    const y = yPosition(p.value, bounds, height);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      previous = undefined;
      continue;
    }
    path += `${previous && !(maxGapMs !== undefined && p.timeMs - previous.timeMs > maxGapMs) ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
    previous = p;
  }
  return path;
}
export function areaPath(
  top: readonly NumericPoint[],
  bottom: readonly NumericPoint[],
  domain: TimeDomain,
  bounds: readonly [number, number],
  height: number,
  maxGapMs?: number,
): string {
  let path = '';
  let upper = '';
  let lower: string[] = [];
  let previous: number | undefined;
  const flush = () => {
    if (upper) path += upper + lower.reverse().join('') + 'Z';
    upper = '';
    lower = [];
    previous = undefined;
  };
  for (let i = 0; i < top.length; i++) {
    const point = top[i]!;
    const base = bottom[i];
    if (point.value === null || !base || base.value === null || base.timeMs !== point.timeMs) {
      flush();
      continue;
    }
    const x = xPosition(point.timeMs, domain);
    const y = yPosition(point.value, bounds, height);
    const by = yPosition(base.value, bounds, height);
    if (![x, y, by].every(Number.isFinite)) {
      flush();
      continue;
    }
    if (previous !== undefined && maxGapMs !== undefined && point.timeMs - previous > maxGapMs)
      flush();
    upper += `${upper ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
    lower.push(`L${x.toFixed(2)},${by.toFixed(2)}`);
    previous = point.timeMs;
  }
  flush();
  return path;
}
export function stackFrame(
  frame: StackedFrame,
  hidden: readonly string[] = [],
): { series: NumericSeries[]; bases: NumericSeries[]; valid: boolean } {
  let previous = -Infinity;
  for (const time of frame.timestamps) {
    if (!Number.isFinite(time) || time <= previous) return { series: [], bases: [], valid: false };
    previous = time;
  }
  if (
    !frame.series.every(
      (s) =>
        s.values.length === frame.timestamps.length &&
        s.values.every((v) => v === null || Number.isFinite(v)),
    )
  )
    return { series: [], bases: [], valid: false };
  const visible = frame.series.filter((s) => !hidden.includes(s.id));
  const known = frame.timestamps.map((_, i) => {
    let positive = 0;
    let negative = 0;
    for (const item of visible) {
      const value = item.values[i];
      if (value == null) return false;
      if (value < 0) negative += value;
      else positive += value;
    }
    return Number.isFinite(positive) && Number.isFinite(negative);
  });
  const positive = frame.timestamps.map(() => 0);
  const negative = frame.timestamps.map(() => 0);
  const bases: NumericSeries[] = [];
  const series = visible.map((item) => {
    const base: NumericPoint[] = [];
    const points = frame.timestamps.map((timeMs, i) => {
      const value = item.values[i];
      if (!known[i] || value == null) {
        base.push({ timeMs, value: null });
        return { timeMs, value: null };
      }
      const totals = value < 0 ? negative : positive;
      // Totals have exactly one entry for each timestamp.
      const before = totals[i]!;
      const after = before + value;
      totals[i] = after;
      base.push({ timeMs, value: before });
      return { timeMs, value: after };
    });
    bases.push({ ...item, points: base });
    return { ...item, points };
  });
  return { series, bases, valid: true };
}
