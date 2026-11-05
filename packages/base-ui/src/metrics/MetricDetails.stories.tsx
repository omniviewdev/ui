import type { Meta, StoryObj } from '@storybook/react';
import { MetricDetails } from './MetricDetails';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/MetricDetails',
  component: MetricDetails,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof MetricDetails>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { source: f.source, samples: f.samples, labels: f.labels, items: f.details },
};
export const DelayedAndUnknown: Story = {
  args: {
    ...Default.args,
    samples: [
      { ...f.samples[0]!, status: 'delayed' },
      { id: 'history', label: 'History', status: 'unknown' },
    ],
  },
};
export const SourceError: Story = {
  args: { ...Default.args, samples: [{ id: 'current', label: 'Current', status: 'error' }] },
};
export const MetadataOnly: Story = {
  args: { items: [{ id: 'aggregation', label: 'Aggregation', value: 'Average' }, ...f.details] },
};
