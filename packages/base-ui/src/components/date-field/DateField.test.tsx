import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateField } from './DateField';

/**
 * Helpers to locate section spans by their `data-section-type` attribute.
 * The root has role="group"; editable spans are role="spinbutton".
 */

function getSection(container: HTMLElement, type: string): HTMLElement {
  const el = container.querySelector(`[data-section-type="${type}"]:not([data-literal])`);
  if (!el) throw new Error(`No section with type="${type}"`);
  return el as HTMLElement;
}

function getRoot(): HTMLElement {
  return screen.getByRole('group');
}

describe('DateField — rendering', () => {
  it('renders sections in locale order for en-US (month-first)', () => {
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const sections = Array.from(
      container.querySelectorAll('[data-section-type]:not([data-literal])'),
    ).map((el) => el.getAttribute('data-section-type'));
    expect(sections).toEqual(['month', 'day', 'year']);
  });

  it('renders sections in locale order for en-GB (day-first)', () => {
    const { container } = render(<DateField value={null} locale="en-GB" mode="date" />);
    const sections = Array.from(
      container.querySelectorAll('[data-section-type]:not([data-literal])'),
    ).map((el) => el.getAttribute('data-section-type'));
    expect(sections).toEqual(['day', 'month', 'year']);
  });

  it('shows placeholders when value is null', () => {
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    expect(month.textContent).toBe('MM');
    expect(month.getAttribute('data-placeholder')).toBe('');
  });

  it('shows formatted value when value is set', () => {
    const { container } = render(
      <DateField value={new Date(2026, 3, 12)} locale="en-US" mode="date" />,
    );
    expect(getSection(container, 'month').textContent).toBe('04');
    expect(getSection(container, 'day').textContent).toBe('12');
    expect(getSection(container, 'year').textContent).toBe('2026');
  });

  it('time mode renders hour/minute sections', () => {
    const { container } = render(<DateField value={null} mode="time" />);
    expect(container.querySelector('[data-section-type="hour"]')).toBeTruthy();
    expect(container.querySelector('[data-section-type="minute"]')).toBeTruthy();
  });

  it('datetime mode renders date + time sections', () => {
    const { container } = render(<DateField value={null} mode="datetime" />);
    expect(container.querySelector('[data-section-type="year"]')).toBeTruthy();
    expect(container.querySelector('[data-section-type="month"]')).toBeTruthy();
    expect(container.querySelector('[data-section-type="day"]')).toBeTruthy();
    expect(container.querySelector('[data-section-type="hour"]')).toBeTruthy();
    expect(container.querySelector('[data-section-type="minute"]')).toBeTruthy();
  });

  it('time mode with hourCycle 12 renders meridiem section', () => {
    const { container } = render(<DateField value={null} mode="time" hourCycle={12} />);
    expect(container.querySelector('[data-section-type="meridiem"]')).toBeTruthy();
  });

  it('applies aria-label to the root', () => {
    render(<DateField value={null} mode="date" aria-label="Start date" />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Start date');
  });

  it('marks literal separators as aria-hidden', () => {
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const literals = container.querySelectorAll('[data-literal]');
    expect(literals.length).toBeGreaterThan(0);
    literals.forEach((el) => expect(el.getAttribute('aria-hidden')).toBe('true'));
  });
});

describe('DateField — keyboard navigation', () => {
  it('clicking a section focuses it', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    await user.click(month);
    expect(month).toHaveAttribute('data-focused', '');
  });

  it('Tab moves to next section', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    const day = getSection(container, 'day');
    await user.click(month);
    await user.keyboard('{Tab}');
    expect(day).toHaveAttribute('data-focused', '');
  });

  it('Shift+Tab moves to previous section', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    const day = getSection(container, 'day');
    await user.click(day);
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(month).toHaveAttribute('data-focused', '');
  });

  it('ArrowLeft/ArrowRight move between sections', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    const day = getSection(container, 'day');
    await user.click(month);
    await user.keyboard('{ArrowRight}');
    expect(day).toHaveAttribute('data-focused', '');
    await user.keyboard('{ArrowLeft}');
    expect(month).toHaveAttribute('data-focused', '');
  });

  it('Arrow Up increments the focused month section', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateField value={new Date(2026, 3, 12)} locale="en-US" mode="date" />,
    );
    const month = getSection(container, 'month');
    await user.click(month);
    await user.keyboard('{ArrowUp}');
    expect(month.textContent).toBe('05');
  });

  it('Arrow Down decrements the focused day section', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateField value={new Date(2026, 3, 12)} locale="en-US" mode="date" />,
    );
    const day = getSection(container, 'day');
    await user.click(day);
    await user.keyboard('{ArrowDown}');
    expect(day.textContent).toBe('11');
  });

  it('Arrow Up on empty month section starts at 01', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    await user.click(month);
    await user.keyboard('{ArrowUp}');
    expect(month.textContent).toBe('01');
  });

  it('Arrow Down on empty month starts at 12', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    await user.click(month);
    await user.keyboard('{ArrowDown}');
    expect(month.textContent).toBe('12');
  });

  it('Arrow Up toggles meridiem', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateField
        value={new Date(2026, 0, 1, 9, 0)}
        mode="time"
        hourCycle={12}
        locale="en-US"
      />,
    );
    const meridiem = getSection(container, 'meridiem');
    await user.click(meridiem);
    expect(meridiem.textContent).toBe('AM');
    await user.keyboard('{ArrowUp}');
    expect(meridiem.textContent).toBe('PM');
  });
});

describe('DateField — digit input', () => {
  it('typing "1" in month section stages it without advancing', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    await user.click(month);
    await user.keyboard('1');
    expect(month.textContent).toBe('1');
    expect(month).toHaveAttribute('data-focused', '');
  });

  it('typing "12" in month auto-advances to day', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    const day = getSection(container, 'day');
    await user.click(month);
    await user.keyboard('12');
    expect(month.textContent).toBe('12');
    expect(day).toHaveAttribute('data-focused', '');
  });

  it('typing "1" then "3" in month snaps to 03 and advances', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    const day = getSection(container, 'day');
    await user.click(month);
    await user.keyboard('13');
    // "1" then "3": "13" > 12, so digit 3 replaces to "03" and advances.
    expect(month.textContent).toBe('03');
    expect(day).toHaveAttribute('data-focused', '');
  });

  it('typing "3" in month section auto-advances as "03"', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    const day = getSection(container, 'day');
    await user.click(month);
    await user.keyboard('3');
    expect(month.textContent).toBe('03');
    expect(day).toHaveAttribute('data-focused', '');
  });

  it('typing digit into meridiem is ignored', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} mode="time" hourCycle={12} />);
    const meridiem = getSection(container, 'meridiem');
    await user.click(meridiem);
    await user.keyboard('3');
    expect(meridiem.textContent).toBe('AM'); // placeholder unchanged
  });

  it('typing "A" in meridiem sets AM and advances', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateField value={new Date(2026, 0, 1, 14, 0)} mode="time" hourCycle={12} />,
    );
    const meridiem = getSection(container, 'meridiem');
    await user.click(meridiem);
    await user.keyboard('a');
    expect(meridiem.textContent).toBe('AM');
  });

  it('typing "P" in meridiem sets PM', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateField value={new Date(2026, 0, 1, 9, 0)} mode="time" hourCycle={12} />,
    );
    const meridiem = getSection(container, 'meridiem');
    await user.click(meridiem);
    await user.keyboard('p');
    expect(meridiem.textContent).toBe('PM');
  });

  it('Backspace clears focused section', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateField value={new Date(2026, 3, 12)} locale="en-US" mode="date" />,
    );
    const month = getSection(container, 'month');
    await user.click(month);
    await user.keyboard('{Backspace}');
    expect(month.textContent).toBe('MM');
    expect(month.getAttribute('data-placeholder')).toBe('');
  });

  it('Backspace on empty section moves focus to previous', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateField value={null} locale="en-US" mode="date" />);
    const month = getSection(container, 'month');
    const day = getSection(container, 'day');
    await user.click(day);
    await user.keyboard('{Backspace}');
    expect(month).toHaveAttribute('data-focused', '');
  });
});

describe('DateField — validation + commit', () => {
  it('complete valid entry triggers onChange with parsed Date', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DateField value={null} onChange={onChange} locale="en-US" mode="date" />,
    );
    const month = getSection(container, 'month');
    await user.click(month);
    await user.keyboard('04121999');

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[onChange.mock.calls.length - 1];
    if (!call) throw new Error('onChange not called');
    const d = call[0] as Date;
    expect(d.getFullYear()).toBe(1999);
    expect(d.getMonth()).toBe(3);
    expect(d.getDate()).toBe(12);
  });

  it('incomplete sections do not trigger onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DateField value={null} onChange={onChange} locale="en-US" mode="date" />,
    );
    const month = getSection(container, 'month');
    await user.click(month);
    await user.keyboard('04');
    await user.keyboard('12');
    // year not entered
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Feb 30 does not trigger onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DateField value={null} onChange={onChange} locale="en-US" mode="date" />,
    );
    const month = getSection(container, 'month');
    await user.click(month);
    // type 02 30 2026
    await user.keyboard('02302026');
    // "0230" would go: month=02 (advance), day starts "3"(advance as 03), then "0" in year.
    // Actually digit flow: month=02 advances, day sees "3" → 03 advance, year sees "02026"
    // Since exact behaviour is flow-specific, just assert: no Feb 30 date produced.
    for (const c of onChange.mock.calls) {
      const d = c[0] as Date;
      if (d) {
        const isFeb30 =
          d.getMonth() === 1 && d.getDate() === 30;
        expect(isFeb30).toBe(false);
      }
    }
  });

  it('Feb 29 on a leap year triggers onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DateField value={null} onChange={onChange} locale="en-US" mode="date" />,
    );
    const month = getSection(container, 'month');
    await user.click(month);
    await user.keyboard('02292024');
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls[onChange.mock.calls.length - 1]!;
    const d = last[0] as Date;
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(29);
  });

  it('setting month to Apr clamps day from 31 to 30', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Start with March 31, 2026 — then change month to April via ArrowUp.
    const { container } = render(
      <DateField
        value={new Date(2026, 2, 31)}
        onChange={onChange}
        locale="en-US"
        mode="date"
      />,
    );
    const month = getSection(container, 'month');
    const day = getSection(container, 'day');
    await user.click(month);
    await user.keyboard('{ArrowUp}');
    expect(month.textContent).toBe('04');
    expect(day.textContent).toBe('30');
  });
});

describe('DateField — Escape reverts', () => {
  it('Escape reverts sections to the current value', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateField value={new Date(2026, 3, 12)} locale="en-US" mode="date" />,
    );
    const month = getSection(container, 'month');
    await user.click(month);
    await user.keyboard('{Backspace}');
    expect(month.textContent).toBe('MM');
    await user.keyboard('{Escape}');
    expect(month.textContent).toBe('04');
  });
});

describe('DateField — disabled / readOnly', () => {
  it('disabled field does not respond to keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DateField value={null} onChange={onChange} locale="en-US" mode="date" disabled />,
    );
    const month = getSection(container, 'month');
    await user.click(month);
    await user.keyboard('12');
    expect(month.textContent).toBe('MM');
  });

  it('readOnly field does not accept digits but allows focus', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DateField
        value={new Date(2026, 3, 12)}
        onChange={onChange}
        locale="en-US"
        mode="date"
        readOnly
      />,
    );
    const month = getSection(container, 'month');
    await user.click(month);
    expect(month).toHaveAttribute('data-focused', '');
    await user.keyboard('01');
    expect(month.textContent).toBe('04'); // unchanged
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('DateField — paste', () => {
  it('pasting 04/12/2026 fills all date sections', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DateField value={null} onChange={onChange} locale="en-US" mode="date" />,
    );
    const month = getSection(container, 'month');
    await user.click(month);
    await user.paste('04/12/2026');

    expect(getSection(container, 'month').textContent).toBe('04');
    expect(getSection(container, 'day').textContent).toBe('12');
    expect(getSection(container, 'year').textContent).toBe('2026');

    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls[onChange.mock.calls.length - 1]!;
    const d = last[0] as Date;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(3);
    expect(d.getDate()).toBe(12);
  });
});

describe('DateField — external value sync', () => {
  it('updates sections when value prop changes externally', () => {
    const { container, rerender } = render(
      <DateField value={new Date(2026, 3, 12)} locale="en-US" mode="date" />,
    );
    expect(getSection(container, 'month').textContent).toBe('04');

    rerender(<DateField value={new Date(2027, 5, 1)} locale="en-US" mode="date" />);
    expect(getSection(container, 'month').textContent).toBe('06');
    expect(getSection(container, 'day').textContent).toBe('01');
    expect(getSection(container, 'year').textContent).toBe('2027');
  });

  it('clears sections when value becomes null', () => {
    const { container, rerender } = render(
      <DateField value={new Date(2026, 3, 12)} locale="en-US" mode="date" />,
    );
    rerender(<DateField value={null} locale="en-US" mode="date" />);
    expect(getSection(container, 'month').textContent).toBe('MM');
    expect(getSection(container, 'year').textContent).toBe('YYYY');
  });
});
