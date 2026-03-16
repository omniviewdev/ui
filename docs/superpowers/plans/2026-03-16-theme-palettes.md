# Theme Palettes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three new dark theme presets (Obsidian, Carbon, Void) to the base-ui theme system and expose them in the showcase app's theme picker.

**Architecture:** Each theme is a CSS custom property override block in `styles.css` keyed by `data-ov-theme` attribute. The `ThemeMode` type and `ThemeProvider` are extended to recognize the new values. The showcase dock's simple toggle is replaced with a Menu-based theme picker.

**Tech Stack:** CSS custom properties, TypeScript, React, `@omniview/base-ui` Menu component

**Spec:** `docs/superpowers/specs/2026-03-16-theme-palettes-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `packages/base-ui/src/theme/types.ts` | Modify | Add new theme IDs to `ThemeMode` union |
| `packages/base-ui/src/theme/ThemeProvider.tsx` | Modify | Update `isThemeMode` guard and `color-scheme` mapping |
| `packages/base-ui/src/theme/styles.css` | Modify | Add 3 new `data-ov-theme` CSS blocks after line 815 |
| `apps/showcase/src/Dock.tsx` | Modify | Replace light/dark toggle with Menu-based theme picker |

---

## Chunk 1: Base-UI Theme System

### Task 1: Extend ThemeMode type

**Files:**
- Modify: `packages/base-ui/src/theme/types.ts:1`

- [ ] **Step 1: Update ThemeMode union**

Replace line 1:

```ts
export type ThemeMode = 'dark' | 'light' | 'high-contrast-dark' | 'high-contrast-light';
```

With:

```ts
export type ThemeMode =
  | 'dark'
  | 'light'
  | 'high-contrast-dark'
  | 'high-contrast-light'
  | 'obsidian'
  | 'carbon'
  | 'void';
```

- [ ] **Step 2: Commit**

```bash
git add packages/base-ui/src/theme/types.ts
git commit -m "feat(theme): extend ThemeMode with obsidian, carbon, void"
```

---

### Task 2: Update ThemeProvider

**Files:**
- Modify: `packages/base-ui/src/theme/ThemeProvider.tsx:33-37,71-72`

- [ ] **Step 1: Update isThemeMode guard**

Replace lines 33-37:

```ts
const isThemeMode = (value: string): value is ThemeMode =>
  value === 'dark' ||
  value === 'light' ||
  value === 'high-contrast-dark' ||
  value === 'high-contrast-light';
```

With:

```ts
const isThemeMode = (value: string): value is ThemeMode =>
  value === 'dark' ||
  value === 'light' ||
  value === 'high-contrast-dark' ||
  value === 'high-contrast-light' ||
  value === 'obsidian' ||
  value === 'carbon' ||
  value === 'void';
```

- [ ] **Step 2: Update color-scheme mapping**

Replace lines 71-72:

```ts
      root.style.colorScheme =
        theme === 'light' || theme === 'high-contrast-light' ? 'light' : 'dark';
```

No change needed — the existing logic already maps anything that isn't `'light'` or `'high-contrast-light'` to `'dark'`, so `'obsidian'`, `'carbon'`, and `'void'` will correctly get `colorScheme = 'dark'`. Skip this step.

- [ ] **Step 3: Commit**

```bash
git add packages/base-ui/src/theme/ThemeProvider.tsx
git commit -m "feat(theme): update isThemeMode guard for new dark themes"
```

---

### Task 3: Add Obsidian theme tokens

**Files:**
- Modify: `packages/base-ui/src/theme/styles.css` — insert after line 815 (end of `high-contrast-light` block)

- [ ] **Step 1: Add Obsidian CSS block**

Insert after line 815 (`}` closing high-contrast-light):

```css

/* ---------------------------------------------------------------------------
 * Obsidian — near-black neutral, punchy cobalt accent
 * --------------------------------------------------------------------------- */

:root[data-ov-theme='obsidian'] {
  --ov-color-bg-base: #12141a;
  --ov-color-bg-surface: #16181c;
  --ov-color-bg-surface-raised: #1c1f25;
  --ov-color-bg-surface-overlay: #1c1f25;
  --ov-color-bg-inset: #0e1015;
  --ov-color-bg-elevated: #252830;

  --ov-color-fg-default: #e8eaed;
  --ov-color-fg-muted: #8b8f9a;
  --ov-color-fg-subtle: #6b7385;
  --ov-color-fg-disabled: #4e5566;
  --ov-color-fg-inverse: #0e1015;

  --ov-color-border-default: #232730;
  --ov-color-border-muted: #1e2128;
  --ov-color-border-strong: #2e3340;
  --ov-color-border-focus: #4d7cff;

  --ov-color-brand-500: #4d7cff;
  --ov-color-brand-400: #6391ff;
  --ov-color-brand-300: #82a8ff;

  --ov-color-accent-soft: rgb(77 124 255 / 0.14);
  --ov-color-accent-strong: #82a8ff;

  --ov-color-success: #34a56f;
  --ov-color-success-soft: rgb(52 165 111 / 0.15);
  --ov-color-warning: #d4942e;
  --ov-color-warning-soft: rgb(212 148 46 / 0.15);
  --ov-color-danger: #d45555;
  --ov-color-danger-soft: rgb(212 85 85 / 0.15);
  --ov-color-info: var(--ov-color-brand-400);
  --ov-color-info-soft: rgb(99 145 255 / 0.15);

  --ov-color-state-hover: rgb(160 170 185 / 0.09);
  --ov-color-state-pressed: rgb(160 170 185 / 0.16);
  --ov-color-state-selected: rgb(77 124 255 / 0.18);
  --ov-color-state-focus-ring: #4d7cff;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/base-ui/src/theme/styles.css
git commit -m "feat(theme): add Obsidian dark theme palette"
```

---

### Task 4: Add Carbon theme tokens

**Files:**
- Modify: `packages/base-ui/src/theme/styles.css` — insert after the Obsidian block

- [ ] **Step 1: Add Carbon CSS block**

```css

/* ---------------------------------------------------------------------------
 * Carbon — pure achromatic grays, maximum content clarity
 * --------------------------------------------------------------------------- */

:root[data-ov-theme='carbon'] {
  --ov-color-bg-base: #0f0f0f;
  --ov-color-bg-surface: #161616;
  --ov-color-bg-surface-raised: #1e1e1e;
  --ov-color-bg-surface-overlay: #1e1e1e;
  --ov-color-bg-inset: #0a0a0a;
  --ov-color-bg-elevated: #282828;

  --ov-color-fg-default: #e5e5e5;
  --ov-color-fg-muted: #8c8c8c;
  --ov-color-fg-subtle: #737373;
  --ov-color-fg-disabled: #555555;
  --ov-color-fg-inverse: #0a0a0a;

  --ov-color-border-default: #2a2a2a;
  --ov-color-border-muted: #222222;
  --ov-color-border-strong: #363636;
  --ov-color-border-focus: #4b8cff;

  --ov-color-brand-500: #4b8cff;
  --ov-color-brand-400: #69a0ff;
  --ov-color-brand-300: #8db5ff;

  --ov-color-accent-soft: rgb(75 140 255 / 0.14);
  --ov-color-accent-strong: #8db5ff;

  --ov-color-success: #34a56f;
  --ov-color-success-soft: rgb(52 165 111 / 0.15);
  --ov-color-warning: #d4942e;
  --ov-color-warning-soft: rgb(212 148 46 / 0.15);
  --ov-color-danger: #d45555;
  --ov-color-danger-soft: rgb(212 85 85 / 0.15);
  --ov-color-info: var(--ov-color-brand-400);
  --ov-color-info-soft: rgb(105 160 255 / 0.15);

  --ov-color-state-hover: rgb(160 160 160 / 0.09);
  --ov-color-state-pressed: rgb(160 160 160 / 0.16);
  --ov-color-state-selected: rgb(75 140 255 / 0.18);
  --ov-color-state-focus-ring: #4b8cff;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/base-ui/src/theme/styles.css
git commit -m "feat(theme): add Carbon dark theme palette"
```

---

### Task 5: Add Void theme tokens

**Files:**
- Modify: `packages/base-ui/src/theme/styles.css` — insert after the Carbon block

- [ ] **Step 1: Add Void CSS block**

```css

/* ---------------------------------------------------------------------------
 * Void — ultra-deep warm-neutral grays, luxury feel
 * --------------------------------------------------------------------------- */

:root[data-ov-theme='void'] {
  --ov-color-bg-base: #0e0f11;
  --ov-color-bg-surface: #141517;
  --ov-color-bg-surface-raised: #1a1b1e;
  --ov-color-bg-surface-overlay: #1a1b1e;
  --ov-color-bg-inset: #09090b;
  --ov-color-bg-elevated: #232528;

  --ov-color-fg-default: #e6e7ea;
  --ov-color-fg-muted: #898c94;
  --ov-color-fg-subtle: #6e7179;
  --ov-color-fg-disabled: #505359;
  --ov-color-fg-inverse: #09090b;

  --ov-color-border-default: #232528;
  --ov-color-border-muted: #1e1f22;
  --ov-color-border-strong: #2e3033;
  --ov-color-border-focus: #508aff;

  --ov-color-brand-500: #508aff;
  --ov-color-brand-400: #6b9bff;
  --ov-color-brand-300: #8aafff;

  --ov-color-accent-soft: rgb(80 138 255 / 0.12);
  --ov-color-accent-strong: #8aafff;

  --ov-color-success: #34a56f;
  --ov-color-success-soft: rgb(52 165 111 / 0.13);
  --ov-color-warning: #d4942e;
  --ov-color-warning-soft: rgb(212 148 46 / 0.13);
  --ov-color-danger: #d45555;
  --ov-color-danger-soft: rgb(212 85 85 / 0.13);
  --ov-color-info: var(--ov-color-brand-400);
  --ov-color-info-soft: rgb(107 155 255 / 0.13);

  --ov-color-state-hover: rgb(160 165 175 / 0.08);
  --ov-color-state-pressed: rgb(160 165 175 / 0.14);
  --ov-color-state-selected: rgb(80 138 255 / 0.15);
  --ov-color-state-focus-ring: #508aff;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/base-ui/src/theme/styles.css
git commit -m "feat(theme): add Void dark theme palette"
```

---

## Chunk 2: Showcase Theme Picker

### Task 6: Replace dock toggle with theme picker

**Files:**
- Modify: `apps/showcase/src/Dock.tsx`

The current dock has a simple sun/moon toggle button (lines 95-117). Replace it with a Menu-based picker that shows all available themes grouped by category.

- [ ] **Step 1: Update imports**

Replace line 2-3:

```ts
import { IconButton, Tooltip, Separator, useTheme } from '@omniview/base-ui';
import { LuLayoutGrid, LuSun, LuMoon } from 'react-icons/lu';
```

With:

```ts
import { IconButton, Tooltip, Separator, Menu, useTheme } from '@omniview/base-ui';
import type { ThemeMode } from '@omniview/base-ui';
import { LuLayoutGrid, LuPalette } from 'react-icons/lu';
```

- [ ] **Step 2: Add theme options array**

Insert before the `DockProps` interface (before line 7):

```ts
const THEME_OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: 'void', label: 'Void' },
  { id: 'obsidian', label: 'Obsidian' },
  { id: 'carbon', label: 'Carbon' },
  { id: 'dark', label: 'Dark (Classic)' },
  { id: 'light', label: 'Light' },
  { id: 'high-contrast-dark', label: 'High Contrast Dark' },
  { id: 'high-contrast-light', label: 'High Contrast Light' },
];
```

- [ ] **Step 3: Remove isDark variable**

Remove line 14:

```ts
  const isDark = theme === 'dark' || theme === 'high-contrast-dark';
```

- [ ] **Step 4: Replace the theme toggle section**

Replace lines 95-117 (the entire `<div className={styles.bottom}>` block) with:

```tsx
      <div className={styles.bottom}>
        <Separator />
        <Menu.Root>
          <Menu.Trigger
            render={({ color: _, ...props }) => (
              <IconButton
                {...props}
                variant="ghost"
                color="neutral"
                size="md"
                aria-label="Switch theme"
              >
                <LuPalette />
              </IconButton>
            )}
          />
          <Menu.Portal>
            <Menu.Positioner side="right" sideOffset={8} align="end">
              <Menu.Popup>
                <Menu.RadioGroup
                  value={theme}
                  onValueChange={(value) => setTheme(value as ThemeMode)}
                >
                  {THEME_OPTIONS.map((opt) => (
                    <Menu.RadioItem key={opt.id} value={opt.id}>
                      {opt.label}
                      <Menu.RadioItemIndicator />
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioGroup>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
```

- [ ] **Step 5: Commit**

```bash
git add apps/showcase/src/Dock.tsx
git commit -m "feat(showcase): replace theme toggle with theme picker menu"
```

---

### Task 7: Build and verify

- [ ] **Step 1: Rebuild base-ui**

```bash
pnpm --filter @omniview/base-ui build
```

Expected: Successful build with no errors.

- [ ] **Step 2: Type-check showcase**

```bash
cd apps/showcase && npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Verify in browser**

Open the showcase app. Click the palette icon in the dock bottom. The menu should show all 7 themes. Select each of the new themes (Void, Obsidian, Carbon) and verify:
- Backgrounds are visibly deeper/darker than the classic "Dark" theme
- Text contrast is crisp (primary text near white)
- Accent blue is vibrant
- Borders are visible but subtle
- Selection highlights work correctly
- Theme persists across page reload (localStorage)

- [ ] **Step 4: Commit any fixes**

If visual tuning is needed after browser verification, adjust token values and re-commit.
