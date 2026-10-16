---
'@omniviewdev/base-ui': minor
---

Add sibling-only TreeList reordering and hierarchy rail guides.

- Use `reorderable` with explicit `TreeList.ReorderableItem` and `TreeList.ItemDragHandle` in edit mode. Keep `TreeList.Item` for static rows and normal navigation mode.
- Manage sibling ordering with controlled `order` / `onOrderChange` or uncontrolled `defaultOrder`. `TreeOrder` is a readonly map from parent keys (or `null` for roots) to ordered child keys. `TreeReorderEvent` reports the moved key, target key, parent key, and sibling indices. Source item data is not mutated, and moves stay within the same parent.
- Choose `indentGuide="rail"` for vertical guides aligned to parent icons or `indentGuide="connectors"` for connector guides, including virtualized trees.

Breaking boolean cutover: `indentGuide` no longer accepts booleans. Replace `indentGuide={false}` with `indentGuide="none"` (or omit it), and replace `indentGuide={true}` with `indentGuide="connectors"` to retain connector guides. Choose `"rail"` explicitly for the new vertical-only appearance. No boolean compatibility alias is provided.
