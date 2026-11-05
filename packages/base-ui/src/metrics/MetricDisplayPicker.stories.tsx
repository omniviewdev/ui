import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MetricDisplayPicker } from './MetricDisplayPicker';
import * as f from './ComponentStoryFixtures';
import styles from './ComponentStories.module.css';

const meta = {
  title: 'Metrics/Components/MetricDisplayPicker',
  component: MetricDisplayPicker,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof MetricDisplayPicker>;
export default meta;
type Story = StoryObj<Omit<import('./types').MetricDisplayPickerProps, 'onChange'>>;
export const Default: Story = {
  args: { value: 'area', options: f.displayOptions, label: 'Visualization' },
  render: function Controlled(args) {
    const [value, setValue] = useState(args.value);
    return <MetricDisplayPicker {...args} value={value} onChange={setValue} />;
  },
};
export const DisabledOption: Story = {
  ...Default,
  args: {
    ...Default.args,
    options: f.displayOptions.map((option) =>
      option.value === 'sample-bars'
        ? { ...option, disabled: true, reason: 'Sample history unavailable' }
        : option,
    ),
  },
};
export const Menu: Story = { ...Default, args: { ...Default.args, presentation: 'menu' } };
