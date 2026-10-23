# Command-palette interaction quality and accessibility

Status: **verified** (2026-10-22). Component deliverable complete; production P42/P43 remain open.

## Isolation and ownership

- PR branch: `feature/command-palette-interactions-main`, based on current main `3e55d761ca6c53413c27c8c924168185373d3607`.
- PR worktree: `/Users/joshuapare/Repos/omniviewdev/workspaces/resource-intelligence-ui/command-palette-pr`.
- Original verified branch/worktree `feature/command-palette-interactions` / `resource-intelligence-ui/command-palette-interactions` preserved unchanged.
- Source: `resource-intelligence-ui/table-ui`, branch `feature/resource-intelligence-table-ui`, HEAD `c71831890e5c869ff9bbf92ac12a0bb7bec29d3b` plus its current tracked/untracked source.
- Snapshot commit: `e849d8d0958c22d39bfcd37efabc92554831e000` (baseline only, not this feature). Captures 95 dirty paths, including 85 untracked files. All 1,267 tracked/nonignored source files copied; aggregate SHA-256 `e5631f693d890058c0cc773f98bdea72248df8fdbfd312b3df40c2261ccfe28a` matched source before/after and destination. No node_modules, generated output, or ignored files copied. Original worktree/index untouched; no operations against `feature/agentic-workspaces`.
- Own: `packages/editors/src/components/command-palette/`, narrowly scoped `packages/editors/CHANGELOG.md`, `.changeset/command-palette-interactions.md` (required minor-release metadata for the additive optional props), and this receipt.
- Read-only context: latest reconciled readiness/work-packages copies under `resource-intelligence-ui/host/docs/roadmap/`; no central ledger edits.

## Roadmap allocation

- **P42 presentation-only subset**: reusable palette input/list/active relationships, keyboard dismissal/activation, focus lifecycle, result replacement and visible states. Not production action registration, settings/router integration, authorization or command execution.
- **P43 component-level preparation only**: safe caller-ordered replacement and readable pending/failure presentation. Not resource query execution, search providers, cancellation/coverage contracts or backend search.
- C11 remains unfrozen for production command/search contracts. No production packet, P00/C00 or backend gate is completed by this work.

## Implementation plan

1. Replace the palette's large CommandList mock with real-component behavioral regressions; reproduce accessible-input, ordering, composition, focus and state gaps before changing implementation.
2. Reuse CommandList public hooks/primitives. Put combobox state on the focused input; keep current enabled-command filtering and bounded static fuzzy matching. Preserve caller ordering, without merging noncontiguous groups. Validate execution against current results. Keep expensive ranking, acquisition, authorization and execution in consumers.
3. Preserve existing required props/ref. Add only optional caller-controlled `loading` and `error` presentation if needed; no fetching or future service contract. Pending/error states suppress executable results.
4. Keep Escape single-shot, ignore composition/229 command keys, contain Tab focus, restore the opening element on dismissal/controlled close/unmount without overriding deliberate command navigation focus.
5. Improve focused existing stories with repeatable opening, disabled commands, live result replacement and pending/error cases. Update the existing editors changelog.
6. Run scoped real tests/typecheck; launch actual Storybook on a unique port, exercise keyboard/replacement/disabled/dismissal/focus paths and capture visual evidence. Obtain independent focused review and resolve Important/Critical findings.

## Evidence so far

- `pnpm install --frozen-lockfile`: launcher rejected installed pnpm 11.28.6 versus declared 12.14.0; corepack's old launcher expected a nonexistent pnpm.cjs entry.
- `npx --yes pnpm@12.14.0 install --frozen-lockfile`: passed; 838 packages installed independently, no manifest/lock edits.
- `npx --yes pnpm@12.14.0 --filter @omniviewdev/editors test src/components/command-palette/CommandPalette.test.tsx`: baseline 21/21 passed, but mocked CommandList emitted a React missing-key warning and does not prove real accessibility/focus behavior.
- LSP references inspected for `CommandPaletteProps`; consumers are focused stories and existing reexports. No shared barrels/configuration edits planned.
- Real-component regression run before implementation: **14 failed / 6 passed**, reproducing missing named/focused combobox relationships, group reordering, IME activation/dismissal, focus containment/restoration and missing state presentation. A separate new Clear search/Enter regression also failed before its fix.
- Final scoped command: `npx --yes pnpm@12.14.0 --filter @omniviewdev/editors test src/components/command-palette/CommandPalette.test.tsx --reporter=dot && npx --yes pnpm@12.14.0 --filter @omniviewdev/editors typecheck`: **22/22 passed**, typecheck exit 0, no React warnings. Tests use real CommandList, not its former 200-line behavior mock.
- `npx --yes pnpm@12.14.0 --filter @omniviewdev/base-ui build`: passed, generating only this worktree's dependency declarations/output; API Extractor noted its bundled TypeScript 5.8.2 is older than project 5.9.3.
- `npx --yes pnpm@12.14.0 --filter @omniviewdev/editors typecheck`: passed, including focused stories and tests.
- `npx --yes pnpm@12.14.0 exec storybook dev -p 64127 --exact-port --ci --no-open -c .storybook`: ready on unique port 64127.
- Actual Chromium Storybook `editors-commandpalette--changing-results`: named input/list/selected option observed; ArrowUp/Down wrap retained Alpha/Beta/Gamma caller order; Enter executed Beta, then after Alt+R replacement executed Replacement (not previous Gamma). Opener focus restored each time. Replacing the active item with a disabled item cleared the active descendant and prevented execution. Pending, error and empty states had distinct status/alert semantics; Enter left selection unchanged; Escape restored opener focus.
- Actual Chromium Storybook `editors-commandpalette--playground`: Shift+Tab remained in the dialog; typing then Tab/Enter activated Clear search (not a command), cleared input and restored input focus. Escape and backdrop click restored the opener. `--with-disabled-commands`: Revert/Deploy/Publish absent; typing Revert and Enter executed nothing.
- Browser screenshots inspected after the final layout adjustment: compact ordered/loading/error surfaces; active result remains visible. Local evidence captures (outside the repo, not copied/generated source): `/tmp/command-palette-interactions-evidence/{ordered,loading,error}.png`. No uncaught component errors observed; recorded request failures were navigation-aborted Vite dependency requests (`net::ERR_ABORTED`), not failed component rendering.
- Additional actual-browser finding: clicking a group heading blurred the input to body, stranding Arrow/Escape. Added a failing-before real userEvent regression and a narrow primary-mousedown focus-preservation fix, leaving input/button descendants and click activation intact. Browser recheck confirmed input retained focus, ArrowDown selected Beta and Escape dismissed/restored opener.
- Actual Chromium `--with-many-commands`: ArrowUp selected Command 100, list scrollTop became 2027, bounding-box check confirmed the full active row visible while input retained focus. Populated-query Shift+Tab/Tab wrap and Enter-to-clear also passed after the pointer fix.
- Independent focused read-only review (`PaletteReview`, including applied pointer/layout fix follow-up): **no Critical/Important findings; no outstanding minor suggestions**. Added the suggested populated-query Shift+Tab/Tab boundary coverage. Reviewer did not run checks; observed commands/browser evidence above are from the implementation owner.
- Browser tab closed and owned Storybook service stopped after verification. Branch/worktree and local evidence captures preserved.

## Implemented behavior and exact paths

- `packages/editors/src/components/command-palette/CommandPalette.tsx`: focused-input combobox semantics, current active descendant, contiguous (order-preserving) group runs, stable bounded static filtering, current enabled execution, composition/229 guards, single Escape dismissal, Tab containment, active scrolling, controlled-close/unmount focus restoration without overriding deliberately focused destinations. Existing required props/ref unchanged; optional `loading?: boolean` and `error?: string` are presentation only. Error wins over loading; both hide executable results. Disabled commands remain hidden.
- `packages/editors/src/components/command-palette/CommandPalette.module.css`: contained result scrolling, content-sized overlay surface, existing semantic error color/spacing tokens.
- `packages/editors/src/components/command-palette/CommandPalette.test.tsx`: 22 real consumer-visible interaction regressions, including effect replay, ID reuse/replacement/disable, empty recovery, order, composition, Clear-button behavior and post-heading-click keyboard operation.
- `packages/editors/src/components/command-palette/CommandPalette.stories.tsx`: improved Playground and WithDisabledCommands; focused ChangingResults, Loading and Error stories. No Resource Intelligence showcase.
- `packages/editors/CHANGELOG.md`: existing Unreleased section documents compatibility, corrections and presentation-only boundary.

## Remaining dependencies / blockers

No concrete blocker remains for this component deliverable. Production command contribution lifecycle, host settings/navigation adapters, permission-aware resource search and authoritative query services remain outside this task. Verification is scoped, not a whole-monorepo suite or host integration run. Native OS IME candidates, Safari and physical assistive-technology output have not been exercised; synthetic composition/isComposing/229 events are covered by regressions and Chromium accessibility relationships were inspected.

## Proposed central-ledger update (not applied)

P42/P43: reusable CommandPalette interaction/accessibility preparation **verified** on `feature/command-palette-interactions`; UI receipt `docs/roadmap-progress/command-palette-interactions.md`. Evidence: 22 real-component behavioral regressions, editor typecheck, actual Chromium Storybook on unique port 64127 (ordered keyboard selection, replacement/disable, loading/error/empty, Clear search, pointer/keyboard continuity, active scrolling, dismissal and focus restoration), plus independent focused review with no Critical/Important findings. This is **P42 presentation-only work and P43 component preparation**, not production action registration, settings/navigation wiring, permission-aware resource search or C11 freeze. Keep complete production packets and backend gates open. Central ledger has not been edited; integration owner must apply this proposed update.

## Main-based PR readiness

- User approved opening a PR against main. Only the two owned feature/receipt commits were cherry-picked onto `3e55d761ca6c53413c27c8c924168185373d3607`; the 95-path source snapshot and agentic-workspaces history are excluded.
- No dependency on pending resource-intelligence work or agentic-workspaces PR #57: command-list/search-input source already matches main. The sole cherry-pick conflict was the changelog; resolved with only the palette's Unreleased entries, excluding unrelated CEL notes.
- Main's declared manager retained: `npx --yes pnpm@10.6.2 install --frozen-lockfile` passed; no shared configuration, package manifest or lockfile changes.
- Main-based verification: `npx --yes pnpm@10.6.2 --filter @omniviewdev/base-ui build` passed; `npx --yes pnpm@10.6.2 --filter @omniviewdev/editors test` passed **169 tests across 8 files**, including all 22 palette regressions; `npx --yes pnpm@10.6.2 --filter @omniviewdev/editors typecheck` passed. Existing Terminal mock emitted a Vitest constructor warning; API Extractor reported its older bundled TS compiler; no failures.
- Actual main-based Chromium Storybook on unique port **64129** confirmed named input/list/active-option relationships, interleaved order, Arrow navigation, live replacement activation, disabled replacement preventing execution, Escape dismissal and opener focus restoration. Error presentation visually inspected. Earlier comprehensive port-64127 evidence remains applicable to identical component source.
- Main-based feature commit: `bbec7ee` (cherry-pick of `d523e106664d3eb21ad798d65601c8a0217b029c`); receipt cherry-pick: `11b1776`. PR publication pending.

## Feature commit / PR

- Original verified feature commit: `d523e106664d3eb21ad798d65601c8a0217b029c` (`fix(editors): improve command palette interactions and accessibility`).
- Use the clean main-based PR branch for integration. `e849d8d0958c22d39bfcd37efabc92554831e000` is a preserved source-baseline snapshot of other ongoing work and is not part of the PR.
- Worktree/branch preserved. No push, PR, merge, package publication or central-ledger modification performed.
