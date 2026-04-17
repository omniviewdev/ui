import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DateField } from './DateField';

const meta = {
  title: 'Components/DateField',
  component: DateField,
  tags: ['autodocs'],
  args: {
    mode: 'date',
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    mode: { control: 'select', options: ['date', 'time', 'datetime'] },
    hourCycle: { control: 'inline-radio', options: [12, 24] },
    showSeconds: { control: 'boolean' },
    locale: { control: 'text' },
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DateMode: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return <DateField {...args} mode="date" locale="en-US" value={value} onChange={setValue} />;
  },
};

export const TimeMode24h: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return <DateField {...args} mode="time" hourCycle={24} value={value} onChange={setValue} />;
  },
};

export const TimeMode12h: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <DateField
        {...args}
        mode="time"
        hourCycle={12}
        showSeconds
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const DateTimeMode: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return <DateField {...args} mode="datetime" value={value} onChange={setValue} />;
  },
};

export const LocaleGB: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date());
    return <DateField {...args} mode="date" locale="en-GB" value={value} onChange={setValue} />;
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date());
    return <DateField {...args} disabled value={value} onChange={setValue} />;
  },
};

export const ReadOnly: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date());
    return <DateField {...args} readOnly value={value} onChange={setValue} />;
  },
};
