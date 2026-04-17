import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: {
    disabled: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return <DatePicker {...args} value={value} onChange={setValue} />;
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
      />
    );
  },
};

export const LocaleGB: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date());
    return (
      <DatePicker
        {...args}
        value={value}
        onChange={setValue}
        locale="en-GB"
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
