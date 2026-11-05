import type { Meta, StoryObj } from '@storybook/react';
import { CapacityBar } from './CapacityBar';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/CapacityBar',
  component: CapacityBar,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof CapacityBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    value: 376 * 1024 ** 2,
    unit: f.bytesUnit,
    bound: { kind: 'limit', value: 512 * 1024 ** 2 },
    request: 256 * 1024 ** 2,
    color: 'series-4',
    thresholds: [
      { value: 409.6 * 1024 ** 2, tone: 'warning' },
      { value: 486.4 * 1024 ** 2, tone: 'danger' },
    ],
    label: 'Memory usage',
  },
};
export const Unbounded: Story = { args: { ...Default.args, bound: undefined } };
export const OverCapacity: Story = { args: { ...Default.args, value: 1.2 * 1024 ** 3 } };
export const Zero: Story = { args: { ...Default.args, value: 0 } };
export const Missing: Story = { args: { ...Default.args, value: null } };
export const Compact: Story = {
  args: { value: 216, unit: f.cpuUnit, bound: { kind: 'limit', value: 500 }, variant: 'compact' },
  render: (args) => (
    <div className={styles.Stack}>
      <CapacityBar {...args} label="Current CPU" />
      <CapacityBar {...args} value={0} label="Idle CPU" />
      <CapacityBar {...args} value={null} label="Unknown CPU" />
    </div>
  ),
};
