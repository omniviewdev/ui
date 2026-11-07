import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SmallMultiples } from './SmallMultiples';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/SmallMultiples',
  component: SmallMultiples,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Wide}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof SmallMultiples>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    items: f.multiples,
    domain: f.domain,
    unit: f.cpuUnit,
    pageSize: 4,
    label: 'CPU by instance',
  },
  render: function Controlled(args) {
    const [page, setPage] = useState(0);
    const [selection, setSelection] = useState<string>();
    return (
      <div className={styles.Stack}>
        <SmallMultiples {...args} page={page} onPageChange={setPage} onSelect={setSelection} />
        {selection && <output className={styles.Caption}>Selected: {selection}</output>}
      </div>
    );
  },
};
export const Missing: Story = {
  ...Default,
  args: {
    ...Default.args,
    items: f.multiples.map((item, index) =>
      index === 1 ? { ...item, value: null, series: { ...item.series, points: [] } } : item,
    ),
  },
};

export const Empty: Story = {
  ...Default,
  args: { ...Default.args, items: [] },
  render: (args) => (
    <div className={styles.Stack}>
      <SmallMultiples {...args} />
      <p>Following section</p>
    </div>
  ),
};
