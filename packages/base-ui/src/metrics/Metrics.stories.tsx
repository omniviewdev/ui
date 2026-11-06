import { PodReference } from './PodReference';
import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LuPlus, LuX, LuDatabase } from 'react-icons/lu';
import { Button } from '../components/button';
import { Menu } from '../components/menu';
import { DataTable } from '../components/data-table/DataTable';
import { useDataTable } from '../components/data-table/hooks/useDataTable';
import type { DataTableColumnDef } from '../components/data-table/types';
import { MetricPanel } from './MetricPanel';
import { MetricValue } from './MetricValue';
import { MetricCell } from './MetricCell';
import { CapacityBar } from './CapacityBar';
import { Gauge } from './Gauge';
import { RankedBars } from './RankedBars';
import { SloSummary } from './SloSummary';
import { TimeSeriesChart } from './TimeSeriesChart';
import { StackedTimeSeriesChart } from './StackedTimeSeriesChart';
import { Sparkline } from './Sparkline';
import { SmallMultiples } from './SmallMultiples';
import { Histogram } from './Histogram';
import { Heatmap } from './Heatmap';
import { StateTimeline } from './StateTimeline';
import { MetricDisplayPicker } from './MetricDisplayPicker';
import { TimeRangeControl } from './TimeRangeControl';
import { MetricDetails } from './MetricDetails';
import type {
  MetricDisplay,
  MetricPanelState,
  RankedItem,
  TimeDomain,
  TimeSelection,
} from './types';
import styles from './Metrics.stories.module.css';
import {
  cpuFrame,
  denseSeries,
  distributionValues,
  distributionWindows,
  fixtureDomain,
  largeMultiples,
  largeResources,
  latencyBuckets,
  latencySeries,
  resourceMultiples,
  resources,
  timelineLanes,
  timelineStates,
} from './fixtures';
const meta = {
  title: 'Metrics/Compositions',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Deterministic presentation fixtures. No connected source, live backend, or provider integration.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const cpuUnit = { kind: 'cpu', base: 'millicores' } as const;
const bytesUnit = { kind: 'bytes', display: 'binary' } as const;
const durationUnit = { kind: 'duration', base: 'milliseconds' } as const;
const catalog = {
  memory: 'Memory capacity',
  cpu: 'CPU saturation',
  stack: 'CPU by container',
  timeline: 'Readiness history',
  latency: 'Request latency',
  slo: 'Error budget',
  distribution: 'Latency distribution',
  ranking: 'Resource ranking',
  multiples: 'CPU trends',
  table: 'Resource metrics',
};
type PanelId = keyof typeof catalog;
const viewPanels: Record<'pod' | 'service' | 'cluster', readonly PanelId[]> = {
  pod: ['memory', 'cpu', 'stack', 'timeline'],
  service: ['latency', 'slo', 'distribution'],
  cluster: ['ranking', 'multiples', 'table'],
};
const resourceSeries = new Map(largeMultiples.map((item) => [item.id, item.series]));
const tableResources = [...resources];
const largeTableResources = [...largeResources];
const tableColumns: DataTableColumnDef<RankedItem, unknown>[] = [
  { accessorKey: 'label', header: 'Resource', size: 220 },
  {
    accessorKey: 'value',
    header: 'CPU',
    size: 120,
    cell: ({ row }) => <MetricCell value={row.original.value} unit={cpuUnit} />,
  },
  {
    id: 'capacity',
    header: 'Configured capacity',
    size: 200,
    cell: ({ row }) => (
      <MetricCell
        value={row.original.value}
        unit={cpuUnit}
        bound={{ kind: 'limit', value: 500 }}
        className={styles.capacityCell}
        color="series-1"
        label={`${row.original.label} capacity`}
      />
    ),
  },
  {
    id: 'trend',
    header: 'Trend',
    size: 170,
    cell: ({ row }) => (
      <Sparkline
        series={resourceSeries.get(row.original.id)!}
        domain={fixtureDomain}
        height={28}
        label={`${row.original.label} CPU trend`}
      />
    ),
  },
];
function ResourceTable({ large = false }: { large?: boolean }) {
  const table = useDataTable({
    data: large ? largeTableResources : tableResources,
    columns: tableColumns,
    getRowId: (item) => item.id,
  });
  return (
    <DataTable.Root table={table} size="sm" hoverable>
      <DataTable.Container height={260}>
        <DataTable.Header />
        <DataTable.VirtualBody<RankedItem> fixedRowHeight estimateRowSize={42} overscan={3} />
      </DataTable.Container>
    </DataTable.Root>
  );
}
function Composition({ view }: { view: 'pod' | 'service' | 'cluster' }) {
  const [panels, setPanels] = useState<readonly PanelId[]>(viewPanels[view]);
  const [selection, setSelection] = useState<TimeSelection>({
    mode: 'relative',
    durationMs: 3600000,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [revision, setRevision] = useState(0);
  const [modes, setModes] = useState<
    Record<'memory' | 'cpu' | 'distribution' | 'latency', MetricDisplay>
  >({ memory: 'capacity', cpu: 'gauge', distribution: 'heatmap', latency: 'line' });
  const [cursor, setCursor] = useState<number | null>(null);
  const [range, setRange] = useState<TimeDomain | null>(null);
  const [hidden, setHidden] = useState<readonly string[]>([]);
  const [emphasized, setEmphasized] = useState<string | undefined>('p95');
  const [selectedResource, setSelectedResource] = useState<string>();
  const [page, setPage] = useState(0);
  useEffect(() => {
    if (!refreshing) return;
    const timer = setTimeout(() => {
      setRefreshing(false);
      setRevision((value) => value + 1);
    }, 1200);
    return () => clearTimeout(timer);
  }, [refreshing]);
  const domain =
    range ??
    (selection.mode === 'absolute'
      ? selection.domain
      : { startMs: fixtureDomain.endMs - selection.durationMs, endMs: fixtureDomain.endMs });
  const state: MetricPanelState = { kind: 'data', updating: refreshing };
  const setMode = (id: string, mode: MetricDisplay) =>
    setModes((current) => ({ ...current, [id]: mode }));
  const picker = (id: 'memory' | 'cpu') => (
    <MetricDisplayPicker
      value={modes[id]}
      onChange={(mode) => setMode(id, mode)}
      options={[
        { value: 'capacity', label: 'Capacity bar' },
        { value: 'gauge', label: 'Gauge' },
        { value: 'stat', label: 'Stat' },
        {
          value: 'stacked',
          label: 'Stacked area',
          disabled: true,
          reason: 'Requires aligned additive series',
        },
      ]}
    />
  );
  return (
    <main className={styles.sheet}>
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Presentation fixture · {view}</span>
          <h1>
            {view === 'pod'
              ? 'api-001'
              : view === 'service'
                ? 'Checkout service'
                : 'Cluster overview'}
          </h1>
        </div>
        <span className={styles.fixture}>Fixture data</span>
      </header>
      <div className={styles.toolbar}>
        <span className={styles.source}>
          <LuDatabase /> Prepared sample source
        </span>
        <TimeRangeControl
          value={selection}
          referenceTimeMs={fixtureDomain.endMs}
          onChange={(next) => {
            setSelection(next);
            setRange(null);
          }}
          onRefresh={() => setRefreshing(true)}
          refreshing={refreshing}
        />
      </div>
      <div className={styles.chips}>
        {panels.map((id) => (
          <Button
            key={id}
            variant="soft"
            size="sm"
            onClick={() => setPanels((current) => current.filter((item) => item !== id))}
            aria-label={`Remove ${catalog[id]}`}
          >
            {catalog[id]}
            <LuX />
          </Button>
        ))}
        <Menu.Root size="sm" variant="ghost">
          <Menu.Trigger>
            <LuPlus />
            Add metric
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup>
                {viewPanels[view].map((id) => (
                  <Menu.Item
                    key={id}
                    disabled={panels.includes(id)}
                    onClick={() => setPanels((current) => [...current, id])}
                  >
                    {catalog[id]}
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
      {range && (
        <Button size="sm" variant="soft" onClick={() => setRange(null)}>
          Clear inspected interval
        </Button>
      )}
      {selectedResource && (
        <p className={styles.selection}>
          Inspecting {resources.find((item) => item.id === selectedResource)?.label}
        </p>
      )}
      <div className={styles.grid}>
        {panels.map((id) => {
          const wide = id === 'distribution' || id === 'table';
          let content;
          let actions;
          if (id === 'memory' || id === 'cpu') {
            const value = id === 'memory' ? (376 + (revision % 3)) * 1048576 : 216 + (revision % 3);
            const max = id === 'memory' ? 512 * 1048576 : 500;
            const unit = id === 'memory' ? bytesUnit : cpuUnit;
            actions = picker(id);
            content = (
              <div className={styles.scalar}>
                {modes[id] === 'stat' ? (
                  <MetricValue
                    value={value}
                    unit={unit}
                    color={id === 'memory' ? 'series-2' : 'series-1'}
                    size="lg"
                  />
                ) : modes[id] === 'gauge' ? (
                  <Gauge
                    value={value / max}
                    max={1}
                    unit={{ kind: 'ratio' }}
                    color={id === 'memory' ? 'series-2' : 'series-1'}
                    label={catalog[id]}
                  />
                ) : (
                  <CapacityBar
                    value={value}
                    unit={unit}
                    color={id === 'memory' ? 'series-2' : 'series-1'}
                    bound={{ kind: 'limit', value: max }}
                    request={max / 2}
                    label={catalog[id]}
                  />
                )}
                <MetricDetails
                  items={[
                    {
                      id: 'request',
                      label: 'Request',
                      value: <MetricValue value={max / 2} unit={unit} size="sm" />,
                    },
                    {
                      id: 'limit',
                      label: 'Limit',
                      value: <MetricValue value={max} unit={unit} size="sm" />,
                    },
                    {
                      id: 'headroom',
                      label: 'Headroom',
                      value: <MetricValue value={max - value} unit={unit} size="sm" />,
                    },
                  ]}
                />
              </div>
            );
          } else if (id === 'stack')
            content = (
              <>
                <div className={styles.valueRow}>
                  <MetricValue value={216} unit={cpuUnit} color="series-1" size="lg" />
                  <span>Pod total</span>
                </div>
                <StackedTimeSeriesChart
                  frame={cpuFrame}
                  unit={cpuUnit}
                  domain={domain}
                  cursorTimeMs={cursor}
                  onCursorTimeChange={setCursor}
                  selectedRange={range}
                  onSelectedRangeChange={setRange}
                  label="CPU by container"
                  height={180}
                />
              </>
            );
          else if (id === 'timeline')
            content = (
              <StateTimeline
                lanes={timelineLanes}
                states={timelineStates}
                domain={domain}
                onIntervalSelect={(_, interval) => setRange(interval)}
                label="Readiness history"
              />
            );
          else if (id === 'latency') {
            actions = (
              <MetricDisplayPicker
                value={modes.latency}
                options={[
                  { value: 'line', label: 'Lines' },
                  { value: 'area', label: 'Area' },
                ]}
                onChange={(mode) => setMode(id, mode)}
              />
            );
            content = (
              <>
                <div className={styles.percentiles}>
                  {latencySeries.map((series) => (
                    <Button
                      key={series.id}
                      variant={emphasized === series.id ? 'soft' : 'ghost'}
                      onClick={() => setEmphasized(series.id)}
                    >
                      <span>{series.label}</span>
                      <MetricValue
                        value={series.points.at(-1)?.value ?? null}
                        unit={durationUnit}
                        size="md"
                        format={{ maximumFractionDigits: 1 }}
                        color={
                          series.id === 'p95'
                            ? 'series-2'
                            : series.id === 'p99'
                              ? 'series-3'
                              : 'series-1'
                        }
                      />
                    </Button>
                  ))}
                </div>
                <TimeSeriesChart
                  series={latencySeries}
                  unit={durationUnit}
                  mode={modes.latency === 'area' ? 'area' : 'line'}
                  domain={domain}
                  cursorTimeMs={cursor}
                  onCursorTimeChange={setCursor}
                  selectedRange={range}
                  onSelectedRangeChange={setRange}
                  hiddenSeriesIds={hidden}
                  onHiddenSeriesIdsChange={setHidden}
                  emphasizedSeriesId={emphasized}
                  annotations={[{ id: 'target', value: 300, label: 'p95 target', tone: 'warning' }]}
                  height={180}
                  label="Request latency percentiles"
                />
              </>
            );
          } else if (id === 'slo')
            content = (
              <SloSummary
                objectiveRatio={0.999}
                observedRatio={0.999724}
                budgetRemainingRatio={0.724}
                windowLabel="30 days"
                burnRates={[
                  { id: '5m', label: '5m burn', value: 0.6 },
                  { id: '1h', label: '1h burn', value: 0.4 },
                ]}
              />
            );
          else if (id === 'distribution') {
            actions = (
              <MetricDisplayPicker
                value={modes.distribution}
                options={[
                  { value: 'heatmap', label: 'Heatmap' },
                  { value: 'histogram', label: 'Histogram' },
                ]}
                onChange={(mode) => setMode(id, mode)}
              />
            );
            const windowIndices = distributionWindows
              .map((window, index) => ({ window, index }))
              .filter(
                ({ window }) => window.startMs < domain.endMs && window.endMs > domain.startMs,
              );
            const counts = latencyBuckets.map((_, bucket) =>
              Math.round(
                windowIndices.reduce(
                  (sum, { window, index }) =>
                    sum +
                    (distributionValues[index]![bucket]! *
                      (Math.min(window.endMs, domain.endMs) -
                        Math.max(window.startMs, domain.startMs))) /
                      1000,
                  0,
                ),
              ),
            );
            content =
              modes.distribution === 'histogram' ? (
                <Histogram
                  buckets={latencyBuckets}
                  values={counts}
                  measure="count"
                  unit={durationUnit}
                  label="Latency bucket request counts for selected range"
                  height={190}
                />
              ) : (
                <Heatmap
                  buckets={latencyBuckets}
                  windows={windowIndices.map((item) => item.window)}
                  values={windowIndices.map((item) => distributionValues[item.index]!)}
                  measure="rate"
                  unit={durationUnit}
                  colorDomain={[0, 50]}
                  onWindowSelect={setRange}
                  label="Latency bucket rates; select interval to inspect"
                  height={190}
                />
              );
          } else if (id === 'ranking')
            content = (
              <RankedBars
                items={resources}
                unit={cpuUnit}
                limit={5}
                label="Top 5 of 24 resources"
                selectedId={selectedResource}
                onSelect={setSelectedResource}
              />
            );
          else if (id === 'multiples')
            content = (
              <SmallMultiples
                items={resourceMultiples}
                unit={cpuUnit}
                domain={domain}
                page={page}
                pageSize={4}
                onPageChange={setPage}
                onSelect={setSelectedResource}
                label="CPU trends"
              />
            );
          else content = <ResourceTable />;
          return (
            <MetricPanel
              key={id}
              title={catalog[id]}
              className={wide ? styles.wide : undefined}
              state={state}
              actions={actions}
              details={{
                color: id === 'memory' ? 'series-2' : 'series-1',
                content: (
                  <MetricDetails
                    source="Prepared sample source"
                    items={[
                      {
                        id: 'window',
                        label: 'Window',
                        value: `${new Date(domain.startMs).toLocaleTimeString()}–${new Date(domain.endMs).toLocaleTimeString()}`,
                      },
                      { id: 'identity', label: 'Panel', value: id, advanced: true },
                    ]}
                  />
                ),
              }}
            >
              {content}
            </MetricPanel>
          );
        })}
      </div>
      <footer className={styles.footer}>Fixture data</footer>
    </main>
  );
}
export const Pod: Story = { render: () => <PodReference /> };
export const PodAdvanced: Story = { render: () => <Composition view="pod" /> };
export const Service: Story = { render: () => <Composition view="service" /> };
export const Cluster: Story = { render: () => <Composition view="cluster" /> };
function StateExamples() {
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (!refreshing) return;
    const timer = setTimeout(() => setRefreshing(false), 1500);
    return () => clearTimeout(timer);
  }, [refreshing]);
  return (
    <main className={styles.sheet}>
      <header className={styles.heading}>
        <h1>Presentation states</h1>
        <span className={styles.fixture}>Fixture data</span>
      </header>
      <div className={styles.grid}>
        <MetricPanel title="No samples" state={{ kind: 'empty' }} />
        <MetricPanel title="Unknown is not zero">
          <MetricValue value={null} unit={cpuUnit} />
          <CapacityBar value={null} unit={cpuUnit} bound={{ kind: 'limit', value: 500 }} />
        </MetricPanel>
        <MetricPanel title="Valid zero">
          <MetricValue value={0} unit={cpuUnit} />
          <CapacityBar value={0} unit={cpuUnit} bound={{ kind: 'limit', value: 500 }} />
        </MetricPanel>
        <MetricPanel title="No configured bound">
          <CapacityBar value={216} unit={cpuUnit} request={250} />
        </MetricPanel>
        <MetricPanel
          title="Access denied"
          state={{ kind: 'denied', message: 'Fixture permission does not allow this metric.' }}
        />
        <MetricPanel
          title="Source error"
          state={{ kind: 'error', message: 'Fixture source returned an error.' }}
        />
        <MetricPanel
          title="Partial coverage"
          state={{
            kind: 'data',
            completeness: 'partial',
            notice: {
              tone: 'warning',
              label: 'Partial samples',
              detail: 'Unknown intervals remain gaps.',
            },
          }}
        >
          <TimeSeriesChart
            series={[
              {
                ...denseSeries[0]!,
                points: denseSeries[0]!.points.map((point, index) =>
                  index > 6000 && index < 9000 ? { ...point, value: null } : point,
                ),
              },
            ]}
            unit={cpuUnit}
            domain={fixtureDomain}
            label="Partial CPU history"
          />
        </MetricPanel>
        <MetricPanel
          title="Delayed observation"
          state={{
            kind: 'data',
            freshness: 'delayed',
            notice: { tone: 'warning', label: 'Last observed 8 minutes ago' },
          }}
        >
          <MetricValue value={216} unit={cpuUnit} />
        </MetricPanel>
        <MetricPanel
          title="Retained while refreshing"
          state={{ kind: 'data', updating: refreshing }}
          actions={
            <Button size="sm" disabled={refreshing} onClick={() => setRefreshing(true)}>
              Refresh fixture
            </Button>
          }
        >
          <TimeSeriesChart
            series={denseSeries}
            unit={cpuUnit}
            domain={fixtureDomain}
            label="Retained CPU history"
          />
        </MetricPanel>
      </div>
    </main>
  );
}
export const States: Story = { render: () => <StateExamples /> };
function LargeDataExample() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string>();
  return (
    <main className={styles.sheet}>
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Prepared fixture · bounded rendering</span>
          <h1>2,400 resources · 18,000 samples</h1>
        </div>
        <span className={styles.fixture}>Fixture data</span>
      </header>
      <div className={styles.grid}>
        <MetricPanel
          title="Dense history"
          details={{
            color: 'series-2',
            content: (
              <MetricDetails
                source="Prepared sample source"
                items={[{ id: 'samples', label: 'Samples', value: '18,000' }]}
              />
            ),
          }}
        >
          <TimeSeriesChart
            series={denseSeries}
            unit={cpuUnit}
            domain={fixtureDomain}
            label="Dense prepared CPU history"
          />
        </MetricPanel>
        <MetricPanel
          title="Top resources"
          details={{
            content: (
              <MetricDetails
                source="Prepared sample source"
                items={[{ id: 'resources', label: 'Resources', value: '2,400' }]}
              />
            ),
          }}
        >
          <RankedBars
            items={largeResources}
            limit={8}
            unit={cpuUnit}
            label="Large resource ranking"
            selectedId={selected}
            onSelect={setSelected}
          />
        </MetricPanel>
        <MetricPanel
          title="Paged resource trends"
          className={styles.wide}
          details={{
            content: (
              <MetricDetails
                source="Prepared sample source"
                items={[
                  { id: 'resources', label: 'Resources', value: '2,400' },
                  { id: 'samples', label: 'Samples per resource', value: '361' },
                ]}
              />
            ),
          }}
        >
          <SmallMultiples
            items={largeMultiples}
            unit={cpuUnit}
            domain={fixtureDomain}
            page={page}
            pageSize={6}
            onPageChange={setPage}
            onSelect={setSelected}
            label="Large paged trends"
          />
        </MetricPanel>
        <MetricPanel title="Virtual metric rows" className={styles.wide}>
          <ResourceTable large />
        </MetricPanel>
      </div>
      {selected && (
        <p className={styles.selection}>
          Selected {largeResources.find((item) => item.id === selected)?.label}
        </p>
      )}
    </main>
  );
}
export const LargeData: Story = { render: () => <LargeDataExample /> };
