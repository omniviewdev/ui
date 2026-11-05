import type { Meta, StoryObj } from '@storybook/react';
import { Sparkline } from './Sparkline';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/Sparkline',
  component: Sparkline,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof Sparkline>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { series: f.cpuSeries, domain: f.domain, height: 64, label: 'CPU trend' },
};
export const Gaps: Story = { args: { ...Default.args, series: f.gapSeries } };
export const Negative: Story = { args: { ...Default.args, series: f.signedSeries } };
export const Missing: Story = { args: { ...Default.args, series: { ...f.cpuSeries, points: [] } } };
export const Zero: Story = {
  args: {
    ...Default.args,
    series: { ...f.cpuSeries, points: f.cpuSeries.points.map((point) => ({ ...point, value: 0 })) },
  },
};
