# Kubernetes navigation tree migration

## Scope and workspace

Work in the `kubernetes-tree-audit` workspace created with `omniview-dev`. The workspace contains isolated `ui`, `kubernetes`, and `omniview` worktrees. Do not change the source checkouts or launch a shared development instance.

Replace the Kubernetes resource-kind navigation tree with base-ui `TreeList`. This is not an object inventory. Resource counts, inline search, pagination, reparenting, and object-level lazy loading are outside migration parity.

Stages 1–5 are implemented in the isolated workspace. Registry adoption and final dependent-PR readiness require publishing the shared UI release. Verification below distinguishes store measurements, browser fixtures, and the real host/plugin runtime.

## 1. Shared store update costs

- Preserve immutable snapshots when selection, expansion, disabled state, or loading changes.
- Build flattened keys only when flattened nodes change. Focus and selection updates must not scan the node list.
- Copy only changed set slices. Keep old snapshots unchanged, including during silent updates before a batched emit.
- Remove unused snapshot-version state.
- Verify focus, selection, expansion, disabled updates, loading completion, and silent commits. Measure actual source code before and after with a large flattened tree.

### First increment: verified

The store now builds flattened keys during structural commits and reuses them for focus, selection, and loading updates. It copies only dirty set slices. State synchronization commits changed slices independently before one notification. Published snapshots retain their prior values, including when callers reuse mutable set inputs.

- Before: one focus update over 10,000 flattened nodes read all 10,000 keys and allocated new flattened keys and unchanged set slices.
- After: a real React hook smoke over 10,000 nodes performed 100 focus changes and a selection change with zero node-key reads. Flattened keys and unchanged sets retained identity; earlier snapshots remained unchanged.
- Focused TreeList, ordering, and store suites: 92 tests passed across three files.
- Base-ui typecheck and changed-file formatting check passed.

These first-increment checks establish store allocation behavior, not browser rendering performance. Later evidence below covers rendering and the Kubernetes adapter.

## 2. Shared viewport and keyboard performance

- Separate structural subscriptions from item-state subscriptions. Selection or focus changes must not invoke every row renderer.
- Preserve the contract that custom `renderItem` receives current expansion/loading metadata. A per-row subscription must retain this behavior without global viewport invalidation.
- Index visible keys for keyboard movement rather than repeatedly searching flattened keys.
- Batch sibling expansion instead of performing a visible-node scan and emission per branch.
- Keep accessors and structural data stable in callers. Do not rebuild flattened nodes for badge-only changes.
- Acceptance: profiling shows bounded affected-row rendering; structural changes still update rows and custom metadata correctly.

## 3. Virtualization and focus correctness

- Wire public `overscan` and `estimatedItemSize` through Root configuration to the shared virtualizer.
- Supply stable item keys to virtual measurements across filtering, expansion, and reorder.
- Expose the required scrolling operation from the shared virtualizer. Keep the active row mounted and visible after arrow movement, Home/End, and typeahead.
- Repair active keys after collapse, filter, or source removal. Prefer a visible ancestor when a branch hides the active descendant; otherwise choose a valid nearby row or clear focus for an empty tree.
- Add sibling position/count metadata to flattened rows and expose `aria-posinset` and `aria-setsize`.
- Restrict ArrowRight to an actual enabled child. Keep item-local disabled behavior consistent with root disabled state, including expansion controls.
- Ensure filtered rows report expansion consistent with the displayed tree.
- Acceptance: exercise the actual browser surface with enough rows to exceed the viewport. Verify visible focus, valid active-descendant targets, variable-height measurement, collapse/removal recovery, and screen-reader metadata.

### Shared rendering and focus increment: verified

- Custom row rendering subscribes to stable metadata snapshots. Focus and selection update the affected Items without invoking every custom renderer. Expansion/loading metadata remains live, including for memoized consumer row elements.
- Visible-key indices replace linear keyboard-position lookup. Sibling expansion proposes loaded branches in one update and retains lazy-load completion behavior.
- Virtualization forwards both tuning props, keys measurements by node identity, pins the active row, and scrolls keyboard focus into view.
- Collapse, filtering, removal, and disabled-state changes repair uncontrolled focus. Invalid controlled focus requests correction without exposing a dangling active-descendant ID.
- Sibling metadata reflects displayed order and filtered membership. Filter-revealed branches report their displayed expansion without changing saved expansion.
- ArrowRight stays inside its branch and skips disabled direct children. Item-local disabled state participates in keyboard, selection, and expansion checks. Root `disabledKeys` remains necessary for rows that have never mounted.
- Known empty child arrays are leaves unless `isBranch` explicitly declares a branch.

Verification:

- Base-ui suite: 143 files and 1,619 tests passed. Initial regressions reproduced dangling focus and incorrect filtered expansion; later regressions cover stable-row sibling metadata, drag-source lifetime, and scroll behavior across structural updates.
- Base-ui typecheck and production bundle build passed.
- Changed-file lint: zero errors; TanStack Virtual's `react-hooks/incompatible-library` warning remains. No warning suppression was added.
- Browser DOM/geometry smoke used both source components and the shipped compiled bundle/styles with 10,000 variable-height rows.
- In the compiled bundle, one focus move plus selection kept the custom-render count at eight while updating the selected row. End mounted the final destination inside the viewport with eight rows mounted; removing it focused the surviving neighbor.
- Changing overscan from zero to twenty increased mounted rows from eight to twenty-five in the measured compiled scenario. A 48px estimate produced the expected initial total height in the source scenario.
- Typeahead reached an offscreen destination in the source scenario. Filtering retained correct sibling counts and non-overlapping measured rows in both source and compiled scenarios.

Browser automation limits: the default screenshot/animation-frame helpers intermittently stalled. A dedicated headless Chrome instance provided reliable native screenshots and interaction evidence. No frame-time or production latency claim is made.

Virtualized pointer and keyboard reorder both changed the actual order in the 1,260-row shared-component story. A later stress check exposed drag-source unmounting during scroll. The virtualizer now pins the drag source independently of keyboard focus; a real-sensor regression verifies both rows survive scrolling and cancellation releases the drag pin.

The stress check also exposed a flex-layout defect: the virtual spacer declared 282,595px but computed to the 554px viewport height. Its flex shrink is now disabled so native scrolling can reach the full catalog without relying on an offscreen focused row to extend overflow.

After rebuilding through the workspace CLI, the same viewport measured 554px with a 282,659px spacer and scroll range. The baseline fixture mounted 34 rows. End reached `Kind 99-99` about 282,000px down with 36 rows mounted. At a 4,934px scroll offset during keyboard drag, the source remained mounted alongside the new window; cancellation removed its offscreen pin. Pointer reorder and reset also changed/restored the adapter order. A keyboard drop after both a watch-error update and a new catalog group retained the new group and reordered only the original siblings. Switching alpha/beta fixture connections restored their separate expansion state.

PR review exposed an unrelated-source scroll jump: appending a node reset a manually scrolled viewport from 1,400px to zero even though its active key and index did not change. Scrolling now responds to active-key/index changes rather than every flattened-array replacement. A browser check also exposed React Compiler caching direct mutable-store index reads across structural changes. Active and dragged indices now use external-store snapshots. In the compiled Storybook scenario, appending preserved 1,222px exactly; prepending changed the active index, scrolled to 30px, and kept the active descendant mounted and visible.

## 4. Activation and section representation

- Define one activation path for mouse and keyboard. Selection is route state, not a substitute for activation.
- Preserve pure-group toggling, selectable-parent routing/expansion, leaf routing, and repeat activation of the selected destination.
- Decide whether activation needs a shared callback after checking existing TreeList consumer contracts. Do not require plugin-specific routing in base-ui.
- Represent sections explicitly so sibling-only reorder cannot cross section boundaries. Avoid introducing unnecessary visual or keyboard changes through synthetic selectable rows.
- Preserve explicit drag handles, keyboard dragging, and edit-mode-only sortable hooks.
- Acceptance: groups never navigate to invalid group IDs; destination activation works with mouse and Enter/Space; section boundaries hold for pointer and keyboard drag.

## 5. Kubernetes adapter and data efficiency

- Replace `components/kubernetes/sidebar/DraggableNavMenu.tsx`; remove obsolete recursive rendering and drag code once all callers migrate.
- Preserve both full API-group and modern layouts, unknown resource kinds, contributed pages, Helm destinations, generic routes, labels, and icons.
- Preserve pathname-derived selection, encoded resource IDs, and automatic selected-ancestor expansion.
- Preserve connection-isolated expansion storage, defaults for newly discovered nodes, global saved sibling order, edit-mode storage, and reset semantics.
- Translate the existing persisted order to `TreeOrder`; unknown saved keys must not hide new resources. Apply contributed-page ordering after injection so restored positions take effect.
- Keep catalog loading/error/retry outside the tree adapter.
- Preserve watch-state badges and global-search navigation publication without adding count subscriptions.
- Pre-index resource catalog entries instead of repeated `types.find` calls.
- Keep navigation structure stable across badge changes; subscribe badge content separately. Preserve status precedence without delaying structural catalog changes behind status debounce.
- Preserve incoming-data behavior during drag and validate the final drop against current catalog membership.
- Review empty modern categories and unavailable primary destinations explicitly; do not carry invalid routes into the adapter.
- Acceptance: switch connections, restore saved layouts, add/remove CRDs, activate extension pages, change route externally, reset order, and update watch state during a drag.

### Activation and adapter: implemented

- Shared `onAction` handles enabled mouse and Enter/Space activation independently of selection. The committed callback ref keeps action consumers stable when routing callbacks change.
- `ResourceNavTree` replaces the recursive draggable menu with one flex-bounded, virtualized TreeList. Section headings remain outside treeitems; current catalog membership and section ownership validate every drop.
- Plain rows avoid sortable hooks outside edit mode. Explicit handles preserve keyboard dragging without triggering row activation.
- The existing encoded routes, selectable-parent behavior, connection-keyed expansion, saved global sibling order, edit mode, and reset remain caller-owned. Contributed pages enter the catalog before saved order applies.
- Layout construction indexes groups and types once. Watch-state changes update keyed badge subscribers instead of rebuilding the navigation structure. Existing page-level watch summaries remain the only watch-state source.
- Empty categories and unavailable primary kinds no longer create invalid destinations. New catalog entries retain defaults while explicit collapsed state survives.

Runtime evidence includes both layouts in the actual isolated host, route-selected Pod navigation, edit handles, and a newly created `Widget` CRD reached through keyboard navigation. The owned Kind cluster and kubeconfig are separate from normal application state and production contexts.

The committed LiveCatalog story supplies a deterministic 10,101-node fixture for large-catalog, connection-state, status, and incoming-data checks. Fixture screenshots must be labeled as fixtures, not Kubernetes backend data.

### Release dependency

The host provides the plugin's shared base-ui singleton. Updating only the plugin dependency cannot enable `onAction` in an older host. Publish the shared UI release first, then update both host/runtime and plugin dependency manifests and lockfiles to real published versions. Keep dependent PRs draft until that cutover is verified.

## 6. Verification and cutover

- Run focused behavior tests for changed contracts, then the affected component suites and typechecks once implementation is stable.
- Add deterministic regression tests for consumer-visible failures, not source-text or forwarding assertions.
- Build local base-ui packages and use workspace CLI linking/lifecycle commands to run the isolated host/plugin. Generate Wails bindings only with `task bindings` if needed; use `GOWORK=off` for Go commands.
- Browser-smoke normal and edit modes, both layouts, offscreen keyboard navigation, dynamic catalog changes, and virtualized pointer/keyboard reorder.
- Compare update profiles using realistic resource-kind catalogs and a synthetic large CRD catalog. Record mounted rows, affected-row renders, focus/selection work, status updates, and layout/reorder latency. Do not infer DOM performance from store-only timings.
- Update changed public API documentation, changesets, and plugin migration documentation. Remove temporary probes and superseded implementation paths.
- Do not release a partially migrated plugin. Keep each shared-component increment independently usable and verified.

Latest plugin frontend suite: 79 files passed and one skipped; 644 tests passed and three skipped. Both frontend typechecks passed. Plugin lint reported zero errors and existing warnings; shared-tree lint reported only the existing TanStack compatibility warning.

## Additional shared API findings

Review these independently before extending generic loading/filter APIs: default-expanded lazy branches do not automatically load; async completion has no cancellation/generation policy; uncontrolled filter text has no mutation action. Current Kubernetes navigation does not require these features, so they do not block parity migration. Related ordinary `List` virtualization is outside this tree migration.
