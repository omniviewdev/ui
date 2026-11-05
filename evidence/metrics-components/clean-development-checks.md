# Clean development checks

## Verified

| Check                                       | Result                                                                                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`            | Passed; patch and lockfile reproduce                                                                                                      |
| `pnpm validate`                             | Passed: lint, formatting, all package types, audit, tests                                                                                 |
| ESLint                                      | Zero errors and warnings; `--max-warnings=0` now enforces this                                                                            |
| UI audit                                    | Zero High findings; no baseline expansion                                                                                                 |
| Package tests                               | 1,816 base-ui + 221 ai-ui + 229 editors = 2,266 passed                                                                                    |
| `pnpm build`                                | All three libraries passed without the prior editor warnings                                                                              |
| `pnpm --filter @omniviewdev/showcase build` | Dependency builds, native typecheck, and frontend build passed                                                                            |
| Static Storybook build                      | Passed                                                                                                                                    |
| Formatting after audit/build                | Passed; generated report stays formatter-clean                                                                                            |
| Audit/ESLint tool tests                     | 19 passed, unchanged                                                                                                                      |
| Dedicated theme type tests                  | Seven passed; no type errors                                                                                                              |
| Strict installed consumer                   | Root and metrics imports passed without `skipLibCheck`, workspace aliases, or consumer patches                                            |
| Style-policy probes                         | Nine passed: safe variables/public passthrough accepted; assertions, local/default/reassigned/shadowed spreads and computed keys rejected |
| Live Table v9 selection                     | Unchecked → mixed → checked → unchecked                                                                                                   |
| Live filtering                              | Eight services → one matching service → eight restored                                                                                    |
| Live resize/sort                            | First column 170.375px → 230.203px; ascending sort applied                                                                                |
| Live virtualization                         | Scroll offset 6,000px → 12,000px changed visible records; only 13 table rows mounted                                                      |
| Live date picker                            | Calendar opened and selection updated fields to 11 / 15 / 2026                                                                            |
| Fresh browser smoke                         | No application console or page errors observed                                                                                            |

## Fixes

- `patches/@dnd-kit__core@6.3.1.patch` imports React's JSX types in five upstream declarations. No global JSX shim or new skipped checks.
- `packages/base-ui/scripts/bundle-types.mjs` builds portable root and metrics declarations. DnD's complete declaration graph is embedded; React, Base UI, and other dependencies retain external type identity. Managed snapshots retain their existing unbundled output mode.
- The isolated consumer still installed the original, unpatched DnD declarations containing global JSX references. Its successful strict check therefore does not depend on this workspace's patch.
- DatePicker uses the library's compound-component pattern, preserving `DatePicker.Calendar` without recursive namespace inference.
- Maintained package-bundled Table **v9.3.1** skills replace the stale general v8 guidance. Table remains compiler-enabled. Virtual v3 core feeds subscribed immutable snapshots rather than an incompatible mutable React-hook result; no compiler opt-outs were retained.
- Table render/layout caches keep subscribed state and option invalidation. Select-all headers use `!all && some` for indeterminate state, matching v9's selection semantics.
- Semantic tokens replace High styling violations. The shared AST style classifier accepts explicit CSS-variable bindings and proven public style forwarding, while retaining unsafe-style detection.
- Audit reports use the repository's Prettier configuration when generated.
- Editor builds resolve the browser localization entry and no longer pretend an already-static CodeEditor dependency is a separate lazy chunk.

## Tests and scope

No existing test assertions or behavioral expectations changed. Prettier normalized test formatting. One existing `@ts-expect-error` comment moved immediately before the JSX expression it guards after line wrapping; its negative API check remains intact.

The audit still reports 1,089 Medium and 213 Low advisory findings. These were not hidden or re-baselined. Optional Storybook and showcase builds pass but still print upstream loader, code-generator, or large-chunk advisories. Vitest labels its dedicated type-testing feature experimental. Those advisories are not failed source checks or runtime application errors.

No PR, merge, or publish. Local Storybook remains available at http://127.0.0.1:48637/.
