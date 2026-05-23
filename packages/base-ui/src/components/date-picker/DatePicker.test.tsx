import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

describe('DatePicker (convenience)', () => {
  it('renders the DateField trigger with per-section placeholders', () => {
    render(<DatePicker value={null} onChange={() => {}} />);
    // DateField root has role="group"
    expect(screen.getByRole('group', { name: 'Date' })).toBeInTheDocument();
    // Popover calendar should not be visible
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('opens the popover when the icon button is clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('calls onChange and closes the popover when a day is selected from the calendar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('Escape closes the popover', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('disables the DateField and icon button when disabled=true', () => {
    render(<DatePicker value={null} onChange={() => {}} disabled />);
    const field = screen.getByRole('group', { name: 'Date' });
    expect(field).toHaveAttribute('data-disabled', '');
    expect(screen.getByRole('button', { name: 'Open calendar' })).toBeDisabled();
  });

  it('applies readOnly to the DateField', () => {
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={() => {}} readOnly />);
    const field = screen.getByRole('group', { name: 'Date' });
    expect(field).toHaveAttribute('data-readonly', '');
  });

  it('calendar selection updates the DateField value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it('shows error state when DateField fires a date outside the min/max range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Start with an in-range value so the shell renders without error, then
    // paste a date outside the range into the DateField. The DatePicker's
    // onChange handler should mark the shell with shellError.
    render(
      <DatePicker
        value={new Date(2026, 3, 20)}
        onChange={onChange}
        min={new Date(2026, 3, 15)}
        max={new Date(2026, 3, 30)}
      />,
    );
    const shell = screen.getByTestId('date-picker-shell');
    expect(shell.className).not.toMatch(/shellError/);

    // Focus the DateField (en-US → month/day/year), then paste an out-of-
    // range date. The DateField parses the paste + emits a complete Date,
    // which the DatePicker wrapper then rejects via setRangeError(true).
    const dateField = screen.getByRole('group', { name: 'Date' });
    const firstSection = dateField.querySelector(
      '[role="spinbutton"]',
    ) as HTMLElement;
    firstSection.focus();
    await user.paste('01/05/2026'); // Jan 5 2026 — before min

    expect(shell.className).toMatch(/shellError/);
  });

  it('does not open the popover when disabled and icon button is clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={null} onChange={() => {}} disabled />);
    // button is disabled so click has no effect
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('Clear button resets the date', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('Done button closes the popover', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});
