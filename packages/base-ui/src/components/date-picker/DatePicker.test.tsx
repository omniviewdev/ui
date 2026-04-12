import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

describe('DatePicker (convenience)', () => {
  it('renders a closed trigger by default', () => {
    render(<DatePicker value={null} onChange={() => {}} placeholder="Pick a date" />);
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('opens the popover when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={() => {}} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('calls onChange and closes the popover when a day is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={onChange} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('Escape closes the popover and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={() => {}} />);
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('disables the trigger when disabled=true', () => {
    render(<DatePicker value={null} onChange={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
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
    expect(screen.getByRole('button').textContent).toMatch(/April 12, 2026/);
  });
});
