---
'@omniviewdev/base-ui': minor
---

Add sibling-only TreeList reordering and hierarchy rail guides.

- Use `reorderable` with explicit `TreeList.ReorderableItem` and `TreeList.ItemDragHandle` in edit mode. Keep `TreeList.Item` for static rows and normal navigation mode.
- Manage sibling ordering with controlled `order` / `onOrderChange` or uncontrolled `defaultOrder`. `TreeOrder` is a readonly map from parent keys (or `null` for roots) to ordered child keys. `TreeReorderEvent` reports the moved key, target key, parent key, and sibling indices. Source item data is not mutated, and moves stay within the same parent.
- Saved presets ignore stale keys throughout the complete entry (O(source siblings + saved keys)); filtering and reordering preserve hidden siblings and their saved relative order. Reorder event indices refer to the complete resolved sibling group.
- Nested drops reuse the existing visible-node index for constant-time parent lookup, without constructing another index or adding work to static trees.
- `selectable={false}` keeps mounted rows focusable and expandable while excluding them from click, keyboard, select-all, and range selection. For virtualized trees, provide root `isItemSelectable={(item) => ...}` so selection eligibility also covers never-mounted rows. Returning false at the root is authoritative; item props can further restrict selection.
- Choose `indentGuide="rail"` for vertical guides aligned to parent icons or `indentGuide="connectors"` for connector guides, including virtualized trees.

Breaking boolean cutover: `indentGuide` no longer accepts booleans. Replace `indentGuide={false}` with `indentGuide="none"` (or omit it), and replace `indentGuide={true}` with `indentGuide="connectors"` to retain connector guides. Choose `"rail"` explicitly for the new vertical-only appearance. No boolean compatibility alias is provided.
