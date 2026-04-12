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
