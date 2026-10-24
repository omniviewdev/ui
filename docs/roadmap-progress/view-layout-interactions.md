# View layout interactions — UI-LAYOUT / P33 presentation subset

## Status

Implemented, reverified on merged `main`, independently reviewed, and **In Review** in [UI PR #71](https://github.com/omniviewdev/ui/pull/71). This is the bounded [UI-LAYOUT issue ui#67](https://github.com/omniviewdev/ui/issues/67), not completion of [P33](https://github.com/omniviewdev/omniview/issues/104), P32, dashboard integration, or a production contract freeze. The PR is open, not merged; remote CI/review acceptance is separate from the exercised local evidence below.

## Current source, ownership and integration

- Main baseline: `229a060885acea203410b1b113c68e4016d81b97`, merged [UI PR #69](https://github.com/omniviewdev/ui/pull/69). Its visualization directory matches the original captured baseline; the interaction fixes were not included in that merge.
- Clean branch: `fix/view-layout-interactions`; own worktree: `workspaces/resource-intelligence-ui/view-layout-interactions-pr`.
- Applied only the interaction delta from local commit `e5db77c`. Visualization code applied cleanly. Additive `docs/COMPONENT_STATUS.md` and base-ui changelog conflicts were reconciled while preserving the merged table/resource-authoring documentation.
- Exclusive seam: `packages/base-ui/src/components/visualization/`, plus narrow documentation/progress/changelog and the required base-ui patch changeset. No data-table, query/CEL/editor, backend, shared barrel or workspace/build configuration changes.
- Original integrated source and original `resource-intelligence/view-layout-interactions` branch/worktree remain preserved. No inherited workspace/tooling commits are part of this new branch's PR delta.
- Public names retained: `ViewLayout`, `ViewLayoutItem`, `ViewLayoutProps`; immutable keyed `items`, externally authoritative `onItemsChange`, `renderItem`, `onConfigure`. Optional `disabled` / `readOnly` prevent layout/configuration mutation without disabling rendered content. Host owns selection; the story clears missing IDs.
- Resize invalidates when its item or constraints/editability change, except for the exact emitted resize item echoed by the host. Hosts cloning/normalizing that item conservatively end the gesture. Reorder invalidates on controlled items/constraint/editability updates. There is no internal layout copy or automatic normalization writeback.

## Historical isolation and prerequisite resolution

The original integrated `feature/resource-intelligence-table-ui` checkout had untracked visualization source. Only that directory was safely captured as local snapshot `72a7ce1`, without changing the source worktree or copying dependency/build artifacts as part of the source snapshot. Interaction commit `e5db77c` was reviewed and browser-smoked separately. On the original remote-main check, no visualization source existed and only tooling PR #57 was open; publication was held to avoid publishing independently owned ancestry. PR #69 has now landed the baseline, so that prerequisite is resolved. The new PR is based directly on merged main, not the historical workspace branch.

## Exercised verification on the clean main-based branch

- `npx --yes pnpm@12.14.0 install --frozen-lockfile`: passed, no dependency/config edits.
- `npx --yes pnpm@12.14.0 --filter @omniviewdev/base-ui exec vitest run src/components/visualization`: **19 tests passed**, 11 layout and 8 visualization. The original baseline had 13 tests; six new cases were observed failing before implementation (accepted/external removal focus, bound no-op, disabled/read-only mutation, and external geometry during resize).
- `npx --yes pnpm@12.14.0 --filter @omniviewdev/base-ui typecheck`: passed.
- Scoped ESLint on the three modified visualization TSX files: zero errors, one existing `prefer-memo-leaf-component` advisory on the exported generic container. No suppression or memo framework introduced.
- `npx --yes pnpm@12.14.0 --filter @omniviewdev/base-ui build`: passed, including declaration generation. API Extractor reported its bundled TypeScript 5.8.2 is older than the project's 5.9.3; build succeeded.
- `npx --yes pnpm@12.14.0 exec changeset status --since=origin/main`: passed; base-ui patch with dependent-package patch propagation. No package publication performed.
- No full repository-suite, benchmark, screen-reader, touch-device or desktop-host certification. The known unchanged Calendar failure was not rerun simply to confirm it.

### Actual Chromium Storybook

Launched the existing focused `KeyboardAndPointerLayoutBuilder` story from this clean worktree on unique port **6191** with `npx --yes pnpm@12.14.0 exec storybook dev -p 6191 --ci --no-open`. All scenarios below were re-exercised after the main-based transplant. Screenshots inspected; final browser error log empty. The earlier isolated verification used port 6187.

| Scenario | Observed result |
| --- | --- |
| Earlier/Later via keyboard | Order changed and the same move control retained focus, including boundary states. |
| Space/Right/Space drag | Keyed order changed; drop restored its own drag-handle focus. |
| Actual pointer drag | Restricted scope moved to first position. |
| Continuous pointer resize | Reached 3×3, maximum 6×4, then minimum 1×1 in one gesture; resize focus retained. |
| Arrow-key resize | Reached 6×4 maxima and 1×1 minima without exceeding bounds; resize focus retained. |
| Host update during pointer drag | Scheduled external reversed order and Capacity 4×2 geometry survived the subsequent drop unchanged. |
| Host update during accepted resize | External order/4×2 geometry survived further pointer movement; binding stayed `opaque.capacity`. |
| Disabled/read-only | Pointer drag/resize, keyboard drag/resize and move/remove/configure did not mutate layout; content actions remained usable. |
| Host rejects edits | Resize/removal requests did not change controlled data; rejected removal kept its button focus. |
| Missing renderer | Exact configuration retained; unavailable panel remained resizable with binding preserved; restoring renderer recovered content. |
| Selection and external removal | Keyed selection survived a move, cleared on host removal, did not revive on reset; host trigger kept focus. |
| Removal focus | Next survivor, previous survivor, then empty layout received focus; Tab continued into survivor controls. |
| Preview | Editing controls disappeared without unmounting panels; content actions worked. External removal of a focused resize control focused its panel. |
| Configure/Inspect close | Returned focus to the actual opening trigger, not a previously configured panel's trigger. |
| External controlled reorder | Focused Capacity resize control stayed focused and connected across external order/geometry replacement. |

Browser scripts awaited sensor/collision updates and used normal-duration keyboard presses. Early automation selector/timing failures were investigated, not counted as passing evidence. No extra runtime/test scaffolding is shipped.

## Independent review

- Original read-only `LayoutInteractionReview`: no Important/Critical findings. One Minor stale Inspect return target was reproduced, fixed by capturing `event.currentTarget`, and browser-verified; reviewer acknowledged resolution.
- Fresh read-only `MainLayoutReview` against main `229a060`: no Important/Critical findings, no concrete patch-introduced interaction defect, ownership boundaries preserved. No edits/checks/services were run by that reviewer.

## Tracking and proposed central-ledger reconciliation

- [Delivery project](https://github.com/orgs/omniviewdev/projects/13), [parent roadmap](https://github.com/omniviewdev/omniview/issues/78), and [UI-LAYOUT](https://github.com/omniviewdev/ui/issues/67) track this bounded slice. Reconciliation replaces stale unassigned/Ready wording with actual ownership, verified acceptance and [PR #71](https://github.com/omniviewdev/ui/pull/71) review state. Keep the bounded issue open/In Review until the focused PR is accepted/merged; do not mark the production packet Done.
- Issue-named [ui-layout.md](ui-layout.md) points to this canonical receipt rather than duplicating it.
- Read the latest host work-package/readiness and remote-index tracking rules. Only the integration owner writes the central host ledgers; no other worktree was edited.
- Proposed C10 / P33 ledger update: PR #69 provides merged visualization/binding/layout primitives; open PR #71 adds verified accessible focus/controlled-state interaction hardening. Record its actual PR/merge state and verification, not full P33 acceptance. Current registry integration, authoritative binding/schema validation, versioned saved documents/migrations, resource-context defaults and actual host consumers remain unresolved.
- P32/P33/P34 stay open with their actual blockers; production acceptance checkboxes and native dependency readiness are not advanced by fixture-only UI evidence.

## Release boundary

No persistence, resource acquisition, query execution/subscriptions, registry/plugin loading, user-JavaScript execution, generated bindings or backend changes. Provider-neutral presentation only. A patch changeset is included; no package publication or merge is authorized by the PR-creation request. Preserve both own worktrees.
