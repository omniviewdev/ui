import { useMemo, useState } from 'react';
import { LuPlus, LuX, LuDatabase } from 'react-icons/lu';
import { Button } from '../components/button';
import { Menu } from '../components/menu';
import { MetricPanel } from './MetricPanel';
import { MetricValue } from './MetricValue';
import { TimeSeriesChart } from './TimeSeriesChart';
import { MetricDisplayPicker } from './MetricDisplayPicker';
import { MetricDetails } from './MetricDetails';
import { TimeRangeControl } from './TimeRangeControl';
import {
  bytesUnit,
  cpuSeries,
  cpuUnit,
  details,
  displayOptions,
  domain,
  labels,
  samples,
  source,
} from './ComponentStoryFixtures';
import type { MetricDisplay, NumericSeries, TimeSelection } from './types';
import styles from './PodReference.module.css';

const memorySeries: NumericSeries = {
  id: 'memory',
  label: 'Memory working set',
  color: 'series-4',
  points: cpuSeries.points.map((point, index) => ({
    timeMs: point.timeMs,
    value:
      (index === 180
        ? 496.4
        : 496.4 + Math.sin(index * 0.09) * 1.2 + Math.cos(index * 0.7) * 0.25) *
      1024 *
      1024,
  })),
};
const metrics = [
  { id: 'cpu', title: 'CPU usage', unit: cpuUnit, series: cpuSeries, precision: 3 },
  {
    id: 'memory',
    title: 'Memory working set',
    unit: bytesUnit,
    series: memorySeries,
    precision: 1,
  },
] as const;
const presets = [
  { label: '15 minutes', durationMs: 15 * 60_000 },
  { label: '1 hour', durationMs: 60 * 60_000 },
  { label: '3 hours', durationMs: 3 * 60 * 60_000 },
];
type MetricId = (typeof metrics)[number]['id'];

/** Internal Storybook composition of the original pod metrics view. */
export function PodReference() {
  const [visible, setVisible] = useState<readonly MetricId[]>(['cpu', 'memory']);
  const [selection, setSelection] = useState<TimeSelection>({
    mode: 'relative',
    durationMs: domain.endMs - domain.startMs,
  });
  const [displays, setDisplays] = useState<Record<MetricId, MetricDisplay>>({
    cpu: 'area',
    memory: 'area',
  });
  const [revision, setRevision] = useState(0);
  const visibleDomain =
    selection.mode === 'absolute'
      ? selection.domain
      : { startMs: domain.endMs - selection.durationMs, endMs: domain.endMs };
  const series = useMemo(
    () =>
      metrics.map((metric) => ({
        ...metric.series,
        points: metric.series.points.map((point, index) => ({
          ...point,
          value:
            point.value === null
              ? null
              : point.value +
                (revision === 0
                  ? 0
                  : Math.sin(index * 0.31 + revision) * (metric.id === 'cpu' ? 0.12 : 80_000)),
        })),
      })),
    [revision],
  );

  return (
    <section className={styles.root} aria-label="Pod metrics">
      <div className={styles.toolbar}>
        <span className={styles.source}>
          <LuDatabase aria-hidden="true" />
          {source}
        </span>
        <TimeRangeControl
          value={selection}
          onChange={setSelection}
          referenceTimeMs={domain.endMs}
          presets={presets}
          onRefresh={() => setRevision((current) => current + 1)}
        />
      </div>
      <div className={styles.selection}>
        <div className={styles.chips} aria-label="Visible metrics">
          {metrics
            .filter((metric) => visible.includes(metric.id))
            .map((metric) => (
              <button
                key={metric.id}
                type="button"
                className={styles.chip}
                data-metric={metric.id}
                aria-label={`Remove ${metric.title}`}
                onClick={() => setVisible((current) => current.filter((id) => id !== metric.id))}
              >
                <span className={styles.swatch} aria-hidden="true" />
                {metric.title}
                <LuX aria-hidden="true" />
              </button>
            ))}
          <Menu.Root size="sm" variant="ghost">
            <Menu.Trigger className={styles.add}>
              <LuPlus aria-hidden="true" />
              Add metric
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner>
                <Menu.Popup>
                  {metrics.map((metric) => (
                    <Menu.Item
                      key={metric.id}
                      disabled={visible.includes(metric.id)}
                      onClick={() => setVisible((current) => [...current, metric.id])}
                    >
                      {metric.title}
                    </Menu.Item>
                  ))}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>
      <div className={styles.grid}>
        {metrics.map((metric, index) => {
          if (!visible.includes(metric.id)) return null;
          const currentSeries = series[index]!;
          const points = currentSeries.points.filter(
            (point) => point.timeMs >= visibleDomain.startMs && point.timeMs <= visibleDomain.endMs,
          );
          const value = points.at(-1)?.value ?? null;
          const display = displays[metric.id];
          const diagnosticItems = details.map((item) => ({
            ...item,
            value:
              item.id === 'samples'
                ? String(points.length)
                : item.id === 'query' && metric.id === 'memory'
                  ? 'container_memory_working_set_bytes'
                  : item.value,
          }));
          return (
            <MetricPanel
              key={metric.id}
              className={styles.card}
              title={metric.title}
              actions={
                <MetricDisplayPicker
                  value={display}
                  options={displayOptions}
                  label={`${metric.title} display`}
                  onChange={(next) => setDisplays((current) => ({ ...current, [metric.id]: next }))}
                />
              }
              details={{
                color: metric.series.color,
                content: (
                  <MetricDetails
                    source={source}
                    samples={samples}
                    labels={labels}
                    items={diagnosticItems}
                    label={`${metric.title} details`}
                  />
                ),
              }}
            >
              <div className={styles.values}>
                <MetricValue
                  value={value}
                  unit={metric.unit}
                  color={metric.series.color}
                  size="lg"
                  format={{ maximumFractionDigits: metric.precision }}
                />
              </div>
              <div hidden={display === 'stat'}>
                <TimeSeriesChart
                  series={[currentSeries]}
                  unit={metric.unit}
                  domain={visibleDomain}
                  mode={display === 'line' || display === 'sample-bars' ? display : 'area'}
                  height={180}
                  label={`${metric.title} history`}
                />
              </div>
            </MetricPanel>
          );
        })}
      </div>
      <div className={styles.fixture}>
        <span className={styles.fixtureBadge}>Fixture data</span>
      </div>
      {visible.length === 0 && (
        <div className={styles.empty}>
          No metrics selected.{' '}
          <Button size="sm" variant="ghost" onClick={() => setVisible(['cpu', 'memory'])}>
            Restore metrics
          </Button>
        </div>
      )}
    </section>
  );
}
