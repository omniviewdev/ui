import type { CSSProperties, ReactNode } from 'react';

/** All presentation timestamps are epoch milliseconds. */
export interface TimeDomain {
  readonly startMs: number;
  readonly endMs: number;
}
export type TimeSelection =
  | { readonly mode: 'relative'; readonly durationMs: number }
  | { readonly mode: 'absolute'; readonly domain: TimeDomain };
export type MetricUnit =
  | { readonly kind: 'cpu'; readonly base: 'cores' | 'millicores' }
  | { readonly kind: 'bytes'; readonly display: 'binary' | 'decimal' }
  | { readonly kind: 'duration'; readonly base: 'seconds' | 'milliseconds' }
  | { readonly kind: 'ratio' | 'percent' | 'count' | 'number' }
  | { readonly kind: 'rate'; readonly numerator: 'count' | 'bytes' };
export type MetricTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type SeriesColor =
  | 'series-1'
  | 'series-2'
  | 'series-3'
  | 'series-4'
  | 'series-5'
  | 'series-6'
  | 'series-7'
  | 'series-8';
export interface MetricFormatOptions {
  readonly maximumFractionDigits?: number;
  readonly locale?: string;
}
export interface FormattedMetric {
  readonly value: string;
  readonly unit: string;
}
export interface NumericPoint {
  readonly timeMs: number;
  readonly value: number | null;
}
export interface NumericSeries {
  readonly id: string;
  readonly label: string;
  readonly points: readonly NumericPoint[];
  readonly color?: SeriesColor;
  readonly lineStyle?: 'solid' | 'dashed' | 'dotted';
}
export interface AlignedSeries {
  readonly id: string;
  readonly label: string;
  readonly values: readonly (number | null)[];
  readonly color?: SeriesColor;
}
/** Each values column must match timestamps. Nulls remain unknown, never additive zero. */
export interface StackedFrame {
  readonly timestamps: readonly number[];
  readonly series: readonly AlignedSeries[];
}
export interface MetricThreshold {
  readonly value: number;
  readonly tone: MetricTone;
  readonly label?: string;
}
export interface MetricAnnotation {
  readonly id: string;
  readonly value: number;
  readonly label: string;
  readonly tone?: MetricTone;
}
export interface MetricNotice {
  readonly tone: 'info' | 'warning' | 'danger';
  readonly label: string;
  readonly detail?: string;
}
export type MetricPanelState =
  | {
      readonly kind: 'data';
      readonly updating?: boolean;
      readonly notice?: MetricNotice;
      readonly freshness?: 'fresh' | 'delayed' | 'unknown';
      readonly completeness?: 'complete' | 'partial' | 'unknown';
    }
  | { readonly kind: 'initial' | 'empty' | 'denied' | 'unsupported'; readonly message?: string }
  | { readonly kind: 'error'; readonly message: string };
export interface MetricPanelProps {
  title: ReactNode;
  state?: MetricPanelState;
  actions?: ReactNode;
  footer?: ReactNode;
  /** Shared disclosure footer. Supply prepared metadata, not another disclosure wrapper. */
  details?: {
    content: ReactNode;
    color?: SeriesColor;
    label?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  };
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}
export interface MetricValueProps {
  value: number | null;
  unit: MetricUnit;
  color?: SeriesColor;
  tone?: MetricTone;
  size?: 'sm' | 'md' | 'lg';
  format?: MetricFormatOptions;
  className?: string;
  'aria-label'?: string;
}
export interface CapacityBound {
  readonly value: number;
  readonly kind: 'limit' | 'capacity' | 'allocatable' | 'request' | 'target';
}
export interface CapacityBarProps {
  value: number | null;
  unit: MetricUnit;
  bound?: CapacityBound;
  request?: number | null;
  thresholds?: readonly MetricThreshold[];
  color?: SeriesColor;
  label?: string;
  showValue?: boolean;
  /** Compact mode keeps the value and track inline; labels remain available to assistive technology. */
  variant?: 'full' | 'compact';
  className?: string;
}
export interface GaugeProps {
  value: number | null;
  unit: MetricUnit;
  min?: number;
  max: number;
  thresholds?: readonly MetricThreshold[];
  color?: SeriesColor;
  label: string;
  className?: string;
}
export interface RankedItem {
  readonly id: string;
  readonly label: string;
  readonly value: number | null;
  readonly color?: SeriesColor;
}
export interface RankedBarsProps {
  items: readonly RankedItem[];
  unit: MetricUnit;
  limit?: number;
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  label: string;
}
export interface SloSummaryProps {
  objectiveRatio: number;
  observedRatio: number | null;
  windowLabel: string;
  budgetRemainingRatio?: number | null;
  burnRates?: readonly {
    readonly id: string;
    readonly label: string;
    readonly value: number | null;
  }[];
  className?: string;
}
export interface TimeSeriesChartProps {
  series: readonly NumericSeries[];
  unit: MetricUnit;
  domain: TimeDomain;
  mode?: 'line' | 'area' | 'sample-bars';
  height?: number;
  maxGapMs?: number;
  yDomain?: readonly [number, number];
  annotations?: readonly MetricAnnotation[];
  cursorTimeMs?: number | null;
  onCursorTimeChange?: (timeMs: number | null) => void;
  selectedRange?: TimeDomain | null;
  onSelectedRangeChange?: (range: TimeDomain | null) => void;
  hiddenSeriesIds?: readonly string[];
  onHiddenSeriesIdsChange?: (ids: readonly string[]) => void;
  emphasizedSeriesId?: string;
  label: string;
  className?: string;
}
export interface StackedTimeSeriesChartProps extends Omit<
  TimeSeriesChartProps,
  'series' | 'mode' | 'maxGapMs'
> {
  frame: StackedFrame;
}
export interface SparklineProps {
  series: NumericSeries;
  domain: TimeDomain;
  yDomain?: readonly [number, number];
  height?: number;
  label: string;
  className?: string;
}
export interface SmallMultiple {
  readonly id: string;
  readonly label: string;
  readonly series: NumericSeries;
  readonly value: number | null;
}
export interface SmallMultiplesProps {
  items: readonly SmallMultiple[];
  unit: MetricUnit;
  domain: TimeDomain;
  yDomain?: readonly [number, number];
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSelect?: (id: string) => void;
  label: string;
  className?: string;
}
export interface MetricLegendProps {
  items: readonly { readonly id: string; readonly label: string; readonly color?: SeriesColor }[];
  hiddenIds?: readonly string[];
  onHiddenIdsChange?: (ids: readonly string[]) => void;
  emphasizedId?: string;
  onEmphasizedIdChange?: (id: string | undefined) => void;
  label?: string;
  className?: string;
}
/** Sorted contiguous noncumulative buckets describe (lower, upper]; null is an open first/last tail. */
export interface DistributionBucket {
  readonly id: string;
  readonly lower: number | null;
  readonly upper: number | null;
  readonly label?: string;
}
export type DistributionMeasure = 'count' | 'rate' | 'density';
export interface HistogramProps {
  buckets: readonly DistributionBucket[];
  values: readonly (number | null)[];
  unit: MetricUnit;
  measure: DistributionMeasure;
  height?: number;
  selectedBucketId?: string;
  onBucketSelect?: (id: string) => void;
  label: string;
  className?: string;
}
export interface HeatmapWindow extends TimeDomain {
  readonly id: string;
}
/** values[windowIndex][bucketIndex]; null and absent cells are unknown, not zero. */
export interface HeatmapProps {
  buckets: readonly DistributionBucket[];
  windows: readonly HeatmapWindow[];
  values: readonly (readonly (number | null)[])[];
  unit: MetricUnit;
  measure: DistributionMeasure;
  height?: number;
  colorDomain?: readonly [number, number];
  selectedWindowId?: string;
  onWindowSelect?: (window: HeatmapWindow) => void;
  label: string;
  className?: string;
}
export interface TimelineState {
  readonly id: string;
  readonly label: string;
  readonly tone: MetricTone;
}
export interface StateInterval extends TimeDomain {
  readonly id: string;
  readonly stateId: string | null;
}
export interface StateLane {
  readonly id: string;
  readonly label: string;
  readonly intervals: readonly StateInterval[];
}
export interface StateTimelineProps {
  lanes: readonly StateLane[];
  states: readonly TimelineState[];
  domain: TimeDomain;
  onIntervalSelect?: (laneId: string, interval: StateInterval) => void;
  label: string;
  className?: string;
}
export type MetricDisplay =
  | 'line'
  | 'area'
  | 'sample-bars'
  | 'stat'
  | 'capacity'
  | 'gauge'
  | 'stacked'
  | 'timeline'
  | 'histogram'
  | 'heatmap'
  | 'ranking'
  | 'small-multiples'
  | 'slo';
export interface MetricDisplayOption {
  readonly value: MetricDisplay;
  readonly label: string;
  readonly disabled?: boolean;
  readonly reason?: string;
}
export interface MetricDisplayPickerProps {
  value: MetricDisplay;
  options: readonly MetricDisplayOption[];
  onChange: (value: MetricDisplay) => void;
  label?: string;
  presentation?: 'segmented' | 'menu';
  className?: string;
}
export interface TimeRangeControlProps {
  value: TimeSelection;
  onChange: (value: TimeSelection) => void;
  presets?: readonly { readonly label: string; readonly durationMs: number }[];
  /** Anchor relative-to-absolute editing to the displayed window; defaults to the current clock. */
  referenceTimeMs?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  className?: string;
}
export interface MetricDetail {
  readonly id: string;
  readonly label: string;
  readonly value: ReactNode;
  readonly advanced?: boolean;
}
export interface MetricSampleDetail {
  readonly id: string;
  readonly label: string;
  readonly status: 'ok' | 'delayed' | 'unknown' | 'error';
  readonly updatedAtMs?: number;
  readonly validUntilMs?: number;
}
export interface MetricDetailsProps {
  items: readonly MetricDetail[];
  source?: ReactNode;
  samples?: readonly MetricSampleDetail[];
  labels?: Readonly<Record<string, string>>;
  label?: string;
  className?: string;
}
