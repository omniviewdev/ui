# @omniviewdev/base-ui

## 0.9.1

### Patch Changes

- [#87](https://github.com/omniviewdev/ui/pull/87) [`21ae88e`](https://github.com/omniviewdev/ui/commit/21ae88e3cf3ffe24290c1e4466151c058f2180c2) Thanks [@joshuapare](https://github.com/joshuapare)! - Unify neutral buttons and labeled selection controls with quiet decorative borders and opaque resting, hover, and pressed surfaces. Preserve semantic accents, keyboard focus, required input/choice boundaries, and high-contrast themes. Expose shared control-surface and decorative-border theme tokens, and document the native-control design language with contrast measurements and live workspace screenshots.

## 0.9.0

### Minor Changes

- [#84](https://github.com/omniviewdev/ui/pull/84) [`4bd528b`](https://github.com/omniviewdev/ui/commit/4bd528bdac42df112d78210ab5e7b03196626814) Thanks [@mononen](https://github.com/mononen)! - Let `EditorTabs` move tabs between separate documents such as native windows. `TabDragBrokerProvider` accepts a `transport` that streams a drag to other documents and receives remote hovers and drops, and the broker now resolves exactly one outcome per drag: attached elsewhere (`onTabTransferred` on the source strip), torn off (`onDetachCommit`), or cancelled (Escape or revert, `onCancel`). Strips and drop zones only exchange tabs of the same `dragType`, drop zones can set `expandY`, and a tab can opt out of detaching with `detachable: false`. `aria-label` and `aria-labelledby` name the tab list, so several strips on one page can be told apart.

  The transport and `onDetachCommit` receive the pointer in both client and screen coordinates. Screen coordinates are not global in every webview (WebKitGTK reports them relative to the native window), so a host that places native windows should map the client point with its own window bounds.

  Breaking for direct broker users: `beginSession(session, pointer)` takes a pointer with client and screen coordinates, and in broker mode `onDetachCommit` fires only for a tear-off.

## 0.8.0

### Minor Changes

- [#81](https://github.com/omniviewdev/ui/pull/81) [`bc10c70`](https://github.com/omniviewdev/ui/commit/bc10c70bdff94ea943aa2b098cb740d2b62ea60b) Thanks [@joshuapare](https://github.com/joshuapare)! - Upgrade the shared frontend packages to React 19.3.1 and require React and React DOM ^19.3.1. AI UI now also requires react-icons ^5.7.0. These are minor releases under the project's release policy; consumers must upgrade these peers together and account for the narrower peer contracts.

  Migrate base UI DataTable from TanStack Table 8 to 9.3.1. This is a breaking pre-1.0 API change: use the exported DataTableColumnDef, DataTableInstance, DataTableRow, and DataTableColumn types instead of Table 8 types. DataTableFeatures now describes the TanStack feature registry; use DataTableFeatureFlags for presentation toggles. Update controlled state and persisted column pinning from left/right to start/end, and columnSizingInfo to columnResizing. Consumers that use TanStack APIs directly must migrate those calls to Table 9 as well.

  Use Table 9 state subscriptions and shared feature definitions to keep sorting, filtering, grouping, selection, expansion, pagination, and column visibility reactive under the React Compiler. Preserve virtualized row updates and pinned-column geometry through resizing, unpinning, and repinning.

  Upgrade AI UI and editors Markdown rendering to react-markdown 10.1.0. Keep reasoning-stream state, editor sizing, and object-inspector search expansion synchronized with React 19 rendering. Retain Monaco 0.52.2 while updating its worker imports for the upgraded build toolchain.

## 0.7.2

### Patch Changes

- [#79](https://github.com/omniviewdev/ui/pull/79) [`33d4122`](https://github.com/omniviewdev/ui/commit/33d412248ef4c39409e94087d976fc9621517d58) Thanks [@joshuapare](https://github.com/joshuapare)! - Fix left- and right-pinned columns in fixed-height virtual tables by keeping horizontal scrolling on the table viewport. Preserve exact row heights and clip oversized content within each cell instead of the row. Add a browser regression story covering both pinned edges, horizontal scrolling, and oversized cell content.

## 0.7.1

### Patch Changes

- [#76](https://github.com/omniviewdev/ui/pull/76) [`85f5396`](https://github.com/omniviewdev/ui/commit/85f53969f336f14aff348894f2e83a2ed69a30a0) Thanks [@joshuapare](https://github.com/joshuapare)! - Keep DataTable rows, headers, pagination, filters, column visibility, loading cells, and persisted state reactive when TanStack updates its stable table controller. Use the existing React Compiler opt-out at live table readers instead of copying the controller, and exercise library memoization in interaction tests.

  Share memoized layout styles across cells of each visible column, invalidating on real sizing, pinning, visibility, ordering, grouping, and column-option changes. Row data and custom cell renderers remain live and are never cached by controller identity.

## 0.7.0

### Minor Changes

- [#73](https://github.com/omniviewdev/ui/pull/73) [`a3c205f`](https://github.com/omniviewdev/ui/commit/a3c205f386c0593dcc27ce62d9f67e5224c35afc) Thanks [@joshuapare](https://github.com/joshuapare)! - Add SearchTrigger, a native search-dialog button that shares Input's shell, radius, sizing, variants, and focus styling.

  Fit trailing shortcut badges to SearchTrigger's control size with equal top, bottom, and end insets.

  Add optional Hotkey keys for accessible chords with consistent modifier sizing and a default plus separator. Existing plain children remain supported.

  Add CommandList.ItemContent, ItemMeta, and ItemDisabledReason for compact two-line command rows with aligned icons and trailing metadata. Center the complete content block within each themed item boundary across densities while keeping icons aligned with titles. Preserve existing inline row composition.

  Fix competing hover and keyboard highlights in CommandList. Keep one active row while keyboard scrolling moves content under a stationary pointer, and return selection to the pointer when it moves.

## 0.6.0

### Minor Changes

- [#69](https://github.com/omniviewdev/ui/pull/69) [`229a060`](https://github.com/omniviewdev/ui/commit/229a060885acea203410b1b113c68e4016d81b97) Thanks [@joshuapare](https://github.com/joshuapare)! - Add provider-neutral controlled query authoring, typed variable controls, visualization/binding/layout primitives and resource workspace/inspection controls. Add a compact Monaco CEL editor with contextual completion, diagnostics, hover, signature help and cancellation.

  Keep resource/query semantics outside generic UI packages. The accompanying Go CEL and LSP workbench is development-only, fixture-backed and explicitly integer-only; it is not production resource acquisition, live query transport, persistence or permission enforcement. Retain the existing prepared-table and command-palette improvements already merged into main.

### Patch Changes

- [#71](https://github.com/omniviewdev/ui/pull/71) [`6c046bf`](https://github.com/omniviewdev/ui/commit/6c046bf19e332e8250d3aa66daaf5f092e600c5e) Thanks [@joshuapare](https://github.com/joshuapare)! - Preserve focus through controlled visualization layout moves, removals and preview transitions. Invalidate stale drag/resize gestures after host updates, avoid resize requests at bounds, and support disabled/read-only editing without disabling panel content. Keep unavailable-renderer configuration intact and extend the existing focused layout story with external updates and rejected-edit fixtures.

## 0.5.0

### Minor Changes

- [#59](https://github.com/omniviewdev/ui/pull/59) [`3c5b5fc`](https://github.com/omniviewdev/ui/commit/3c5b5fc0cb50bef541b536e865b5aceabb667d9a) Thanks [@joshuapare](https://github.com/joshuapare)! - Support controlled host-prepared table state and keyed virtual detail slots. Add native labeled expansion controls, isolate interactive and nested content from row actions, and recover focus across collapse, reorder, removal and virtual unmount while preserving viewport-bounded detail mounting.

  Expansion controls accept `getAccessibleLabel(expanded, label)` so consumers can localize the complete accessible name while retaining English defaults.

### Patch Changes

- [#57](https://github.com/omniviewdev/ui/pull/57) [`74e3d0b`](https://github.com/omniviewdev/ui/commit/74e3d0bb267a235d27e29a0499c66d150e74cc25) Thanks [@joshuapare](https://github.com/joshuapare)! - Keep the shared Markdown remark plugin list compatible with react-markdown's mutable plugin-list contract without allocating a new list per render. Give story metadata explicit public Meta types so declaration checks do not expose pnpm's private store paths.

  Emit complete declaration trees into isolated build outputs without reading or writing the active dist entry; keep rolled declarations for standalone publishing. Fail the build on declaration compiler errors instead of reporting successful output.

  Keep calendar focus and its displayed month synchronized during navigation without reciprocal update effects. Focus editable-list fields when editing starts so a deferred animation frame cannot interrupt input in another field.

  Retain pnpm's 24-hour release-age protection for third-party registry packages, exempting only the coordinated `@omniviewdev/*` release cohort.

## 0.4.3

### Patch Changes

- [#55](https://github.com/omniviewdev/ui/pull/55) [`c92e05e`](https://github.com/omniviewdev/ui/commit/c92e05eb10251d59c9cf1b007b30391a6aca8bb4) Thanks [@joshuapare](https://github.com/joshuapare)! - Keep popover grid tracks and unbroken prose within the constrained surface. Give small popovers a 240px viewport-clamped minimum width and less padding than medium popovers across densities, and large popovers a 400px minimum; preserve medium default padding and gaps. Align static and collapsible NavList group headers with the list’s size-aware typography and row dimensions, and reset native button block padding for consistent badge-bearing headers.

## 0.4.2

### Patch Changes

- [#53](https://github.com/omniviewdev/ui/pull/53) [`5ced267`](https://github.com/omniviewdev/ui/commit/5ced267acd03b140a9b4fc7485aec200bed0a39e) Thanks [@joshuapare](https://github.com/joshuapare)! - Unify five-tier input, select, and button sizing across densities; keep compound fields stable when typing, selecting, and clearing; contain narrow selected-chip rows without overlapping actions; and align resting field surfaces for every public color and variant. Preserve explicit styled-button sizes and variants through Popover and Tooltip triggers while ignoring unrelated native render props. Repair RadioGroup style inheritance and compact size gradients, retain identifiable empty choice marks, and keep switch thumbs visible and contained in every state.

## Unreleased

### Minor Changes

- Add controlled provider-neutral query authoring, typed completion/diagnostic edits with UTF-8/DOM and CRLF mapping, callback-driven code/builder conversion, grouped clauses and typed variable controls. Semantic validation and execution remain host responsibilities.
- Add a controlled `QueryAuthoring.renderEditor` composition slot and presentation contracts for completion filtering/ranking/snippets, hover and signature help. Monaco remains in the editors package; base-ui does not depend on it.
- Allow an optional document URI in query-language requests so external language-service sessions can isolate editor models; native controls without model URIs remain supported.
- Add externally controlled table state and manual row-model modes, selection-eligibility invalidation, stable keyed virtual expanded-content slots and independently measured arbitrary details.
- Add prepared-value visualization panels, opaque field bindings and controlled keyboard/pointer view-layout editing.
- Add explicit resource scope/grouping controls, recoverable saved query/view/preset management with confirmed deletion, context-preserving navigation, externally ranked search results and Explore composition.
- Add host-supplied query explain/index inventory/advice, explicit index action approvals and relationship-rule/preview controls with visible coverage, denied/unavailable states, cancellation and stale-response protection.
- Retain focused query, prepared-table and visualization Storybooks and behavioral regression coverage. Remove workspace, admission and inspector composition showcases from the catalog without removing their component APIs or tests. These are reusable UI contracts, not a connected resource query engine, persisted saved-view service or production permission boundary.

### Patch Changes

- Add `DataTable.ExpansionToggle`: a native, row-labeled disclosure with accurate expanded state and Enter/Space operation. Virtual row callbacks ignore interactive descendants and nested tables. Both bodies recover focus after DOM removal/movement to the same mounted element, the parent disclosure, or the table viewport without scrolling; unrelated focused controls are left alone. Detail content still mounts only while expanded and virtually visible, and local detail state resets after unmount. Includes explicitly prepared cloud/container/hypervisor keyboard fixtures; no host/live-result integration or production performance claim.
- Preserve focus through controlled visualization layout removal, boundary moves and preview transitions; register drag activators for keyboard focus restoration. Cancel stale gestures on host layout/constraint updates, avoid resize requests at bounds, and support disabled/read-only layout editing without disabling panel content. Extend the focused layout story with controlled replacements, rejected edits and unavailable renderer fixtures; retain host-owned bindings and selection conventions.
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
