export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number): Date {
  const targetMonth = d.getMonth() + n;
  const out = new Date(d.getFullYear(), targetMonth, 1);
  // Clamp to the last day of the target month if the original day exceeds it.
  const daysInTarget = new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate();
  out.setDate(Math.min(d.getDate(), daysInTarget));
  return out;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function addYears(d: Date, n: number): Date {
  const targetYear = d.getFullYear() + n;
  // Clamp the day to the last day of the target month in the target year —
  // handles e.g. Feb 29 + 1 year → Feb 28 (not March 1) on non-leap years.
  const daysInTarget = new Date(targetYear, d.getMonth() + 1, 0).getDate();
  const out = new Date(targetYear, d.getMonth(), Math.min(d.getDate(), daysInTarget));
  out.setHours(d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  return out;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

export function clampDate(d: Date, min?: Date, max?: Date): Date {
  if (min && isBefore(d, min)) return new Date(min);
  if (max && isAfter(d, max)) return new Date(max);
  return d;
}

export function isDateInRange(d: Date, min?: Date, max?: Date): boolean {
  if (min && isBefore(d, min)) return false;
  if (max && isAfter(d, max)) return false;
  return true;
}

/**
 * Return a 6×7 matrix of Dates that covers the visible month grid, with the
 * leading cells filled from the previous month and trailing cells from the
 * next month, aligned so the first column is `weekStartsOn`.
 */
export function getMonthMatrix(anchor: Date, weekStartsOn: WeekStart): Date[][] {
  const firstOfMonth = startOfMonth(anchor);
  const leadingOffset = (firstOfMonth.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(firstOfMonth, -leadingOffset);
  const rows: Date[][] = [];
  for (let r = 0; r < 6; r++) {
    const row: Date[] = [];
    for (let c = 0; c < 7; c++) {
      row.push(addDays(gridStart, r * 7 + c));
    }
    rows.push(row);
  }
  return rows;
}
