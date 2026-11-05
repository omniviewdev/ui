import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimeRangeControl } from './TimeRangeControl';
import { Button } from '../components/button';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/TimeRangeControl',
  component: TimeRangeControl,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof TimeRangeControl>;
export default meta;
type Story = StoryObj<Omit<import('./types').TimeRangeControlProps, 'onChange'>>;
export const Default: Story = {
  args: { value: { mode: 'relative', durationMs: 1800000 }, referenceTimeMs: f.endMs },
  render: function Controlled(args) {
    const [value, setValue] = useState(args.value);
    const [refreshing, setRefreshing] = useState(false);
    return (
      <div className={styles.Stack}>
        <TimeRangeControl
          {...args}
          value={value}
          onChange={setValue}
          refreshing={refreshing}
          onRefresh={() => setRefreshing(true)}
        />
        {refreshing && (
          <Button size="sm" onClick={() => setRefreshing(false)}>
            Complete refresh
          </Button>
        )}
      </div>
    );
  },
};
export const AbsoluteRange: Story = {
  ...Default,
  args: { value: { mode: 'absolute', domain: f.domain } },
};
export const Refreshing: Story = {
  args: {
    value: { mode: 'relative', durationMs: 1800000 },
    referenceTimeMs: f.endMs,
    refreshing: true,
  },
  render: function Controlled(args) {
    const [value, setValue] = useState(args.value);
    const [refreshing, setRefreshing] = useState(true);
    return (
      <div className={styles.Stack}>
        <TimeRangeControl
          {...args}
          value={value}
          onChange={setValue}
          refreshing={refreshing}
          onRefresh={() => setRefreshing(true)}
        />
        <Button size="sm" disabled={!refreshing} onClick={() => setRefreshing(false)}>
          Complete refresh
        </Button>
      </div>
    );
  },
};
