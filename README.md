# Omniview Base UI Platform

This repository defines standards, token contracts, and the in-progress Base UI component package for Omniview.

## What is included now

1. Repository standards and contribution rules.
2. ESLint + Prettier baseline setup (pnpm only).
3. CSS-variable theme engine (`theme`, `density`, `motion`) with runtime switching.
4. Base UI component wrappers with Storybook and Vitest coverage.
5. Migration and architecture planning docs.

## Core commands

```bash
pnpm install
pnpm lint
pnpm format:check
pnpm validate
pnpm storybook
```

## Frontend compatibility checks

Use Node.js 26.13.0 LTS and pnpm 12.14.0. Library and showcase builds enable the
React Compiler. Source checks use native TypeScript 7; JavaScript tooling uses
the TypeScript 6 compatibility API.

In a standalone checkout, `pnpm --filter @omniviewdev/showcase build` checks the
showcase and builds its workspace dependencies. Do not run independent installs
inside roots linked by a managed Omniview workspace.

After dependency changes, exercise browser tab creation, last-tab replacement
and reordering; chat reactions and sending; AI replay tool completion; and
container selection, filtering, and empty-state recovery. Keep tab ID generation
out of replayable state updaters. Place `DataTable.Empty` outside the table
container and render it only when data is empty.

The chat, AI, container, and file-explorer demos use fixtures; they do not prove
real backend or cloud integration. Host-owned Playwright acceptance remains
separate.

## Key docs

- `docs/REPOSITORY_GUIDELINES.md`
- `docs/THEME_PRIMITIVES.md`
- `docs/THEME_TOKEN_MAPPING.md`
- `docs/TOKEN_CATALOG.md`
- `docs/IDE_TOKEN_CATALOG.md`
- `docs/OMNIVIEW_TOKEN_AUDIT.md`
- `docs/COMPONENT_STATUS.md`
- `docs/MIGRATION_PLAN.md`
