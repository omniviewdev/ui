import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimePicker } from './TimePicker';

describe('TimePicker', () => {
  // ─── Existing tests (8) ───────────────────────────────────────────────────

  it('renders hour and minute inputs; no seconds by default', () => {
    render(<TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />);
    expect(screen.getByLabelText(/hour/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minute/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/second/i)).not.toBeInTheDocument();
  });

  it('shows seconds when showSeconds=true', () => {
    render(<TimePicker value={new Date()} onChange={() => {}} showSeconds />);
    expect(screen.getByLabelText(/second/i)).toBeInTheDocument();
  });

  it('calls onChange when the hour is edited (24-hour)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={onChange} hourCycle={24} />,
    );
    const hour = screen.getByLabelText(/hour/i) as HTMLInputElement;
    await user.clear(hour);
    await user.type(hour, '14');
    await user.tab();
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getHours()).toBe(14);
    expect(last.getMinutes()).toBe(30);
  });

  it('shows AM/PM toggle when hourCycle=12', () => {
    render(
      <TimePicker value={new Date(2026, 3, 12, 14, 0)} onChange={() => {}} hourCycle={12} />,
    );
    expect(screen.getByRole('button', { name: /pm/i })).toBeInTheDocument();
  });

  it('toggling PM→AM subtracts 12 from a 14:00 value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker value={new Date(2026, 3, 12, 14, 0)} onChange={onChange} hourCycle={12} />,
    );
    await user.click(screen.getByRole('button', { name: /pm/i }));
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getHours()).toBe(2);
  });

  it('minuteStep=5 clamps a typed 37 to 35', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 0)} onChange={onChange} minuteStep={5} />,
    );
    const minute = screen.getByLabelText(/minute/i) as HTMLInputElement;
    await user.clear(minute);
    await user.type(minute, '37');
    await user.tab();
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getMinutes()).toBe(35);
  });

  it('ignores edits when readOnly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={onChange} readOnly />,
    );
    const hour = screen.getByLabelText(/hour/i) as HTMLInputElement;
    await user.type(hour, '14');
    await user.tab();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables all inputs when disabled', () => {
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} disabled />,
    );
    expect(screen.getByLabelText(/hour/i)).toBeDisabled();
    expect(screen.getByLabelText(/minute/i)).toBeDisabled();
  });

  // ─── New tests ────────────────────────────────────────────────────────────

  it('opens the popover when the icon button is clicked', async () => {
    const user = userEvent.setup();
    render(<TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />);

    // Popover should not be visible before click
    expect(screen.queryByRole('listbox', { name: /hours/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /open time picker/i }));

    expect(screen.getByRole('listbox', { name: /hours/i })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: /minutes/i })).toBeInTheDocument();
  });

  it('selecting a column item commits the time', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={onChange} hourCycle={24} />,
    );

    await user.click(screen.getByRole('button', { name: /open time picker/i }));

    const hoursColumn = screen.getByRole('listbox', { name: /hours/i });
    const item14 = within(hoursColumn).getByRole('option', { name: '14' });
    await user.click(item14);

    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getHours()).toBe(14);
  });

  it('minutes column respects minuteStep (60/step items visible)', async () => {
    const user = userEvent.setup();
    render(
      <TimePicker
        value={new Date(2026, 3, 12, 9, 0)}
        onChange={() => {}}
        minuteStep={15}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open time picker/i }));

    const minutesColumn = screen.getByRole('listbox', { name: /minutes/i });
    const options = within(minutesColumn).getAllByRole('option');
    // 0, 15, 30, 45 → 4 items
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.textContent)).toEqual(['00', '15', '30', '45']);
  });

  it('AM/PM column switches meridiem', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker
        value={new Date(2026, 3, 12, 14, 0)}
        onChange={onChange}
        hourCycle={12}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open time picker/i }));

    const ampmColumn = screen.getByRole('listbox', { name: /am\/pm/i });
    const amOption = within(ampmColumn).getByRole('option', { name: 'AM' });
    await user.click(amOption);

    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getHours()).toBe(2); // 14 - 12
  });

  it('popover closes on Escape and returns focus to icon button', async () => {
    const user = userEvent.setup();
    render(<TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />);

    const iconButton = screen.getByRole('button', { name: /open time picker/i });
    await user.click(iconButton);

    expect(screen.getByRole('listbox', { name: /hours/i })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox', { name: /hours/i })).not.toBeInTheDocument();
    expect(iconButton).toHaveFocus();
  });
});
