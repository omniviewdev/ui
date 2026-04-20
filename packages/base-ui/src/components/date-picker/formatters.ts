import type { WeekStart } from './dateUtils';

export type DateFormat = Intl.DateTimeFormatOptions | ((date: Date) => string);

export function formatDate(date: Date, format?: DateFormat, locale?: string): string {
  if (typeof format === 'function') return format(date);
  const options: Intl.DateTimeFormatOptions = format ?? { dateStyle: 'short' };
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatMonthYear(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

// Locales where the week starts on Saturday (6).
const SATURDAY_START_LOCALES = new Set(['ar-sa']);
// Locales where the week starts on Sunday (0), beyond the en-US family.
const SUNDAY_START_PREFIXES = ['he', 'pt-br', 'zh-cn', 'ja', 'ko', 'th'];

/**
 * Return the first day of week for a given locale using Intl.Locale's
 * weekInfo (modern browsers) or fall back to a well-known locale map,
 * with a final Monday default.
 */
export function getWeekStartsOnForLocale(locale?: string): WeekStart {
  try {
    const info = (new Intl.Locale(locale ?? 'en-US') as unknown as {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    });
    const first =
      info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay ?? undefined;
    if (first !== undefined) {
      return (first === 7 ? 0 : first) as WeekStart;
    }
  } catch {
    /* fall through */
  }
  const tag = (locale ?? 'en-US').toLowerCase();
  if (tag === 'en-us' || tag.startsWith('en-us-')) return 0;
  if (SATURDAY_START_LOCALES.has(tag)) return 6;
  if (SUNDAY_START_PREFIXES.some((p) => tag === p || tag.startsWith(`${p}-`))) return 0;
  return 1;
}

export function getWeekdayLabels(
  locale: string | undefined,
  weekStartsOn: WeekStart,
  style: 'narrow' | 'short' | 'long' = 'narrow',
): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: style });
  // Pick a Sunday that's stable across DST; 2026-01-04 was a Sunday.
  const sunday = new Date(2026, 0, 4);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + ((i + weekStartsOn) % 7));
    out.push(fmt.format(day));
  }
  return out;
}
