import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DateTimePicker } from './DateTimePicker';

const meta = {
  title: 'Components/DateTimePicker',
  component: DateTimePicker,
  tags: ['autodocs'],
  args: {
    disabled: false,
    showSeconds: false,
    hourCycle: 24,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    showSeconds: { control: 'boolean' },
    hourCycle: { control: 'inline-radio', options: [12, 24] },
  },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return <DateTimePicker {...args} value={value} onChange={setValue} />;
  },
};

export const WithSeconds: Story = {
  args: { showSeconds: true },
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date());
    return <DateTimePicker {...args} value={value} onChange={setValue} />;
  },
};

export const TwelveHour: Story = {
  args: { hourCycle: 12 },
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date());
    return <DateTimePicker {...args} value={value} onChange={setValue} />;
  },
};
