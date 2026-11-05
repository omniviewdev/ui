import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MetricPanel } from './MetricPanel';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/MetricPanel',
  component: MetricPanel,
  args: { title: 'CPU usage' },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof MetricPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
import { MetricValue } from './MetricValue';
import { TimeSeriesChart } from './TimeSeriesChart';
import { MetricDisplayPicker } from './MetricDisplayPicker';
import { MetricDetails } from './MetricDetails';
import type { MetricDisplay, MetricPanelState } from './types';

function CpuCard({
  state = { kind: 'data' },
  expanded = false,
}: {
  state?: MetricPanelState;
  expanded?: boolean;
}) {
  const [display, setDisplay] = useState<MetricDisplay>('area');
  const [detailsOpen, setDetailsOpen] = useState(expanded);
  return (
    <MetricPanel
      title="CPU usage"
      state={state}
      actions={
        <MetricDisplayPicker value={display} options={f.displayOptions} onChange={setDisplay} />
      }
      details={{
        color: 'series-2',
        open: detailsOpen,
        onOpenChange: setDetailsOpen,
        content: (
          <MetricDetails
            source={f.source}
            samples={f.samples}
            labels={f.labels}
            items={f.details}
          />
        ),
      }}
    >
      <div className={styles.PanelValue}>
        <MetricValue
          value={21.656}
          unit={f.cpuUnit}
          size="lg"
          color="series-2"
          format={{ maximumFractionDigits: 3 }}
        />
      </div>
      {display !== 'stat' && (
        <TimeSeriesChart
          series={[f.cpuSeries]}
          unit={f.cpuUnit}
          domain={f.domain}
          mode={display === 'line' ? 'line' : display === 'sample-bars' ? 'sample-bars' : 'area'}
          height={180}
          label="CPU usage history"
        />
      )}
    </MetricPanel>
  );
}
export const Default: Story = { render: () => <CpuCard /> };
export const DetailsExpanded: Story = { render: () => <CpuCard expanded /> };
export const Refresh: Story = {
  render: function RefreshCard() {
    const [updating, setUpdating] = useState(false);
    return (
      <div className={styles.Stack}>
        <CpuCard state={{ kind: 'data', updating }} />
        <button
          className={styles.Control}
          aria-pressed={updating}
          onClick={() => setUpdating((value) => !value)}
        >
          {updating ? 'Complete refresh' : 'Refresh samples'}
        </button>
      </div>
    );
  },
};
export const Delayed: Story = {
  render: () => <CpuCard state={{ kind: 'data', freshness: 'delayed', completeness: 'partial' }} />,
};
export const Unknown: Story = {
  render: () => <CpuCard state={{ kind: 'data', freshness: 'unknown', completeness: 'unknown' }} />,
};
export const Initial: Story = { args: { title: 'CPU', state: { kind: 'initial' } } };
export const Empty: Story = { args: { title: 'CPU', state: { kind: 'empty' } } };
export const Denied: Story = { args: { title: 'CPU', state: { kind: 'denied' } } };
export const Unsupported: Story = { args: { title: 'CPU', state: { kind: 'unsupported' } } };
export const Error: Story = {
  args: { title: 'CPU', state: { kind: 'error', message: 'Source unavailable' } },
};
