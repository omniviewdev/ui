import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Heatmap } from './Heatmap';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/Heatmap',
  component: Heatmap,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Wide}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof Heatmap>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    buckets: f.buckets,
    windows: f.windows,
    values: f.heatValues,
    unit: f.latencyUnit,
    measure: 'count',
    height: 180,
    label: 'Latency over time',
  },
  render: function Controlled(args) {
    const [selectedWindowId, setSelectedWindowId] = useState<string>();
    return (
      <Heatmap
        {...args}
        selectedWindowId={selectedWindowId}
        onWindowSelect={(window) => setSelectedWindowId(window.id)}
      />
    );
  },
};
export const UnknownAndZero: Story = {
  ...Default,
  args: {
    ...Default.args,
    values: f.heatValues.map((row, index) =>
      index === 4 ? [null, null, null, null, null] : index === 7 ? [0, 0, 0, 0, 0] : row,
    ),
  },
};
