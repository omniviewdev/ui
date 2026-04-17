import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTimePicker } from './DateTimePicker';

describe('DateTimePicker', () => {
  it('opens popover and renders both Calendar and time columns', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />);
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    // Time columns are rendered as listboxes in the popup
    expect(screen.getByRole('listbox', { name: /hours/i })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: /minutes/i })).toBeInTheDocument();
  });

  it('selecting a day preserves the current time-of-day', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value={new Date(2026, 3, 12, 9, 30)}
        onChange={onChange}
        hourCycle={24}
      />,
    );
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getDate()).toBe(20);
    expect(last.getHours()).toBe(9);
    expect(last.getMinutes()).toBe(30);
  });

  it('selecting an hour option in the popup updates value and preserves the current date', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value={new Date(2026, 3, 12, 9, 30)}
        onChange={onChange}
        hourCycle={24}
      />,
    );
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    // TimeColumns renders a listbox for hours in the popup
    const hoursColumn = screen.getByRole('listbox', { name: /hours/i });
    const option14 = within(hoursColumn).getByRole('option', { name: '14' });
    await user.click(option14);
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getDate()).toBe(12);
    expect(last.getHours()).toBe(14);
  });

  it('typing in the DateField hour section updates value with new hour', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value={new Date(2026, 3, 12, 9, 30)}
        onChange={onChange}
        hourCycle={24}
      />,
    );
    // The DateField trigger is always visible (no need to open popover)
    const hourSections = screen.getAllByRole('spinbutton', { name: /hour/i });
    const triggerHour = hourSections[0] as HTMLElement;
    await user.click(triggerHour);
    await user.keyboard('15');
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last?.getHours()).toBe(15);
    expect(last?.getDate()).toBe(12);
  });

  it('disabled state applies to the DateField and icon button', () => {
    render(
      <DateTimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} disabled />,
    );
    const iconButton = screen.getByRole('button', { name: /open calendar/i });
    expect(iconButton).toBeDisabled();
    const shell = screen.getByTestId('date-time-picker-shell');
    expect(shell).toHaveAttribute('data-disabled');
  });

  it('Clear button resets the date and time', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('Done button closes the popover', async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />,
    );
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});
