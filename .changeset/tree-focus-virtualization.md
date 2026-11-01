---
'@omniviewdev/base-ui': minor
---

Improve TreeList rendering, virtualization, keyboard focus, and accessibility:

- Isolate custom row rendering from unrelated focus and selection updates while retaining live expansion and loading metadata.
- Index visible keys for keyboard movement and add `expandSiblings` to batch loaded sibling expansion while preserving lazy loading.
- Honor `overscan` and `estimatedItemSize`, key virtual measurements by node identity, and keep keyboard-active rows mounted and scrolled into view.
- Prevent flex layouts from shrinking the virtual spacer and truncating the native scroll range.
- Keep the drag source mounted independently of keyboard focus while scrolling a virtualized tree; release its pin after drop or cancellation.
- Repair focus after collapse, filtering, removal, or disabled-state changes. Invalid controlled active keys request correction without exposing a dangling active descendant.
- Add `posInSet` and `setSize` to flattened nodes and render metadata, with corresponding treeitem ARIA attributes.
- Keep filtered expansion metadata consistent with displayed children without changing saved expansion.
- Restrict ArrowRight to enabled direct children and honor item-local disabled state for keyboard, selection, and expansion actions. Use root `disabledKeys` for rows that have never mounted.
- Treat known empty child arrays as leaves unless `isBranch` explicitly declares a branch.
- Add `onAction` for enabled mouse and Enter/Space activation, independent of selection. Non-selectable groups and repeated activation of the selected destination use the same callback.

The shared list virtualizer also accepts stable item keys and optional active and dragged indices, and exposes `scrollToIndex`.
