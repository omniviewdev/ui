import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StackedTimeSeriesChart } from './StackedTimeSeriesChart';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/StackedTimeSeriesChart',
  component: StackedTimeSeriesChart,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Wide}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof StackedTimeSeriesChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    frame: f.frame,
    domain: f.domain,
    unit: f.cpuUnit,
    height: 180,
    label: 'CPU by container',
  },
  render: function Controlled(args) {
    const [cursorTimeMs, setCursor] = useState<number | null>(null);
    const [hiddenSeriesIds, setHidden] = useState<readonly string[]>([]);
    const [selectedRange, setRange] = useState<import('./types').TimeDomain | null>(null);
    return (
      <StackedTimeSeriesChart
        {...args}
        cursorTimeMs={cursorTimeMs}
        onCursorTimeChange={setCursor}
        hiddenSeriesIds={hiddenSeriesIds}
        onHiddenSeriesIdsChange={setHidden}
        selectedRange={selectedRange}
        onSelectedRangeChange={setRange}
      />
    );
  },
};
export const UnknownSamples: Story = {
  ...Default,
  args: {
    ...Default.args,
    frame: {
      ...f.frame,
      series: f.frame.series.map((series) => ({
        ...series,
        values: series.values.map((value, index) => (index > 5 && index < 9 ? null : value)),
      })),
    },
  },
};
export const Zero: Story = {
  ...Default,
  args: {
    ...Default.args,
    frame: {
      ...f.frame,
      series: f.frame.series.map((series) => ({ ...series, values: series.values.map(() => 0) })),
    },
  },
};
