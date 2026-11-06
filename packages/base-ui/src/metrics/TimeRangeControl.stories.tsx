import { useState } from 'react';
import { flushSync } from 'react-dom';
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

/** Drafts stay local until Apply; calendar and time columns share a nested popup. */
export const OpenSidebar: Story = {
  ...AbsoluteRange,
  decorators: [
    (Story) => (
      <div style={{ width: 320, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('button[aria-label="Time range"]')?.click();
  },
};
export const OpenNarrowSidebar: Story = {
  ...OpenSidebar,
  decorators: [
    (Story) => (
      <div style={{ width: 260, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};
export const OpenCalendarAndTime: Story = {
  ...OpenSidebar,
  play: async ({ canvasElement }) => {
    flushSync(() => {
      canvasElement.querySelector<HTMLButtonElement>('button[aria-label="Time range"]')?.click();
    });
    canvasElement.ownerDocument
      .querySelector<HTMLButtonElement>(
        'button[aria-label="Open calendar for Start (local date and time)"]',
      )
      ?.click();
  },
};
