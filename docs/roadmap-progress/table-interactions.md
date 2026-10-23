# Table interaction quality and accessibility

- Task: table-interactions; status: verified (reusable presentation subset only).
- Branch: `feature/resource-intelligence-table-interactions`.
- Worktree: `~/Repos/omniviewdev/workspaces/resource-intelligence-ui/table-interactions` (UI repository).
- Initial baseline: `main` at `817961647f8306994e6f508c9b547308404a7570`. For the user-approved combined PR, rebased only this own branch onto current `origin/main` at `3e55d76`; no inherited feature/agentic-workspaces build commits.
- Source snapshot: complete `packages/base-ui/src/components/data-table/` from `feature/resource-intelligence-table-ui` at HEAD `c71831890e5c869ff9bbf92ac12a0bb7bec29d3b` plus current uncommitted/untracked table files. `cp -pR …/data-table/. …/data-table/` followed by `diff -qr` succeeded. Original checkout was only read; no stash/reset/commit/rebase/merge there. Ignored local dependencies were APFS-cloned by worktree tooling; not deliverables.
- Owning files: data-table directory, `packages/base-ui/CHANGELOG.md`, this progress record. No shared barrels/configuration, authoring/editor, host, SDK or plugin changes.
- Context read: reconciled readiness/work-packages copies in `resource-intelligence-ui/host/docs/roadmap/`; central ledgers are integration-owner-owned and unchanged.

## Packet boundary

P23/P24 presentation-only keyboard/focus/virtual-detail subset, relevant to P30 expanded presentation. No production packet completion. Host-prepared order/groups remain authoritative. No acquisition, result leases, SDK/wire identities, grouping/query computation, host integration or inventory/performance acceptance.

## Concrete gaps and bounded design

Observed source gaps: prepared expansion button always says Expand; nested example toggles omit expanded state; VirtualBody bubbles interactive/nested clicks to row callbacks; no focus fallback on focused detail/row removal. Native header sorting already uses buttons; retain native table roles and ordinary Tab behavior, not role=grid.

Plan: add a table-local native expansion toggle (row-specific label + expanded state), guard parent-row callbacks for interactive/nested targets, and container-local focus recovery based on mounted DOM only. Preserve an existing focused element through keyed reorder; on detail removal prefer mounted parent expansion control, otherwise focus container without scrolling. Never retain offscreen detail mounts. Tests reproduce concrete event/focus bugs before implementation. Prepared stories must remain table-focused fixtures; remove dependence on unsnapshotted visualization components using local native markup rather than copying unrelated packages.

## Implemented behavior

- `packages/base-ui/src/components/data-table/DataTableExpansionToggle.tsx` and `DataTable.tsx`: compound native row-specific disclosure, accurate Expand/Collapse name, `aria-expanded`, disabled eligibility, controlled-state requests. No shared barrel changes.
- `DataTableVirtualBody.tsx`: interactive/nested targets do not invoke either row callback; no global event suppression. Existing keyed slots, dynamic detail measurement and memoization retained.
- `hooks/useTableFocusRecovery.ts`, `DataTableContainer.tsx`, `DataTableBody.tsx`, `DataTable.module.css`: mounted-DOM-only focus ownership/recovery, keyed normal/detail row markers, programmatic viewport fallback and visible focus indication. Nested table disclosures are not outer-row fallbacks. No data/model traversal per focus event or keystroke.
- Recovery ownership is innermost-container-specific; explicit blur is recorded before observer delivery and only an actual DOM move can restore a still-connected blurred element. Only `data-ov-expansion-toggle` buttons are disclosure fallbacks, not unrelated menu/popover triggers. Custom disclosure buttons can opt in with that marker; public body comments document this and container labeling.
- `DataTable.Interactions.test.tsx`: consumer-visible callback isolation, self/host collapse recovery, keyed reorder/state, row/last-row removal, outside-focus safety, controlled keyboard disclosure, nested fallback boundary. Initial regression run: seven failures; added nested fallback regression also failed before correction.
- `DataTable.Interactions.stories.tsx`: 2,000 prepared cloud/container/hypervisor fixtures, delayed host reorder/removal/collapse commands, nested table selection, detail notes/height changes and expand-all mounting probe.
- `DataTable.Prepared.stories.tsx`, `DataTable.Nested.stories.tsx`: corrected disclosure usage; prepared examples no longer depend on unsnapshotted visualization package. `packages/base-ui/CHANGELOG.md` records changed behavior.


## Verification

- Source snapshot equality: `diff -qr` succeeded (no differences immediately after copy).
- Final `pnpm --filter @omniviewdev/base-ui exec vitest run src/components/data-table`: **5 files / 50 tests passed**, including 15 new interaction cases. Earlier red runs reproduced seven original failures, the nested-disclosure boundary, and the review's explicit-blur/menu-fallback defects before correction.
- `pnpm --filter @omniviewdev/base-ui typecheck`: exit 0. Repeated after rebasing onto current remote main (base-ui 0.4.3), along with the scoped table suite: 50/50 passed. No dependency repinning or package/build configuration edits.
- Storybook launched from `packages/base-ui`: `pnpm exec storybook dev --ci --no-open --exact-port -p 6419 -c .storybook`; exact unused port startup succeeded.
- Chromium story: `http://localhost:6419/iframe.html?id=components-datatable-interactions--keyboard-and-virtual-details&viewMode=story`.
- Observed native table/rowgroup/row/columnheader/cell tree (no grid). Enter expanded; Tab moved from disclosure to row link then detail note; Space expanded. Parent row action count remained 0 after parent/nested checkboxes and row link.
- Scheduled reorder preserved focused note DOM/value and nested checked state. Scheduled host collapse and self-close both restored Cloud instance 0 disclosure. Removal of focused row moved focus to connected viewport at scrollTop 0.
- Scroll to 30,000 while detail input focused: detail 0 unmounted, focus moved to connected viewport, scrollTop remained 30,000. Scroll back: row remained expanded, detail-local note reset as documented; focus stayed viewport.
- Final all-expanded probe (2,000 prepared fixtures): at top, **4 parent rows / 4 detail slots / 21 total tr / 305 total elements**; at scrollTop 150,000, **6 parent rows / 5 detail slots / 26 total tr / 355 elements**, first detail fixture:764. These are sampled browser DOM observations, not production performance gates.
- Keyboard-grown detail measured **156.14px → 386.39px**. Focus-visible disclosure outline computed solid 2px; screenshot inspected with compact nested table and subsequent resource rows visible.
- Explicit blur after a queued detail mutation left focus on BODY as requested. In Chromium, outer-status insertion followed synchronously by nested-row removal reproduced the review race (outer disclosure incorrectly focused) before correction; after correction focus stayed in the connected nested viewport. Removing that owner returned focus to outer disclosure. A preceding unrelated expanded menu button was not used as the row fallback.
- Final scheduled removal returned focus to the viewport; scheduled reorder while “After table” was focused left it there. Browser error collection empty.
- Existing prepared-results story `components-datatable-prepared-results--live-patches-and-arbitrary-details` also loaded: keyboard expansion, asynchronous grow/shrink fixture, accurate expanded state and mounted-details count 1 observed.
- Independent reviewer `TableInteractionReview` found three Important issues (explicit blur, nested recovery ownership, menu-vs-disclosure identification). All addressed; follow-up read-only review: **no Important/Critical findings remain**. Nested observer ordering was established in Chromium; JSDOM's boundary test alone did not reproduce that delivery ordering.
- Browser tab released after verification; isolated Storybook service stopped after smoke.
- Known unchanged Calendar.test.tsx failure not rerun.

## Exact changed-file inventory

Relative to the clean main branch baseline (including the relevant inherited table snapshot):

```text
docs/roadmap-progress/table-interactions.md
packages/base-ui/CHANGELOG.md
packages/base-ui/src/components/data-table/DataTable.Controlled.test.tsx
packages/base-ui/src/components/data-table/DataTable.Interactions.stories.tsx
packages/base-ui/src/components/data-table/DataTable.Interactions.test.tsx
packages/base-ui/src/components/data-table/DataTable.Nested.stories.tsx
packages/base-ui/src/components/data-table/DataTable.Prepared.stories.tsx
packages/base-ui/src/components/data-table/DataTable.module.css
packages/base-ui/src/components/data-table/DataTable.tsx
packages/base-ui/src/components/data-table/DataTableBody.tsx
packages/base-ui/src/components/data-table/DataTableContainer.tsx
packages/base-ui/src/components/data-table/DataTableExpansionToggle.tsx
packages/base-ui/src/components/data-table/DataTableVirtualBody.test.tsx
packages/base-ui/src/components/data-table/DataTableVirtualBody.tsx
packages/base-ui/src/components/data-table/hooks/useDataTable.ts
packages/base-ui/src/components/data-table/hooks/useTableFocusRecovery.ts
packages/base-ui/src/components/data-table/types.ts
```

`DataTable.Controlled.test.tsx`, `DataTableVirtualBody.test.tsx`, `hooks/useDataTable.ts` and `types.ts` are inherited unchanged from the source snapshot. Prepared/virtual implementation was reused, not rebuilt. No unrelated source, shared barrel or build/package configuration changes appear in the handoff inventory.

## Limitations / remaining dependencies

- No blocker to this UI-library deliverable. User approved committing/pushing the combined table contribution and opening a PR against UI main. Implementation commit after rebase: `7713e7f9c5bd9b76e92c0bcbdd654bb3c89e6de2`. Worktree preserved. No merge or package publication.
- Browser evidence is Chromium keyboard/accessibility-tree/DOM evidence, not a human VoiceOver/NVDA audit or Safari/Firefox coverage.
- Native Tab traversal covers mounted controls; no grid/spreadsheet contract or automatic inventory-wide keyboard traversal. Disclosure recovery requires the provided toggle or documented marker; without one, the viewport is the fallback.
- Detail-local state intentionally resets on collapse/virtual unmount. Persistent query/cache/detail ownership remains the consumer's responsibility.
- P23/P24/P30 host adapter, live identity/result leases, authoritative grouped transport and production performance acceptance remain separate and open.

## Proposed central-ledger update — integration owner only

> P23/P24 (and P30 expanded presentation), presentation-only interaction subset verified in UI worktree `table-interactions`, branch `feature/resource-intelligence-table-interactions`; receipt `docs/roadmap-progress/table-interactions.md`. Reused controlled/manual keyed virtual table; added native labeled disclosures, interactive/nested row-action boundaries and mounted-DOM focus recovery across collapse/reorder/removal/scroll. Scoped table suite 50/50 and base-ui typecheck pass; Storybook Chromium keyboard/DOM smoke verifies independent nested behavior and bounded detail mounts with 2,000 prepared fixtures. Independent review Important findings resolved. Not host/live backend integration, authoritative grouping execution or production performance acceptance; P23/P24/P30 remain incomplete.

Central tracking documents were read only. This is a proposed receipt, not an applied ledger update.
