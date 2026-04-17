import { describe, it, expect } from 'vitest';
import {
  buildSections,
  getDaysInMonth,
  isLeapYear,
  validateSections,
  adjustSectionValue,
  applyDigitToSection,
  applyPaste,
  clampDayToMonth,
  padZero,
  getNextEditableIndex,
  getPreviousEditableIndex,
  setSectionValue,
} from './sections';

describe('padZero', () => {
  it('pads numbers smaller than len', () => {
    expect(padZero(4, 2)).toBe('04');
    expect(padZero(4, 4)).toBe('0004');
  });

  it('does not pad numbers at or above len', () => {
    expect(padZero(12, 2)).toBe('12');
    expect(padZero(1234, 2)).toBe('1234');
  });
});

describe('isLeapYear / getDaysInMonth', () => {
  it('detects leap years', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
  });

  it('returns 29 for Feb on leap years and 28 on non-leap', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it('returns 30 for Apr/Jun/Sep/Nov', () => {
    expect(getDaysInMonth(2026, 4)).toBe(30);
    expect(getDaysInMonth(2026, 6)).toBe(30);
    expect(getDaysInMonth(2026, 9)).toBe(30);
    expect(getDaysInMonth(2026, 11)).toBe(30);
  });

  it('returns 31 for Jan/Mar/May/Jul/Aug/Oct/Dec', () => {
    for (const m of [1, 3, 5, 7, 8, 10, 12]) {
      expect(getDaysInMonth(2026, m)).toBe(31);
    }
  });
});

describe('buildSections', () => {
  it('renders month-first sections for en-US date mode', () => {
    const sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    const order = sections.map((s) => s.type);
    // en-US: MM / DD / YYYY
    expect(order[0]).toBe('month');
    const firstNonLiteral = order.filter((t) => t !== 'literal');
    expect(firstNonLiteral).toEqual(['month', 'day', 'year']);
  });

  it('renders day-first sections for en-GB date mode', () => {
    const sections = buildSections({ mode: 'date', locale: 'en-GB', value: null });
    const nonLiteral = sections.filter((s) => s.type !== 'literal').map((s) => s.type);
    expect(nonLiteral).toEqual(['day', 'month', 'year']);
  });

  it('renders year-first sections for en-CA or ja-JP', () => {
    const sections = buildSections({ mode: 'date', locale: 'ja-JP', value: null });
    const nonLiteral = sections.filter((s) => s.type !== 'literal').map((s) => s.type);
    expect(nonLiteral).toEqual(['year', 'month', 'day']);
  });

  it('time mode includes hour/minute', () => {
    const sections = buildSections({ mode: 'time', locale: 'en-US', hourCycle: 24 });
    const types = sections.filter((s) => s.type !== 'literal').map((s) => s.type);
    expect(types).toContain('hour');
    expect(types).toContain('minute');
    expect(types).not.toContain('second');
  });

  it('time mode with showSeconds includes seconds', () => {
    const sections = buildSections({
      mode: 'time',
      locale: 'en-US',
      hourCycle: 24,
      showSeconds: true,
    });
    const types = sections.filter((s) => s.type !== 'literal').map((s) => s.type);
    expect(types).toContain('second');
  });

  it('time mode with hourCycle 12 includes meridiem', () => {
    const sections = buildSections({ mode: 'time', locale: 'en-US', hourCycle: 12 });
    const types = sections.filter((s) => s.type !== 'literal').map((s) => s.type);
    expect(types).toContain('meridiem');
  });

  it('datetime mode combines date + time sections', () => {
    const sections = buildSections({
      mode: 'datetime',
      locale: 'en-US',
      hourCycle: 24,
    });
    const types = sections.filter((s) => s.type !== 'literal').map((s) => s.type);
    expect(types).toContain('year');
    expect(types).toContain('month');
    expect(types).toContain('day');
    expect(types).toContain('hour');
    expect(types).toContain('minute');
  });

  it('populates section values from a provided Date', () => {
    const d = new Date(2026, 3, 12, 9, 5); // Apr 12 2026 09:05
    const sections = buildSections({
      mode: 'datetime',
      locale: 'en-US',
      hourCycle: 24,
      value: d,
    });
    const month = sections.find((s) => s.type === 'month');
    const day = sections.find((s) => s.type === 'day');
    const year = sections.find((s) => s.type === 'year');
    const hour = sections.find((s) => s.type === 'hour');
    const minute = sections.find((s) => s.type === 'minute');
    expect(month?.value).toBe('04');
    expect(day?.value).toBe('12');
    expect(year?.value).toBe('2026');
    expect(hour?.value).toBe('09');
    expect(minute?.value).toBe('05');
  });

  it('sets proper min/max for month/day/hour sections', () => {
    const date24 = buildSections({ mode: 'datetime', locale: 'en-US', hourCycle: 24 });
    const month = date24.find((s) => s.type === 'month');
    const day = date24.find((s) => s.type === 'day');
    const hour = date24.find((s) => s.type === 'hour');
    expect(month?.min).toBe(1);
    expect(month?.max).toBe(12);
    expect(day?.min).toBe(1);
    expect(day?.max).toBe(31);
    expect(hour?.min).toBe(0);
    expect(hour?.max).toBe(23);
  });

  it('12-hour hour section has min=1 max=12', () => {
    const t = buildSections({ mode: 'time', locale: 'en-US', hourCycle: 12 });
    const hour = t.find((s) => s.type === 'hour');
    expect(hour?.min).toBe(1);
    expect(hour?.max).toBe(12);
  });

  it('populates meridiem from value', () => {
    const d = new Date(2026, 3, 12, 15, 0); // 3 PM
    const s = buildSections({ mode: 'time', locale: 'en-US', hourCycle: 12, value: d });
    const m = s.find((x) => x.type === 'meridiem');
    expect(m?.value).toBe('PM');
  });
});

describe('validateSections', () => {
  it('returns incomplete when any numeric section is empty', () => {
    const sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    const result = validateSections(sections);
    expect(result.valid).toBe(false);
    expect(result.incomplete).toBe(true);
    expect(result.date).toBeNull();
  });

  it('returns a valid Date for a complete valid input', () => {
    const sections = buildSections({
      mode: 'date',
      locale: 'en-US',
      value: new Date(2026, 3, 12),
    });
    const result = validateSections(sections);
    expect(result.valid).toBe(true);
    expect(result.date?.getFullYear()).toBe(2026);
    expect(result.date?.getMonth()).toBe(3);
    expect(result.date?.getDate()).toBe(12);
  });

  it('Feb 30 is invalid', () => {
    let sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'month'),
      '02',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'day'),
      '30',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'year'),
      '2026',
    );
    const result = validateSections(sections);
    expect(result.valid).toBe(false);
    expect(result.incomplete).toBe(false);
  });

  it('Feb 29 is valid on a leap year', () => {
    let sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'month'),
      '02',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'day'),
      '29',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'year'),
      '2024',
    );
    const result = validateSections(sections);
    expect(result.valid).toBe(true);
    expect(result.date?.getFullYear()).toBe(2024);
  });

  it('Feb 29 is invalid on a non-leap year', () => {
    let sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'month'),
      '02',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'day'),
      '29',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'year'),
      '2025',
    );
    const result = validateSections(sections);
    expect(result.valid).toBe(false);
  });

  it('month=13 is invalid', () => {
    let sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'month'),
      '13',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'day'),
      '01',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'year'),
      '2026',
    );
    const result = validateSections(sections);
    expect(result.valid).toBe(false);
  });

  it('12-hour mode converts PM correctly', () => {
    let sections = buildSections({ mode: 'time', locale: 'en-US', hourCycle: 12 });
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'hour'),
      '03',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'minute'),
      '15',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'meridiem'),
      'PM',
    );
    const result = validateSections(sections);
    expect(result.valid).toBe(true);
    expect(result.date?.getHours()).toBe(15);
    expect(result.date?.getMinutes()).toBe(15);
  });

  it('12-hour mode maps 12 AM to midnight and 12 PM to noon', () => {
    let sections = buildSections({ mode: 'time', locale: 'en-US', hourCycle: 12 });
    const hourIdx = sections.findIndex((s) => s.type === 'hour');
    const minuteIdx = sections.findIndex((s) => s.type === 'minute');
    const meridiemIdx = sections.findIndex((s) => s.type === 'meridiem');

    sections = setSectionValue(sections, hourIdx, '12');
    sections = setSectionValue(sections, minuteIdx, '00');
    sections = setSectionValue(sections, meridiemIdx, 'AM');
    let result = validateSections(sections);
    expect(result.date?.getHours()).toBe(0);

    sections = setSectionValue(sections, meridiemIdx, 'PM');
    result = validateSections(sections);
    expect(result.date?.getHours()).toBe(12);
  });
});

describe('adjustSectionValue', () => {
  it('increments month within bounds', () => {
    const sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    const m = sections.find((s) => s.type === 'month')!;
    const withVal = { ...m, value: '05' };
    expect(adjustSectionValue(withVal, 1)).toBe('06');
    expect(adjustSectionValue(withVal, -1)).toBe('04');
  });

  it('wraps month at boundaries', () => {
    const sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    const m = sections.find((s) => s.type === 'month')!;
    expect(adjustSectionValue({ ...m, value: '12' }, 1)).toBe('01');
    expect(adjustSectionValue({ ...m, value: '01' }, -1)).toBe('12');
  });

  it('starts empty sections at min on Arrow Up and max on Arrow Down', () => {
    const sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    const m = sections.find((s) => s.type === 'month')!;
    expect(adjustSectionValue({ ...m, value: '' }, 1)).toBe('01');
    expect(adjustSectionValue({ ...m, value: '' }, -1)).toBe('12');
  });

  it('toggles meridiem', () => {
    const meridiem = {
      type: 'meridiem' as const,
      value: 'AM',
      placeholder: 'AM',
      maxLength: null,
      min: null,
      max: null,
    };
    expect(adjustSectionValue(meridiem, 1)).toBe('PM');
    expect(adjustSectionValue({ ...meridiem, value: 'PM' }, 1)).toBe('AM');
    expect(adjustSectionValue({ ...meridiem, value: '' }, 1)).toBe('AM');
    expect(adjustSectionValue({ ...meridiem, value: '' }, -1)).toBe('PM');
  });
});

describe('applyDigitToSection', () => {
  const buildMonth = () =>
    buildSections({ mode: 'date', locale: 'en-US', value: null }).find((s) => s.type === 'month')!;
  const buildYear = () =>
    buildSections({ mode: 'date', locale: 'en-US', value: null }).find((s) => s.type === 'year')!;
  const buildHour24 = () =>
    buildSections({ mode: 'time', locale: 'en-US', hourCycle: 24 }).find((s) => s.type === 'hour')!;

  it('accepts a first digit in month without advancing', () => {
    const m = buildMonth();
    const r = applyDigitToSection(m, '1');
    expect(r.value).toBe('1');
    expect(r.shouldAdvance).toBe(false);
  });

  it('appends a second digit in month and advances', () => {
    const m = { ...buildMonth(), value: '1' };
    const r = applyDigitToSection(m, '2');
    expect(r.value).toBe('12');
    expect(r.shouldAdvance).toBe(true);
  });

  it('digit that would exceed month max replaces + advances (e.g. 1 then 3 -> snap)', () => {
    // Typing "1" then "3" in month: "13" > 12, so fresh "3" replaces and advances (3*10>12).
    const m = { ...buildMonth(), value: '1' };
    const r = applyDigitToSection(m, '3');
    expect(r.shouldAdvance).toBe(true);
    expect(Number(r.value)).toBe(3);
    expect(r.value).toBe('03'); // padded on advance
  });

  it('typing a leading digit that cannot be extended advances (e.g. "3" in month)', () => {
    const m = buildMonth();
    const r = applyDigitToSection(m, '3');
    // 3*10=30 > 12, so shouldAdvance with value "03"
    expect(r.shouldAdvance).toBe(true);
    expect(r.value).toBe('03');
  });

  it('year accepts 4 digits before advancing', () => {
    let y = buildYear();
    let r = applyDigitToSection(y, '2');
    expect(r.shouldAdvance).toBe(false);
    y = { ...y, value: r.value };
    r = applyDigitToSection(y, '0');
    expect(r.shouldAdvance).toBe(false);
    y = { ...y, value: r.value };
    r = applyDigitToSection(y, '2');
    expect(r.shouldAdvance).toBe(false);
    y = { ...y, value: r.value };
    r = applyDigitToSection(y, '6');
    expect(r.shouldAdvance).toBe(true);
    expect(r.value).toBe('2026');
  });

  it('hour 24: typing 2 then 5 results in fresh "5" with advance', () => {
    const h = { ...buildHour24(), value: '2' };
    const r = applyDigitToSection(h, '5');
    // 25 > 23 so replace with "5", advance (5*10=50>23)
    expect(r.shouldAdvance).toBe(true);
    expect(r.value).toBe('05');
  });

  it('hour 24: typing 0 stays as "0" (no advance), then "9" -> "09" advance', () => {
    const h0 = buildHour24();
    const r1 = applyDigitToSection(h0, '0');
    expect(r1.value).toBe('0');
    expect(r1.shouldAdvance).toBe(false);
    const r2 = applyDigitToSection({ ...h0, value: '0' }, '9');
    expect(r2.value).toBe('09');
    expect(r2.shouldAdvance).toBe(true);
  });

  it('non-digit input returns unchanged', () => {
    const m = buildMonth();
    const r = applyDigitToSection(m, 'a');
    expect(r.value).toBe(m.value);
    expect(r.shouldAdvance).toBe(false);
  });
});

describe('clampDayToMonth', () => {
  it('clamps day=31 to 30 when month is April', () => {
    let sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'month'),
      '04',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'day'),
      '31',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'year'),
      '2026',
    );
    const clamped = clampDayToMonth(sections);
    const day = clamped.find((s) => s.type === 'day');
    expect(day?.value).toBe('30');
  });

  it('leaves day alone if it fits', () => {
    let sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'month'),
      '03',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'day'),
      '31',
    );
    sections = setSectionValue(
      sections,
      sections.findIndex((s) => s.type === 'year'),
      '2026',
    );
    const clamped = clampDayToMonth(sections);
    const day = clamped.find((s) => s.type === 'day');
    expect(day?.value).toBe('31');
  });
});

describe('applyPaste', () => {
  it('fills all date sections from "04/12/2026"', () => {
    const sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    const result = applyPaste(sections, '04/12/2026');
    const month = result.find((s) => s.type === 'month');
    const day = result.find((s) => s.type === 'day');
    const year = result.find((s) => s.type === 'year');
    expect(month?.value).toBe('04');
    expect(day?.value).toBe('12');
    expect(year?.value).toBe('2026');
  });

  it('fills en-GB order from "12/04/2026"', () => {
    const sections = buildSections({ mode: 'date', locale: 'en-GB', value: null });
    const result = applyPaste(sections, '12/04/2026');
    const month = result.find((s) => s.type === 'month');
    const day = result.find((s) => s.type === 'day');
    const year = result.find((s) => s.type === 'year');
    expect(day?.value).toBe('12');
    expect(month?.value).toBe('04');
    expect(year?.value).toBe('2026');
  });

  it('handles datetime paste', () => {
    const sections = buildSections({
      mode: 'datetime',
      locale: 'en-US',
      hourCycle: 24,
    });
    const result = applyPaste(sections, '04/12/2026 14:30');
    const hour = result.find((s) => s.type === 'hour');
    const minute = result.find((s) => s.type === 'minute');
    expect(hour?.value).toBe('14');
    expect(minute?.value).toBe('30');
  });

  it('ignores out-of-range tokens', () => {
    const sections = buildSections({ mode: 'date', locale: 'en-US', value: null });
    const result = applyPaste(sections, '99/99/2026');
    const month = result.find((s) => s.type === 'month');
    const day = result.find((s) => s.type === 'day');
    // Out-of-range tokens skip; year should still be set.
    expect(month?.value).toBe('');
    expect(day?.value).toBe('');
  });
});

describe('getNextEditableIndex / getPreviousEditableIndex', () => {
  const sections = buildSections({ mode: 'date', locale: 'en-US', value: null });

  it('returns first editable when from is null', () => {
    const idx = getNextEditableIndex(sections, null);
    expect(idx).not.toBeNull();
    expect(sections[idx as number]?.type).not.toBe('literal');
  });

  it('skips literal sections', () => {
    const first = getNextEditableIndex(sections, null) as number;
    const second = getNextEditableIndex(sections, first) as number;
    expect(sections[second]?.type).not.toBe('literal');
    expect(second).toBeGreaterThan(first + 1);
  });

  it('returns null at end', () => {
    // Find last editable
    let last = getNextEditableIndex(sections, null);
    while (true) {
      const next = getNextEditableIndex(sections, last);
      if (next === null) break;
      last = next;
    }
    expect(getNextEditableIndex(sections, last)).toBeNull();
  });

  it('previous from first is null', () => {
    const first = getNextEditableIndex(sections, null);
    expect(getPreviousEditableIndex(sections, first)).toBeNull();
  });
});
