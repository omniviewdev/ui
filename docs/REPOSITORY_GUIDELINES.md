# Repository Guidelines

## Purpose

This repository defines the standards and primitives for Omniview's Base UI migration.
Component implementation is active and must follow token and theming contracts.

## Tooling policy

1. Use `pnpm` for all package operations.
2. Use `eslint` and `prettier` from repository root.
3. Keep formatting decisions in Prettier; keep quality rules in ESLint.

## Styling policy (hard requirements)

1. No CSS-in-JS runtime styling in component render paths.
2. Use CSS modules for component-level styles and plain CSS for token layers.
3. All colors, spacing, typography, motion, radii, and elevation values must come from tokens.
4. Components must consume semantic tokens, not primitive tokens.
5. No utility framework dependency (no Tailwind).

## Theme and token governance

1. Additions or renames to token keys require docs update in:
   - `docs/TOKEN_CATALOG.md`
   - `docs/THEME_PRIMITIVES.md`
2. Any change to token defaults must include:
   - rationale
   - before/after value
   - impacted component list
3. Token removals require migration notes and a deprecation window.
4. Any IDE-facing feature must map its visual states to an existing `docs/IDE_TOKEN_CATALOG.md` family.
5. Syntax styling must use `--ov-syntax-*` tokens, not editor component-local colors.

## Code organization

1. `packages/base-ui`: reusable components, hooks, and CSS token source.
2. `packages/base-ui/src/components`: component wrappers and Storybook stories.
3. `docs`: architecture, theme contracts, migration phases, and checklists.

## Pull request expectations

1. Keep scope narrow: one conceptual change per PR when possible.
2. Include screenshots or short recordings for visual changes.
3. Reference the impacted tokens and theme modes.
4. If behavior changes, include test updates (unit or integration).

## Naming conventions

1. Token prefix: `--ov-`.
2. Theme attributes: `data-ov-*`.
3. Components: `<ComponentName>` (for example `Button`, `Card`, `Select`).
4. CSS module classes: PascalCase for root slots, camelCase for modifiers.

## Performance rules

1. Avoid unnecessary React context re-renders; theme context state is small and stable.
2. Avoid inline style object creation in hot lists unless required.
3. Prefer Base UI data attributes for interaction styling.
4. For expensive views, benchmark before and after migration.
