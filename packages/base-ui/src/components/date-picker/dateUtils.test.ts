import { describe, it, expect } from 'vitest';
import {
  startOfDay,
  startOfMonth,
  addMonths,
  addDays,
  addYears,
  isSameDay,
  isBefore,
  isAfter,
  getMonthMatrix,
  clampDate,
  isDateInRange,
} from './dateUtils';

describe('dateUtils', () => {
  it('startOfDay zeroes h/m/s/ms', () => {
    const d = new Date(2026, 3, 12, 14, 30, 45, 678);
    const s = startOfDay(d);
    expect(s.getHours()).toBe(0);
    expect(s.getMinutes()).toBe(0);
    expect(s.getSeconds()).toBe(0);
    expect(s.getMilliseconds()).toBe(0);
    expect(s.getDate()).toBe(12);
  });

  it('startOfMonth returns day 1', () => {
    const s = startOfMonth(new Date(2026, 3, 25));
    expect(s.getDate()).toBe(1);
    expect(s.getMonth()).toBe(3);
  });

  it('addMonths handles month wrap and year rollover', () => {
    expect(addMonths(new Date(2026, 11, 15), 1)).toEqual(new Date(2027, 0, 15));
    expect(addMonths(new Date(2026, 0, 31), 1).getMonth()).toBe(1);
  });

  it('addDays and addYears', () => {
    expect(addDays(new Date(2026, 3, 12), 1)).toEqual(new Date(2026, 3, 13));
    expect(addYears(new Date(2026, 3, 12), -1)).toEqual(new Date(2025, 3, 12));
  });

  it('isSameDay is strict on year/month/day', () => {
    expect(isSameDay(new Date(2026, 3, 12), new Date(2026, 3, 12, 15, 0))).toBe(true);
    expect(isSameDay(new Date(2026, 3, 12), new Date(2026, 3, 13))).toBe(false);
    expect(isSameDay(new Date(2026, 3, 12), new Date(2025, 3, 12))).toBe(false);
  });

  it('isBefore / isAfter compare at day granularity', () => {
    expect(isBefore(new Date(2026, 3, 11), new Date(2026, 3, 12))).toBe(true);
    expect(isBefore(new Date(2026, 3, 12), new Date(2026, 3, 12))).toBe(false);
    expect(isAfter(new Date(2026, 3, 13), new Date(2026, 3, 12))).toBe(true);
  });

  it('clampDate clamps to [min, max]', () => {
    const min = new Date(2026, 3, 10);
    const max = new Date(2026, 3, 20);
    expect(clampDate(new Date(2026, 3, 5), min, max)).toEqual(min);
    expect(clampDate(new Date(2026, 3, 25), min, max)).toEqual(max);
    expect(clampDate(new Date(2026, 3, 15), min, max)).toEqual(new Date(2026, 3, 15));
  });

  it('isDateInRange is inclusive', () => {
    const min = new Date(2026, 3, 10);
    const max = new Date(2026, 3, 20);
    expect(isDateInRange(new Date(2026, 3, 10), min, max)).toBe(true);
    expect(isDateInRange(new Date(2026, 3, 20), min, max)).toBe(true);
    expect(isDateInRange(new Date(2026, 3, 9), min, max)).toBe(false);
    expect(isDateInRange(new Date(2026, 3, 21), min, max)).toBe(false);
  });

  it('getMonthMatrix returns 6 rows of 7 days aligned to weekStartsOn', () => {
    const matrix = getMonthMatrix(new Date(2026, 3, 15), 0);
    expect(matrix.length).toBe(6);
    expect(matrix[0]).toBeDefined();
    expect(matrix[0]!.length).toBe(7);
    expect(matrix[0]![0]).toEqual(new Date(2026, 2, 29));
    expect(matrix[5]![6]!.getTime()).toBeGreaterThanOrEqual(new Date(2026, 3, 30).getTime());
  });

  it('getMonthMatrix respects weekStartsOn=1 (Monday)', () => {
    const matrix = getMonthMatrix(new Date(2026, 3, 15), 1);
    expect(matrix[0]).toBeDefined();
    expect(matrix[0]![0]!.getDay()).toBe(1);
  });
});
