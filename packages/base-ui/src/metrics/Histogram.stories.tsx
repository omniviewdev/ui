import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Histogram } from './Histogram';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/Histogram',
  component: Histogram,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof Histogram>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    buckets: f.buckets,
    values: f.histogramValues,
    unit: f.latencyUnit,
    measure: 'count',
    height: 180,
    label: 'Request latency distribution',
  },
  render: function Controlled(args) {
    const [selectedBucketId, setSelectedBucketId] = useState<string>();
    return (
      <Histogram
        {...args}
        selectedBucketId={selectedBucketId}
        onBucketSelect={setSelectedBucketId}
      />
    );
  },
};
export const UnknownAndZero: Story = {
  ...Default,
  args: { ...Default.args, values: [0, 64, null, 16, 3] },
};
export const Empty: Story = { ...Default, args: { ...Default.args, values: [], buckets: [] } };
