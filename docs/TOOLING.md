# Tooling Standards

## Package manager

- `pnpm` only.

## Linting and formatting

- ESLint config: `eslint.config.mjs`
- Prettier config: `prettier.config.mjs`
- Prettier ignore: `.prettierignore`
- Editor baseline: `.editorconfig`

## Commands

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm validate
pnpm storybook
pnpm build-storybook
```

## Rule intent

1. ESLint catches correctness and consistency issues.
2. Prettier enforces formatting and minimizes stylistic diffs.
3. Prettier-compatible ESLint config avoids rule conflicts.

## Benchmark fixtures

Use `packages/benchmarks/src/utils/bench-render.ts` for component benchmarks. Rerender fixtures require both Tinybench `setup`/`teardown` options (native Vitest and CodSpeed walltime) and isolated Vitest `beforeAll`/`afterAll` hooks (CodSpeed 5 simulation). Initial mounts and normal cleanup must stay outside the measured rerender callback.

Use Node 20 and the [benchmark validation commands](../packages/benchmarks/README.md#validation) to smoke-test both actual runners. `CI=true` alone does not activate CodSpeed's analysis runner locally; the documented simulation command explicitly selects it. The lifecycle regression benchmark runs in the normal CI shards without mocking the runner. Local lifecycle success does not certify simulation measurements or uploads.

## Compiler-sensitive component tests

Base UI tests compile library modules with the same React Compiler plugin as
production builds; test fixtures remain uncompiled. TanStack Table keeps a stable,
mutable controller, so table renderers that read its live state use the existing
`use no memo` boundary instead of copying the controller or forcing remounts.

## Future additions (after component implementation starts)

1. Add CSS linting (`stylelint`) for token and module CSS files.
2. Add TypeScript project references for type-aware linting in package workspaces.
3. Add CI gates for `pnpm validate`.
