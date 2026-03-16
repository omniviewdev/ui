# New Dark Theme Palettes — Design Spec

**Goal:** Add three new dark theme presets (Obsidian, Carbon, Void) with deeper backgrounds, crisper text contrast, and punchy blue accents inspired by new JetBrains UI, LM Studio, and macOS native dark mode. Expose all themes in the showcase app via an upgraded theme picker.

**Architecture:** Each theme is a CSS custom property override block keyed by `data-ov-theme` attribute on `:root`, following the same pattern as the existing 4 presets. The `ThemeMode` type is extended, and the showcase dock gets a theme picker replacing the simple light/dark toggle.

---

## Themes

| ID | Name | Character |
|----|------|-----------|
| `obsidian` | Obsidian | Near-black neutral bases, punchy cobalt accent. JetBrains/LM Studio energy. |
| `carbon` | Carbon | Pure achromatic grays. No color tint — content is the only color. VS Code One Dark Pro vibes. |
| `void` | Void | Ultra-deep warm-neutral grays. Luxury/high-end feel. User's preferred default. |

All three share the same token structure and override the same semantic tokens as existing themes.

---

## Color Specifications

### Background Stack

| Token | Obsidian | Carbon | Void |
|-------|----------|--------|------|
| `bg-inset` | `#0e1015` | `#0a0a0a` | `#09090b` |
| `bg-base` | `#12141a` | `#0f0f0f` | `#0e0f11` |
| `bg-surface` | `#16181c` | `#161616` | `#141517` |
| `bg-surface-raised` | `#1c1f25` | `#1e1e1e` | `#1a1b1e` |
| `bg-surface-overlay` | `#1c1f25` | `#1e1e1e` | `#1a1b1e` |
| `bg-elevated` | `#252830` | `#282828` | `#232528` |

### Foreground / Text

| Token | Obsidian | Carbon | Void |
|-------|----------|--------|------|
| `fg-default` | `#e8eaed` | `#e5e5e5` | `#e6e7ea` |
| `fg-muted` | `#8b8f9a` | `#8c8c8c` | `#898c94` |
| `fg-subtle` | `#6b7385` | `#737373` | `#6e7179` |
| `fg-disabled` | `#4e5566` | `#555555` | `#505359` |
| `fg-inverse` | `#0e1015` | `#0a0a0a` | `#09090b` |

### Borders

| Token | Obsidian | Carbon | Void |
|-------|----------|--------|------|
| `border-muted` | `#1e2128` | `#222222` | `#1e1f22` |
| `border-default` | `#232730` | `#2a2a2a` | `#232528` |
| `border-strong` | `#2e3340` | `#363636` | `#2e3033` |
| `border-focus` | `#4d7cff` | `#4b8cff` | `#508aff` |

### Brand / Accent

| Token | Obsidian | Carbon | Void |
|-------|----------|--------|------|
| `brand-500` | `#4d7cff` | `#4b8cff` | `#508aff` |
| `brand-400` | `#6391ff` | `#69a0ff` | `#6b9bff` |
| `brand-300` | `#82a8ff` | `#8db5ff` | `#8aafff` |
| `accent-soft` | `rgb(77 124 255 / 0.14)` | `rgb(75 140 255 / 0.14)` | `rgb(80 138 255 / 0.12)` |
| `accent-strong` | `#82a8ff` | `#8db5ff` | `#8aafff` |

### State & Status

| Token | Obsidian | Carbon | Void |
|-------|----------|--------|------|
| `success` | `#34a56f` | `#34a56f` | `#34a56f` |
| `success-soft` | `rgb(52 165 111 / 0.15)` | `rgb(52 165 111 / 0.15)` | `rgb(52 165 111 / 0.13)` |
| `warning` | `#d4942e` | `#d4942e` | `#d4942e` |
| `warning-soft` | `rgb(212 148 46 / 0.15)` | `rgb(212 148 46 / 0.15)` | `rgb(212 148 46 / 0.13)` |
| `danger` | `#d45555` | `#d45555` | `#d45555` |
| `danger-soft` | `rgb(212 85 85 / 0.15)` | `rgb(212 85 85 / 0.15)` | `rgb(212 85 85 / 0.13)` |
| `info` | `var(--ov-color-brand-400)` | `var(--ov-color-brand-400)` | `var(--ov-color-brand-400)` |
| `info-soft` | `rgb(99 145 255 / 0.15)` | `rgb(105 160 255 / 0.15)` | `rgb(107 155 255 / 0.13)` |
| `state-hover` | `rgb(160 170 185 / 0.09)` | `rgb(160 160 160 / 0.09)` | `rgb(160 165 175 / 0.08)` |
| `state-pressed` | `rgb(160 170 185 / 0.16)` | `rgb(160 160 160 / 0.16)` | `rgb(160 165 175 / 0.14)` |
| `state-selected` | `rgb(77 124 255 / 0.18)` | `rgb(75 140 255 / 0.18)` | `rgb(80 138 255 / 0.15)` |
| `state-focus-ring` | `#4d7cff` | `#4b8cff` | `#508aff` |

### Design Rationale

- **Deeper backgrounds**: All three themes are significantly darker than the current default (#181a1c base). This creates the "native app" feel of JetBrains/LM Studio where the app disappears into the OS chrome.
- **Brighter primary text**: fg-default pushed from #cccccc to ~#e5-e8 range. Combined with deeper backgrounds, this produces much higher contrast ratio.
- **Lower overlay opacity**: State overlays (hover/pressed/selected) use lower opacity than current theme (0.08-0.09 vs 0.11) because deeper backgrounds make translucent overlays more visible.
- **Shared status colors**: success/warning/danger are semantic and consistent across all themes. Only soft variants adjust opacity.
- **Tuned accent blues**: Each theme gets a slightly different blue hue to complement its undertone — Obsidian gets cobalt, Carbon gets azure, Void gets steel blue.

---

## Implementation Scope

### 1. Theme Tokens (`packages/base-ui/src/theme/styles.css`)

Add three new `data-ov-theme` blocks after the existing high-contrast-light block. Each block overrides the same set of semantic color tokens. Non-color tokens (sizing, spacing, animation) are inherited from the default theme.

### 2. Type Extension (`packages/base-ui/src/theme/types.ts`)

Extend `ThemeMode`:
```ts
export type ThemeMode =
  | 'dark' | 'light' | 'high-contrast-dark' | 'high-contrast-light'
  | 'obsidian' | 'carbon' | 'void';
```

### 3. Theme Provider (`packages/base-ui/src/theme/ThemeProvider.tsx`)

Update the `color-scheme` mapping to include the 3 new themes as `dark` scheme variants. Also update the `isThemeMode` type guard function (hardcoded union check) to include `'obsidian'`, `'carbon'`, and `'void'` — without this, persisted theme values from localStorage will fail validation and fall back to the default.

### 4. Showcase Theme Picker (`apps/showcase/src/Dock.tsx`)

Replace the simple light/dark toggle button with a theme picker that lists all available themes. Could be a Menu dropdown triggered from the existing settings icon position, showing theme names with color swatches.

### 5. Rebuild & Verify

Rebuild base-ui, verify all three themes render correctly in the showcase chat demo.

---

## Out of Scope

- Light theme variants of Obsidian/Carbon/Void (future work if needed)
- Syntax highlighting / editor-specific token overrides (inherit from default)
- ANSI terminal color overrides (inherit from default)
- Component-specific token overrides (tabs, editor groups, etc. — inherit from default for now)
