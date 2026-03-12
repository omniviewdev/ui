# Omniview Base UI Platform

[![CodSpeed](https://img.shields.io/endpoint?url=https://codspeed.io/badge.json)](https://codspeed.io/omniviewdev/ui?utm_source=badge)

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

## Key docs

- `docs/REPOSITORY_GUIDELINES.md`
- `docs/THEME_PRIMITIVES.md`
- `docs/THEME_TOKEN_MAPPING.md`
- `docs/TOKEN_CATALOG.md`
- `docs/IDE_TOKEN_CATALOG.md`
- `docs/OMNIVIEW_TOKEN_AUDIT.md`
- `docs/COMPONENT_STATUS.md`
- `docs/MIGRATION_PLAN.md`
