import type { Meta, StoryObj } from '@storybook/react';
import { SloSummary } from './SloSummary';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/SloSummary',
  component: SloSummary,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof SloSummary>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    objectiveRatio: 0.999,
    observedRatio: 0.9996,
    windowLabel: 'Last 30 days',
    budgetRemainingRatio: 0.6,
    burnRates: [
      { id: 'hour', label: '1 hour', value: 0.4 },
      { id: 'day', label: '24 hours', value: 0.7 },
    ],
  },
};
export const ExhaustedBudget: Story = {
  args: { ...Default.args, observedRatio: 0.997, budgetRemainingRatio: -2 },
};
export const Unknown: Story = {
  args: {
    ...Default.args,
    observedRatio: null,
    budgetRemainingRatio: null,
    burnRates: [{ id: 'hour', label: '1 hour', value: null }],
  },
};
