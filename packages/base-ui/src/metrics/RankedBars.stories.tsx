import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RankedBars } from './RankedBars';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/RankedBars',
  component: RankedBars,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof RankedBars>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    items: f.rankedItems,
    unit: f.cpuUnit,
    label: 'CPU by workload',
    references: f.references,
  },
  render: function Controlled(args) {
    const [selectedId, setSelectedId] = useState<string>();
    return <RankedBars {...args} selectedId={selectedId} onSelect={setSelectedId} />;
  },
};
export const MissingAndZero: Story = {
  ...Default,
  args: {
    ...Default.args,
    items: [
      ...f.rankedItems,
      { id: 'idle', label: 'idle', value: 0 },
      { id: 'unknown', label: 'unknown', value: null },
    ],
  },
};
export const Negative: Story = {
  ...Default,
  args: {
    ...Default.args,
    items: [
      { id: 'loss', label: 'Net decrease', value: -20 },
      { id: 'gain', label: 'Net increase', value: 40 },
    ],
  },
};
export const CoincidentZeroReferences: Story = {
  ...Default,
  args: {
    ...Default.args,
    items: [{ id: 'idle', label: 'Idle workload', value: 0 }],
    references: [
      { id: 'zero', kind: 'line', label: 'Zero target', value: 0 },
      { id: 'zero-band', kind: 'band', label: 'Zero range', from: 0, to: 0 },
    ],
  },
};
