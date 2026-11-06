# Contributing

Before writing component implementation code, review and approve:

1. `docs/REPOSITORY_GUIDELINES.md`
2. `docs/THEME_PRIMITIVES.md`
3. `docs/THEME_TOKEN_MAPPING.md`
4. `docs/THEME_REVIEW_CHECKLIST.md`

## Workflow

1. Install dependencies with `pnpm install`.
2. Run quality checks with `pnpm validate`.
3. Keep changes scoped and update related docs with token changes.

## Shared components first

- Host and plugin views must use base-ui controls, not native interactive controls or local replicas of shared components.
- Record missing shared capability before implementing it. Add the API, token-owned styling, behavior, and component stories in base-ui first.
- Consumer CSS may arrange layouts. It must not override shared component chrome, density, typography, or theme colors.
- Keep identity, units, capacity bounds, and source provenance explicit. Missing data is not zero; unknown capacity is not utilization.
- Visual acceptance requires the actual IDE beside the approved reference, not only mocked orchestration tests or standalone stories.
- Preserve before images. Record each finding's fix commit, owning package, component story, and actual before/after evidence.
