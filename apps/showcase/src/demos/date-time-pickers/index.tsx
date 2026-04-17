import { useState } from 'react';
import {
  DatePicker,
  TimePicker,
  DateTimePicker,
  Stack,
  Card,
  Heading,
  Text,
} from '@omniviewdev/base-ui';

const today = new Date();
const twoWeeksAgo = new Date(today);
twoWeeksAgo.setDate(today.getDate() - 14);
const twoWeeksAhead = new Date(today);
twoWeeksAhead.setDate(today.getDate() + 14);

function formatDateDisplay(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimeDisplay(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDateTimeDisplay(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DateTimePickersDemo() {
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date>(today);
  const [dateTime, setDateTime] = useState<Date | null>(null);

  return (
    <Stack direction="column" spacing={4} style={{ padding: '2rem', maxWidth: 640 }}>
      <Stack direction="column" spacing={1}>
        <Heading level={2}>Date &amp; Time Pickers</Heading>
        <Text tone="muted">
          Interactive demo of DatePicker, TimePicker, and DateTimePicker components.
        </Text>
      </Stack>

      {/* DatePicker */}
      <Card elevation={0}>
        <Card.Header>
          <Card.Title>DatePicker</Card.Title>
          <Card.Description>
            Calendar popover with min/max bounds (±14 days from today).
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <Stack direction="row" spacing={3} align="center">
            <DatePicker
              value={date}
              onChange={setDate}
              min={twoWeeksAgo}
              max={twoWeeksAhead}
              placeholder="Pick a date"
            />
            <Stack direction="column" spacing={0}>
              <Text size="sm" tone="muted">Selected</Text>
              <Text size="sm">{formatDateDisplay(date)}</Text>
            </Stack>
          </Stack>
        </Card.Body>
      </Card>

      {/* TimePicker */}
      <Card elevation={0}>
        <Card.Header>
          <Card.Title>TimePicker</Card.Title>
          <Card.Description>
            12-hour clock with seconds enabled. Type into the fields or use AM/PM toggle.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <Stack direction="row" spacing={3} align="center">
            <TimePicker
              value={time}
              onChange={setTime}
              hourCycle={12}
              showSeconds
            />
            <Stack direction="column" spacing={0}>
              <Text size="sm" tone="muted">Selected</Text>
              <Text size="sm">{formatTimeDisplay(time)}</Text>
            </Stack>
          </Stack>
        </Card.Body>
      </Card>

      {/* DateTimePicker */}
      <Card elevation={0}>
        <Card.Header>
          <Card.Title>DateTimePicker</Card.Title>
          <Card.Description>
            Combined calendar + time picker (24-hour, with seconds, 15-minute steps).
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <Stack direction="row" spacing={3} align="center">
            <DateTimePicker
              value={dateTime}
              onChange={setDateTime}
              showSeconds
              hourCycle={24}
              minuteStep={15}
              placeholder="Pick date and time"
            />
            <Stack direction="column" spacing={0}>
              <Text size="sm" tone="muted">Selected</Text>
              <Text size="sm">{formatDateTimeDisplay(dateTime)}</Text>
            </Stack>
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
}
