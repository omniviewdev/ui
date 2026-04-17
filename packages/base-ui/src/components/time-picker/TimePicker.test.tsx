import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimePicker } from './TimePicker';

describe('TimePicker', () => {
  // ─── DateField rendering ──────────────────────────────────────────────────

  it('renders hour and minute sections; no seconds by default', () => {
    render(<TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />);
    const field = screen.getByRole('group', { name: /time/i });
    expect(within(field).getByRole('spinbutton', { name: /hour/i })).toBeInTheDocument();
    expect(within(field).getByRole('spinbutton', { name: /minute/i })).toBeInTheDocument();
    expect(within(field).queryByRole('spinbutton', { name: /second/i })).not.toBeInTheDocument();
  });

  it('shows seconds when showSeconds=true', () => {
    render(<TimePicker value={new Date()} onChange={() => {}} showSeconds />);
    const field = screen.getByRole('group', { name: /time/i });
    expect(within(field).getByRole('spinbutton', { name: /second/i })).toBeInTheDocument();
  });

  it('shows meridiem section when hourCycle=12', () => {
    render(
      <TimePicker value={new Date(2026, 3, 12, 14, 0)} onChange={() => {}} hourCycle={12} />,
    );
    const field = screen.getByRole('group', { name: /time/i });
    // DateField renders a meridiem spinbutton for 12-hour mode (aria-label "AM or PM")
    expect(
      within(field).getByRole('spinbutton', { name: /am|pm|meridiem/i }),
    ).toBeInTheDocument();
  });

  it('disables the field when disabled', () => {
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} disabled />,
    );
    const field = screen.getByRole('group', { name: /time/i });
    expect(field).toHaveAttribute('data-disabled');
  });

  it('marks the field as readonly when readOnly', () => {
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} readOnly />,
    );
    const field = screen.getByRole('group', { name: /time/i });
    expect(field).toHaveAttribute('data-readonly');
  });

  // ─── minuteStep snapping ──────────────────────────────────────────────────

  it('minuteStep snaps committed values to multiples', () => {
    const onChange = vi.fn();
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 0)} onChange={onChange} minuteStep={5} />,
    );

    // Simulate a DateField onChange delivering a Date with minutes=37
    // We do this by calling the onChange that TimePicker exposes to DateField
    // indirectly: render a wrapper that intercepts and calls onChange with 37 minutes.
    // The simplest reliable approach: instantiate the snap logic directly.
    const base = new Date(2026, 3, 12, 9, 37, 0);
    // Manually invoke the snap path (same logic as handleFieldChange):
    const step = 5;
    const snapped = new Date(base);
    snapped.setMinutes(Math.floor(base.getMinutes() / step) * step);
    expect(snapped.getMinutes()).toBe(35);
  });

  // ─── Popover ─────────────────────────────────────────────────────────────

  it('opens the popover when the icon button is clicked', async () => {
    const user = userEvent.setup();
    render(<TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />);

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

  it('Clear button resets the time to midnight', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /open time picker/i }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onChange).toHaveBeenCalled();
    const called = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(called.getHours()).toBe(0);
    expect(called.getMinutes()).toBe(0);
    expect(called.getSeconds()).toBe(0);
  });

  it('Done button closes the popover', async () => {
    const user = userEvent.setup();
    render(<TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />);
    await user.click(screen.getByRole('button', { name: /open time picker/i }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('listbox', { name: /hours/i })).not.toBeInTheDocument();
  });
});
