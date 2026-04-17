import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DateRangePicker } from './DateRangePicker';
import type { DateRange } from './DateRangePicker';

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  args: {
    placeholder: 'Select a range',
    disabled: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    rangeSeparator: { control: 'text' },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRange>({ start: null, end: null });
    return (
      <DateRangePicker
        {...args}
        value={value}
        onChange={setValue}
        placeholder="Select a range"
      />
    );
  },
};

export const Controlled: Story = {
  render: (args) => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    const [value, setValue] = useState<DateRange>({ start: today, end });
    return <DateRangePicker {...args} value={value} onChange={setValue} />;
  },
};

export const WithMinMax: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRange>({ start: null, end: null });
    const today = new Date();
    const min = new Date(today);
    min.setDate(today.getDate() - 30);
    const max = new Date(today);
    max.setDate(today.getDate() + 30);
    return (
      <DateRangePicker
        {...args}
        value={value}
        onChange={setValue}
        min={min}
        max={max}
        placeholder="Within ±30 days"
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    const [value, setValue] = useState<DateRange>({ start: today, end });
    return <DateRangePicker {...args} value={value} onChange={setValue} />;
  },
};

export const CustomSeparator: Story = {
  render: (args) => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    const [value, setValue] = useState<DateRange>({ start: today, end });
    return (
      <DateRangePicker {...args} value={value} onChange={setValue} rangeSeparator=" to " />
    );
  },
};

export const LongFormat: Story = {
  render: (args) => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    const [value, setValue] = useState<DateRange>({ start: today, end });
    return (
      <DateRangePicker
        {...args}
        value={value}
        onChange={setValue}
        format={{ month: 'long', day: 'numeric' }}
      />
    );
  },
};
