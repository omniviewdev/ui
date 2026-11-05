import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MetricLegend } from './MetricLegend';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/MetricLegend',
  component: MetricLegend,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof MetricLegend>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { items: [f.cpuSeries, f.secondarySeries], label: 'Container series' },
  render: function Controlled(args) {
    const [hiddenIds, setHidden] = useState<readonly string[]>([]);
    const [emphasizedId, setEmphasized] = useState<string>();
    return (
      <MetricLegend
        {...args}
        hiddenIds={hiddenIds}
        onHiddenIdsChange={setHidden}
        emphasizedId={emphasizedId}
        onEmphasizedIdChange={setEmphasized}
      />
    );
  },
};
export const InitiallyHidden: Story = {
  args: { ...Default.args },
  render: function Controlled(args) {
    const [hiddenIds, setHidden] = useState<readonly string[]>(['worker']);
    return <MetricLegend {...args} hiddenIds={hiddenIds} onHiddenIdsChange={setHidden} />;
  },
};
