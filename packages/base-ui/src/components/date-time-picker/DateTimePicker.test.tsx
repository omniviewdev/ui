import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTimePicker } from './DateTimePicker';

describe('DateTimePicker', () => {
  it('opens popover and renders both Calendar and TimePicker', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByLabelText(/hour/i)).toBeInTheDocument();
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
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getDate()).toBe(20);
    expect(last.getHours()).toBe(9);
    expect(last.getMinutes()).toBe(30);
  });

  it('changing the hour preserves the current date', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value={new Date(2026, 3, 12, 9, 30)}
        onChange={onChange}
        hourCycle={24}
      />,
    );
    await user.click(screen.getByRole('button'));
    const hour = screen.getByLabelText(/hour/i) as HTMLInputElement;
    await user.clear(hour);
    await user.type(hour, '15');
    await user.tab();
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getDate()).toBe(12);
    expect(last.getHours()).toBe(15);
  });
});
