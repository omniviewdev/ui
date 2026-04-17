/**
 * Section model + pure helpers for the DateField primitive.
 *
 * Inspired by MUI X's `useField`, adapted for our constraints:
 *  - Native `Date` (no adapter)
 *  - `Intl.DateTimeFormatToParts` for format tokenization
 *  - Simpler scope: skip localized digits, RTL reordering, adapters
 */

export type SectionType =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'meridiem' // AM/PM
  | 'literal'; // separator like "/", ":", " "

export interface Section {
  type: SectionType;
  /** Raw typed value or '' if empty */
  value: string;
  /** Placeholder shown when value is empty */
  placeholder: string;
  /** For digit sections: expected length (e.g. 2 for MM, 4 for YYYY). null for literal/meridiem. */
  maxLength: number | null;
  /** Inclusive min/max for validation (e.g. month = 1..12). null for literal/meridiem. */
  min: number | null;
  max: number | null;
}

export interface BuildSectionsOptions {
  mode: 'date' | 'time' | 'datetime';
  locale?: string;
  hourCycle?: 12 | 24;
  showSeconds?: boolean;
  /** Optional current value used to seed section content. */
  value?: Date | null;
}

const DIGIT_PLACEHOLDERS: Record<Exclude<SectionType, 'literal' | 'meridiem'>, string> = {
  year: 'YYYY',
  month: 'MM',
  day: 'DD',
  hour: 'HH',
  minute: 'mm',
  second: 'ss',
};

const NUMERIC_TYPES: ReadonlySet<SectionType> = new Set([
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
]);

/** Representative date: 2026-01-07 (a Wednesday) at 14:30:45 local time. */
function getRepresentativeDate(): Date {
  return new Date(2026, 0, 7, 14, 30, 45);
}

function getDateFormatOptions(mode: 'date' | 'datetime'): Intl.DateTimeFormatOptions {
  return mode === 'date' || mode === 'datetime'
    ? { year: 'numeric', month: '2-digit', day: '2-digit' }
    : {};
}

function getTimeFormatOptions(
  mode: 'time' | 'datetime',
  hourCycle: 12 | 24,
  showSeconds: boolean,
): Intl.DateTimeFormatOptions {
  if (mode !== 'time' && mode !== 'datetime') return {};
  const opts: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: hourCycle === 12,
  };
  if (showSeconds) opts.second = '2-digit';
  return opts;
}

function buildFormatOptions(opts: BuildSectionsOptions): Intl.DateTimeFormatOptions {
  const hourCycle = opts.hourCycle ?? 24;
  const showSeconds = opts.showSeconds ?? false;

  if (opts.mode === 'date') {
    return getDateFormatOptions('date');
  }
  if (opts.mode === 'time') {
    return getTimeFormatOptions('time', hourCycle, showSeconds);
  }
  // datetime
  return {
    ...getDateFormatOptions('datetime'),
    ...getTimeFormatOptions('datetime', hourCycle, showSeconds),
  };
}

/**
 * Map an `Intl.DateTimeFormatPartTypes` value to our internal SectionType.
 * Returns null for unsupported parts (which we'll skip).
 */
function partTypeToSectionType(part: Intl.DateTimeFormatPart['type']): SectionType | null {
  switch (part) {
    case 'year':
      return 'year';
    case 'month':
      return 'month';
    case 'day':
      return 'day';
    case 'hour':
      return 'hour';
    case 'minute':
      return 'minute';
    case 'second':
      return 'second';
    case 'dayPeriod':
      return 'meridiem';
    case 'literal':
      return 'literal';
    default:
      return null;
  }
}

function getMinMax(type: SectionType, hourCycle: 12 | 24): { min: number | null; max: number | null } {
  switch (type) {
    case 'year':
      return { min: 1, max: 9999 };
    case 'month':
      return { min: 1, max: 12 };
    case 'day':
      return { min: 1, max: 31 };
    case 'hour':
      return hourCycle === 12 ? { min: 1, max: 12 } : { min: 0, max: 23 };
    case 'minute':
    case 'second':
      return { min: 0, max: 59 };
    case 'meridiem':
    case 'literal':
    default:
      return { min: null, max: null };
  }
}

/**
 * Pad a number to `len` digits with leading zeros. Negative numbers are not expected here.
 */
export function padZero(n: number, len: number): string {
  const s = String(n);
  if (s.length >= len) return s;
  return '0'.repeat(len - s.length) + s;
}

/**
 * Extract a numeric section value from a Date based on the section's type and hour cycle.
 * Returns the formatted string representation using `maxLength` leading zeros.
 */
export function getSectionValueFromDate(
  type: SectionType,
  date: Date,
  maxLength: number,
  hourCycle: 12 | 24,
): string {
  switch (type) {
    case 'year':
      return padZero(date.getFullYear(), maxLength);
    case 'month':
      return padZero(date.getMonth() + 1, maxLength);
    case 'day':
      return padZero(date.getDate(), maxLength);
    case 'hour': {
      const h = date.getHours();
      if (hourCycle === 24) return padZero(h, maxLength);
      // 12-hour display: 0 -> 12, 13 -> 1, etc.
      const display = h % 12 === 0 ? 12 : h % 12;
      return padZero(display, maxLength);
    }
    case 'minute':
      return padZero(date.getMinutes(), maxLength);
    case 'second':
      return padZero(date.getSeconds(), maxLength);
    default:
      return '';
  }
}

/**
 * Build an ordered array of `Section`s for the given mode/locale/options.
 *
 * Uses `Intl.DateTimeFormat(locale).formatToParts(<representative date>)` to establish
 * the display order (e.g. `en-US` -> month/day/year, `en-GB` -> day/month/year).
 */
export function buildSections(options: BuildSectionsOptions): Section[] {
  const hourCycle = options.hourCycle ?? 24;
  const formatOptions = buildFormatOptions(options);

  // Nothing to render for this mode.
  if (Object.keys(formatOptions).length === 0) return [];

  const representative = getRepresentativeDate();
  const fmt = new Intl.DateTimeFormat(options.locale, formatOptions);
  const parts = fmt.formatToParts(representative);

  const sections: Section[] = [];

  for (const part of parts) {
    const type = partTypeToSectionType(part.type);
    if (type === null) continue;

    if (type === 'literal') {
      sections.push({
        type,
        value: part.value,
        placeholder: part.value,
        maxLength: null,
        min: null,
        max: null,
      });
      continue;
    }

    if (type === 'meridiem') {
      let value = '';
      if (options.value) {
        value = options.value.getHours() >= 12 ? 'PM' : 'AM';
      }
      sections.push({
        type,
        value,
        placeholder: 'AM',
        maxLength: null,
        min: null,
        max: null,
      });
      continue;
    }

    // Numeric section: derive maxLength from the formatted token length.
    // e.g. "2026" -> 4, "04" -> 2.
    const maxLength = part.value.length;
    const { min, max } = getMinMax(type, hourCycle);

    let value = '';
    if (options.value) {
      value = getSectionValueFromDate(type, options.value, maxLength, hourCycle);
    }

    sections.push({
      type,
      value,
      placeholder: DIGIT_PLACEHOLDERS[type].slice(0, maxLength),
      maxLength,
      min,
      max,
    });
  }

  return sections;
}

/** True if the `year` is a leap year (Gregorian calendar). */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Number of days in `month` (1-12) for `year`.
 * If `year` is not supplied (NaN), assume non-leap behaviour for February (28).
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 31; // fall back to max
  if (month === 2) {
    if (Number.isFinite(year) && isLeapYear(year)) return 29;
    return 28;
  }
  // 30 days: April, June, September, November
  if (month === 4 || month === 6 || month === 9 || month === 11) return 30;
  return 31;
}

export interface ValidateSectionsResult {
  /** True when all non-literal sections are populated AND valid. */
  valid: boolean;
  /** Parsed Date on success, null on failure or incompleteness. */
  date: Date | null;
  /** True if ANY section is empty (different from "invalid"). */
  incomplete: boolean;
}

/**
 * Validate + parse sections into a Date.
 * Returns `{ valid: false, date: null, incomplete: true }` when any required section is empty.
 */
export function validateSections(sections: Section[]): ValidateSectionsResult {
  const nonLiterals = sections.filter((s) => s.type !== 'literal');

  // Check for emptiness first.
  for (const s of nonLiterals) {
    if (s.value === '') {
      return { valid: false, date: null, incomplete: true };
    }
  }

  let year = NaN;
  let month = NaN;
  let day = NaN;
  let hour = NaN;
  let minute = 0;
  let second = 0;
  let meridiem: 'AM' | 'PM' | null = null;
  let has12HourHour = false;

  let hasYear = false;
  let hasMonth = false;
  let hasDay = false;
  let hasHour = false;

  for (const s of sections) {
    if (s.type === 'literal') continue;

    if (s.type === 'meridiem') {
      const v = s.value.toUpperCase();
      if (v !== 'AM' && v !== 'PM') {
        return { valid: false, date: null, incomplete: false };
      }
      meridiem = v;
      continue;
    }

    if (!NUMERIC_TYPES.has(s.type)) continue;

    const n = Number(s.value);
    if (!Number.isFinite(n) || !/^\d+$/.test(s.value)) {
      return { valid: false, date: null, incomplete: false };
    }

    // min/max check
    if (s.min !== null && n < s.min) {
      return { valid: false, date: null, incomplete: false };
    }
    if (s.max !== null && n > s.max) {
      return { valid: false, date: null, incomplete: false };
    }

    switch (s.type) {
      case 'year':
        year = n;
        hasYear = true;
        break;
      case 'month':
        month = n;
        hasMonth = true;
        break;
      case 'day':
        day = n;
        hasDay = true;
        break;
      case 'hour':
        hour = n;
        hasHour = true;
        // If max is 12 (inclusive), we are in 12-hour mode.
        if (s.max === 12) has12HourHour = true;
        break;
      case 'minute':
        minute = n;
        break;
      case 'second':
        second = n;
        break;
    }
  }

  // Day-in-month check (when month/year are present). Defaults:
  // - If year is missing, use a leap year to be lenient (e.g. time-only mode).
  if (hasDay && hasMonth) {
    const maxDay = getDaysInMonth(hasYear ? year : 2024, month);
    if (day > maxDay) {
      return { valid: false, date: null, incomplete: false };
    }
  }

  // Convert 12-hour to 24-hour
  if (hasHour && has12HourHour) {
    if (meridiem === null) {
      // 12-hour mode but no AM/PM provided (should have been caught by emptiness check).
      return { valid: false, date: null, incomplete: false };
    }
    const base = hour % 12; // 12 -> 0, 1..11 -> 1..11
    hour = meridiem === 'PM' ? base + 12 : base;
  }

  // Construct. Time-only mode uses epoch date; datetime uses provided y/m/d.
  const y = hasYear ? year : 1970;
  const m = hasMonth ? month - 1 : 0;
  const d = hasDay ? day : 1;
  const h = hasHour ? hour : 0;

  const date = new Date(y, m, d, h, minute, second);

  if (Number.isNaN(date.getTime())) {
    return { valid: false, date: null, incomplete: false };
  }

  return { valid: true, date, incomplete: false };
}

/**
 * Update one section's `value` immutably, returning a new sections array.
 */
export function setSectionValue(sections: Section[], index: number, value: string): Section[] {
  if (index < 0 || index >= sections.length) return sections;
  const existing = sections[index];
  if (!existing) return sections;
  const next = sections.slice();
  next[index] = { ...existing, value };
  return next;
}

/** Return the indices of non-literal sections in order. */
export function getEditableIndices(sections: Section[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (s && s.type !== 'literal') result.push(i);
  }
  return result;
}

/**
 * Find the next editable section index after `from`, or null if none.
 * If `from` is null, returns the first editable index.
 */
export function getNextEditableIndex(sections: Section[], from: number | null): number | null {
  const editable = getEditableIndices(sections);
  if (editable.length === 0) return null;
  if (from === null) return editable[0] ?? null;
  for (const idx of editable) {
    if (idx > from) return idx;
  }
  return null;
}

/**
 * Find the previous editable section index before `from`, or null if none.
 */
export function getPreviousEditableIndex(
  sections: Section[],
  from: number | null,
): number | null {
  const editable = getEditableIndices(sections);
  if (editable.length === 0) return null;
  if (from === null) return editable[editable.length - 1] ?? null;
  for (let i = editable.length - 1; i >= 0; i--) {
    const idx = editable[i];
    if (idx !== undefined && idx < from) return idx;
  }
  return null;
}

/**
 * Increment/decrement a section's value by `delta`, wrapping within [min, max].
 * If the section is empty, starts from `min`.
 * For meridiem, toggles between AM and PM.
 * Returns the new string value.
 */
export function adjustSectionValue(section: Section, delta: number): string {
  if (section.type === 'meridiem') {
    const current = section.value.toUpperCase();
    if (current === 'AM') return 'PM';
    if (current === 'PM') return 'AM';
    // empty -> default start
    return delta >= 0 ? 'AM' : 'PM';
  }

  if (section.type === 'literal') return section.value;

  const min = section.min ?? 0;
  const max = section.max ?? 0;
  const maxLength = section.maxLength ?? 2;

  if (min === max) return padZero(min, maxLength);

  const range = max - min + 1;

  let current: number;
  if (section.value === '') {
    // Empty: Arrow Up -> start at `min`, Arrow Down -> start at `max`.
    current = delta >= 0 ? min - delta : max - delta;
  } else {
    current = Number(section.value);
    if (!Number.isFinite(current)) current = min;
  }

  // Compute raw next then wrap.
  let next = current + delta;
  // Wrap into [min, max]
  next = ((((next - min) % range) + range) % range) + min;

  return padZero(next, maxLength);
}

/**
 * Clamp a day section against the current month/year if possible. Returns an
 * updated sections array where the day is reduced if it exceeds the days-in-month.
 */
export function clampDayToMonth(sections: Section[]): Section[] {
  const dayIdx = sections.findIndex((s) => s.type === 'day');
  if (dayIdx === -1) return sections;

  const day = sections[dayIdx];
  if (!day || day.value === '') return sections;

  const monthSection = sections.find((s) => s.type === 'month');
  if (!monthSection || monthSection.value === '') return sections;

  const yearSection = sections.find((s) => s.type === 'year');
  // Only trust the year when it is fully populated (value length matches maxLength).
  // Otherwise a partial year (e.g. "2" while typing) would mis-clamp against year 2.
  const yearComplete =
    yearSection &&
    yearSection.value !== '' &&
    yearSection.maxLength !== null &&
    yearSection.value.length === yearSection.maxLength;
  const year = yearComplete ? Number(yearSection.value) : 2024; /* leap */

  const month = Number(monthSection.value);
  if (!Number.isFinite(month) || month < 1 || month > 12) return sections;

  const maxDays = getDaysInMonth(year, month);
  const dayNum = Number(day.value);
  if (!Number.isFinite(dayNum)) return sections;
  if (dayNum <= maxDays) return sections;

  return setSectionValue(sections, dayIdx, padZero(maxDays, day.maxLength ?? 2));
}

/**
 * Apply a typed digit to a section. Returns the new section value (possibly truncated
 * or replaced), and a `shouldAdvance` flag indicating whether focus should move to the
 * next section (either because maxLength is reached or the next digit would overflow).
 *
 * Rules:
 *  - If the section is not a numeric type, returns unchanged.
 *  - If the section is empty: the digit becomes the new value.
 *  - If appending the digit stays within [min, max]: append and check if length reached maxLength.
 *  - If appending overflows (> max): the digit REPLACES the existing value (fresh start).
 */
export function applyDigitToSection(
  section: Section,
  digit: string,
): { value: string; shouldAdvance: boolean } {
  if (!/^\d$/.test(digit)) return { value: section.value, shouldAdvance: false };
  if (!NUMERIC_TYPES.has(section.type)) return { value: section.value, shouldAdvance: false };

  const max = section.max ?? 99;
  const min = section.min ?? 0;
  const maxLength = section.maxLength ?? 2;

  const d = Number(digit);

  // Empty: start fresh. For sections with min > 0 (like month=1..12), typing "0"
  // is kept as "0" (staged) but does NOT advance — the user may want to type "01".
  // However, if the digit alone already equals/exceeds half the max range, we can
  // pre-advance. Keep it simple: always stage and only advance when maxLength reached
  // or when the next digit could not grow.
  if (section.value === '') {
    // If typing this single digit would be > max, it's not a valid start either — but
    // for max=12 typing "3" is fine (stays as "3"). For max=5 typing "7"... clamp to max.
    const num = d;
    if (num > max) {
      // Can't fit. Snap to max.
      const clamped = Math.min(num, max);
      return { value: padZero(clamped, maxLength), shouldAdvance: true };
    }

    // If num*10 > max, no more digits can be appended → advance.
    // Also advance if num already has length === maxLength (only possible if maxLength=1).
    const shouldAdvance = num * 10 > max || maxLength === 1;
    return {
      value: shouldAdvance ? padZero(num, maxLength) : String(num),
      shouldAdvance,
    };
  }

  // Non-empty: try to append.
  const candidate = section.value + digit;
  const candidateNum = Number(candidate);

  if (candidateNum <= max && candidate.length <= maxLength) {
    // Accept the append. Advance when we reach maxLength OR no more digits can be added.
    const shouldAdvance =
      candidate.length === maxLength || candidateNum * 10 > max;

    if (shouldAdvance) {
      // On advance, make sure the stored value has leading zeros up to maxLength.
      // But only if we still meet min. If below min, clamp up to min.
      let finalNum = candidateNum;
      if (finalNum < min) finalNum = min;
      return { value: padZero(finalNum, maxLength), shouldAdvance: true };
    }

    return { value: candidate, shouldAdvance: false };
  }

  // Overflow — the new digit replaces the old value.
  const fresh = d;
  if (fresh > max) {
    return { value: padZero(Math.min(fresh, max), maxLength), shouldAdvance: true };
  }

  const shouldAdvance = fresh * 10 > max || maxLength === 1;
  return {
    value: shouldAdvance ? padZero(fresh, maxLength) : String(fresh),
    shouldAdvance,
  };
}

/**
 * Parse a free-form pasted string and attempt to distribute digits into matching sections.
 * Returns an updated `sections` array. Strategy:
 *  - Split the pasted text by non-digit+non-letter characters.
 *  - Match tokens to non-literal section slots in order (preferring digits for digit
 *    sections, letters for meridiem).
 *  - Only apply tokens that fit the section's bounds.
 */
export function applyPaste(sections: Section[], text: string): Section[] {
  const tokens = text.split(/[^0-9A-Za-z]+/).filter((t) => t.length > 0);
  if (tokens.length === 0) return sections;

  const result = sections.slice();
  const editableIdxs = getEditableIndices(result);

  let tokenIdx = 0;
  for (const sectionIdx of editableIdxs) {
    if (tokenIdx >= tokens.length) break;
    const section = result[sectionIdx];
    const token = tokens[tokenIdx];
    if (!section || token === undefined) continue;

    if (section.type === 'meridiem') {
      const letters = token.replace(/[^A-Za-z]/g, '').toUpperCase();
      if (letters === 'AM' || letters === 'PM') {
        result[sectionIdx] = { ...section, value: letters };
        tokenIdx++;
      } else {
        // Skip; don't advance the token index — literal digit tokens should go to digit sections
        // but if there's really no match, just skip the section.
        tokenIdx++;
      }
      continue;
    }

    // Numeric
    const digits = token.replace(/[^0-9]/g, '');
    if (digits === '') {
      tokenIdx++;
      continue;
    }

    const maxLength = section.maxLength ?? 2;
    // Take up to maxLength digits from start; if too many, truncate.
    let candidate = digits.slice(0, maxLength);
    // Pad with leading zeros if token is shorter than maxLength (interpretation: numeric).
    const asNum = Number(candidate);
    const max = section.max ?? Number.POSITIVE_INFINITY;
    const min = section.min ?? 0;

    if (!Number.isFinite(asNum) || asNum < min || asNum > max) {
      tokenIdx++;
      continue;
    }

    // Store with leading zeros for digit sections.
    candidate = padZero(asNum, maxLength);
    result[sectionIdx] = { ...section, value: candidate };
    tokenIdx++;
  }

  return clampDayToMonth(result);
}

/**
 * Return a fresh set of sections derived from options + a value. Used when the
 * component's inputs change (locale, mode, value) to rebuild the state.
 */
export function rebuildSectionsFromValue(options: BuildSectionsOptions): Section[] {
  return buildSections(options);
}
