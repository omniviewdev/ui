import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TimePicker } from './TimePicker';

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  args: {
    hourCycle: 24,
    showSeconds: false,
    minuteStep: 1,
    disabled: false,
  },
  argTypes: {
    hourCycle: { control: 'inline-radio', options: [12, 24] },
    showSeconds: { control: 'boolean' },
    minuteStep: { control: 'select', options: [1, 5, 10, 15, 30] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwentyFourHour: Story = {
  args: { hourCycle: 24 },
  render: (args) => {
    const [value, setValue] = useState<Date>(new Date());
    return <TimePicker {...args} value={value} onChange={setValue} />;
  },
};

export const TwelveHour: Story = {
  args: { hourCycle: 12 },
  render: (args) => {
    const [value, setValue] = useState<Date>(new Date());
    return <TimePicker {...args} value={value} onChange={setValue} />;
  },
};

export const WithSeconds: Story = {
  args: { showSeconds: true },
  render: (args) => {
    const [value, setValue] = useState<Date>(new Date());
    return <TimePicker {...args} value={value} onChange={setValue} />;
  },
};

export const MinuteStep15: Story = {
  args: { minuteStep: 15 },
  render: (args) => {
    const [value, setValue] = useState<Date>(new Date());
    return <TimePicker {...args} value={value} onChange={setValue} />;
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => {
    const [value, setValue] = useState<Date>(new Date());
    return <TimePicker {...args} value={value} onChange={setValue} />;
  },
};
