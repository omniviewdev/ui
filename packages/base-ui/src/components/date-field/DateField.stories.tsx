import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DateField, type DateFieldProps } from './DateField';

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

// ─── Story components (keep hooks legal) ──────────────────────────────────

function DateModeStory(args: DateFieldProps) {
  const [value, setValue] = useState<Date | null>(null);
  return <DateField {...args} mode="date" locale="en-US" value={value} onChange={setValue} />;
}

function TimeMode24hStory(args: DateFieldProps) {
  const [value, setValue] = useState<Date | null>(null);
  return <DateField {...args} mode="time" hourCycle={24} value={value} onChange={setValue} />;
}

function TimeMode12hStory(args: DateFieldProps) {
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
}

function DateTimeModeStory(args: DateFieldProps) {
  const [value, setValue] = useState<Date | null>(null);
  return <DateField {...args} mode="datetime" value={value} onChange={setValue} />;
}

function LocaleGBStory(args: DateFieldProps) {
  const [value, setValue] = useState<Date | null>(new Date());
  return <DateField {...args} mode="date" locale="en-GB" value={value} onChange={setValue} />;
}

function DisabledStory(args: DateFieldProps) {
  const [value, setValue] = useState<Date | null>(new Date());
  return <DateField {...args} disabled value={value} onChange={setValue} />;
}

function ReadOnlyStory(args: DateFieldProps) {
  const [value, setValue] = useState<Date | null>(new Date());
  return <DateField {...args} readOnly value={value} onChange={setValue} />;
}

// ─── Story exports ────────────────────────────────────────────────────────

export const DateMode: Story = {
  render: (args) => <DateModeStory {...args} />,
};

export const TimeMode24h: Story = {
  render: (args) => <TimeMode24hStory {...args} />,
};

export const TimeMode12h: Story = {
  render: (args) => <TimeMode12hStory {...args} />,
};

export const DateTimeMode: Story = {
  render: (args) => <DateTimeModeStory {...args} />,
};

export const LocaleGB: Story = {
  render: (args) => <LocaleGBStory {...args} />,
};

export const Disabled: Story = {
  render: (args) => <DisabledStory {...args} />,
};

export const ReadOnly: Story = {
  render: (args) => <ReadOnlyStory {...args} />,
};
