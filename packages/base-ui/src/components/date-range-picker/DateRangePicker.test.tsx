import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from './DateRangePicker';
import type { DateRange } from './DateRangePicker';

/** Locate a section span by type within a labelled DateField group. */
function getSectionInGroup(group: HTMLElement, type: string): HTMLElement {
  const el = group.querySelector(`[data-section-type="${type}"]:not([data-literal])`);
  if (!el) throw new Error(`No section with type="${type}" in group`);
  return el as HTMLElement;
}

describe('DateRangePicker', () => {
  // 1. DateFields show per-section placeholders when start/end are null
  it('renders placeholder sections when value is empty', () => {
    const { container } = render(
      <DateRangePicker value={{ start: null, end: null }} onChange={() => {}} />,
    );
    const [startGroup, endGroup] = container.querySelectorAll('[role="group"]');
    if (!startGroup || !endGroup) throw new Error('Expected two DateField groups');
    // Both fields should show placeholder text in their sections
    expect(
      getSectionInGroup(startGroup as HTMLElement, 'month').getAttribute('data-placeholder'),
    ).toBe('');
    expect(
      getSectionInGroup(endGroup as HTMLElement, 'month').getAttribute('data-placeholder'),
    ).toBe('');
  });

  // 2. Renders formatted range when both dates are set
  it('renders formatted range when both dates are set', () => {
    const { container } = render(
      <DateRangePicker
        value={{ start: new Date(2026, 3, 12), end: new Date(2026, 3, 19) }}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    const [startGroup, endGroup] = container.querySelectorAll('[role="group"]');
    if (!startGroup || !endGroup) throw new Error('Expected two DateField groups');
    // Start field shows April 12
    expect(getSectionInGroup(startGroup as HTMLElement, 'month').textContent).toBe('04');
    expect(getSectionInGroup(startGroup as HTMLElement, 'day').textContent).toBe('12');
    // End field shows April 19
    expect(getSectionInGroup(endGroup as HTMLElement, 'month').textContent).toBe('04');
    expect(getSectionInGroup(endGroup as HTMLElement, 'day').textContent).toBe('19');
  });

  // 3. Clicking icon button opens the calendar
  it('clicking icon button opens the calendar', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker value={{ start: null, end: null }} onChange={() => {}} />,
    );
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  // 4. Clicking a date sets the start and keeps the popover open
  it('clicking a date sets the start and keeps the popover open', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        defaultValue={{ start: null, end: null }}
        onChange={onChange}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByRole('gridcell', { name: /^10/ }));
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
    expect(screen.getByRole('grid')).toBeInTheDocument();

    // Click "20" → sets end and closes
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as DateRange;
    expect(lastCall.start).toBeInstanceOf(Date);
    expect(lastCall.end).toBeInstanceOf(Date);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  // 6. Typing into the start field commits the start date
  it('typing into start field commits the start date', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DateRangePicker
        value={{ start: null, end: null }}
        onChange={onChange}
        locale="en-US"
      />,
    );
    const [startGroup] = container.querySelectorAll('[role="group"]');
    if (!startGroup) throw new Error('No start DateField group found');
    const monthSection = getSectionInGroup(startGroup as HTMLElement, 'month');
    await user.click(monthSection);
    // type 04 12 2026
    await user.keyboard('04122026');
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as DateRange;
    expect(lastCall.start).toBeInstanceOf(Date);
    expect(lastCall.start!.getMonth()).toBe(3); // April
    expect(lastCall.start!.getDate()).toBe(12);
    expect(lastCall.start!.getFullYear()).toBe(2026);
  });

  // 7. When start date is entered after end, end is reset
  it('typing a start date after the current end resets end to null', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DateRangePicker
        defaultValue={{ start: new Date(2026, 3, 5), end: new Date(2026, 3, 10) }}
        onChange={onChange}
        locale="en-US"
      />,
    );
    const [startGroup] = container.querySelectorAll('[role="group"]');
    if (!startGroup) throw new Error('No start DateField group found');
    // Set start to April 20 (after current end April 10)
    const monthSection = getSectionInGroup(startGroup as HTMLElement, 'month');
    await user.click(monthSection);
    await user.keyboard('04202026');
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as DateRange;
    // start should be the new date
    expect(lastCall.start).toBeInstanceOf(Date);
    expect(lastCall.start!.getDate()).toBe(20);
    // end should have been reset to null since it was before new start
    expect(lastCall.end).toBeNull();
  });

  // 8. Escape closes the popover
  it('Escape closes the popover', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker value={{ start: null, end: null }} onChange={() => {}} />,
    );
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  // 9. Disabled state applies to both fields and icon button
  it('disabled state applies to both fields and icon button', () => {
    const { container } = render(
      <DateRangePicker value={{ start: null, end: null }} onChange={() => {}} disabled />,
    );
    const [startGroup, endGroup] = container.querySelectorAll('[role="group"]');
    if (!startGroup || !endGroup) throw new Error('Expected two DateField groups');
    expect((startGroup as HTMLElement).getAttribute('data-disabled')).toBe('');
    expect((endGroup as HTMLElement).getAttribute('data-disabled')).toBe('');
    expect(screen.getByRole('button', { name: 'Open calendar' })).toBeDisabled();
  });
});
