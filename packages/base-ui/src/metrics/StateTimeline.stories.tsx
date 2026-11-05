import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StateTimeline } from './StateTimeline';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/StateTimeline',
  component: StateTimeline,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Wide}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof StateTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { lanes: f.lanes, states: f.states, domain: f.domain, label: 'Readiness history' },
  render: function Controlled(args) {
    const [selection, setSelection] = useState<string>();
    return (
      <div className={styles.Stack}>
        <StateTimeline
          {...args}
          onIntervalSelect={(laneId, interval) =>
            setSelection(laneId + ': ' + (interval.stateId ?? 'Unknown'))
          }
        />
        {selection && <output className={styles.Caption}>{selection}</output>}
      </div>
    );
  },
};
export const Unknown: Story = {
  ...Default,
  args: {
    ...Default.args,
    lanes: [
      {
        id: 'unknown',
        label: 'Unknown instance',
        intervals: [{ id: 'unknown-span', ...f.domain, stateId: null }],
      },
      ...f.lanes,
    ],
  },
};
export const Empty: Story = { ...Default, args: { ...Default.args, lanes: [] } };
