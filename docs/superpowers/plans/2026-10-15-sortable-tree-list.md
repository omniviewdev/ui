# Sortable TreeList Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add high-performance controlled/uncontrolled sibling reordering and icon-aligned hierarchy rails to Base UI `TreeList`, ready for a release-gated Kubernetes plugin migration.

**Architecture:** Preserve the current static tree path and DFS loop. Ordering is a sparse `ReadonlyMap<Key | null, readonly Key[]>` applied only by an ordered flattener path; DnD providers, sensors, sortable hooks, transforms, and drag contexts mount only when `reorderable` is true. The tree remains consumer-owned and emits order maps rather than cloning item graphs.

**Tech Stack:** React 19, TypeScript 5.9, CSS Modules, Vitest, Testing Library, Storybook 10, `@dnd-kit/core`, `@dnd-kit/sortable`, `@tanstack/react-virtual`, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-15-sortable-tree-list-design.md`

## Global Constraints

- Work only in `/Users/joshuapare/Repos/omniviewdev/ui/feat/sortable-tree-list` on branch `feat/sortable-tree-list`.
- The static no-order/non-reorderable path must mount no DnD provider, sensor, sortable hook, transform style, drag context, or additional DOM wrapper.
- Keep the current static DFS sibling loop free of ordering work.
- Apply explicit sibling order in O(s) time without sorting, where s is sibling count.
- Reorder only siblings with the same `parentKey`; cross-parent movement is out of scope.
- Keep source items immutable and consumer-owned.
- Support controlled `order`, uncontrolled `defaultOrder`, and read-only external ordering.
- Keep virtualization available in all modes; dragging only targets mounted rows.
- Use test-first development for every behavior change and observe each targeted test fail for the intended reason before production edits.
- Do not modify the Kubernetes plugin until a compatible Base UI package has been published.

---

## File Map

| File | Responsibility |
|---|---|
| `packages/base-ui/src/components/tree-list/types.ts` | Public guide, order, reorder-event, and item prop contracts |
| `packages/base-ui/src/components/tree-list/order.ts` | Pure sparse-order application and sibling-move utilities |
| `packages/base-ui/src/components/tree-list/order.test.ts` | Pure ordering behavior and complexity-sensitive edge cases |
| `packages/base-ui/src/components/tree-list/hooks/useTreeFlattener.ts` | Static and ordered DFS selection while preserving static fast loop |
| `packages/base-ui/src/components/tree-list/hooks/useTreeOrder.ts` | Controlled/uncontrolled sparse order state |
| `packages/base-ui/src/components/tree-list/hooks/useTreeOrder.test.ts` | Controlled/uncontrolled hook contract |
| `packages/base-ui/src/components/tree-list/context/TreeReorderContext.tsx` | Optional reorder item/handle contract, mounted only in reorderable roots |
| `packages/base-ui/src/components/tree-list/TreeListReorder.tsx` | DnD provider, sensors, drag completion, sortable item wrapper, drag handle |
| `packages/base-ui/src/components/tree-list/TreeList.tsx` | Public compound integration, static/ordered/reorderable root selection, selectable items, guide mode |
| `packages/base-ui/src/components/tree-list/TreeList.module.css` | Rail geometry, drag handle, dragging state, reduced motion |
| `packages/base-ui/src/components/tree-list/TreeList.test.tsx` | Public behavior integration tests |
| `packages/base-ui/src/components/tree-list/TreeList.stories.tsx` | Rail, controlled/uncontrolled, virtualized, and Kubernetes-shaped stories |
| `packages/base-ui/src/components/tree-list/index.ts` | Public type exports |
| `apps/showcase/src/demos/container-management/components/tabs/FilesTab.tsx` | Connector prop cutover |
| `packages/benchmarks/src/base-ui/TreeList.bench.tsx` | Static baseline plus ordered/reorderable benchmarks |
| `.changeset/bright-trees-drag.md` | Base UI release note and connector API cutover |

---

### Task 1: Establish the Performance Baseline and Public Contracts

**Files:**
- Modify: `packages/base-ui/src/components/tree-list/types.ts`
- Modify: `packages/base-ui/src/components/tree-list/index.ts`
- Test: `packages/base-ui/src/components/tree-list/order.test.ts`
- Create: `packages/base-ui/src/components/tree-list/order.ts`
- Benchmark: `packages/benchmarks/src/base-ui/TreeList.bench.tsx`

**Interfaces:**
- Produces: `TreeIndentGuide`, `TreeOrder`, `TreeReorderEvent`, `applySiblingOrder`, and `moveSibling`.
- `applySiblingOrder<TItem>(siblings, parentKey, order, itemKey): readonly TItem[]`
- `moveSibling(order, siblingKeys, parentKey, activeKey, overKey): { order: TreeOrder; event: TreeReorderEvent } | null`

- [ ] **Step 1: Install the worktree dependencies and verify the clean baseline**

Run:

```bash
pnpm install
pnpm --filter @omniviewdev/base-ui test -- src/components/tree-list/TreeList.test.tsx
pnpm --filter @omniviewdev/base-ui typecheck
pnpm --filter @omniviewdev/benchmarks exec vitest bench --run src/base-ui/TreeList.bench.tsx
```

Record the static benchmark samples in the implementation notes. If the existing tests or typecheck fail, stop and report the baseline rather than attributing it to this feature.

- [ ] **Step 2: Write failing pure order tests**

Create `order.test.ts` covering:

```ts
it('applies explicit keys first and appends new source keys in source order', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const order: TreeOrder = new Map([[null, ['b', 'missing']]]);

  expect(applySiblingOrder(items, null, order, (item) => item.id).map((item) => item.id))
    .toEqual(['b', 'a', 'c']);
});

it('moves one sibling and returns immutable sparse order plus event metadata', () => {
  const initial: TreeOrder = new Map();
  const result = moveSibling(initial, ['a', 'b', 'c'], null, 'c', 'a');

  expect(result?.order.get(null)).toEqual(['c', 'a', 'b']);
  expect(result?.event).toEqual({
    activeKey: 'c', overKey: 'a', parentKey: null, fromIndex: 2, toIndex: 0,
  });
  expect(initial.size).toBe(0);
});

it('returns null for self, missing, and cross-group-invalid inputs', () => {
  expect(moveSibling(new Map(), ['a', 'b'], null, 'a', 'a')).toBeNull();
  expect(moveSibling(new Map(), ['a', 'b'], null, 'missing', 'a')).toBeNull();
});
```

Also cover number keys, duplicate keys in a malformed preset, empty groups, and source-array identity when no order entry exists.

- [ ] **Step 3: Run the tests and observe the expected missing-module/export failure**

Run:

```bash
pnpm --filter @omniviewdev/base-ui test -- src/components/tree-list/order.test.ts
```

Expected: FAIL because `order.ts` and the new public types do not exist.

- [ ] **Step 4: Add the public types and minimal pure utilities**

Add to `types.ts`:

```ts
export type TreeIndentGuide = 'none' | 'rail' | 'connectors';
export type TreeOrder = ReadonlyMap<Key | null, readonly Key[]>;

export interface TreeReorderEvent {
  activeKey: Key;
  overKey: Key;
  parentKey: Key | null;
  fromIndex: number;
  toIndex: number;
}
```

Implement `applySiblingOrder` using one key-to-item map and two linear passes. Return the original sibling reference when the parent has no order entry. Implement `moveSibling` by validating both indices, cloning only the sibling key array and outer map, and returning event metadata.

Export the public types from `tree-list/index.ts`; keep pure helpers package-private unless a concrete consumer need appears during plugin migration.

- [ ] **Step 5: Run targeted tests and typecheck**

Run:

```bash
pnpm --filter @omniviewdev/base-ui test -- src/components/tree-list/order.test.ts
pnpm --filter @omniviewdev/base-ui typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit the contracts and pure utilities**

```bash
git add packages/base-ui/src/components/tree-list/types.ts \
  packages/base-ui/src/components/tree-list/index.ts \
  packages/base-ui/src/components/tree-list/order.ts \
  packages/base-ui/src/components/tree-list/order.test.ts
git commit -m "feat(tree-list): add sparse ordering contracts"
```

---

### Task 2: Add Ordered Flattening and Controlled/Uncontrolled Order State

**Files:**
- Create: `packages/base-ui/src/components/tree-list/hooks/useTreeOrder.ts`
- Create: `packages/base-ui/src/components/tree-list/hooks/useTreeOrder.test.ts`
- Modify: `packages/base-ui/src/components/tree-list/hooks/useTreeFlattener.ts`
- Modify: `packages/base-ui/src/components/tree-list/hooks/useTreeState.ts`
- Modify: `packages/base-ui/src/components/tree-list/types.ts`
- Test: `packages/base-ui/src/components/tree-list/TreeList.test.tsx`

**Interfaces:**
- Consumes: `TreeOrder`, `TreeReorderEvent`, `applySiblingOrder`, `moveSibling`.
- Produces: `useTreeOrder({ order, defaultOrder, onOrderChange })` returning `{ currentOrder, proposeMove }`.
- `useTreeFlattener` gains an optional `order` used only to select the ordered DFS implementation.

- [ ] **Step 1: Write failing hook tests for controlled and uncontrolled state**

Cover:

```ts
it('updates internal order in uncontrolled mode', () => {
  const { result } = renderHook(() => useTreeOrder({ defaultOrder: new Map() }));
  act(() => result.current.proposeMove(['a', 'b'], null, 'b', 'a'));
  expect(result.current.currentOrder.get(null)).toEqual(['b', 'a']);
});

it('emits without mutating supplied controlled order', () => {
  const controlled = new Map<Key | null, readonly Key[]>();
  const onOrderChange = vi.fn();
  const { result } = renderHook(() => useTreeOrder({ order: controlled, onOrderChange }));
  act(() => result.current.proposeMove(['a', 'b'], null, 'b', 'a'));
  expect(result.current.currentOrder).toBe(controlled);
  expect(onOrderChange.mock.calls[0][0].get(null)).toEqual(['b', 'a']);
});
```

Also test callback notification in uncontrolled mode and prop replacement in controlled mode.

- [ ] **Step 2: Run hook tests and observe the expected missing-hook failure**

```bash
pnpm --filter @omniviewdev/base-ui test -- src/components/tree-list/hooks/useTreeOrder.test.ts
```

Expected: FAIL because `useTreeOrder` does not exist.

- [ ] **Step 3: Implement the order hook using existing controllable-state conventions**

Use the same controlled detection semantics as `useControllableState`. Keep `proposeMove` stable with `useCallback`; it calls `moveSibling`, updates internal state only when uncontrolled, and invokes `onOrderChange(nextOrder, event)` for both modes.

- [ ] **Step 4: Write failing TreeList tests for ordered rendering**

Add integration cases that render root and nested groups with `order`, verify missing keys append, replace the controlled map with `rerender`, and verify filtering retains ordered siblings and correct `isLastChild` metadata.

- [ ] **Step 5: Run the ordered rendering tests and observe source-order output**

```bash
pnpm --filter @omniviewdev/base-ui test -- src/components/tree-list/TreeList.test.tsx -t "order"
```

Expected: FAIL because rendering still follows source order.

- [ ] **Step 6: Add distinct static and ordered DFS functions**

Keep the existing unfiltered static `walk` loop unchanged. Add an ordered sibling resolver that calls `applySiblingOrder` only when an order entry exists. Select the static or ordered DFS once inside the existing memoized computation; do not add an ordering branch inside each static sibling iteration.

Thread `currentOrder` through ordered TreeList state only. The no-order root must continue to call the existing state path without creating order state.

- [ ] **Step 7: Run hook, TreeList, and type tests**

```bash
pnpm --filter @omniviewdev/base-ui test -- \
  src/components/tree-list/hooks/useTreeOrder.test.ts \
  src/components/tree-list/TreeList.test.tsx
pnpm --filter @omniviewdev/base-ui typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit ordered state and flattening**

```bash
git add packages/base-ui/src/components/tree-list/hooks/useTreeOrder.ts \
  packages/base-ui/src/components/tree-list/hooks/useTreeOrder.test.ts \
  packages/base-ui/src/components/tree-list/hooks/useTreeFlattener.ts \
  packages/base-ui/src/components/tree-list/hooks/useTreeState.ts \
  packages/base-ui/src/components/tree-list/types.ts \
  packages/base-ui/src/components/tree-list/TreeList.test.tsx
git commit -m "feat(tree-list): support controlled ordering"
```

---

### Task 3: Add Non-selectable Branch Rows

**Files:**
- Modify: `packages/base-ui/src/components/tree-list/types.ts`
- Modify: `packages/base-ui/src/components/tree-list/TreeList.tsx`
- Test: `packages/base-ui/src/components/tree-list/TreeList.test.tsx`

**Interfaces:**
- Produces: `TreeList.Item selectable?: boolean`, defaulting to `true`.

- [ ] **Step 1: Write a failing behavior test**

Render a branch item with `selectable={false}` and an `onClick` expansion callback. Click the row and assert the callback runs, the row becomes active, and `aria-selected` remains absent. Add a control assertion showing a normal leaf still selects.

- [ ] **Step 2: Run the targeted test and observe selection occurs incorrectly**

```bash
pnpm --filter @omniviewdev/base-ui test -- src/components/tree-list/TreeList.test.tsx -t "non-selectable"
```

Expected: FAIL because `TreeList.Item` always applies configured selection behavior.

- [ ] **Step 3: Implement the minimal selection guard**

Add `selectable = true` to `TreeListItemProps`. Keep active-key and consumer `onClick` updates unchanged; guard only the selection block with `selectable && config.selectionMode !== 'none'`.

- [ ] **Step 4: Run the targeted and complete TreeList test file**

```bash
pnpm --filter @omniviewdev/base-ui test -- src/components/tree-list/TreeList.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit non-selectable item support**

```bash
git add packages/base-ui/src/components/tree-list/types.ts \
  packages/base-ui/src/components/tree-list/TreeList.tsx \
  packages/base-ui/src/components/tree-list/TreeList.test.tsx
git commit -m "feat(tree-list): support non-selectable branches"
```

---

### Task 4: Add the Reorderable DnD Path and Explicit Drag Handle

**Files:**
- Create: `packages/base-ui/src/components/tree-list/context/TreeReorderContext.tsx`
- Create: `packages/base-ui/src/components/tree-list/TreeListReorder.tsx`
- Modify: `packages/base-ui/src/components/tree-list/TreeList.tsx`
- Modify: `packages/base-ui/src/components/tree-list/TreeList.module.css`
- Modify: `packages/base-ui/src/components/tree-list/types.ts`
- Test: `packages/base-ui/src/components/tree-list/TreeList.test.tsx`

**Interfaces:**
- Consumes: `useTreeOrder`, visible flattened keys, store node metadata, and `proposeMove`.
- Produces: `reorderable`, `TreeList.ReorderableItem`, and `TreeList.ItemDragHandle`.
- `TreeList.Item` remains unchanged and never invokes `useSortable` or reads reorder context.

- [ ] **Step 1: Write failing public behavior tests**

Add tests for:

- uncontrolled sibling drag producing visible order and callback metadata;
- controlled drag emitting without changing rendering until rerender;
- cross-parent and disabled drops emitting nothing;
- drag-handle click/keyboard events not activating the row;
- static trees rendering no drag handle semantics or sortable attributes.

Use dnd-kit keyboard interaction where jsdom supports it. For pointer collision details that jsdom cannot represent, test the pure drag-end handler with typed event fixtures rather than mocking consumer callbacks.

- [ ] **Step 2: Run the targeted tests and observe missing API failures**

```bash
pnpm --filter @omniviewdev/base-ui test -- src/components/tree-list/TreeList.test.tsx -t "reorder"
```

Expected: FAIL because reorderable root behavior, `ReorderableItem`, and `ItemDragHandle` do not exist.

- [ ] **Step 3: Implement the optional reorder contexts**

Create one root reorder context containing active ordering operations and one item activator context containing handle attributes/listeners. Both contexts default to `null`; only the reorderable root provides them.

Keep sensor creation in `TreeListReorder.tsx`:

```ts
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
);
```

Use `closestCenter` and `verticalListSortingStrategy`. On drag end, read both node metadata records, reject unequal parent keys, derive the visible sibling keys for that parent, and call `proposeMove` once.

- [ ] **Step 4: Implement the dedicated reorderable item path**

Keep `TreeList.Item` unchanged. Add `TreeList.ReorderableItem` with the same public item props and shared item behavior, but mount `useSortable` and the item activator provider only in this component. Pass transform, transition, and dragging state to the shared item DOM implementation.

Stories and consumers select the item component outside the render callback:

```ts
const TreeItem = editing ? TreeList.ReorderableItem : TreeList.Item;
```

This explicit slot is intentional: it guarantees that a static item performs no optional context lookup merely because reorder support exists in the package.

- [ ] **Step 5: Implement `ItemDragHandle` and styles**

Render a semantic `<button type="button">`, require consumer accessible naming, stop click and keyboard activation from reaching the row, and apply listeners only when reorder context exists and the item is enabled. Add token-based muted/hover colors, fixed flex sizing, grab/grabbing cursors, and reduced-motion-safe transitions.

- [ ] **Step 6: Run reorder, accessibility, full TreeList, and type checks**

```bash
pnpm --filter @omniviewdev/base-ui test -- src/components/tree-list/TreeList.test.tsx
pnpm --filter @omniviewdev/base-ui typecheck
pnpm exec eslint packages/base-ui/src/components/tree-list
```

Expected: PASS with no warnings.

- [ ] **Step 7: Commit reorderable TreeList behavior**

```bash
git add packages/base-ui/src/components/tree-list/context/TreeReorderContext.tsx \
  packages/base-ui/src/components/tree-list/TreeListReorder.tsx \
  packages/base-ui/src/components/tree-list/TreeList.tsx \
  packages/base-ui/src/components/tree-list/TreeList.module.css \
  packages/base-ui/src/components/tree-list/types.ts \
  packages/base-ui/src/components/tree-list/TreeList.test.tsx
git commit -m "feat(tree-list): add optional sibling reordering"
```

---

### Task 5: Replace the Connector Boolean with Guide Modes and Add Rails

**Files:**
- Modify: `packages/base-ui/src/components/tree-list/types.ts`
- Modify: `packages/base-ui/src/components/tree-list/hooks/useTreeState.ts`
- Modify: `packages/base-ui/src/components/tree-list/TreeList.tsx`
- Modify: `packages/base-ui/src/components/tree-list/TreeList.module.css`
- Modify: `packages/base-ui/src/components/tree-list/TreeList.test.tsx`
- Modify: `packages/base-ui/src/components/tree-list/TreeList.stories.tsx`
- Modify: `apps/showcase/src/demos/container-management/components/tabs/FilesTab.tsx`

**Interfaces:**
- Consumes: `TreeIndentGuide`.
- Produces: `indentGuide?: 'none' | 'rail' | 'connectors'`, default `'none'`.
- Removes: `showBranchConnectors` from public and internal config.

- [ ] **Step 1: Rewrite connector tests against the new API and add failing rail tests**

Migrate existing connector tests to `indentGuide="connectors"`. Add rail assertions for:

- no horizontal connector metadata;
- full-height segment on a non-last child;
- center-terminated segment on the last child;
- pass-through segments at multiple depths;
- no guide segments at depth zero; and
- `indentGuide="none"` retaining plain indentation.

Name data attributes by visual semantics, for example `data-ov-guide="rail"` and `data-ov-segment="mid|last|pass"`, rather than implementation classes.

- [ ] **Step 2: Run tests and observe missing `indentGuide` behavior**

```bash
pnpm --filter @omniviewdev/base-ui test -- src/components/tree-list/TreeList.test.tsx -t "guide"
```

Expected: FAIL because only `showBranchConnectors` exists and rails are not rendered.

- [ ] **Step 3: Implement the clean guide-mode cutover**

Replace `showBranchConnectors` in root props, config context, state memoization, stories, tests, and showcase callsites. Do not keep a compatibility alias.

For rails, reuse the existing guide segment count and tree metadata. Omit the horizontal `::after`. Position `::before` with CSS variables derived from item padding, indentation, toggle size, gap, and icon size so each segment aligns under its ancestor icon center. Do not use DOM measurement, layout effects, or observers.

- [ ] **Step 4: Add the `RailGuides` story**

Use at least three levels and include first, middle, and last children. Include icons on every branch so the visual alignment target is explicit.

- [ ] **Step 5: Run TreeList tests, showcase typecheck, and Base UI typecheck**

```bash
pnpm --filter @omniviewdev/base-ui test -- src/components/tree-list/TreeList.test.tsx
pnpm --filter @omniviewdev/base-ui typecheck
pnpm --filter @omniviewdev/showcase build
```

Expected: PASS and no remaining `showBranchConnectors` references under `packages` or `apps`.

- [ ] **Step 6: Commit guide modes and rails**

```bash
git add packages/base-ui/src/components/tree-list \
  apps/showcase/src/demos/container-management/components/tabs/FilesTab.tsx
git commit -m "feat(tree-list): add hierarchy rail guides"
```

---

### Task 6: Add Storybook Scenarios and Performance Benchmarks

**Files:**
- Modify: `packages/base-ui/src/components/tree-list/TreeList.stories.tsx`
- Modify: `packages/benchmarks/src/base-ui/TreeList.bench.tsx`
- Test: `packages/base-ui/src/components/tree-list/TreeList.test.tsx`

**Interfaces:**
- Consumes all public APIs from Tasks 1–5.
- Produces permanent stories `RailGuides`, `ReorderableUncontrolled`, `ReorderableControlledPreset`, `ReorderableVirtualized`, and `KubernetesSidebar`.

- [ ] **Step 1: Add controlled and uncontrolled Storybook state fixtures**

Use module-level stable data and callbacks where possible. The controlled preset story must provide at least two `TreeOrder` maps and a reset control. The uncontrolled story starts from `defaultOrder` and logs `onOrderChange` through Storybook actions or visible state text.

- [ ] **Step 2: Add the virtualized reorder story**

Generate enough expanded rows to exceed the viewport substantially. Keep a fixed-height container, `virtualized`, stable `itemKey/getChildren/renderItem` functions, and explicit drag handles.

- [ ] **Step 3: Add the Kubernetes-shaped story**

Model Dashboard, Nodes, Events, Namespaces, Workload children, collapsed Config/Networking/Storage/Access Control/Admission Control, expanded Helm children, and CRDs. Include an edit-mode toggle that switches `reorderable` and drag handles without replacing source data. Use `indentGuide="rail"` and icons on parent rows.

- [ ] **Step 4: Extend benchmarks**

Retain the current static benchmarks unchanged. Add:

```tsx
benchRender('mount ordered nested (50 parents x 2 children)', ...);
benchRender('mount reorderable nested (50 parents x 2 children)', ...);
benchRerender('reorder one nested sibling group', ...);
```

Use pre-generated data, stable functions, and pre-built order maps outside benchmark callbacks so setup allocations do not contaminate component measurements.

- [ ] **Step 5: Run before/after benchmark comparison**

```bash
pnpm --filter @omniviewdev/benchmarks exec vitest bench --run src/base-ui/TreeList.bench.tsx
```

Compare repeated static samples to Task 1. Any consistent static regression beyond observed baseline variance requires investigation. Prefer splitting the public reorderable item path over accepting static overhead.

- [ ] **Step 6: Build Storybook**

```bash
pnpm build-storybook
```

Expected: successful static Storybook build with no missing story imports or type errors.

- [ ] **Step 7: Commit stories and benchmarks**

```bash
git add packages/base-ui/src/components/tree-list/TreeList.stories.tsx \
  packages/benchmarks/src/base-ui/TreeList.bench.tsx
git commit -m "docs(tree-list): demonstrate sortable hierarchy guides"
```

---

### Task 7: Visual Smoke Test, Release Documentation, and Final Validation

**Files:**
- Create: `.changeset/bright-trees-drag.md`
- Modify only if behavior requires correction: files from Tasks 1–6

**Interfaces:**
- Produces a releasable Base UI branch. The plugin migration remains gated on package publication.

- [ ] **Step 1: Start Storybook and inspect the actual surface**

Run:

```bash
pnpm storybook
```

In a browser, verify:

- rails align with parent icon centers at depth 1 and depth 2;
- the final child rail ends at row center;
- connector mode still has elbows;
- pointer drag reorders only siblings;
- keyboard drag works from the handle without selecting or expanding the row;
- controlled preset replacement and reset work;
- uncontrolled ordering persists for the mounted story instance;
- edit mode adds/removes drag behavior;
- the virtualized story keeps a bounded mounted row count; and
- dark and light themes preserve sufficient guide contrast.

Capture observed behavior in the final delivery; do not claim unobserved interactions.

- [ ] **Step 2: Add the changeset**

Create a minor Base UI changeset because the package is pre-1.0 and removes `showBranchConnectors`:

```md
---
'@omniviewdev/base-ui': minor
---

Add controlled and uncontrolled sibling reordering, explicit tree drag handles, non-selectable branch rows, and icon-aligned hierarchy rail guides. Replace `showBranchConnectors` with `indentGuide="connectors"`.
```

Write the release note above to `.changeset/bright-trees-drag.md`.

- [ ] **Step 3: Run focused and full verification**

```bash
pnpm --filter @omniviewdev/base-ui test
pnpm --filter @omniviewdev/base-ui typecheck
pnpm --filter @omniviewdev/base-ui build
pnpm --filter @omniviewdev/showcase build
pnpm --filter @omniviewdev/benchmarks exec vitest bench --run src/base-ui/TreeList.bench.tsx
pnpm lint
pnpm format:check
pnpm build-storybook
```

Expected: all commands succeed without warnings attributable to this change.

- [ ] **Step 4: Review the complete diff as a consumer**

Confirm:

- every `showBranchConnectors` callsite is migrated;
- all new public types are exported;
- static TreeList markup has no DnD wrappers or attributes;
- no throwaway scripts, screenshots, benchmark output, or generated Storybook files are tracked;
- the changeset matches the public API; and
- plugin migration is not present before package publication.

- [ ] **Step 5: Commit release documentation and final corrections**

```bash
git add .changeset packages/base-ui apps/showcase packages/benchmarks
git commit -m "chore: document sortable TreeList release"
```

- [ ] **Step 6: Request code review**

Use the `requesting-code-review` skill. Resolve correctness, accessibility, API, and performance findings before declaring the Base UI branch complete.

---

## Post-release Plugin Plan

After the Base UI package is published, create a new worktree and branch from `omniview-plugin-kubernetes/main`. Do not start this phase against the current unpublished workspace build.

1. Upgrade `@omniviewdev/base-ui` and regenerate the frozen lockfile.
2. Add tests for `SidebarOrder` ↔ `TreeOrder` conversion before implementation.
3. Replace `DraggableNavMenu` internals with controlled `TreeList` composition.
4. Delete plugin-owned DnD contexts, sensors, sortable wrappers, expansion implementation, row keyboard emulation, manual indent padding, and guide CSS.
5. Add the plugin `DraggableNavMenu` Storybook story matching the reference hierarchy.
6. Verify pointer/keyboard reorder, persisted reset/reload, selection, expansion, and rail alignment in Storybook.
7. Smoke the real cluster resource page to prove router and storage integration.
