import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker, type DatePickerProps } from './DatePicker';

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

// ─── Story components (keep hooks legal) ──────────────────────────────────

function DefaultStory(args: DatePickerProps) {
  const [value, setValue] = useState<Date | null>(null);
  return <DatePicker {...args} value={value} onChange={setValue} />;
}

function ControlledStory(args: DatePickerProps) {
  const [value, setValue] = useState<Date | null>(new Date());
  return <DatePicker {...args} value={value} onChange={setValue} />;
}

function WithMinMaxStory(args: DatePickerProps) {
  const [value, setValue] = useState<Date | null>(null);
  const today = new Date();
  const min = new Date(today);
  min.setDate(today.getDate() - 7);
  const max = new Date(today);
  max.setDate(today.getDate() + 7);
  return <DatePicker {...args} value={value} onChange={setValue} min={min} max={max} />;
}

function LocaleGBStory(args: DatePickerProps) {
  const [value, setValue] = useState<Date | null>(new Date());
  return <DatePicker {...args} value={value} onChange={setValue} locale="en-GB" />;
}

function DisabledStory(args: DatePickerProps) {
  const [value, setValue] = useState<Date | null>(new Date());
  return <DatePicker {...args} value={value} onChange={setValue} />;
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

export const LocaleGB: Story = {
  render: (args) => <LocaleGBStory {...args} />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <DisabledStory {...args} />,
};
