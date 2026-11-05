import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimeSeriesChart } from './TimeSeriesChart';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

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
