import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DateTimePicker, type DateTimePickerProps } from './DateTimePicker';

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

// ─── Story components (keep hooks legal) ──────────────────────────────────

function DefaultStory(args: DateTimePickerProps) {
  const [value, setValue] = useState<Date | null>(null);
  return <DateTimePicker {...args} value={value} onChange={setValue} />;
}

function WithSecondsStory(args: DateTimePickerProps) {
  const [value, setValue] = useState<Date | null>(new Date());
  return <DateTimePicker {...args} value={value} onChange={setValue} />;
}

function TwelveHourStory(args: DateTimePickerProps) {
  const [value, setValue] = useState<Date | null>(new Date());
  return <DateTimePicker {...args} value={value} onChange={setValue} />;
}

// ─── Story exports ────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => <DefaultStory {...args} />,
};

export const WithSeconds: Story = {
  args: { showSeconds: true },
  render: (args) => <WithSecondsStory {...args} />,
};

export const TwelveHour: Story = {
  args: { hourCycle: 12 },
  render: (args) => <TwelveHourStory {...args} />,
};
