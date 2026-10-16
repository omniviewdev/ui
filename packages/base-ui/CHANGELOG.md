# @omniviewdev/base-ui

## 0.4.0

### Minor Changes

- [#49](https://github.com/omniviewdev/ui/pull/49) [`4428ab3`](https://github.com/omniviewdev/ui/commit/4428ab3e43016b952da8389d86f29a638b9e4163) Thanks [@joshuapare](https://github.com/joshuapare)! - Add sibling-only TreeList reordering and hierarchy rail guides.
  - Use `reorderable` with explicit `TreeList.ReorderableItem` and `TreeList.ItemDragHandle` in edit mode. Keep `TreeList.Item` for static rows and normal navigation mode.
  - Manage sibling ordering with controlled `order` / `onOrderChange` or uncontrolled `defaultOrder`. `TreeOrder` is a readonly map from parent keys (or `null` for roots) to ordered child keys. `TreeReorderEvent` reports the moved key, target key, parent key, and sibling indices. Source item data is not mutated, and moves stay within the same parent.
  - Saved presets ignore stale keys throughout the complete entry (O(source siblings + saved keys)); filtering and reordering preserve hidden siblings and their saved relative order. Reorder event indices refer to the complete resolved sibling group.
  - Nested drops reuse the existing visible-node index for constant-time parent lookup, without constructing another index or adding work to static trees.
  - `selectable={false}` keeps mounted rows focusable and expandable while excluding them from click, keyboard, select-all, and range selection. For virtualized trees, provide root `isItemSelectable={(item) => ...}` so selection eligibility also covers never-mounted rows. Returning false at the root is authoritative; item props can further restrict selection.
  - Choose `indentGuide="rail"` for vertical guides aligned to parent icons or `indentGuide="connectors"` for connector guides, including virtualized trees.

  Breaking boolean cutover: `indentGuide` no longer accepts booleans. Replace `indentGuide={false}` with `indentGuide="none"` (or omit it), and replace `indentGuide={true}` with `indentGuide="connectors"` to retain connector guides. Choose `"rail"` explicitly for the new vertical-only appearance. No boolean compatibility alias is provided.

## 0.3.0

### Minor Changes

- [#47](https://github.com/omniviewdev/ui/pull/47) [`c3c8135`](https://github.com/omniviewdev/ui/commit/c3c81357b667fa42c678ce972b2eba169f13c3a9) Thanks [@joshuapare](https://github.com/joshuapare)! - Replace the persisted uncontrolled theme provider with a controlled, owner-aware theme engine; add nine complete built-in themes, versioned custom-theme validation, and typed registry errors. Element-scoped providers now apply their full palette, while Monaco and Xterm resolve and normalize colors from the nearest active theme registration. Editors 2.0.0 removes the previous `useEditorTheme` return contract and changes `buildMonacoTheme` to accept a built-in base plus an optional themed element.

## 0.2.2

### Patch Changes

- [#45](https://github.com/omniviewdev/ui/pull/45) [`2a497a5`](https://github.com/omniviewdev/ui/commit/2a497a53ab5a7b34c625ed5fae3dd4d7d91db80e) Thanks [@mononen](https://github.com/mononen)! - DataTable.VirtualBody: re-render cells when a row's data or the column definitions change, so rows updated in place with a stable `getRowId` no longer show stale values. Add `onRowClick` and `getRowProps` props.

## 0.2.1

### Patch Changes

- [#43](https://github.com/omniviewdev/ui/pull/43) [`dfccc76`](https://github.com/omniviewdev/ui/commit/dfccc76c1d3bbf702f1a2dbc8d8e600d024dc1da) Thanks [@joshuapare](https://github.com/joshuapare)! - Move the `'use no memo'` directive from module top into the `useDataTable` function body so rollup stops stripping it. Restores the React Compiler opt-out for the data-table hook.

## 0.2.0

### Minor Changes

- [#41](https://github.com/omniviewdev/ui/pull/41) [`5ef6e1b`](https://github.com/omniviewdev/ui/commit/5ef6e1b4731a67350096efb8ac48aebf655133d1) Thanks [@joshuapare](https://github.com/joshuapare)! - - Desktop-native consistency sweep: expanded `ComponentSize` to 5-tier (`xs`/`sm`/`md`/`lg`/`xl`) and `ComponentColor` to 8 values (adds `discovery` and `secondary`). Sizing tokens shifted to desktop-native scale (18/22/26/32/40px). IconButton removes the `dense` prop in favor of size tokens.
  - Theme extensibility: third-party theme registry so consumers can register custom themes without forking.
  - Date, time, and date-range pickers with sectioned guided input.
