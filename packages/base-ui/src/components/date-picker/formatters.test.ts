import { describe, it, expect } from 'vitest';
import {
  formatDate,
  getWeekStartsOnForLocale,
  getWeekdayLabels,
  formatMonthYear,
} from './formatters';

describe('formatters', () => {
  it('formatDate uses Intl.DateTimeFormatOptions', () => {
    const d = new Date(2026, 3, 12);
    const out = formatDate(d, { dateStyle: 'short' }, 'en-US');
    expect(out).toMatch(/2026|26/);
  });

  it('formatDate accepts a function formatter', () => {
    const d = new Date(2026, 3, 12);
    expect(formatDate(d, (date) => `custom:${date.getFullYear()}`)).toBe('custom:2026');
  });

  it('formatDate defaults to short date style when no format given', () => {
    const d = new Date(2026, 3, 12);
    const out = formatDate(d, undefined, 'en-US');
    expect(out.length).toBeGreaterThan(0);
  });

  it('getWeekStartsOnForLocale returns Sunday for en-US', () => {
    expect(getWeekStartsOnForLocale('en-US')).toBe(0);
  });

  it('getWeekStartsOnForLocale returns Monday for en-GB', () => {
    expect(getWeekStartsOnForLocale('en-GB')).toBe(1);
  });

  it('getWeekdayLabels returns 7 strings starting from weekStartsOn (Sunday-first)', () => {
    // Use 'short' form so the first-three assertion is unambiguous
    // ('narrow' renders both Sat and Sun as "S" in en-US).
    const labels = getWeekdayLabels('en-US', 0, 'short');
    expect(labels).toHaveLength(7);
    expect(labels.slice(0, 3)).toEqual(['Sun', 'Mon', 'Tue']);
  });

  it('formatMonthYear uses locale', () => {
    const out = formatMonthYear(new Date(2026, 3, 1), 'en-US');
    expect(out).toMatch(/April/);
    expect(out).toMatch(/2026/);
  });
});
