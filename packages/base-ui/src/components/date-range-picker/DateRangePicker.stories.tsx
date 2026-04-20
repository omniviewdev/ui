import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DateRangePicker, type DateRangePickerProps } from './DateRangePicker';
import type { DateRange } from './DateRangePicker';

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  args: {
    disabled: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    rangeSeparator: { control: 'text' },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Story components (keep hooks legal) ──────────────────────────────────

function DefaultStory(args: DateRangePickerProps) {
  const [value, setValue] = useState<DateRange>({ start: null, end: null });
  return <DateRangePicker {...args} value={value} onChange={setValue} />;
}

function ControlledStory(args: DateRangePickerProps) {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + 7);
  const [value, setValue] = useState<DateRange>({ start: today, end });
  return <DateRangePicker {...args} value={value} onChange={setValue} />;
}

function WithMinMaxStory(args: DateRangePickerProps) {
  const [value, setValue] = useState<DateRange>({ start: null, end: null });
  const today = new Date();
  const min = new Date(today);
  min.setDate(today.getDate() - 30);
  const max = new Date(today);
  max.setDate(today.getDate() + 30);
  return (
    <DateRangePicker {...args} value={value} onChange={setValue} min={min} max={max} />
  );
}

function DisabledStory(args: DateRangePickerProps) {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + 7);
  const [value, setValue] = useState<DateRange>({ start: today, end });
  return <DateRangePicker {...args} value={value} onChange={setValue} />;
}

function CustomSeparatorStory(args: DateRangePickerProps) {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + 7);
  const [value, setValue] = useState<DateRange>({ start: today, end });
  return (
    <DateRangePicker {...args} value={value} onChange={setValue} rangeSeparator=" to " />
  );
}

function LocaleGBStory(args: DateRangePickerProps) {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + 7);
  const [value, setValue] = useState<DateRange>({ start: today, end });
  return <DateRangePicker {...args} value={value} onChange={setValue} locale="en-GB" />;
}

// ─── Story exports ────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => <DefaultStory {...args} />,
};

export const Controlled: Story = {
  render: (args) => <ControlledStory {...args} />,
};

export const WithMinMax: Story = {
  render: (args) => <WithMinMaxStory {...args} />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <DisabledStory {...args} />,
};

export const CustomSeparator: Story = {
  render: (args) => <CustomSeparatorStory {...args} />,
};

export const LocaleGB: Story = {
  render: (args) => <LocaleGBStory {...args} />,
};
