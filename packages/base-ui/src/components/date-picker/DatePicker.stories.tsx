import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: {
    placeholder: 'Pick a date',
    disabled: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return <DatePicker {...args} value={value} onChange={setValue} placeholder="Pick a date" />;
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date());
    return <DatePicker {...args} value={value} onChange={setValue} />;
  },
};

export const WithMinMax: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    const today = new Date();
    const min = new Date(today);
    min.setDate(today.getDate() - 7);
    const max = new Date(today);
    max.setDate(today.getDate() + 7);
    return (
      <DatePicker
        {...args}
        value={value}
        onChange={setValue}
        min={min}
        max={max}
        placeholder="Within ±7 days"
      />
    );
  },
};

export const LongFormat: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date());
    return (
      <DatePicker
        {...args}
        value={value}
        onChange={setValue}
        format={{ weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date());
    return <DatePicker {...args} value={value} onChange={setValue} />;
  },
};
