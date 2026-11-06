# Metrics

Presentation components, exported from `@omniviewdev/base-ui/metrics`. Import `@omniviewdev/base-ui/styles.css` and render inside `ThemeProvider`.

These components consume prepared data. Fetching, batching, permissions, polling, query interpolation, and persisted preferences belong to the caller. They do not depend on a plugin or provider SDK.

## Panel composition

```tsx
import {
  MetricPanel,
  MetricValue,
  MetricDetails,
  TimeSeriesChart,
} from '@omniviewdev/base-ui/metrics';

<MetricPanel
  title="CPU usage"
  state={{ kind: 'data', updating }}
  actions={displayPicker}
  details={{
    color: 'series-2',
    open: detailsOpen,
    onOpenChange: setDetailsOpen,
    content: (
      <MetricDetails source={source} samples={samples} labels={labels} items={diagnostics} />
    ),
  }}
>
  <MetricValue value={currentValue} unit={{ kind: 'cpu', base: 'millicores' }} color="series-2" />
  <TimeSeriesChart
    label="CPU usage history"
    series={series}
    unit={{ kind: 'cpu', base: 'millicores' }}
    domain={domain}
    height={180}
  />
</MetricPanel>;
```

`MetricPanel.details` owns the shared swatch-and-Details disclosure. Supply its content, not a nested disclosure. Use `open` and `onOpenChange` for persisted expansion; omit both for native uncontrolled expansion. `footer` is an additional custom slot, not a second implementation of Details.

`MetricPanel.value` holds the current scalar and owns value-to-plot spacing. Put charts in `children`; child-only compositions remain supported. The panel reserves a bottom gutter between chart axes and its disclosure footer.

For initial loading, use `state={{ kind: 'initial' }}`. Set `loadingChart` when a history chart has no domain yet; omit it for value-only cards. Shared skeletons reserve the normal value and chart geometry. During refresh, retain supplied data and use `state={{ kind: 'data', updating: true }}`.

`MetricDetails` renders a compact source row, Current/History sample table, label pairs, and collapsed diagnostics. Timestamps use epoch milliseconds. Put opaque identifiers and revisions in advanced items.

The reference card uses a 50px header, a 66px value slot, a 180px chart including axes, and a 34px collapsed footer. In Void, its surface and first four series colors match the working IDE. Other themes resolve through chart tokens.

## Components

| Purpose                  | Components                                                                 |
| ------------------------ | -------------------------------------------------------------------------- |
| Frame and values         | `MetricPanel`, `MetricValue`                                               |
| Capacity and objectives  | `CapacityBar`, `Gauge`, `SloSummary`                                       |
| History                  | `TimeSeriesChart`, `StackedTimeSeriesChart`, `Sparkline`                   |
| Comparisons              | `RankedBars`, `SmallMultiples`                                             |
| Distributions and states | `Histogram`, `Heatmap`, `StateTimeline`                                    |
| Controls and metadata    | `MetricDisplayPicker`, `TimeRangeControl`, `MetricLegend`, `MetricDetails` |

## Data and interaction contracts

- Units are explicit. CPU cores differ from millicores; ratios differ from percentages; duration bases and byte display systems are declared.
- Missing or non-finite values remain unknown. Zero remains a valid sample. Capacity percentages require a finite positive bound.

### Reference overlays

`TimeSeriesChart` (line, area, and sample bars), `StackedTimeSeriesChart`, `CapacityBar`, `MetricCell`, `MetricValue`, `Gauge`, and `RankedBars` accept `references?: readonly MetricReference[]`.

For stat/current-only views, pass the same references to `MetricValue`. It shows the shared compact reference summary below the unchanged value/unit text, without inventing a numeric scale. Missing samples can still show current configuration; missing references add no DOM. `MetricPanel.value` grows naturally around the summary.

Replace `MetricAnnotation`/`annotations` with `MetricReference`/`references`, adding `kind: 'line'` to each old annotation. Replace `CapacityBar.request` and `MetricCell.request` with an owner-supplied `{ id: 'request', kind: 'line', label: 'Request', value }` reference. These removed APIs have no compatibility aliases.

```tsx
import { TimeSeriesChart, type MetricReference } from '@omniviewdev/base-ui/metrics';

const configuration: { target: number | null; range?: { min: number; max: number } } = {
  target: 0,
  range: { min: 10, max: 20 },
};
const references: readonly MetricReference[] = [
  { id: 'target', kind: 'line', label: 'Target', value: configuration.target },
  {
    id: 'range',
    kind: 'band',
    label: 'Operating range',
    from: configuration.range?.min,
    to: configuration.range?.max,
  },
];
const domain = { startMs: 0, endMs: 1000 };
const series = [
  {
    id: 'usage',
    label: 'Usage',
    points: [
      { timeMs: 0, value: 12 },
      { timeMs: 1000, value: 15 },
    ],
  },
];
// Supply references alongside the existing samples; no history refetch or remount is needed.
<TimeSeriesChart
  series={series}
  unit={{ kind: 'number' }}
  domain={domain}
  references={references}
  label="Usage"
/>;
```

| Option                                                         | Meaning                                                   |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| `id`, `label`                                                  | Stable identity and inspection name                       |
| `kind: 'line'`, `value?: number \| null`                       | Single value                                              |
| `kind: 'band'`, `from?: number \| null`, `to?: number \| null` | Inclusive ordered interval                                |
| `tone?: MetricTone`                                            | Neutral by default; never an implicit alarm               |
| `source?: string`                                              | Optional configuration provenance shown during inspection |
| `lineStyle?: 'solid' \| 'dashed' \| 'dotted'`                  | Dashed by default                                         |

Reference values use the component's **base unit**, not its formatted display unit. Missing/non-finite lines, incomplete/non-finite bands, and reversed bands are omitted. Zero and zero-width bands remain valid. Coincident geometry groups visually; inspection retains every name and value.

Automatic value axes include references. Explicit `yDomain`, gauge ranges, and capacity bounds remain authoritative; off-scale references stay listed with an outside-range notice. Capacity percentages require a real positive bound; references never create a bound. Unknown-bound cells retain reference inspection on the value tooltip. Reference overlays describe **current supplied configuration**, not historical configuration at each sample timestamp.

Chart `height` (default 180px, constrained to 50–1200px) budgets the plot, its 18px time axis, and the responsive reference legend. References remain visible during initial loading and empty history; they do not create historical samples. Loading and data share this geometry, and refreshing supplied data keeps the SVG mounted. The existing series legend is additional to `height`. If wrapped reference labels consume the budget, the chart grows enough to preserve a 32px plot rather than clipping names. Scalar reference legends wrap naturally; cell inspection never adds an inline legend or changes the reserved value slot.

- Use `MetricCell` in tables. Its thin horizontal or vertical track precedes the compact value. Thresholds color the bar, not the neutral value. References use compact grouped markers and track tooltips without changing row height. Unknown bounds use a hatched track and inspectable references, never invented utilization. `MetricValue size="xs"` provides the same table typography independently.

  Horizontal cells fill the available width. One reserved-width value slot keeps track lengths stable across `0 KiB` and `537 MiB`; number and unit remain visually joined. Tracks hide below 128px rather than crowd the value. Values use at most two fractional digits; oversized custom values truncate with a full-value tooltip. `<MetricCell loading label="Memory" />` shows one shared pulse across the cell and preserves row height, including with reduced motion.

- Series and resources have stable IDs. Independent series retain their timestamps; stacked series use an explicitly aligned frame. Missing stack values are not additive zero.
- Histogram and heatmap buckets are ordered, contiguous, non-cumulative `(lower, upper]` intervals. Open first or last tails use null bounds. Declare count versus rate explicitly.
- Heatmaps preserve unknown cells. State timelines preserve unknown intervals rather than inventing continuity.
- `height` on time-series charts includes the time axis. Pointer inspection uses an overlay and does not add a persistent instruction footer.
- Caller-controlled cursor, range, legend visibility, page, display mode, and time selection enable linked views without hidden shared state.
- `TimeRangeControl.referenceTimeMs` anchors relative-to-absolute editing to the displayed window. Without it, the editor uses the current time.
- Use `state: { kind: 'data', updating: true }` during refresh or range changes to retain the mounted visual. Permission-denied states remove data and details from the DOM.
- Dense plots use bounded geometry; small multiples page resources. Do not mount one full chart per resource in an unbounded list.

## Live review

Storybook includes individual component stories plus Pod, Pod Advanced, Service, Cluster, States, and Large Data compositions. MetricCell stories cover resizable widths and loading transitions. The reference Pod story matches the working IDE. All example data is deterministic fixture data, not a live cluster.
