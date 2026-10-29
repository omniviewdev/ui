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

Use `packages/benchmarks/src/utils/bench-render.ts` for component benchmarks. Vitest 5 and CodSpeed 6 use per-function `beforeAll`/`afterAll` options for rerender fixtures. Initial mounts and normal cleanup must stay outside the measured rerender callback. CPU simulation has a 10-minute per-case runner budget; native runs retain 60 seconds. Workloads and regression thresholds remain unchanged.

Use Node 26.13.0 and the [benchmark validation commands](../packages/benchmarks/README.md#validation) to smoke-test both actual runners. `CI=true` alone does not activate CodSpeed's analysis runner locally; the documented simulation command explicitly selects it. The lifecycle regression benchmark runs in the normal CI shards without mocking the runner. Local lifecycle success does not certify simulation measurements or uploads.

## Declaration builds

Published library builds roll declarations with API Extractor. Each library passes
`typescriptCompilerFolder` through `bundleTypes.invokeOptions`, derived from the
active JavaScript compiler's `getDefaultLibFilePath`. The TypeScript 6 compatibility
package forwards its JavaScript API to the underlying compiler; its own package
directory does not contain standard library declarations. Using that alias
directory loses globals such as `Omit` during extraction.

Keep this path derived from the compiler API rather than pinning an internal
package path or disabling declaration diagnostics. Managed output-directory builds
emit unbundled declarations; smoke-test default `dist` builds without
`OMNIVIEW_BUILD_OUTPUT_DIRECTORY` to exercise the published declaration path.

Library typechecks and the showcase build invoke `@typescript/native/bin/tsc`
explicitly. Do not replace these with the JavaScript compiler alias: native
TypeScript 7 checks source, while the compatible TypeScript 6 JavaScript API
serves declaration tooling.

## Compiler-sensitive component tests

Base UI tests compile library modules with the same React Compiler plugin as
production builds; test fixtures remain uncompiled. TanStack Table keeps a stable,
mutable controller, so table renderers that read its live state use the existing
`use no memo` boundary instead of copying the controller or forcing remounts.
Body cells share layout styles per visible column, keyed by actual column layout
state. Do not memoize row models or arbitrary cell-renderer output by the stable
table reference: those reads must remain live across data and state updates.

TanStack Table 9 uses complete `{ start: [], end: [] }` column-pinning state.
Use logical inline offsets for pinned cells. React synchronizes plain
`table.options` during render; `optionsStore` is optional and is not a React
subscription source. Subscribe to table state for state edits, and let owning
renders propagate changed data, columns, and selection predicates.

## Future additions (after component implementation starts)

1. Add CSS linting (`stylelint`) for token and module CSS files.
2. Add TypeScript project references for type-aware linting in package workspaces.
3. Add CI gates for `pnpm validate`.
