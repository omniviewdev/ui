import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimeSeriesChart } from './TimeSeriesChart';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';
import { Button } from '../components/button';

const meta = {
  title: 'Metrics/Components/TimeSeriesChart',
  component: TimeSeriesChart,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Wide}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof TimeSeriesChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    series: [f.cpuSeries],
    domain: f.domain,
    unit: f.cpuUnit,
    mode: 'area',
    height: 180,
    label: 'CPU usage over time',
    references: f.references,
  },
  render: function Controlled(args) {
    const [cursorTimeMs, setCursor] = useState<number | null>(null);
    const [selectedRange, setRange] = useState<import('./types').TimeDomain | null>(null);
    const [hiddenSeriesIds, setHidden] = useState<readonly string[]>([]);
    return (
      <TimeSeriesChart
        {...args}
        cursorTimeMs={cursorTimeMs}
        onCursorTimeChange={setCursor}
        selectedRange={selectedRange}
        onSelectedRangeChange={setRange}
        hiddenSeriesIds={hiddenSeriesIds}
        onHiddenSeriesIdsChange={setHidden}
      />
    );
  },
};
export const Line: Story = {
  ...Default,
  args: { ...Default.args, mode: 'line', series: [f.cpuSeries, f.secondarySeries] },
};
export const SampleBars: Story = { ...Default, args: { ...Default.args, mode: 'sample-bars' } };
export const MissingSamples: Story = {
  ...Default,
  args: { ...Default.args, series: [f.gapSeries], maxGapMs: 180000 },
};
export const Negative: Story = { ...Default, args: { ...Default.args, series: [f.signedSeries] } };
export const Zero: Story = {
  ...Default,
  args: {
    ...Default.args,
    series: [
      { ...f.cpuSeries, points: f.cpuSeries.points.map((point) => ({ ...point, value: 0 })) },
    ],
  },
};

export const BytesNarrow: Story = {
  ...Default,
  args: {
    ...Default.args,
    unit: f.bytesUnit,
    label: 'Memory working set',
    series: [
      {
        ...f.cpuSeries,
        id: 'memory',
        label: 'Memory working set',
        points: f.cpuSeries.points.map((point) => ({
          ...point,
          value: point.value == null ? null : point.value * 24 * 1024 ** 2,
        })),
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ],
};

export const InitialLoading: Story = {
  ...Default,
  args: { ...Default.args, series: [], loading: true },
};
export const Refreshing: Story = {
  ...Default,
  args: { ...Default.args, loading: true },
};
export const Empty: Story = {
  ...Default,
  args: { ...Default.args, series: [] },
};
export const PinnedOffScaleReferences: Story = {
  ...Default,
  args: { ...Default.args, yDomain: [19, 24] },
};
export const NarrowReferences: Story = {
  ...Default,
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ],
};
export const ExtremeReferenceGeometry: Story = {
  ...Default,
  args: {
    ...Default.args,
    mode: 'line',
    series: [
      {
        id: 'extreme',
        label: 'Signed usage',
        points: [
          { timeMs: f.domain.startMs, value: -Number.MAX_VALUE / 2 },
          { timeMs: f.domain.endMs, value: Number.MAX_VALUE / 2 },
        ],
      },
    ],
    references: [
      {
        id: 'extreme-range',
        kind: 'band',
        label: 'Finite range',
        from: -Number.MAX_VALUE,
        to: Number.MAX_VALUE,
      },
    ],
  },
};

function ResizingReferenceLegend() {
  const [narrow, setNarrow] = useState(false);
  return (
    <div data-reference-resize style={{ width: narrow ? 160 : 640, maxWidth: '100%' }}>
      <Button size="sm" onClick={() => setNarrow((current) => !current)}>
        Resize reference legend
      </Button>
      <TimeSeriesChart
        series={[f.cpuSeries]}
        domain={f.domain}
        unit={f.cpuUnit}
        label="Resizing references"
        references={[
          { id: 'request', kind: 'line', label: 'Requested workload allocation', value: 20 },
          { id: 'limit', kind: 'line', label: 'Configured workload limit', value: 25 },
        ]}
      />
    </div>
  );
}
export const WrappedLegendResize: Story = {
  ...Default,
  render: () => <ResizingReferenceLegend />,
  play: async ({ canvasElement }) => {
    const frame = () => {
      const { promise, resolve } = Promise.withResolvers<void>();
      requestAnimationFrame(() => resolve());
      return promise;
    };
    const plot = canvasElement.querySelector('svg')!;
    const check = () => {
      const legend = canvasElement.querySelector<HTMLElement>(
        '[aria-label="Current configuration references"]',
      )!;
      const chart = plot.parentElement!.parentElement!;
      const bounds = chart.getBoundingClientRect();
      if (Math.abs(bounds.height - 180) > 1)
        throw new Error(`Reference chart height changed: ${bounds.height}`);
      if (canvasElement.querySelector('svg') !== plot)
        throw new Error('Legend resize remounted SVG');
      for (const item of legend.querySelectorAll<HTMLElement>('[title]')) {
        const itemBounds = item.getBoundingClientRect();
        if (
          itemBounds.right > bounds.right + 1 ||
          itemBounds.left < bounds.left - 1 ||
          item.scrollWidth > item.clientWidth + 1
        ) {
          throw new Error('Wrapped reference label clips outside chart');
        }
      }
    };
    await frame();
    await frame();
    check();
    canvasElement.querySelector('button')!.click();
    await frame();
    await frame();
    await frame();
    check();
  },
};
