import type { Meta, StoryObj } from '@storybook/react';
import { Gauge } from './Gauge';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/Gauge',
  component: Gauge,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof Gauge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    value: 216,
    max: 500,
    unit: { kind: 'cpu', base: 'millicores' },
    label: 'CPU saturation',
    color: 'series-1',
    thresholds: [
      { value: 400, tone: 'warning' },
      { value: 475, tone: 'danger' },
    ],
  },
};
export const OverRange: Story = { args: { ...Default.args, value: 624 } };
export const Missing: Story = { args: { ...Default.args, value: null } };
export const Zero: Story = { args: { ...Default.args, value: 0 } };
export const SignedRange: Story = { args: { ...Default.args, min: -100, value: -35 } };
