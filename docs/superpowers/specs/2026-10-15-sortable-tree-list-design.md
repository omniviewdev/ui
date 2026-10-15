# Sortable TreeList and Hierarchy Rails Design

## Summary

Enhance `@omniviewdev/base-ui` `TreeList` with optional sibling reordering, controlled and uncontrolled ordering state, explicit drag handles, non-selectable branch rows, and vertical hierarchy rails. Migrate the Kubernetes plugin's custom `DraggableNavMenu` implementation to a thin adapter over `TreeList` after the enhanced Base UI package is released.

The static tree path must not pay for drag-and-drop. Existing flattening, virtualization, selection, expansion, keyboard navigation, and ARIA behavior remain the foundation.

## Problem

The Kubernetes resource sidebar currently implements its own tree in `ui/src/components/kubernetes/sidebar/DraggableNavMenu.tsx`. It duplicates hierarchy flattening, expansion, selection, keyboard activation, indentation, and drag sensor setup because Base UI `TreeList` does not expose reorder behavior or an icon-aligned vertical rail.

Base UI already provides:

- O(visible nodes) memoized tree flattening;
- controlled and uncontrolled selection and expansion;
- optional virtualization;
- typeahead and keyboard focus;
- tree item metadata including depth, parent, last-child state, and ancestor last-child state;
- elbow-style branch connectors; and
- the `@dnd-kit` dependencies used elsewhere in Base UI.

Keeping a second tree implementation in the plugin creates behavioral drift and prevents other consumers from using reorderable navigation trees.

## Goals

1. Add reusable sibling reordering to `TreeList`.
2. Support controlled, uncontrolled, preset, and externally synchronized ordering.
3. Add a vertical-only `rail` indent guide centered under ancestor icon columns.
4. Preserve the existing elbow-style connector presentation through a clearer guide-mode API.
5. Add explicit, keyboard-accessible drag handles.
6. Permit branch rows that expand and focus without becoming selected.
7. Preserve the current static `TreeList` runtime cost when ordering and reordering are unused.
8. Demonstrate all behavior in Base UI Storybook, including a Kubernetes-shaped example.
9. Replace the plugin's custom tree implementation after the Base UI package release.

## Non-goals

- Moving nodes between parents.
- Arbitrary tree restructuring.
- Dragging virtualized nodes that are not mounted.
- Base UI persistence, serialization, presets storage, or server synchronization.
- Plugin-specific navigation, routing, badges, or storage keys in Base UI.
- Retaining `showBranchConnectors` as a deprecated alias after the clean API cutover.

## Public API

### Guide modes

```ts
export type TreeIndentGuide = 'none' | 'rail' | 'connectors';
```

`TreeListRootProps.indentGuide` defaults to `'none'`.

- `none`: indentation only.
- `rail`: vertical-only hierarchy lines aligned with ancestor icon centers.
- `connectors`: the existing vertical and horizontal elbow connectors.

`showBranchConnectors` is removed. All repository callers migrate to `indentGuide="connectors"`.

### Ordering state

```ts
export type TreeOrder = ReadonlyMap<Key | null, readonly Key[]>;

export interface TreeReorderEvent {
  activeKey: Key;
  overKey: Key;
  parentKey: Key | null;
  fromIndex: number;
  toIndex: number;
}
```

`null` identifies the root sibling group. A parent key identifies that parent's direct children. The map is sparse: consumers only need entries for explicitly ordered groups.

`TreeListRootProps` gains:

```ts
reorderable?: boolean;
order?: TreeOrder;
defaultOrder?: TreeOrder;
onOrderChange?: (
  nextOrder: TreeOrder,
  event: TreeReorderEvent,
) => void;
```

Modes:

- **Static source order:** omit all ordering props.
- **Read-only external order:** pass `order` and leave `reorderable={false}`.
- **Uncontrolled customization:** pass `reorderable` and optionally `defaultOrder`.
- **Controlled customization:** pass `reorderable`, `order`, and `onOrderChange`.
- **Uncontrolled notifications:** pass `reorderable` and `onOrderChange` without `order`.

Controlled behavior follows the existing selection and expansion conventions: when `order` is supplied, a drop emits `onOrderChange` but the rendered order changes only when the consumer supplies the next `order` value.

Entries referencing missing keys are ignored. Source keys absent from an order entry append in source order. This permits saved presets and live external data to coexist deterministically.

### Item behavior

`TreeListItemProps` gains:

```ts
selectable?: boolean;
```

The default is `true`. A non-selectable item remains focusable and may invoke its click handler or expansion action, but selection state does not change.

`TreeList` gains separate reorderable item and handle slots:

```tsx
<TreeList.ReorderableItem itemKey={node.key}>
  <TreeList.ItemDragHandle aria-label="Reorder Workload" />
  {/* remaining item slots */}
</TreeList.ReorderableItem>
```

`TreeList.Item` remains the unchanged static fast path. Consumers use `ReorderableItem` only when `reorderable` is enabled, ensuring ordinary trees do not perform an optional reorder-context lookup. The handle is an explicit button-like control that owns pointer and keyboard drag listeners. Row clicks never start a drag. Disabled items expose no active drag behavior.

## Ordering Model

The source item graph remains consumer-owned through `items` and `getChildren`. `TreeList` does not mutate or deep-clone item data.

When an order entry exists for a sibling group, TreeList applies it in linear time:

1. Build a key-to-item lookup for that sibling group.
2. Emit valid keys in the explicit order.
3. Append source items not present in the explicit order.

A valid drop is limited to nodes with equal `parentKey`. TreeList derives the sibling key list, applies an array move to that one list, clones the outer `Map`, stores the new list under the parent key, and emits the resulting map and reorder event.

Cross-parent drops, missing targets, self-drops, and disabled-item drops leave order untouched and emit nothing.

## Architecture

### Static path

The existing `useTreeFlattener` remains the no-order/no-reorder fast path. Static `TreeList.Item` does not invoke `useSortable`, create DnD sensors, subscribe to drag state, add transform styles, or add wrapper DOM.

`TreeList.Root` chooses the static path when all of the following are true:

- `reorderable` is false;
- `order` is absent; and
- `defaultOrder` is absent.

Read-only ordered trees use ordered flattening but do not mount DnD.

### Ordered flattening

Ordering is integrated before each sibling group is traversed. The ordered flattener reuses the existing DFS metadata contract and only performs key lookup work for groups with explicit entries. Groups absent from the sparse order map use their source arrays directly.

The result preserves `depth`, `parentKey`, `isLastChild`, and `ancestorIsLast`, so filtering, guide rendering, focus, and virtualization continue to use one metadata model.

### Reorderable path

The reorderable root mounts one `DndContext` and one visible-item `SortableContext`. `TreeList.ReorderableItem` invokes `useSortable`; `TreeList.Item` remains the existing static implementation and performs no reorder-context lookup.

The sortable context may contain all visible keys, but drag completion accepts only same-parent targets. Collision feedback may identify another parent; such drops are invalid and do not alter state.

The drag handle receives activator listeners through an item-local context. Drag transforms apply to the item row without changing source data during pointer movement. The controlled or uncontrolled order update occurs once on a valid drag end.

Virtualization remains enabled when requested. DnD collision detection operates on mounted rows only and never forces hidden rows to mount.

### Rail guides

`TreeList.ItemIndent` continues to consume `depth`, `ancestorIsLast`, and `isLastChild`. In `rail` mode it renders vertical-only guide segments:

- pass-through ancestor segments render only while that ancestor has later siblings;
- the current parent segment spans the full row for intermediate children;
- the current parent segment ends at the row center for the final child;
- no horizontal elbow is rendered.

CSS calculates each rail's inline position from item padding, indentation, toggle size, item gap, and icon size. The line aligns with the corresponding ancestor `ItemIcon` center without DOM measurement or layout effects.

Guide styling uses existing TreeList connector width and muted-border color variables. Rail rendering adds no JavaScript geometry and no ResizeObserver.

## Performance Invariants

1. Static trees mount no DnD provider, sensor, sortable hook, drag context, transform style, or extra wrapper.
2. Static trees continue to use the current flattener without order-processing branches in its sibling loop.
3. Ordering one sibling group clones one outer map and one sibling key array; it does not recursively clone item data.
4. Applying explicit order is O(s) for a sibling group of size s and performs no sort.
5. Rail geometry is CSS-only and uses metadata already produced by flattening.
6. Virtualization remains available in static, read-only ordered, and reorderable modes.
7. Drag movement must not rebuild the item graph or update ordering state before drag end.
8. Static benchmark regression is a release blocker if it exceeds normal benchmark variance in repeated same-machine runs.

## Accessibility and Interaction

- Root keeps `role="tree"`; items keep `role="treeitem"`, `aria-level`, `aria-expanded`, and selection semantics.
- `selectable={false}` suppresses selection only; it does not remove focus or expansion.
- `ItemDragHandle` has an accessible label supplied by the consumer and supports dnd-kit's keyboard sensor.
- Enter/Space behavior on the row remains available for navigation or expansion; handle keyboard events do not bubble into row activation.
- Pointer drag requires a small movement activation constraint to avoid converting clicks into drags.
- Reduced-motion settings disable or minimize sortable transition animation consistently with existing Base UI motion handling.

## Storybook

Base UI `Lists/TreeList` adds permanent stories:

1. **RailGuides** — nested branches with first, middle, and last children across multiple depths.
2. **ReorderableUncontrolled** — local customization from source order.
3. **ReorderableControlledPreset** — externally replaceable presets and reset behavior.
4. **ReorderableVirtualized** — a large tree proving mounted-row bounds remain virtualized.
5. **KubernetesSidebar** — Workload, Config, Networking, Storage, Access Control, Admission Control, Helm, and CRD-style rows with an edit-mode toggle and icon-aligned rails.

After release, the plugin adds a focused story for its real adapter, styles, persisted order conversion, icons, badges, and selection behavior.

## Testing

### Base UI behavior tests

- Uncontrolled reorder changes visible sibling order and emits the next sparse order map.
- Controlled reorder emits the proposed map but remains rendered from supplied state until the prop changes.
- Replacing controlled order from an external source changes rendering.
- Default order initializes uncontrolled state.
- Missing preset keys append in source order.
- Root and nested sibling order entries remain independent.
- Cross-parent, disabled, self, cancelled, and missing-target drops do nothing.
- Keyboard drag through the explicit handle reorders without triggering row activation.
- `selectable={false}` branch rows focus and expand without becoming selected.
- `rail` emits vertical-only guide metadata and terminates the final child segment at row center.
- `connectors` retains current elbow metadata after the API cutover.
- Static trees do not expose sortable state or handle behavior.
- Filtering and expansion preserve ordered sibling traversal and correct last-child metadata.

### Performance benchmarks

Retain current TreeList benchmarks and add:

- read-only ordered nested tree;
- reorderable nested tree mount;
- reorderable tree rerender after one sibling-group order change.

Run static baseline benchmarks before implementation and compare after implementation on the same machine and toolchain. Repeat runs when variance obscures the result. Investigate any consistent static regression before release.

### Smoke verification

In Base UI Storybook:

- expand and collapse nested groups;
- pointer-reorder siblings;
- keyboard-reorder siblings;
- switch controlled presets;
- toggle edit mode;
- inspect rail alignment at multiple depths in dark and light themes; and
- verify the virtualized story mounts only the visible window.

After plugin migration:

- render the screenshot-equivalent hierarchy in plugin Storybook;
- reorder Workload children;
- reload and reset persisted ordering;
- select a resource and toggle a non-selectable group;
- verify icon-centered rails; and
- repeat expand, select, and reorder once in the real cluster resource page to prove router and persistence integration.

## Kubernetes Plugin Migration

The plugin's `DraggableNavMenu` becomes a focused adapter over `TreeList`.

It retains:

- `NavSection` and `NavMenuItem` conversion;
- plugin icons and badges;
- router selection callbacks;
- edit-mode presentation;
- conversion between persisted `SidebarOrder` and Base UI `TreeOrder`; and
- plugin-specific section headings.

It removes:

- nested `DndContext` and `SortableContext` trees;
- sensor creation;
- custom sortable wrappers;
- local expansion implementation;
- recursive ancestor expansion logic superseded by controlled TreeList expansion;
- row selection and keyboard emulation;
- manual depth padding; and
- plugin-owned hierarchy guide CSS.

The persisted `SidebarOrder` storage format may remain unchanged. Conversion at the adapter boundary avoids a user-visible storage migration and keeps persistence concerns out of Base UI.

## Release Sequence and Worktrees

### Base UI repository

- Worktree: `feat/sortable-tree-list`
- Branch: `feat/sortable-tree-list`
- Deliverables: API, implementation, tests, Storybook stories, benchmarks, exports, docs, and changeset.

The changeset documents:

- new controlled/uncontrolled ordering state;
- `ItemDragHandle`;
- `selectable={false}`;
- `indentGuide` modes; and
- the `showBranchConnectors` to `indentGuide="connectors"` cutover.

### Package release gate

The enhanced `@omniviewdev/base-ui` version must be published before the plugin branch updates its frozen lockfile. The plugin must not commit source that requires an unpublished package API.

### Kubernetes plugin repository

After package publication:

- create a separate plugin worktree from `main`;
- create a dedicated feature branch;
- update `@omniviewdev/base-ui` and the lockfile to the released version;
- migrate `DraggableNavMenu` to the adapter;
- add plugin tests and Storybook coverage; and
- verify the actual cluster sidebar.

## Failure Behavior

- Invalid or cancelled drops preserve current order and emit no change.
- Missing keys in external order are ignored.
- New source keys append deterministically.
- Consumer exceptions from `onOrderChange` are not swallowed.
- A controlled consumer that declines the proposed order leaves rendering unchanged.
- Reorder support does not silently disable virtualization.
- An unavailable Base UI release blocks only plugin migration; it does not justify committing an unresolved dependency or duplicating the implementation in the plugin.
