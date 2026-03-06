# Theming Engine

## Requirements coverage

1. Fastest possible component rendering: all component styles are static CSS.
2. Runtime theme changes allowed to be slower: theme updates happen via root-level CSS variable and attribute updates.

## Theme state contract

Theme context values:

- `theme`: `dark | light | high-contrast-dark | high-contrast-light`
- `density`: `compact | comfortable`
- `motion`: `normal | reduced`
- `setTheme`, `setDensity`, `setMotion`

Persistence:

- LocalStorage keys:
  - `ov-theme-mode`
  - `ov-theme-density`
  - `ov-theme-motion`
- On mount, the provider applies state to `document.documentElement`.

## Attribute contract

Applied to `document.documentElement`:

- `data-ov-theme`
- `data-ov-density`
- `data-ov-motion`

## Performance notes

- Theme switching updates a bounded number of root-level properties.
- Components consume variables and do not re-register styles.
- CSS modules are compiled once; no runtime style serialization.

## Baseline palette notes

- The default `dark` mode uses a neutral graphite ramp with reduced blue bias.
- Surface separation is driven by semantic tokens (`--ov-color-bg-*`, `--ov-color-border-*`) instead of component-local color tweaks.
- Accent and status colors are intentionally slightly desaturated so dense IDE layouts feel native and low-glare.

## Integration rules

1. Every component must use semantic tokens, not primitives directly.
2. Component-specific hardcoded colors are forbidden unless intentional (e.g. brand logo).
3. Visual states rely on data attributes from Base UI parts (`data-disabled`, `data-highlighted`, etc.).
4. New tokens must be added to the catalog before usage.

## Token scope guardrails

1. Keep the global token surface minimal: prefer existing semantic tokens before creating new component tokens.
2. Add a new `--ov-size-*` or `--ov-color-*` component token only when the value is reused across multiple selectors or density modes.
3. Wrapper-only components must not introduce dedicated token families until they have real themed slot styling.
4. Current component implementation tiers are tracked in `docs/COMPONENT_STATUS.md`.

## IDE coverage requirement

Theme specs must cover:

1. Workbench/chrome regions (title bar, side bar, panel, status bar, tabs).
2. Editor rendering states (selection, cursor, line highlights, gutters, diff, minimap).
3. Terminal and ANSI colors.
4. Syntax and semantic highlighting colors plus style modifiers.
5. Debug/source-control/testing/chat surfaces.
6. Omniview runtime surfaces (plugin lifecycle, dev server, connection sync, logs, operations, and drawer/editor workflows).

Reference docs:

- `docs/IDE_TOKEN_CATALOG.md`
- `docs/OMNIVIEW_TOKEN_AUDIT.md`
