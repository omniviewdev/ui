# @omniviewdev/base-ui

## 0.4.3

### Patch Changes

- [#55](https://github.com/omniviewdev/ui/pull/55) [`c92e05e`](https://github.com/omniviewdev/ui/commit/c92e05eb10251d59c9cf1b007b30391a6aca8bb4) Thanks [@joshuapare](https://github.com/joshuapare)! - Keep popover grid tracks and unbroken prose within the constrained surface. Give small popovers a 240px viewport-clamped minimum width and less padding than medium popovers across densities, and large popovers a 400px minimum; preserve medium default padding and gaps. Align static and collapsible NavList group headers with the list’s size-aware typography and row dimensions, and reset native button block padding for consistent badge-bearing headers.

## 0.4.2

### Patch Changes

- [#53](https://github.com/omniviewdev/ui/pull/53) [`5ced267`](https://github.com/omniviewdev/ui/commit/5ced267acd03b140a9b4fc7485aec200bed0a39e) Thanks [@joshuapare](https://github.com/joshuapare)! - Unify five-tier input, select, and button sizing across densities; keep compound fields stable when typing, selecting, and clearing; contain narrow selected-chip rows without overlapping actions; and align resting field surfaces for every public color and variant. Preserve explicit styled-button sizes and variants through Popover and Tooltip triggers while ignoring unrelated native render props. Repair RadioGroup style inheritance and compact size gradients, retain identifiable empty choice marks, and keep switch thumbs visible and contained in every state.

## Unreleased

### Patch Changes

- Align Button, IconButton, Input, SearchInput, TextField, Select, MultiSelect, TagInput, and NumberInput to one five-tier height scale per density. Keep field heights stable when clearing, typing, or selecting; fit nested affordances inside their parent, retain intentional tag wrapping, and scroll narrow selected-chip rows without overlapping neighboring controls. SearchInput now supports every public size and semantic color.
- Match resting field surfaces for every public color and variant while retaining semantic accents and popup selection-state colors.
- Preserve explicit library size, color, and variant props on elements rendered by `Popover.Trigger` and `Tooltip.Trigger`; explicit trigger props take precedence over valid rendered-element style props, then inherited context. Unrelated native or generic props do not override inherited styling.
- Repair RadioGroup style inheritance for direct and compound radios, make comfortable `xl` choice marks and switch tracks larger than `lg`, keep unchecked choice marks identifiable, and restore visible, contained switch thumbs. The consistency audit now uses default form controls and distinguishes density-aware field heights from compact glyph scales.

## 0.4.1

### Patch Changes

- [#51](https://github.com/omniviewdev/ui/pull/51) [`3ba3592`](https://github.com/omniviewdev/ui/commit/3ba35924bf90e732ada2ff21f0e67f66e02e2e8a) Thanks [@joshuapare](https://github.com/joshuapare)! - Restore a consistent boundary hierarchy across built-in themes: quiet structural rules and passive enclosures remain separate from necessary control-identification outlines, overlay perimeters, keyboard focus, selection, and semantic status accents.
  - Base UI adds public `color.border.control` and `color.border.overlay` tokens, repairs Separator custom-property cycles, and applies the appropriate roles to cards, table rules, controls, and overlays without adding outlines to intentionally borderless variants.
  - Editors use the control role for ObjectInspector search, the overlay role for CommandPalette, and muted structural rules for inspector toolbars and Markdown headings.
  - AI UI uses the control role for chat and message-editing fields and muted structural rules for conversation, artifact, code, reasoning, and tool-result dividers while retaining dedicated focus and semantic status treatments.

  Boundary guidance now documents single-owner composition and meaningful control/focus contrast rather than a blanket contrast floor for decorative lines. Theme audit coverage and the Storybook theme toolbar follow the built-in catalog, and the audit reports same-scope custom-property dependency cycles.

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
