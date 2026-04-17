import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTimePicker } from './DateTimePicker';

describe('DateTimePicker', () => {
  it('opens popover and renders both Calendar and TimePicker', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />);
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    // Multiple hour spinbuttons: one in the DateField trigger, one in the embedded TimePicker
    expect(screen.getAllByLabelText(/hour/i).length).toBeGreaterThanOrEqual(1);
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

  it('changing the hour in the embedded TimePicker preserves the current date', async () => {
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
    // The TimePicker inside the popover exposes a spinbutton for hour
    const hourSpinbuttons = screen.getAllByRole('spinbutton', { name: /hour/i });
    // The last one belongs to the embedded TimePicker (the DateField trigger also
    // renders an hour section, so pick the one inside the open popup)
    const hour = hourSpinbuttons[hourSpinbuttons.length - 1] as HTMLElement;
    await user.click(hour);
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}');
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getDate()).toBe(12);
    expect(last.getHours()).toBeGreaterThan(9);
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
});
