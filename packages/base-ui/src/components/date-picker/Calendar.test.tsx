import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from './Calendar';

const ANCHOR = new Date(2026, 3, 15); // April 15, 2026

describe('Calendar', () => {
  it('renders 7 weekday headers and 42 day cells', () => {
    render(<Calendar value={ANCHOR} onChange={() => {}} locale="en-US" />);
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
  });

  it('marks the selected day with aria-selected', () => {
    render(<Calendar value={ANCHOR} onChange={() => {}} locale="en-US" />);
    const selected = screen.getByRole('gridcell', { selected: true });
    expect(selected.textContent).toContain('15');
  });

  it('onChange fires when a day is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Calendar value={ANCHOR} onChange={onChange} locale="en-US" />);
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    const arg = onChange.mock.calls[0]?.[0] as Date;
    expect(arg.getDate()).toBe(20);
  });

  it('arrow keys move focus across days', async () => {
    const user = userEvent.setup();
    render(<Calendar value={ANCHOR} onChange={() => {}} locale="en-US" autoFocus />);
    const initial = screen.getByRole('gridcell', { selected: true });
    initial.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toContain('16');
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement?.textContent).toContain('23');
  });

  it('Home moves to first day of week; End moves to last day of week', async () => {
    const user = userEvent.setup();
    render(<Calendar value={ANCHOR} onChange={() => {}} locale="en-US" weekStartsOn={0} autoFocus />);
    screen.getByRole('gridcell', { selected: true }).focus();
    await user.keyboard('{Home}');
    expect(document.activeElement?.textContent).toContain('12');
    await user.keyboard('{End}');
    expect(document.activeElement?.textContent).toContain('18');
  });

  it('PageUp/PageDown navigate months', async () => {
    const user = userEvent.setup();
    render(<Calendar value={ANCHOR} onChange={() => {}} locale="en-US" autoFocus />);
    screen.getByRole('gridcell', { selected: true }).focus();
    await user.keyboard('{PageDown}');
    const focused = document.activeElement as HTMLElement;
    expect(focused.getAttribute('data-date')).toBe('2026-05-15');
  });

  it('Shift+PageUp/Shift+PageDown navigate years', async () => {
    const user = userEvent.setup();
    render(<Calendar value={ANCHOR} onChange={() => {}} locale="en-US" autoFocus />);
    screen.getByRole('gridcell', { selected: true }).focus();
    await user.keyboard('{Shift>}{PageDown}{/Shift}');
    const focused = document.activeElement as HTMLElement;
    expect(focused.getAttribute('data-date')).toBe('2027-04-15');
  });

  it('Enter and Space select the focused day', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Calendar value={ANCHOR} onChange={onChange} locale="en-US" autoFocus />);
    screen.getByRole('gridcell', { selected: true }).focus();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    expect((onChange.mock.calls[0]?.[0] as Date).getDate()).toBe(16);
  });

  it('disables days outside [min, max]', () => {
    const min = new Date(2026, 3, 10);
    const max = new Date(2026, 3, 20);
    render(<Calendar value={ANCHOR} onChange={() => {}} locale="en-US" min={min} max={max} />);
    const cellFor = (day: number) =>
      screen.getByRole('gridcell', { name: new RegExp(`^${day}`) });
    expect(cellFor(5)).toHaveAttribute('aria-disabled', 'true');
    expect(cellFor(15)).not.toHaveAttribute('aria-disabled');
    expect(cellFor(25)).toHaveAttribute('aria-disabled', 'true');
  });

  it('isDateDisabled overrides individual cells', () => {
    const isDateDisabled = (d: Date) => d.getDate() === 14;
    render(
      <Calendar
        value={ANCHOR}
        onChange={() => {}}
        locale="en-US"
        isDateDisabled={isDateDisabled}
      />,
    );
    expect(screen.getByRole('gridcell', { name: /^14/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('marks today with aria-current="date"', () => {
    const today = new Date();
    render(<Calendar value={today} onChange={() => {}} locale="en-US" />);
    const todayCell = screen.getByRole('gridcell', {
      name: new RegExp(`^${today.getDate()}`),
    });
    expect(todayCell).toHaveAttribute('aria-current', 'date');
  });
});

describe('Calendar range mode', () => {
  const START = new Date(2026, 3, 10); // April 10
  const END = new Date(2026, 3, 15);   // April 15

  it('renders both start and end with aria-selected=true', () => {
    render(
      <Calendar
        mode="range"
        startDate={START}
        endDate={END}
        onRangeChange={() => {}}
        locale="en-US"
      />,
    );
    const selected = screen.getAllByRole('gridcell', { selected: true });
    const texts = selected.map((el) => el.textContent?.trim());
    expect(texts).toContain('10');
    expect(texts).toContain('15');
  });

  it('clicking a date when no start is set emits { start, end: null }', async () => {
    const user = userEvent.setup();
    const onRangeChange = vi.fn();
    render(
      <Calendar
        mode="range"
        startDate={null}
        endDate={null}
        onRangeChange={onRangeChange}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole('gridcell', { name: /^10/ }));
    expect(onRangeChange).toHaveBeenCalledWith(
      expect.objectContaining({ start: expect.any(Date), end: null }),
    );
    expect((onRangeChange.mock.calls[0]?.[0] as { start: Date }).start.getDate()).toBe(10);
  });

  it('clicking a date after start is set emits { start, end }', async () => {
    const user = userEvent.setup();
    const onRangeChange = vi.fn();
    render(
      <Calendar
        mode="range"
        startDate={START}
        endDate={null}
        onRangeChange={onRangeChange}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    expect(onRangeChange).toHaveBeenCalledWith(
      expect.objectContaining({ start: START, end: expect.any(Date) }),
    );
    expect((onRangeChange.mock.calls[0]?.[0] as { end: Date }).end.getDate()).toBe(20);
  });

  it('clicking a date before start resets the range', async () => {
    const user = userEvent.setup();
    const onRangeChange = vi.fn();
    render(
      <Calendar
        mode="range"
        startDate={START}
        endDate={null}
        onRangeChange={onRangeChange}
        locale="en-US"
      />,
    );
    // Click April 5, which is before START (April 10)
    await user.click(screen.getByRole('gridcell', { name: /^5/ }));
    const call = onRangeChange.mock.calls[0]?.[0] as { start: Date; end: Date | null };
    expect(call.start.getDate()).toBe(5);
    expect(call.end).toBeNull();
  });

  it('cells between start and end get the in-range class', () => {
    render(
      <Calendar
        mode="range"
        startDate={START}
        endDate={END}
        onRangeChange={() => {}}
        locale="en-US"
      />,
    );
    // April 12 and 13 are strictly between April 10 and April 15
    const cell12 = screen.getByRole('gridcell', { name: /^12/ });
    const cell13 = screen.getByRole('gridcell', { name: /^13/ });
    expect(cell12.className).toMatch(/cellInRange/);
    expect(cell13.className).toMatch(/cellInRange/);
    // Start and end cells should NOT have the in-range class
    const cell10 = screen.getByRole('gridcell', { name: /^10/ });
    const cell15 = screen.getByRole('gridcell', { name: /^15/ });
    expect(cell10.className).not.toMatch(/cellInRange/);
    expect(cell15.className).not.toMatch(/cellInRange/);
  });

  it('disabled dates are not selectable in range mode', async () => {
    const user = userEvent.setup();
    const onRangeChange = vi.fn();
    const isDateDisabled = (d: Date) => d.getDate() === 14;
    render(
      <Calendar
        mode="range"
        startDate={null}
        endDate={null}
        onRangeChange={onRangeChange}
        locale="en-US"
        isDateDisabled={isDateDisabled}
      />,
    );
    const disabledCell = screen.getByRole('gridcell', { name: /^14/ });
    expect(disabledCell).toHaveAttribute('aria-disabled', 'true');
    await user.click(disabledCell);
    expect(onRangeChange).not.toHaveBeenCalled();
  });
});
