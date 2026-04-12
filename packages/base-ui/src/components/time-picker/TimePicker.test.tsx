import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimePicker } from './TimePicker';

describe('TimePicker', () => {
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
});
