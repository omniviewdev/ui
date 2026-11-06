import type { Meta, StoryObj } from '@storybook/react';
import { MetricValue } from './MetricValue';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/MetricValue',
  component: MetricValue,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof MetricValue>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    value: 21.656,
    unit: f.cpuUnit,
    color: 'series-4',
    size: 'lg',
    format: { maximumFractionDigits: 3 },
  },
};
export const Missing: Story = { args: { ...Default.args, value: null } };
export const Zero: Story = { args: { ...Default.args, value: 0 } };
export const Negative: Story = {
  args: { value: -12.4, unit: { kind: 'percent' }, tone: 'danger' },
};
export const CurrentConfigurationReferences: Story = {
  args: { ...Default.args, references: f.references },
};
export const MissingSampleWithReferences: Story = {
  args: { ...Default.args, value: null, references: f.references },
};
export const ZeroWithReferences: Story = {
  args: {
    ...Default.args,
    value: 0,
    references: [
      {
        id: 'zero',
        kind: 'line',
        label: 'Zero target',
        value: 0,
        source: 'Current supplied configuration',
      },
      { id: 'missing', kind: 'line', label: 'Unknown limit', value: null },
      { id: 'band', kind: 'band', label: 'Incomplete range', from: 0 },
    ],
  },
};
