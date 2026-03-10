# UI Library Audit Design

**Date**: 2026-03-10
**Scope**: `@omniview/base-ui`, `@omniview/editors`, `@omniview/ai-ui`
**Approach**: Automated scan + targeted manual review + fixes + guardrails
**Breaking changes**: Allowed (pre-1.0, internal consumers only)

## Motivation

The UI monorepo has grown rapidly to 3 packages and 78+ components. Styling drift, token misuse, convention violations, and React performance gaps have likely accumulated. This audit identifies issues, fixes them, and adds permanent enforcement to prevent regression.

## Priority Order

1. Token/styling consistency
2. Convention violations
3. React performance
4. Accessibility

## Phase 1: Automated Scan

Run detection rules across all 3 packages. Produce a structured findings report at `docs/superpowers/specs/audit-findings.md`.

### 1.1 Token/Styling Consistency

| Check | Detection | Severity |
|-------|-----------|----------|
| Hardcoded colors | Hex `#xxx`, `rgb()`, `hsl()` in `.module.css` (excluding `styles.css`) | High |
| Primitive token leakage | `--ov-primitive-*` in component CSS | High |
| Missing theme coverage | Semantic tokens in one `[data-ov-theme]` block but absent from others; also checks `[data-ov-density]` and `[data-ov-motion]` blocks | Medium |
| Hardcoded spacing | Raw `px`/`rem`/`em` for spacing/padding/margin instead of `--ov-space-*` | Medium |
| Hardcoded radii | Raw values for `border-radius` instead of `--ov-radius-*` | Medium |
| Hardcoded font sizes | Raw values instead of `--ov-font-*` | Low |
| Hardcoded z-index | Raw numbers instead of `--ov-z-*` | Low |
| Hardcoded transitions | Raw `transition`/`animation` durations and easing instead of `--ov-duration-*`/`--ov-ease-*` (breaks `[data-ov-motion="reduced"]`) | Medium |
| Hardcoded box-shadow | Raw `box-shadow` values instead of `--ov-shadow-*` tokens | Medium |
| Hardcoded opacity | Raw `opacity` values where `--ov-opacity-*` families exist | Low |
| Missing syntax tokens | Colors in editors package CSS not using `--ov-syntax-*` for syntax highlighting (per REPOSITORY_GUIDELINES rule 5) | High |
| Missing IDE alias indirection | Components using raw semantic tokens where an IDE alias (`--ov-color-sidebar-*`, `--ov-color-editor-*`, etc.) exists | Medium |

### 1.2 Convention Violations

| Check | Detection | Severity |
|-------|-----------|----------|
| Inline styles in JSX | `style={{...}}` in component files | High |
| Missing data attributes | State styling via classes instead of `data-ov-*` / Base UI `data-*` | Medium |
| Inconsistent exports | Components not following barrel export convention | Medium |
| Component-local token defs | `--ov-*` defined in component CSS, reused in fewer than 3 selectors | Low |
| CSS class naming | CSS Module classes not following PascalCase for root slots, camelCase for modifiers | Low |

### 1.3 React Performance

| Check | Detection | Severity |
|-------|-----------|----------|
| Missing `memo` on leaf components | Exported components without `React.memo` or memo-wrapped `forwardRef` | Medium |
| Inline object/array literals | `prop={{}}` or `prop={[]}` in component JSX | Medium |
| Inline function handlers | Arrow functions passed as props to child components (causes child re-renders); same-component-only handlers excluded | Medium |
| Missing `useCallback`/`useMemo` | Handlers and computed values in render body without memoization | Low |
| Large component files | Files over ~300 lines | Low |

### 1.4 Accessibility

| Check | Detection | Severity |
|-------|-----------|----------|
| Missing ARIA roles | Interactive elements without `role`, `aria-label`, or `aria-labelledby` | Medium |
| Missing keyboard handlers | Clickable non-button elements without `onKeyDown`/`onKeyUp` | Medium |
| Hardcoded colors in HC modes | Tokens in `high-contrast-*` modes not meeting WCAG AAA | Low |

### Scan Exclusions

- `*.stories.tsx` files (demo code, not production)
- `*.test.tsx` / `*.test.ts` files
- `styles.css` (token source of truth, not a consumer)
- Monaco/xterm internal styles (third-party)

## Phase 2: Targeted Manual Review

Based on Phase 1 results:

- Deep-dive the top 10-15 worst-offending components (highest issue density)
- Review patterns automation can't catch: API inconsistencies, naming conventions, component composition
- Performance review of complex components regardless of Phase 1 issue count: DataTable, TreeList, CommandPalette, CodeEditor, Chat components (virtualization, render frequency, state management)
- Check `ai-ui` for package-specific token families (e.g., `--ov-color-chat-*` if reserved)

## Phase 3: Fixes

Implement in priority order, committed separately by category:

1. **High**: Hardcoded colors, primitive token leakage, inline styles
2. **Medium**: Missing theme coverage, spacing tokens, missing memo, data attributes
3. **Low**: Font tokens, z-index tokens, file sizes, minor conventions

## Phase 4: Guardrails

### Custom ESLint Rules

Add via `eslint-plugin-local-rules` or inline flat-config plugin:

- `no-hardcoded-colors-in-css` — flag hex/rgb/hsl in CSS Modules
- `no-primitive-tokens` — flag `--ov-primitive-*` in component CSS
- `no-inline-styles` — flag `style={{}}` in component JSX
- `prefer-memo-leaf-components` — warn on exported components without memo

### Stylelint (if warranted)

- Token-only values for color, spacing, radius, z-index CSS properties

### CI Integration

- All checks run as part of `pnpm lint`
- Block PRs on violations

## Deliverables

| Deliverable | Format | Location |
|-------------|--------|----------|
| Audit findings report | Markdown | `docs/superpowers/specs/audit-findings.md` |
| Component fixes | Git commits | Grouped by severity/category |
| ESLint guardrail plugin | TypeScript | Root-level (per REPOSITORY_GUIDELINES: lint from repo root) |
| Updated lint scripts | `package.json` | Each package |
| This design doc | Markdown | `docs/superpowers/specs/2026-03-10-ui-audit-design.md` |

## Non-Goals

- Visual regression testing (Chromatic, Percy)
- Storybook coverage audit
- Bundle size optimization
- New component development
- Theme palette/spacing scale redesign
- `styles.css` token source refactoring
