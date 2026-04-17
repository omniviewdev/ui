import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from './DateRangePicker';
import type { DateRange } from './DateRangePicker';

const SEP = ' \u2013 '; // default rangeSeparator

describe('DateRangePicker', () => {
  // 1. Renders placeholder when value is empty
  it('renders placeholder when value is empty', () => {
    render(
      <DateRangePicker
        value={{ start: null, end: null }}
        onChange={() => {}}
        placeholder="Pick a range"
      />,
    );
    expect(screen.getByPlaceholderText('Pick a range')).toBeInTheDocument();
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  // 2. Renders formatted range when both dates are set
  it('renders formatted range when both dates are set', () => {
    render(
      <DateRangePicker
        value={{ start: new Date(2026, 3, 12), end: new Date(2026, 3, 19) }}
        onChange={() => {}}
        locale="en-US"
        format={{ month: 'short', day: 'numeric' }}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toMatch(/Apr 12/);
    expect(input.value).toMatch(/Apr 19/);
    expect(input.value).toContain(SEP.trim());
  });

  // 3. Clicking icon button opens the calendar
  it('clicking icon button opens the calendar', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        value={{ start: null, end: null }}
        onChange={() => {}}
      />,
    );
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  // 4. Clicking a date sets the start and keeps the popover open
  it('clicking a date sets the start and keeps the popover open', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Use uncontrolled so internal state drives re-renders
    render(
      <DateRangePicker
        defaultValue={{ start: null, end: null }}
        onChange={onChange}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    // Click the "10" day cell (April 10 in current month view)
    await user.click(screen.getByRole('gridcell', { name: /^10/ }));
    // onChange called with start set and end null
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as DateRange;
    expect(lastCall.start).toBeInstanceOf(Date);
    expect(lastCall.end).toBeNull();
    // Calendar should still be visible (waiting for end)
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  // 5. Clicking a second date after start sets the end and closes the popover
  it('clicking a second date after start sets the end and closes the popover', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Use uncontrolled to let internal state drive rendering
    render(
      <DateRangePicker
        defaultValue={{ start: null, end: null }}
        onChange={onChange}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));

    // Click "10" → sets start
    await user.click(screen.getByRole('gridcell', { name: /^10/ }));
    expect(onChange).toHaveBeenCalled();
    const firstCall = onChange.mock.calls[0]![0] as DateRange;
    expect(firstCall.start).toBeInstanceOf(Date);
    expect(firstCall.end).toBeNull();
    // Calendar still open (only start is set)
    expect(screen.getByRole('grid')).toBeInTheDocument();

    // Click "20" → sets end and closes
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    const allCalls = onChange.mock.calls;
    const lastCall = allCalls[allCalls.length - 1]![0] as DateRange;
    expect(lastCall.start).toBeInstanceOf(Date);
    expect(lastCall.end).toBeInstanceOf(Date);
    // Popover should now be closed
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  // 6. Typing a valid "start – end" string commits on blur
  it('typing a valid start\u2013end string commits on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        value={{ start: null, end: null }}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.clear(input);
    await user.type(input, `April 12 2026${SEP}April 19 2026`);
    await user.tab(); // blur
    expect(onChange).toHaveBeenCalled();
    const committed = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as DateRange;
    expect(committed.start).toBeInstanceOf(Date);
    expect(committed.end).toBeInstanceOf(Date);
    expect(committed.start!.getFullYear()).toBe(2026);
    expect(committed.start!.getMonth()).toBe(3); // April = 3
    expect(committed.start!.getDate()).toBe(12);
    expect(committed.end!.getMonth()).toBe(3);
    expect(committed.end!.getDate()).toBe(19);
  });

  // 7. Typing an invalid range does not commit
  it('typing an invalid range does not commit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        value={{ start: null, end: null }}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'not-a-date – also-not-a-date');
    await user.tab();
    expect(onChange).not.toHaveBeenCalled();
  });

  // 8. Pressing Escape in the input reverts to the committed value
  it('pressing Escape in the input reverts to the committed value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        value={{ start: new Date(2026, 3, 12), end: new Date(2026, 3, 19) }}
        onChange={onChange}
        locale="en-US"
        format={{ month: 'short', day: 'numeric' }}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    const originalValue = input.value;
    await user.click(input);
    await user.clear(input);
    await user.type(input, 'garbage');
    await user.keyboard('{Escape}');
    expect(input.value).toBe(originalValue);
    expect(onChange).not.toHaveBeenCalled();
  });

  // Extra: disabled state
  it('disables input and button when disabled=true', () => {
    render(
      <DateRangePicker
        value={{ start: null, end: null }}
        onChange={() => {}}
        disabled
      />,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Open calendar' })).toBeDisabled();
  });

  // Extra: only start date set shows trailing separator
  it('shows trailing separator when only start is set', () => {
    render(
      <DateRangePicker
        value={{ start: new Date(2026, 3, 12), end: null }}
        onChange={() => {}}
        locale="en-US"
        format={{ month: 'short', day: 'numeric' }}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toMatch(/Apr 12/);
    expect(input.value).toContain(SEP.trim());
  });
});
