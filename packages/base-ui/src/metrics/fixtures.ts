import type {
  DistributionBucket,
  HeatmapWindow,
  NumericSeries,
  RankedItem,
  SmallMultiple,
  StackedFrame,
  StateLane,
  TimelineState,
  TimeDomain,
} from './types';

export const fixtureDomain: TimeDomain = {
  startMs: Date.UTC(2026, 10, 5, 12),
  endMs: Date.UTC(2026, 10, 5, 13),
};
export function fixtureSeries(
  id: string,
  label: string,
  base: number,
  amplitude: number,
  count = 121,
): NumericSeries {
  return {
    id,
    label,
    points: Array.from({ length: count }, (_, index) => ({
      timeMs: fixtureDomain.startMs + (index / (count - 1)) * 3600000,
      value: Math.max(
        0,
        base + amplitude * Math.sin(index * 0.18) + amplitude * 0.25 * Math.cos(index * 0.63),
      ),
    })),
  };
}
export const latencySeries = [
  { ...fixtureSeries('p50', 'p50', 42, 8), color: 'series-1' },
  { ...fixtureSeries('p95', 'p95', 124, 22), color: 'series-2' },
  { ...fixtureSeries('p99', 'p99', 318, 45), color: 'series-3' },
] as const;
const cpu: NumericSeries = {
  ...fixtureSeries('application', 'Application', 185, 22),
  color: 'series-1',
};
const proxy: NumericSeries = { ...fixtureSeries('proxy', 'Proxy', 31, 6), color: 'series-2' };
export const cpuFrame: StackedFrame = {
  timestamps: cpu.points.map((point) => point.timeMs),
  series: [cpu, proxy].map((series) => ({
    id: series.id,
    label: series.label,
    values: series.points.map((point) => point.value),
  })),
};
export const timelineStates: readonly TimelineState[] = [
  { id: 'ready', label: 'Ready', tone: 'success' },
  { id: 'not-ready', label: 'Not ready', tone: 'warning' },
];
export const timelineLanes: readonly StateLane[] = ['Pod ready', 'Application', 'Proxy'].map(
  (label, lane) => ({
    id: label,
    label,
    intervals: Array.from({ length: 6 }, (_, index) => ({
      id: `${lane}-${index}`,
      stateId: index === 3 && lane !== 1 ? null : index === 1 && lane === 0 ? 'not-ready' : 'ready',
      startMs: fixtureDomain.startMs + index * 600000,
      endMs: fixtureDomain.startMs + (index + 1) * 600000,
    })),
  }),
);
export const latencyBuckets: readonly DistributionBucket[] = [
  0, 5, 10, 25, 50, 100, 250, 500, 1000,
].map((lower, index, bounds) => ({
  id: `bucket-${index}`,
  lower,
  upper: bounds[index + 1] ?? null,
}));
export const distributionWindows: readonly HeatmapWindow[] = Array.from(
  { length: 30 },
  (_, index) => ({
    id: `window-${index}`,
    startMs: fixtureDomain.startMs + index * 120000,
    endMs: fixtureDomain.startMs + (index + 1) * 120000,
  }),
);
export const distributionValues = distributionWindows.map((_, index) =>
  [1, 3, 15, 40, 30, 4, 0.9, 0.25, 0.05].map(
    (value, bucket) =>
      value *
      (1 +
        0.14 * Math.sin(index * 0.4) +
        (bucket > 5 ? 3 : 0.2) * Math.exp(-Math.pow((index - 20) / 3, 2))),
  ),
);
export const histogramValues = latencyBuckets.map((_, bucket) =>
  Math.round(distributionValues.reduce((sum, values) => sum + values[bucket]! * 120, 0)),
);
export function resourceFixtures(count: number): readonly RankedItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `resource-${index}`,
    label: `${['api', 'worker', 'gateway', 'cache', 'queue'][index % 5]}-${String(index + 1).padStart(3, '0')}`,
    value: index === 5 ? null : Math.round(24 + 192 / (1 + index * 0.17)),
  }));
}
export const resources = resourceFixtures(24);
export function multipleFixtures(
  items: readonly RankedItem[],
  points = 121,
): readonly SmallMultiple[] {
  return items.map((item, index) => ({
    id: item.id,
    label: item.label,
    value: item.value,
    series: fixtureSeries(item.id, item.label, item.value ?? 0, 12 + (index % 8), points),
  }));
}
export const resourceMultiples = multipleFixtures(resources);
export const largeResources = resourceFixtures(2400);
export const largeMultiples = multipleFixtures(largeResources, 361);
export const denseSeries = [fixtureSeries('dense', 'Prepared 24-hour signal', 180, 35, 18000)];
