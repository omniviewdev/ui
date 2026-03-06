# Architecture

## Repository layout

```txt
omniview-ui/
  packages/
    base-ui/           # Reusable component library
  docs/
    *.md               # Migration and implementation specs
```

## Runtime model

1. Components are authored with Base UI primitives and CSS Modules.
2. Visual design is driven by CSS variables in `packages/base-ui/src/theme/styles.css`.
3. Theme state is applied as HTML data attributes and CSS custom property overrides.
4. No runtime style generation is used in render hot paths.

## CSS architecture

Token layers:

1. Primitives: stable color/spacing/type scales.
2. Semantic: intent-driven variables (`--ov-color-bg-surface`).
3. Component aliases: optional local aliases for readability in component CSS files.
4. IDE aliases: workbench/editor/terminal/chat-specific semantic namespaces.

Selector strategy:

- `:root`: default dark tokens (desktop-first)
- `[data-ov-theme="light"]`: light overrides
- `[data-ov-theme="high-contrast-dark"]`: dark high-contrast overrides
- `[data-ov-theme="high-contrast-light"]`: light high-contrast overrides
- `[data-ov-density="compact|comfortable"]`: density overrides
- `[data-ov-motion="reduced"]`: motion overrides

## Build architecture

- `packages/base-ui` uses Vite library mode + TypeScript declarations.
- CSS is emitted as static files, with side effects explicitly declared.
- Storybook (`pnpm storybook`) is the visual validation environment.

## Non-goals for this phase

- Full component replacement of the current MUI package in this phase.
- Production API freeze.
- Full visual replacement of all legacy screens in this phase.

This phase is for a robust platform, token model, and migration-safe workflow.

## Default visual direction

Default dark themes should feel native and restrained (graphite/neutral, low-chroma, subtle separators) for Omniview desktop workflows.
