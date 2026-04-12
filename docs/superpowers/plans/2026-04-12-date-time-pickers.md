# Date & Time Picker Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `DatePicker`, `TimePicker`, and `DateTimePicker` components in `@omniviewdev/base-ui`, built on `@base-ui/react` primitives with CSS Modules and the existing token system. No third-party date library.

**Architecture:** Three compound components that share a pure date/time utility module. `DatePicker` uses `@base-ui/react`'s `Popover` + `Input` primitives, renders a month-grid `Calendar` inside the popover, and follows the WAI-ARIA Date Picker pattern for keyboard navigation. `TimePicker` composes three number fields (hour/minute/seconds) plus an optional AM/PM toggle. `DateTimePicker` composes the two. Formatting uses `Intl.DateTimeFormat` exclusively.

**Tech Stack:** TypeScript 5.9, React 19, Vite 5, Vitest + jsdom, `@testing-library/react`, `@testing-library/user-event`, Storybook 10, `@base-ui/react`, CSS Modules. Source location: `/Users/joshuapare/Repos/omniviewdev/omniview-ui/packages/base-ui/`.

**Spec:** `docs/superpowers/specs/2026-04-12-library-readiness-for-ide-migration-design.md`

**Independence:** This plan does not depend on the theme extensibility plan. They can be executed in parallel worktrees.

**Cross-plan coordination note:** The theme extensibility plan adds a `generate:token-keys` script that parses `styles.css` into typed token unions. When both branches merge, run `pnpm --filter @omniviewdev/base-ui generate:token-keys` and commit the refreshed `src/theme/generated/tokenKeys.ts` — this is what lets custom themes override the new `color.datepicker.*` tokens. If the theme extensibility plan has not yet landed, this step is a no-op; the picker tokens still work because the components reference them via CSS `var()` directly.

---

## Working Directory & Worktree

All file paths in this plan are relative to the base-ui package:
`/Users/joshuapare/Repos/omniviewdev/omniview-ui/packages/base-ui/`

Create a worktree for this work before starting:

```bash
cd /Users/joshuapare/Repos/omniviewdev/omniview-ui
git worktree add worktrees/omniview-ui/date-time-pickers -b feat/date-time-pickers
cd worktrees/omniview-ui/date-time-pickers
pnpm install
pnpm --filter @omniviewdev/base-ui test
pnpm --filter @omniviewdev/base-ui build
```

Expected: baseline tests green, build clean.

---

## File Structure

**New files:**

- `packages/base-ui/src/components/date-picker/dateUtils.ts` — pure date math helpers
- `packages/base-ui/src/components/date-picker/dateUtils.test.ts`
- `packages/base-ui/src/components/date-picker/formatters.ts` — `Intl.DateTimeFormat` helpers
- `packages/base-ui/src/components/date-picker/formatters.test.ts`
- `packages/base-ui/src/components/date-picker/Calendar.tsx` — month grid (exportable standalone)
- `packages/base-ui/src/components/date-picker/Calendar.module.css`
- `packages/base-ui/src/components/date-picker/Calendar.test.tsx`
- `packages/base-ui/src/components/date-picker/DatePicker.tsx` — compound + convenience wrapper
- `packages/base-ui/src/components/date-picker/DatePicker.module.css`
- `packages/base-ui/src/components/date-picker/DatePicker.test.tsx`
- `packages/base-ui/src/components/date-picker/DatePicker.stories.tsx`
- `packages/base-ui/src/components/date-picker/index.ts`
- `packages/base-ui/src/components/time-picker/TimePicker.tsx`
- `packages/base-ui/src/components/time-picker/TimePicker.module.css`
- `packages/base-ui/src/components/time-picker/TimePicker.test.tsx`
- `packages/base-ui/src/components/time-picker/TimePicker.stories.tsx`
- `packages/base-ui/src/components/time-picker/index.ts`
- `packages/base-ui/src/components/date-time-picker/DateTimePicker.tsx`
- `packages/base-ui/src/components/date-time-picker/DateTimePicker.module.css`
- `packages/base-ui/src/components/date-time-picker/DateTimePicker.test.tsx`
- `packages/base-ui/src/components/date-time-picker/DateTimePicker.stories.tsx`
- `packages/base-ui/src/components/date-time-picker/index.ts`

**Modified files:**

- `packages/base-ui/src/theme/styles.css` — add new semantic tokens for all 7 built-in themes (per-density sizes)
- `packages/base-ui/src/components/index.ts` — export the three new components

Utility modules (`dateUtils`, `formatters`) are separated because they are pure, have no React dependency, and can be exercised exhaustively in fast unit tests — this is where most of the date-handling correctness is proved.

---

## Task 1: Add Theming Tokens to styles.css

**Files:**
- Modify: `packages/base-ui/src/theme/styles.css`

Per the spec, add these semantic tokens under each of the 7 `:root[data-ov-theme='<mode>']` blocks. Also add the per-density size tokens under the two `:root[data-ov-density='<density>']` blocks.

Token list:
- `--ov-color-datepicker-header-bg`
- `--ov-color-datepicker-cell-bg`
- `--ov-color-datepicker-cell-bg-today`
- `--ov-color-datepicker-cell-bg-selected`
- `--ov-color-datepicker-cell-bg-hover`
- `--ov-color-datepicker-cell-fg`
- `--ov-color-datepicker-cell-fg-today`
- `--ov-color-datepicker-cell-fg-selected`
- `--ov-color-datepicker-cell-fg-disabled`
- `--ov-color-datepicker-cell-fg-other-month`
- `--ov-size-datepicker-cell` (per-density)
- `--ov-size-datepicker-gap` (per-density)

- [ ] **Step 1: Read the current styles.css to understand existing patterns**

Read the file to confirm the block structure for `:root[data-ov-theme='dark']`, `:root[data-ov-density='comfortable']`, etc. Pay attention to the adjacent tokens (e.g., `--ov-color-bg-*`, `--ov-color-state-*`) that the new tokens should reference via `var()`.

- [ ] **Step 2: Add tokens per-theme, defined in terms of existing semantic tokens**

For each of the 7 built-in themes, add values that re-use existing tokens where possible and introduce new concrete hex values only when needed. Below is a starting recipe for the `dark` theme — derive analogous values for the other 6 themes based on each theme's existing color character (consult the theme's existing `color.bg.*`, `color.fg.*`, `color.brand.*`, and `color.state.*` values before picking):

For `:root[data-ov-theme='dark']`:
```css
--ov-color-datepicker-header-bg: var(--ov-color-bg-surface-raised);
--ov-color-datepicker-cell-bg: transparent;
--ov-color-datepicker-cell-bg-today: var(--ov-color-state-selected);
--ov-color-datepicker-cell-bg-selected: var(--ov-color-brand-500);
--ov-color-datepicker-cell-bg-hover: var(--ov-color-state-hover);
--ov-color-datepicker-cell-fg: var(--ov-color-fg-default);
--ov-color-datepicker-cell-fg-today: var(--ov-color-fg-default);
--ov-color-datepicker-cell-fg-selected: var(--ov-color-fg-inverse);
--ov-color-datepicker-cell-fg-disabled: var(--ov-color-fg-disabled);
--ov-color-datepicker-cell-fg-other-month: var(--ov-color-fg-muted);
```

For the two high-contrast themes, pick values that preserve WCAG AAA contrast (e.g., `--ov-color-datepicker-cell-bg-selected: var(--ov-color-fg-default)` with inverse fg, or use the theme's pure white/black variables).

For `:root[data-ov-density='comfortable']`:
```css
--ov-size-datepicker-cell: 32px;
--ov-size-datepicker-gap: 2px;
```

For `:root[data-ov-density='compact']`:
```css
--ov-size-datepicker-cell: 26px;
--ov-size-datepicker-gap: 1px;
```

Run through each of the 7 themes carefully. Keep the token ordering consistent with the existing file.

- [ ] **Step 3: Verify the file still parses**

```bash
pnpm --filter @omniviewdev/base-ui build
```

Expected: clean build. If Vite emits a CSS parse warning/error, fix the offending block before continuing.

- [ ] **Step 4: Commit**

```bash
git add packages/base-ui/src/theme/styles.css
git commit -m "feat(base-ui): add date picker theming tokens"
```

---

## Task 2: Pure Date Utilities

**Files:**
- Create: `packages/base-ui/src/components/date-picker/dateUtils.ts`
- Create: `packages/base-ui/src/components/date-picker/dateUtils.test.ts`

Zero-dependency pure functions. These get exhaustive unit tests because they're where calendar correctness is established.

- [ ] **Step 1: Write failing tests**

Create `packages/base-ui/src/components/date-picker/dateUtils.test.ts`:

```typescript
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
    expect(addMonths(new Date(2026, 0, 31), 1).getMonth()).toBe(1); // Jan 31 + 1mo → Feb 28/29
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
    // April 2026 starts on a Wednesday.
    const matrix = getMonthMatrix(new Date(2026, 3, 15), 0); // Sunday start
    expect(matrix.length).toBe(6);
    expect(matrix[0].length).toBe(7);
    // First row starts with the last Sunday of March 2026: March 29
    expect(matrix[0][0]).toEqual(new Date(2026, 2, 29));
    // Last cell is at least the last day of April 2026 or later
    expect(matrix[5][6].getTime()).toBeGreaterThanOrEqual(new Date(2026, 3, 30).getTime());
  });

  it('getMonthMatrix respects weekStartsOn=1 (Monday)', () => {
    const matrix = getMonthMatrix(new Date(2026, 3, 15), 1);
    expect(matrix[0][0].getDay()).toBe(1); // Monday
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/date-picker/dateUtils.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the utilities**

Create `packages/base-ui/src/components/date-picker/dateUtils.ts`:

```typescript
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function startOfMonth(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), 1);
  return out;
}

export function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function addYears(d: Date, n: number): Date {
  const out = new Date(d);
  out.setFullYear(out.getFullYear() + n);
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
  if (min && isBefore(d, min)) return min;
  if (max && isAfter(d, max)) return max;
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/date-picker/dateUtils.test.ts
```

Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/components/date-picker/dateUtils.ts \
        packages/base-ui/src/components/date-picker/dateUtils.test.ts
git commit -m "feat(base-ui): pure date utilities for DatePicker"
```

---

## Task 3: Intl Formatter Helpers

**Files:**
- Create: `packages/base-ui/src/components/date-picker/formatters.ts`
- Create: `packages/base-ui/src/components/date-picker/formatters.test.ts`

Wrappers around `Intl.DateTimeFormat` and `Intl.Locale`. Keeps formatting logic testable and reusable across all three pickers.

- [ ] **Step 1: Write failing tests**

Create `packages/base-ui/src/components/date-picker/formatters.test.ts`:

```typescript
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
    // en-US short is M/d/yy or similar; just verify it contains the year & month
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

  it('getWeekdayLabels returns 7 strings starting from weekStartsOn', () => {
    const labels = getWeekdayLabels('en-US', 0, 'narrow');
    expect(labels).toHaveLength(7);
    expect(labels[0]).toMatch(/^S/); // Sun in English starts with S
  });

  it('formatMonthYear uses locale', () => {
    const out = formatMonthYear(new Date(2026, 3, 1), 'en-US');
    expect(out).toMatch(/April/);
    expect(out).toMatch(/2026/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/date-picker/formatters.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `packages/base-ui/src/components/date-picker/formatters.ts`:

```typescript
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

/**
 * Return the first day of week for a given locale using Intl.Locale's
 * weekInfo (modern browsers) or fall back to Sunday for en-US, Monday
 * otherwise.
 */
export function getWeekStartsOnForLocale(locale?: string): WeekStart {
  try {
    // Intl.Locale.weekInfo (Chrome 110+, Safari 17+). firstDay: 1=Mon…7=Sun.
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/date-picker/formatters.test.ts
```

Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/components/date-picker/formatters.ts \
        packages/base-ui/src/components/date-picker/formatters.test.ts
git commit -m "feat(base-ui): Intl-based formatters for DatePicker"
```

---

## Task 4: Calendar Grid Component

**Files:**
- Create: `packages/base-ui/src/components/date-picker/Calendar.tsx`
- Create: `packages/base-ui/src/components/date-picker/Calendar.module.css`
- Create: `packages/base-ui/src/components/date-picker/Calendar.test.tsx`

Standalone calendar grid with full WAI-ARIA keyboard navigation. Exported both as a part (`DatePicker.Calendar`) and a top-level primitive.

- [ ] **Step 1: Write failing tests**

Create `packages/base-ui/src/components/date-picker/Calendar.test.tsx`:

```typescript
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
    const arg = onChange.mock.calls[0][0] as Date;
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
    // April 15, 2026 is Wednesday. With Sunday=0 start, Home → Sunday April 12.
    expect(document.activeElement?.textContent).toContain('12');
    await user.keyboard('{End}');
    // End of week → Saturday April 18.
    expect(document.activeElement?.textContent).toContain('18');
  });

  it('PageUp/PageDown navigate months', async () => {
    const user = userEvent.setup();
    render(<Calendar value={ANCHOR} onChange={() => {}} locale="en-US" autoFocus />);
    screen.getByRole('gridcell', { selected: true }).focus();
    await user.keyboard('{PageDown}');
    // Now focused on May 15, 2026
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
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(16);
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/date-picker/Calendar.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the Calendar**

Create `packages/base-ui/src/components/date-picker/Calendar.module.css`:

```css
.root {
  display: inline-flex;
  flex-direction: column;
  padding: var(--ov-space-2);
  background: var(--ov-color-bg-surface-raised);
  border-radius: var(--ov-primitive-radius-md);
  color: var(--ov-color-fg-default);
  font-family: var(--ov-primitive-font-sans);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ov-space-1);
  padding: var(--ov-space-1);
  background: var(--ov-color-datepicker-header-bg);
  border-radius: var(--ov-primitive-radius-sm);
  margin-bottom: var(--ov-space-2);
}

.monthLabel {
  font-weight: var(--ov-primitive-font-weight-medium);
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, var(--ov-size-datepicker-cell));
  gap: var(--ov-size-datepicker-gap);
}

.weekday {
  display: grid;
  place-items: center;
  height: var(--ov-size-datepicker-cell);
  color: var(--ov-color-fg-muted);
  font-size: var(--ov-primitive-font-size-11);
}

.cell {
  display: grid;
  place-items: center;
  height: var(--ov-size-datepicker-cell);
  width: var(--ov-size-datepicker-cell);
  border: none;
  border-radius: var(--ov-primitive-radius-sm);
  background: var(--ov-color-datepicker-cell-bg);
  color: var(--ov-color-datepicker-cell-fg);
  cursor: pointer;
  transition: background var(--ov-duration-interactive) var(--ov-primitive-ease-standard);
}

.cell:hover:not([aria-disabled='true']) {
  background: var(--ov-color-datepicker-cell-bg-hover);
}

.cell[aria-current='date'] {
  background: var(--ov-color-datepicker-cell-bg-today);
  color: var(--ov-color-datepicker-cell-fg-today);
}

.cell[aria-selected='true'] {
  background: var(--ov-color-datepicker-cell-bg-selected);
  color: var(--ov-color-datepicker-cell-fg-selected);
}

.cell[aria-disabled='true'] {
  color: var(--ov-color-datepicker-cell-fg-disabled);
  cursor: not-allowed;
}

.otherMonth {
  color: var(--ov-color-datepicker-cell-fg-other-month);
}

.cell:focus-visible {
  outline: 2px solid var(--ov-color-border-focus);
  outline-offset: -2px;
}
```

Create `packages/base-ui/src/components/date-picker/Calendar.tsx`:

```tsx
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import styles from './Calendar.module.css';
import {
  addDays,
  addMonths,
  addYears,
  getMonthMatrix,
  isDateInRange,
  isSameDay,
  startOfMonth,
  type WeekStart,
} from './dateUtils';
import {
  formatMonthYear,
  getWeekStartsOnForLocale,
  getWeekdayLabels,
} from './formatters';

export interface CalendarProps {
  value: Date | null;
  onChange: (value: Date) => void;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  locale?: string;
  weekStartsOn?: WeekStart;
  autoFocus?: boolean;
  className?: string;
}

function toIsoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function Calendar({
  value,
  onChange,
  min,
  max,
  isDateDisabled,
  locale,
  weekStartsOn,
  autoFocus,
  className,
}: CalendarProps) {
  const resolvedWeekStart = weekStartsOn ?? getWeekStartsOnForLocale(locale);
  const [focusedDate, setFocusedDate] = useState<Date>(() => value ?? new Date());
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(focusedDate));
  const gridRef = useRef<HTMLDivElement>(null);
  const rovingRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus) rovingRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    // Keep view month in sync with focusedDate.
    setViewMonth((prev) =>
      prev.getMonth() === focusedDate.getMonth() &&
      prev.getFullYear() === focusedDate.getFullYear()
        ? prev
        : startOfMonth(focusedDate),
    );
  }, [focusedDate]);

  const matrix = useMemo(
    () => getMonthMatrix(viewMonth, resolvedWeekStart),
    [viewMonth, resolvedWeekStart],
  );
  const weekdayLabels = useMemo(
    () => getWeekdayLabels(locale, resolvedWeekStart),
    [locale, resolvedWeekStart],
  );
  const today = useMemo(() => new Date(), []);

  const isCellDisabled = useCallback(
    (d: Date) => {
      if (!isDateInRange(d, min, max)) return true;
      if (isDateDisabled?.(d)) return true;
      return false;
    },
    [min, max, isDateDisabled],
  );

  const moveFocus = useCallback(
    (next: Date) => {
      setFocusedDate(next);
      // Defer focus to after the next render.
      queueMicrotask(() => {
        const selector = `[data-date='${toIsoDay(next)}']`;
        gridRef.current?.querySelector<HTMLButtonElement>(selector)?.focus();
      });
    },
    [],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = focusedDate;
    let next: Date | null = null;
    switch (e.key) {
      case 'ArrowRight': next = addDays(current, 1); break;
      case 'ArrowLeft':  next = addDays(current, -1); break;
      case 'ArrowDown':  next = addDays(current, 7); break;
      case 'ArrowUp':    next = addDays(current, -7); break;
      case 'Home': {
        const diff = (current.getDay() - resolvedWeekStart + 7) % 7;
        next = addDays(current, -diff);
        break;
      }
      case 'End': {
        const diff = (current.getDay() - resolvedWeekStart + 7) % 7;
        next = addDays(current, 6 - diff);
        break;
      }
      case 'PageUp':   next = e.shiftKey ? addYears(current, -1) : addMonths(current, -1); break;
      case 'PageDown': next = e.shiftKey ? addYears(current, 1)  : addMonths(current, 1); break;
      case 'Enter':
      case ' ':
        if (!isCellDisabled(current)) onChange(current);
        e.preventDefault();
        return;
      default:
        return;
    }
    if (next) {
      e.preventDefault();
      moveFocus(next);
    }
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div className={styles.header}>
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setViewMonth((v) => addMonths(v, -1))}
        >
          ‹
        </button>
        <span
          className={styles.monthLabel}
          aria-live="polite"
          role="status"
        >
          {formatMonthYear(viewMonth, locale)}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setViewMonth((v) => addMonths(v, 1))}
        >
          ›
        </button>
      </div>
      <div role="grid" ref={gridRef} onKeyDown={onKeyDown}>
        <div role="row" className={styles.grid}>
          {weekdayLabels.map((label) => (
            <div key={label} role="columnheader" className={styles.weekday}>
              {label}
            </div>
          ))}
        </div>
        {matrix.map((row, ri) => (
          <div key={ri} role="row" className={styles.grid}>
            {row.map((date) => {
              const iso = toIsoDay(date);
              const disabled = isCellDisabled(date);
              const selected = value ? isSameDay(date, value) : false;
              const isToday = isSameDay(date, today);
              const inMonth = date.getMonth() === viewMonth.getMonth();
              const focused = isSameDay(date, focusedDate);
              return (
                <button
                  ref={focused ? rovingRef : undefined}
                  key={iso}
                  type="button"
                  role="gridcell"
                  data-date={iso}
                  tabIndex={focused ? 0 : -1}
                  aria-selected={selected}
                  aria-disabled={disabled || undefined}
                  aria-current={isToday ? 'date' : undefined}
                  className={[styles.cell, !inMonth && styles.otherMonth]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => !disabled && onChange(date)}
                  onFocus={() => setFocusedDate(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/date-picker/Calendar.test.tsx
```

Expected: PASS (11 tests). If the focus-movement tests fail because focus does not move after `queueMicrotask`, switch to `flushSync` or a short `await Promise.resolve()` in the tests before asserting.

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/components/date-picker/Calendar.tsx \
        packages/base-ui/src/components/date-picker/Calendar.module.css \
        packages/base-ui/src/components/date-picker/Calendar.test.tsx
git commit -m "feat(base-ui): Calendar grid with WAI-ARIA keyboard nav"
```

---

## Task 5: DatePicker — Compound + Convenience Wrapper

**Files:**
- Create: `packages/base-ui/src/components/date-picker/DatePicker.tsx`
- Create: `packages/base-ui/src/components/date-picker/DatePicker.module.css`
- Create: `packages/base-ui/src/components/date-picker/DatePicker.test.tsx`
- Create: `packages/base-ui/src/components/date-picker/index.ts`
- Modify: `packages/base-ui/src/components/index.ts`

Compose the Calendar inside a `@base-ui/react` popover triggered by an input/button. Expose both a compound form (`DatePicker.Root`, `DatePicker.Trigger`, `DatePicker.Popup`, `DatePicker.Calendar`) and a convenience `<DatePicker value … />` form.

- [ ] **Step 1: Write failing tests**

Create `packages/base-ui/src/components/date-picker/DatePicker.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

describe('DatePicker (convenience)', () => {
  it('renders a closed trigger by default', () => {
    render(<DatePicker value={null} onChange={() => {}} placeholder="Pick a date" />);
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('opens the popover when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={() => {}} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('calls onChange and closes the popover when a day is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={onChange} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('Escape closes the popover and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={new Date(2026, 3, 12)} onChange={() => {}} />);
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('disables the trigger when disabled=true', () => {
    render(<DatePicker value={null} onChange={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('formats the value using provided Intl options', () => {
    render(
      <DatePicker
        value={new Date(2026, 3, 12)}
        onChange={() => {}}
        locale="en-US"
        format={{ year: 'numeric', month: 'long', day: 'numeric' }}
      />,
    );
    expect(screen.getByRole('button').textContent).toMatch(/April 12, 2026/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/date-picker/DatePicker.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Look up the `@base-ui/react/popover` API in the existing codebase (search for existing popover usage in `src/components/popover`) to copy the correct import paths and compound patterns. The implementation sketch:

Create `packages/base-ui/src/components/date-picker/DatePicker.module.css`:

```css
.trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--ov-space-2);
  min-height: var(--ov-size-control-md);
  padding-inline: var(--ov-space-3);
  background: var(--ov-color-bg-surface);
  color: var(--ov-color-fg-default);
  border: 1px solid var(--ov-color-border-default);
  border-radius: var(--ov-primitive-radius-sm);
  font-family: var(--ov-primitive-font-sans);
  cursor: pointer;
}

.trigger:focus-visible {
  outline: 2px solid var(--ov-color-border-focus);
  outline-offset: 2px;
}

.trigger[disabled] { cursor: not-allowed; opacity: 0.6; }

.placeholder { color: var(--ov-color-fg-muted); }

.popup {
  /* Popover positioning handled by @base-ui/react. */
  background: var(--ov-color-bg-surface-raised);
  border: 1px solid var(--ov-color-border-default);
  border-radius: var(--ov-primitive-radius-md);
  box-shadow: var(--ov-primitive-shadow-md);
}
```

Create `packages/base-ui/src/components/date-picker/DatePicker.tsx`:

```tsx
import { Popover } from '@base-ui/react/popover';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './DatePicker.module.css';
import { Calendar, type CalendarProps } from './Calendar';
import { formatDate, type DateFormat } from './formatters';
import type { WeekStart } from './dateUtils';
import type { StyledComponentProps } from '../../system/types';

export interface DatePickerProps extends StyledComponentProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date | null) => void;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  format?: DateFormat;
  locale?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  weekStartsOn?: WeekStart;
  className?: string;
}

function useControlled<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<T>(defaultValue);
  const current = isControlled ? (value as T) : internal;
  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [current, set];
}

export function DatePicker(props: DatePickerProps) {
  const {
    value,
    defaultValue = null,
    onChange,
    min,
    max,
    isDateDisabled,
    format,
    locale,
    placeholder,
    disabled,
    readOnly,
    weekStartsOn,
    className,
  } = props;

  const [current, setCurrent] = useControlled<Date | null>(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const label = useMemo(
    () => (current ? formatDate(current, format, locale) : null),
    [current, format, locale],
  );

  const handleSelect: CalendarProps['onChange'] = (next) => {
    setCurrent(next);
    setOpen(false);
    // Return focus to the trigger after a microtask so the popover can close.
    queueMicrotask(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        queueMicrotask(() => triggerRef.current?.focus());
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-readonly={readOnly || undefined}
        className={[styles.trigger, className].filter(Boolean).join(' ')}
      >
        {label ?? (
          <span className={styles.placeholder}>{placeholder ?? 'Select a date'}</span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4}>
          <Popover.Popup className={styles.popup}>
            <Calendar
              value={current}
              onChange={handleSelect}
              min={min}
              max={max}
              isDateDisabled={isDateDisabled}
              locale={locale}
              weekStartsOn={weekStartsOn}
              autoFocus
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

DatePicker.Root = Popover.Root;
DatePicker.Trigger = Popover.Trigger;
DatePicker.Popup = Popover.Popup;
DatePicker.Calendar = Calendar;
```

**Note on @base-ui/react import**: the exact import path (`@base-ui/react/popover`) and Popover compound structure must match how the existing `src/components/popover` wrapper uses it. Read that file first and adapt. The general shape is correct; specific import names (`Portal`, `Positioner`, etc.) may differ.

Create `packages/base-ui/src/components/date-picker/index.ts`:

```typescript
export { DatePicker } from './DatePicker';
export type { DatePickerProps } from './DatePicker';
export { Calendar } from './Calendar';
export type { CalendarProps } from './Calendar';
```

Edit `packages/base-ui/src/components/index.ts` to add:

```typescript
export * from './date-picker';
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/date-picker/DatePicker.test.tsx
```

Expected: PASS (6 tests). If any test fails due to a specific `@base-ui/react/popover` API mismatch, look at `src/components/popover/Popover.tsx` (or the equivalent) for the correct compound shape and adapt.

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/components/date-picker/ \
        packages/base-ui/src/components/index.ts
git commit -m "feat(base-ui): DatePicker component with compound API"
```

---

## Task 6: TimePicker

**Files:**
- Create: `packages/base-ui/src/components/time-picker/TimePicker.tsx`
- Create: `packages/base-ui/src/components/time-picker/TimePicker.module.css`
- Create: `packages/base-ui/src/components/time-picker/TimePicker.test.tsx`
- Create: `packages/base-ui/src/components/time-picker/index.ts`
- Modify: `packages/base-ui/src/components/index.ts`

Three number fields (hour, minute, seconds) plus an AM/PM toggle when `hourCycle=12`. No popover — it's an inline control composed of spinners.

- [ ] **Step 1: Write failing tests**

Create `packages/base-ui/src/components/time-picker/TimePicker.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimePicker } from './TimePicker';

describe('TimePicker', () => {
  it('renders hour and minute inputs; no seconds by default', () => {
    render(<TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />);
    expect(screen.getByLabelText(/hour/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minute/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/second/i)).not.toBeInTheDocument();
  });

  it('shows seconds when showSeconds=true', () => {
    render(<TimePicker value={new Date()} onChange={() => {}} showSeconds />);
    expect(screen.getByLabelText(/second/i)).toBeInTheDocument();
  });

  it('calls onChange when the hour is edited (24-hour)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={onChange} hourCycle={24} />,
    );
    const hour = screen.getByLabelText(/hour/i) as HTMLInputElement;
    await user.clear(hour);
    await user.type(hour, '14');
    await user.tab();
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getHours()).toBe(14);
    expect(last.getMinutes()).toBe(30);
  });

  it('shows AM/PM toggle when hourCycle=12', () => {
    render(
      <TimePicker value={new Date(2026, 3, 12, 14, 0)} onChange={() => {}} hourCycle={12} />,
    );
    expect(screen.getByRole('button', { name: /pm/i })).toBeInTheDocument();
  });

  it('toggling PM→AM subtracts 12 from a 14:00 value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker value={new Date(2026, 3, 12, 14, 0)} onChange={onChange} hourCycle={12} />,
    );
    await user.click(screen.getByRole('button', { name: /pm/i }));
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getHours()).toBe(2);
  });

  it('minuteStep=5 clamps a typed 37 to 35', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 0)} onChange={onChange} minuteStep={5} />,
    );
    const minute = screen.getByLabelText(/minute/i) as HTMLInputElement;
    await user.clear(minute);
    await user.type(minute, '37');
    await user.tab();
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getMinutes()).toBe(35);
  });

  it('ignores edits when readOnly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={onChange} readOnly />,
    );
    const hour = screen.getByLabelText(/hour/i) as HTMLInputElement;
    await user.type(hour, '14');
    await user.tab();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables all inputs when disabled', () => {
    render(
      <TimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} disabled />,
    );
    expect(screen.getByLabelText(/hour/i)).toBeDisabled();
    expect(screen.getByLabelText(/minute/i)).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/time-picker/TimePicker.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `packages/base-ui/src/components/time-picker/TimePicker.module.css`:

```css
.root {
  display: inline-flex;
  align-items: center;
  gap: var(--ov-space-1);
  font-family: var(--ov-primitive-font-mono);
  color: var(--ov-color-fg-default);
}

.field {
  width: 2.5ch;
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  text-align: center;
}

.field:focus-visible {
  outline: 2px solid var(--ov-color-border-focus);
  outline-offset: 2px;
  border-radius: 2px;
}

.separator { color: var(--ov-color-fg-muted); }

.meridiem {
  min-width: 3ch;
  background: var(--ov-color-bg-surface-raised);
  border: 1px solid var(--ov-color-border-default);
  border-radius: var(--ov-primitive-radius-sm);
  color: var(--ov-color-fg-default);
  cursor: pointer;
  padding-inline: var(--ov-space-2);
}

.root[data-disabled] { opacity: 0.6; }
```

Create `packages/base-ui/src/components/time-picker/TimePicker.tsx`:

```tsx
import { useCallback, useId } from 'react';
import styles from './TimePicker.module.css';
import type { StyledComponentProps } from '../../system/types';

export interface TimePickerProps extends StyledComponentProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date) => void;
  showSeconds?: boolean;
  hourCycle?: 12 | 24;
  minuteStep?: number;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  'aria-label'?: string;
}

function clampToStep(value: number, step: number, max: number): number {
  if (step <= 1) return Math.max(0, Math.min(max, value));
  const snapped = Math.floor(value / step) * step;
  return Math.max(0, Math.min(max, snapped));
}

export function TimePicker(props: TimePickerProps) {
  const {
    value,
    onChange,
    showSeconds = false,
    hourCycle = 24,
    minuteStep = 1,
    disabled = false,
    readOnly = false,
    className,
  } = props;

  const current = value ?? new Date();
  const id = useId();

  const emit = useCallback(
    (hours: number, minutes: number, seconds: number) => {
      const next = new Date(current);
      next.setHours(hours, minutes, seconds, 0);
      onChange?.(next);
    },
    [current, onChange],
  );

  const h24 = current.getHours();
  const isPM = h24 >= 12;
  const displayedHour = hourCycle === 12 ? ((h24 + 11) % 12) + 1 : h24;

  const onHourChange = (text: string) => {
    if (readOnly) return;
    const parsed = Number.parseInt(text, 10);
    if (Number.isNaN(parsed)) return;
    let hours: number;
    if (hourCycle === 12) {
      const clamped = Math.max(1, Math.min(12, parsed));
      hours = (clamped % 12) + (isPM ? 12 : 0);
    } else {
      hours = Math.max(0, Math.min(23, parsed));
    }
    emit(hours, current.getMinutes(), current.getSeconds());
  };

  const onMinuteChange = (text: string) => {
    if (readOnly) return;
    const parsed = Number.parseInt(text, 10);
    if (Number.isNaN(parsed)) return;
    emit(current.getHours(), clampToStep(parsed, minuteStep, 59), current.getSeconds());
  };

  const onSecondChange = (text: string) => {
    if (readOnly) return;
    const parsed = Number.parseInt(text, 10);
    if (Number.isNaN(parsed)) return;
    emit(current.getHours(), current.getMinutes(), Math.max(0, Math.min(59, parsed)));
  };

  const toggleMeridiem = () => {
    if (readOnly) return;
    const next = isPM ? h24 - 12 : h24 + 12;
    emit(next, current.getMinutes(), current.getSeconds());
  };

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-disabled={disabled || undefined}
    >
      <input
        id={`${id}-h`}
        aria-label="Hour"
        className={styles.field}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        readOnly={readOnly}
        value={String(displayedHour).padStart(2, '0')}
        onChange={(e) => onHourChange(e.target.value)}
      />
      <span className={styles.separator}>:</span>
      <input
        id={`${id}-m`}
        aria-label="Minute"
        className={styles.field}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        readOnly={readOnly}
        value={String(current.getMinutes()).padStart(2, '0')}
        onChange={(e) => onMinuteChange(e.target.value)}
      />
      {showSeconds && (
        <>
          <span className={styles.separator}>:</span>
          <input
            id={`${id}-s`}
            aria-label="Second"
            className={styles.field}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            readOnly={readOnly}
            value={String(current.getSeconds()).padStart(2, '0')}
            onChange={(e) => onSecondChange(e.target.value)}
          />
        </>
      )}
      {hourCycle === 12 && (
        <button
          type="button"
          className={styles.meridiem}
          disabled={disabled}
          onClick={toggleMeridiem}
          aria-pressed={isPM}
        >
          {isPM ? 'PM' : 'AM'}
        </button>
      )}
    </div>
  );
}
```

Create `packages/base-ui/src/components/time-picker/index.ts`:

```typescript
export { TimePicker } from './TimePicker';
export type { TimePickerProps } from './TimePicker';
```

Add to `packages/base-ui/src/components/index.ts`:

```typescript
export * from './time-picker';
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/time-picker/TimePicker.test.tsx
```

Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/components/time-picker/ \
        packages/base-ui/src/components/index.ts
git commit -m "feat(base-ui): TimePicker with 12/24 hour support and minute step"
```

---

## Task 7: DateTimePicker

**Files:**
- Create: `packages/base-ui/src/components/date-time-picker/DateTimePicker.tsx`
- Create: `packages/base-ui/src/components/date-time-picker/DateTimePicker.module.css`
- Create: `packages/base-ui/src/components/date-time-picker/DateTimePicker.test.tsx`
- Create: `packages/base-ui/src/components/date-time-picker/index.ts`
- Modify: `packages/base-ui/src/components/index.ts`

Composition of `DatePicker` + `TimePicker`: the popover hosts both, with the Calendar on top and the TimePicker beneath.

- [ ] **Step 1: Write failing test**

Create `packages/base-ui/src/components/date-time-picker/DateTimePicker.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTimePicker } from './DateTimePicker';

describe('DateTimePicker', () => {
  it('opens popover and renders both Calendar and TimePicker', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker value={new Date(2026, 3, 12, 9, 30)} onChange={() => {}} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByLabelText(/hour/i)).toBeInTheDocument();
  });

  it('selecting a day preserves the current time-of-day', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value={new Date(2026, 3, 12, 9, 30)}
        onChange={onChange}
        hourCycle={24}
      />,
    );
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('gridcell', { name: /^20/ }));
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getDate()).toBe(20);
    expect(last.getHours()).toBe(9);
    expect(last.getMinutes()).toBe(30);
  });

  it('changing the hour preserves the current date', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value={new Date(2026, 3, 12, 9, 30)}
        onChange={onChange}
        hourCycle={24}
      />,
    );
    await user.click(screen.getByRole('button'));
    const hour = screen.getByLabelText(/hour/i) as HTMLInputElement;
    await user.clear(hour);
    await user.type(hour, '15');
    await user.tab();
    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getDate()).toBe(12);
    expect(last.getHours()).toBe(15);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/date-time-picker/DateTimePicker.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `packages/base-ui/src/components/date-time-picker/DateTimePicker.module.css`:

```css
.combo {
  display: flex;
  flex-direction: column;
  gap: var(--ov-space-2);
  padding: var(--ov-space-2);
}

.timeRow {
  display: flex;
  justify-content: center;
  padding: var(--ov-space-1);
  border-top: 1px solid var(--ov-color-border-muted);
}
```

Create `packages/base-ui/src/components/date-time-picker/DateTimePicker.tsx`:

```tsx
import { Popover } from '@base-ui/react/popover';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Calendar } from '../date-picker/Calendar';
import { formatDate, type DateFormat } from '../date-picker/formatters';
import type { WeekStart } from '../date-picker/dateUtils';
import { TimePicker } from '../time-picker/TimePicker';
import pickerStyles from '../date-picker/DatePicker.module.css';
import styles from './DateTimePicker.module.css';
import type { StyledComponentProps } from '../../system/types';

export interface DateTimePickerProps extends StyledComponentProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date | null) => void;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  format?: DateFormat;
  locale?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  weekStartsOn?: WeekStart;
  showSeconds?: boolean;
  hourCycle?: 12 | 24;
  minuteStep?: number;
  className?: string;
}

export function DateTimePicker(props: DateTimePickerProps) {
  const {
    value,
    defaultValue = null,
    onChange,
    min,
    max,
    isDateDisabled,
    format,
    locale,
    placeholder,
    disabled,
    readOnly,
    weekStartsOn,
    showSeconds,
    hourCycle,
    minuteStep,
    className,
  } = props;

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<Date | null>(defaultValue);
  const current = isControlled ? (value as Date | null) : internal;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const emit = useCallback(
    (next: Date | null) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const onDateChange = (d: Date) => {
    const base = current ?? new Date();
    const next = new Date(d);
    next.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), 0);
    emit(next);
  };

  const onTimeChange = (t: Date) => {
    const base = current ?? new Date();
    const next = new Date(base);
    next.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), 0);
    emit(next);
  };

  const label = useMemo(
    () =>
      current
        ? formatDate(current, format ?? { dateStyle: 'short', timeStyle: 'short' }, locale)
        : null,
    [current, format, locale],
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-readonly={readOnly || undefined}
        className={[pickerStyles.trigger, className].filter(Boolean).join(' ')}
      >
        {label ?? (
          <span className={pickerStyles.placeholder}>
            {placeholder ?? 'Select date and time'}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4}>
          <Popover.Popup className={pickerStyles.popup}>
            <div className={styles.combo}>
              <Calendar
                value={current}
                onChange={onDateChange}
                min={min}
                max={max}
                isDateDisabled={isDateDisabled}
                locale={locale}
                weekStartsOn={weekStartsOn}
                autoFocus
              />
              <div className={styles.timeRow}>
                <TimePicker
                  value={current ?? new Date()}
                  onChange={onTimeChange}
                  showSeconds={showSeconds}
                  hourCycle={hourCycle}
                  minuteStep={minuteStep}
                  disabled={disabled}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

Create `packages/base-ui/src/components/date-time-picker/index.ts`:

```typescript
export { DateTimePicker } from './DateTimePicker';
export type { DateTimePickerProps } from './DateTimePicker';
```

Add to `packages/base-ui/src/components/index.ts`:

```typescript
export * from './date-time-picker';
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/components/date-time-picker/DateTimePicker.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/components/date-time-picker/ \
        packages/base-ui/src/components/index.ts
git commit -m "feat(base-ui): DateTimePicker composing DatePicker and TimePicker"
```

---

## Task 8: Storybook Stories

**Files:**
- Create: `packages/base-ui/src/components/date-picker/DatePicker.stories.tsx`
- Create: `packages/base-ui/src/components/time-picker/TimePicker.stories.tsx`
- Create: `packages/base-ui/src/components/date-time-picker/DateTimePicker.stories.tsx`

Stories cover each variant so reviewers can see the behavior under every theme.

- [ ] **Step 1: Create DatePicker stories**

Create `packages/base-ui/src/components/date-picker/DatePicker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = { title: 'Components/DatePicker', component: DatePicker };
export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  render: () => {
    const [v, setV] = useState<Date | null>(null);
    return <DatePicker value={v} onChange={setV} placeholder="Pick a date" />;
  },
};

export const Controlled: Story = {
  render: () => {
    const [v, setV] = useState<Date | null>(new Date());
    return <DatePicker value={v} onChange={setV} />;
  },
};

export const WithMinMax: Story = {
  render: () => {
    const [v, setV] = useState<Date | null>(null);
    const today = new Date();
    const min = new Date(today);
    min.setDate(today.getDate() - 7);
    const max = new Date(today);
    max.setDate(today.getDate() + 7);
    return <DatePicker value={v} onChange={setV} min={min} max={max} />;
  },
};

export const LongFormat: Story = {
  render: () => {
    const [v, setV] = useState<Date | null>(new Date());
    return (
      <DatePicker
        value={v}
        onChange={setV}
        format={{ weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => <DatePicker value={new Date()} onChange={() => {}} disabled />,
};
```

- [ ] **Step 2: Create TimePicker stories**

Create `packages/base-ui/src/components/time-picker/TimePicker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TimePicker } from './TimePicker';

const meta: Meta<typeof TimePicker> = { title: 'Components/TimePicker', component: TimePicker };
export default meta;

type Story = StoryObj<typeof TimePicker>;

export const TwentyFourHour: Story = {
  render: () => {
    const [v, setV] = useState<Date>(new Date());
    return <TimePicker value={v} onChange={setV} hourCycle={24} />;
  },
};

export const TwelveHour: Story = {
  render: () => {
    const [v, setV] = useState<Date>(new Date());
    return <TimePicker value={v} onChange={setV} hourCycle={12} />;
  },
};

export const WithSeconds: Story = {
  render: () => {
    const [v, setV] = useState<Date>(new Date());
    return <TimePicker value={v} onChange={setV} showSeconds />;
  },
};

export const MinuteStep15: Story = {
  render: () => {
    const [v, setV] = useState<Date>(new Date());
    return <TimePicker value={v} onChange={setV} minuteStep={15} />;
  },
};

export const Disabled: Story = {
  render: () => <TimePicker value={new Date()} onChange={() => {}} disabled />,
};
```

- [ ] **Step 3: Create DateTimePicker stories**

Create `packages/base-ui/src/components/date-time-picker/DateTimePicker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DateTimePicker } from './DateTimePicker';

const meta: Meta<typeof DateTimePicker> = {
  title: 'Components/DateTimePicker',
  component: DateTimePicker,
};
export default meta;

type Story = StoryObj<typeof DateTimePicker>;

export const Default: Story = {
  render: () => {
    const [v, setV] = useState<Date | null>(null);
    return <DateTimePicker value={v} onChange={setV} />;
  },
};

export const WithSeconds: Story = {
  render: () => {
    const [v, setV] = useState<Date | null>(new Date());
    return <DateTimePicker value={v} onChange={setV} showSeconds />;
  },
};

export const TwelveHour: Story = {
  render: () => {
    const [v, setV] = useState<Date | null>(new Date());
    return <DateTimePicker value={v} onChange={setV} hourCycle={12} />;
  },
};
```

- [ ] **Step 4: Verify Storybook picks them up**

```bash
pnpm --filter @omniviewdev/base-ui storybook
```

Navigate to each new story. Exercise theme toggle to confirm colors adjust under each of the 7 built-ins. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/components/date-picker/DatePicker.stories.tsx \
        packages/base-ui/src/components/time-picker/TimePicker.stories.tsx \
        packages/base-ui/src/components/date-time-picker/DateTimePicker.stories.tsx
git commit -m "docs(base-ui): Storybook stories for date/time pickers"
```

---

## Task 9: COMPONENT_STATUS & Final Verification

**Files:**
- Modify: `packages/base-ui/docs/COMPONENT_STATUS.md`

- [ ] **Step 1: Update COMPONENT_STATUS.md**

Add entries under the components list (follow the existing structure — the exact format/emoji is already established in the file):

```markdown
- ✅ `DatePicker` — calendar popover with full keyboard nav and min/max/custom disabled cells
- ✅ `TimePicker` — 12/24 hour with optional seconds and minute step
- ✅ `DateTimePicker` — composition of DatePicker + TimePicker
```

- [ ] **Step 2: Run the full package checks**

```bash
pnpm --filter @omniviewdev/base-ui test
pnpm --filter @omniviewdev/base-ui build
```

Expected: all green; the built `dist/` contains exports for `DatePicker`, `TimePicker`, `DateTimePicker`.

- [ ] **Step 3: Verify public exports**

```bash
grep -E "DatePicker|TimePicker|DateTimePicker" packages/base-ui/dist/index.d.ts | head -20
```

Expected: named exports are visible.

- [ ] **Step 4: Commit**

```bash
git add packages/base-ui/docs/COMPONENT_STATUS.md
git commit -m "docs(base-ui): note date/time pickers in component status"
```

- [ ] **Step 5: Push branch**

```bash
git push -u origin feat/date-time-pickers
```

---

## Self-Review Checklist (run before submitting PR)

- [ ] All 9 tasks committed; `git status` clean
- [ ] `pnpm --filter @omniviewdev/base-ui test` — all picker tests pass
- [ ] `pnpm --filter @omniviewdev/base-ui build` — clean build
- [ ] Storybook: all three components render correctly under every built-in theme, density changes alter cell size, motion=reduced disables hover transitions
- [ ] Keyboard nav manual check on DatePicker: arrows, Home/End, PageUp/Down, Shift+PageUp/Down, Enter, Escape all behave per spec
- [ ] TimePicker: hour cycling at boundaries (23→0, 00→23 in 24h; 12→1, AM/PM boundaries in 12h)
- [ ] DateTimePicker: selecting a day preserves the time; changing time preserves the date
