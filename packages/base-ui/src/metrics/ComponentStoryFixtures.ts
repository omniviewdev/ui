import type {
  DistributionBucket,
  MetricDetail,
  MetricDisplayOption,
  MetricReference,
  MetricSampleDetail,
  NumericSeries,
  StateLane,
  TimelineState,
} from './types';

export const cpuUnit = { kind: 'cpu', base: 'millicores' } as const;
export const bytesUnit = { kind: 'bytes', display: 'binary' } as const;
export const latencyUnit = { kind: 'duration', base: 'milliseconds' } as const;
/** Includes valid zero, coincident geometry, missing, partial, and invalid inputs. */
export const references: readonly MetricReference[] = [
  {
    id: 'request',
    kind: 'line',
    label: 'Requested allocation',
    value: 20,
    source: 'Current configuration',
  },
  {
    id: 'target',
    kind: 'line',
    label: 'Service target with a long descriptive name',
    value: 20,
    lineStyle: 'dotted',
  },
  { id: 'limit', kind: 'line', label: 'Configured limit', value: 25, lineStyle: 'solid' },
  { id: 'range', kind: 'band', label: 'Preferred operating band', from: 18, to: 23 },
  { id: 'zero', kind: 'line', label: 'Zero baseline', value: 0 },
  { id: 'missing', kind: 'line', label: 'Missing setting', value: null },
  { id: 'partial', kind: 'band', label: 'Partial band', from: 10 },
  { id: 'invalid', kind: 'band', label: 'Reversed band', from: 30, to: 10 },
  { id: 'nonfinite', kind: 'line', label: 'Invalid setting', value: Infinity },
];
export const endMs = Date.UTC(2026, 10, 5, 14, 30);
export const domain = { startMs: endMs - 3 * 60 * 60_000, endMs };
export const cpuSeries: NumericSeries = {
  id: 'cpu',
  label: 'CPU usage',
  color: 'series-2',
  points: Array.from({ length: 181 }, (_, index) => ({
    timeMs: domain.startMs + index * 60_000,
    value:
      index === 180
        ? 21.656
        : 21.2 +
          Math.sin(index * 0.12) * 1.1 +
          Math.sin(index * 1.7) * 0.22 +
          Math.cos(index * 0.39) * 0.18 +
          ((index % 11) - 5) * 0.035,
  })),
};
export const secondarySeries: NumericSeries = {
  id: 'worker',
  label: 'Worker',
  color: 'series-1',
  points: cpuSeries.points.map((point, index) => ({ ...point, value: 6 + (index % 5) })),
};
export const gapSeries: NumericSeries = {
  ...cpuSeries,
  points: cpuSeries.points.map((point, index) => ({
    ...point,
    value: index > 5 && index < 10 ? null : point.value,
  })),
};
export const signedSeries: NumericSeries = {
  ...cpuSeries,
  label: 'Net change',
  points: cpuSeries.points.map((point, index) => ({ ...point, value: ((index % 7) - 3) * 4 })),
};
export const frame = {
  timestamps: cpuSeries.points.map((point) => point.timeMs),
  series: [cpuSeries, secondarySeries].map((series) => ({
    id: series.id,
    label: series.label,
    color: series.color,
    values: series.points.map((point) => point.value),
  })),
};
export const rankedItems = [
  { id: 'api', label: 'api-server', value: 186, color: 'series-4' },
  { id: 'worker', label: 'background-worker', value: 124, color: 'series-2' },
  { id: 'gateway', label: 'gateway', value: 82, color: 'series-1' },
  { id: 'scheduler', label: 'scheduler', value: 36, color: 'series-3' },
] as const;
export const multiples = Array.from({ length: 8 }, (_, index) => ({
  id: `instance-${index}`,
  label: `Instance ${index + 1}`,
  value: 21.656 + index * 3,
  series: {
    ...cpuSeries,
    id: `instance-${index}`,
    points: cpuSeries.points.map((point) => ({ ...point, value: (point.value ?? 0) + index * 3 })),
  },
}));
export const buckets: readonly DistributionBucket[] = [
  { id: 'fast', lower: 0, upper: 25 },
  { id: 'normal', lower: 25, upper: 50 },
  { id: 'medium', lower: 50, upper: 100 },
  { id: 'slow', lower: 100, upper: 250 },
  { id: 'tail', lower: 250, upper: null },
];
export const histogramValues = [18, 64, 42, 16, 3];
export const windows = Array.from({ length: 12 }, (_, index) => ({
  id: `window-${index}`,
  startMs: domain.startMs + index * 900_000,
  endMs: domain.startMs + (index + 1) * 900_000,
}));
export const heatValues = windows.map((_, index) => [
  12 + (index % 4),
  45 + index * 2,
  30 - index,
  8 + (index % 3),
  index % 4,
]);
export const states: readonly TimelineState[] = [
  { id: 'ready', label: 'Ready', tone: 'success' },
  { id: 'pending', label: 'Pending', tone: 'warning' },
  { id: 'failed', label: 'Failed', tone: 'danger' },
];
export const lanes: readonly StateLane[] = ['API', 'Worker', 'Gateway'].map((label, index) => ({
  id: label,
  label,
  intervals: [
    {
      id: `${label}-start`,
      startMs: domain.startMs,
      endMs: domain.startMs + (index + 1) * 180_000,
      stateId: 'pending',
    },
    {
      id: `${label}-ready`,
      startMs: domain.startMs + (index + 1) * 180_000,
      endMs,
      stateId: 'ready',
    },
  ],
}));
export const displayOptions: readonly MetricDisplayOption[] = [
  { value: 'area', label: 'Area' },
  { value: 'line', label: 'Line' },
  { value: 'sample-bars', label: 'Bars' },
  { value: 'stat', label: 'Value' },
];
export const source = 'Kind local monitoring / Prometheus';
export const samples: readonly MetricSampleDetail[] = [
  {
    id: 'current',
    label: 'Current',
    status: 'ok',
    updatedAtMs: endMs,
    validUntilMs: endMs + 60_000,
  },
  {
    id: 'history',
    label: 'History',
    status: 'ok',
    updatedAtMs: endMs,
    validUntilMs: endMs + 120_000,
  },
];
export const labels = {
  cluster: 'kind-kind',
  namespace: 'kube-system',
  pod: 'kube-apiserver-kind-control-plane',
};
export const details: readonly MetricDetail[] = [
  {
    id: 'query',
    label: 'Query',
    value: 'rate(container_cpu_usage_seconds_total[5m])',
    advanced: true,
  },
  { id: 'step', label: 'Step', value: '1 minute', advanced: true },
  { id: 'samples', label: 'Samples', value: '181', advanced: true },
];
