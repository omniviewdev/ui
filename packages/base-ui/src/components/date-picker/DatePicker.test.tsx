import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

describe('DatePicker (convenience)', () => {
  it('renders a closed trigger by default', () => {
    render(<DatePicker value={null} onChange={() => {}} placeholder="Pick a date" />);
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('opens the popover when the icon button is clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('calls onChange and closes the popover when a day is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('Escape closes the popover and returns focus to the input', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('disables the trigger when disabled=true', () => {
    render(<DatePicker value={null} onChange={() => {}} disabled />);
    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Open calendar' })).toBeDisabled();
  });

  it('formats the value using provided Intl options', () => {
    render(
      <DatePicker
        value={new Date(2026, 3, 12)}
        onChange={() => {}}
        locale="en-US"
        format={{ year: 'numeric', month: 'long', day: 'numeric' }}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toMatch(/April 12, 2026/);
  });

  // ── New: typing flow ──────────────────────────────────────────────────────

  it('typing a valid date commits on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={null} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.clear(input);
    // Use "April 15 2026" — parsed as local midnight by new Date(), timezone-safe
    await user.type(input, 'April 15 2026');
    await user.tab(); // blur
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    const committed: Date = onChange.mock.calls[0][0];
    expect(committed.getFullYear()).toBe(2026);
    expect(committed.getMonth()).toBe(3); // April = 3
    expect(committed.getDate()).toBe(15);
  });

  it('typing an invalid date does not commit onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={null} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'not-a-date');
    await user.tab(); // blur
    expect(onChange).not.toHaveBeenCalled();
  });

  it('typing a valid date then pressing Enter commits', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={null} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.clear(input);
    // Use "June 1 2026" — parsed as local midnight by new Date(), timezone-safe
    await user.type(input, 'June 1 2026');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    const committed: Date = onChange.mock.calls[0][0];
    expect(committed.getFullYear()).toBe(2026);
    expect(committed.getMonth()).toBe(5); // June = 5
    expect(committed.getDate()).toBe(1);
  });

  it('pressing Escape reverts to committed value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        value={new Date(2026, 3, 12)}
        onChange={onChange}
        locale="en-US"
        format={{ year: 'numeric', month: 'long', day: 'numeric' }}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    await user.clear(input);
    await user.type(input, 'garbage');
    await user.keyboard('{Escape}');
    expect(input.value).toMatch(/April 12, 2026/);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calendar selection updates the input text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        value={new Date(2026, 3, 12)}
        onChange={onChange}
        locale="en-US"
        format={{ year: 'numeric', month: 'long', day: 'numeric' }}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    // Input should now reflect the new date, formatted
    expect(input.value).toMatch(/2026/);
  });
});
