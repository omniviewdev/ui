# Component Status

This document reflects the current implementation state in `packages/base-ui/src/components`, `packages/base-ui/src/hooks`, and `packages/base-ui/src/system`.

## Approved component set

These are the only components currently in scope and exported:

- `Accordion`
- `ActionList`
- `AppShell`
- `AlertDialog`
- `AspectRatio`
- `Autocomplete`
- `Avatar`
- `AvatarGroup`
- `Badge`
- `Banner`
- `Box`
- `Breadcrumbs`
- `Button`
- `ButtonGroup`
- `Calendar` (Beta) — calendar grid with full keyboard nav, min/max bounds, and custom disabled-cell support (internal to `DatePicker`; also exported standalone)
- `Card`
- `Checkbox`
- `CheckboxGroup`
- `Chip`
- `ClipboardText`
- `CodeBlock`
- `Combobox`
- `ConfirmButton`
- `Container`
- `ContextMenu`
- `DateField` (Beta) — sectioned guided date/time input primitive with per-section validation, paste-to-fill, and locale-aware section ordering
- `DatePicker` (Beta) — calendar popover input with full keyboard navigation, min/max constraints, and custom disabled-cell callback
- `DateRangePicker` (Beta) — dual `DateField` trigger with range-selecting calendar popover; min/max and custom separators
- `DateTimePicker` (Beta) — composition of `DatePicker` + `TimePicker` producing a combined date-and-time value
- `DescriptionList`
- `Dialog`
- `DockLayout`
- `Drawer`
- `EmptyState`
- `FormField`
- `FormSection`
- `Grid`
- `IconButton`
- `Image`
- `ImageList`
- `Input`
- `Menu`
- `MultiSelect`
- `NumberInput`
- `Pagination`
- `Paper`
- `Popover`
- `Progress`
- `Radio`
- `RadioGroup`
- `ResizableSplitPane`
- `ScrollArea`
- `SearchInput`
- `Select`
- `Separator`
- `Sheet`
- `Skeleton`
- `Slider`
- `Spinner`
- `SplitButton`
- `Stack`
- `StatusDot`
- `Stepper`
- `Switch`
- `Tabs`
- `TagInput`
- `TextField`
- `TextArea`
- `TimePicker` (Beta) — 12/24-hour time input with optional seconds display and configurable minute step
- `Toast`
- `Tooltip`
- `ToggleButton`
- `ToggleButtonGroup`
- `Toolbar`

## Approved hooks and utilities

- `statusToColor` — Maps semantic status strings to component colors (`system/status.ts`)
- `useDebouncedCallback` — Debounced callback hook with cancel/flush (`hooks/useDebouncedCallback.ts`)
- `useDebouncedValue` — Debounced value hook (`hooks/useDebouncedValue.ts`)

## Theming

- `ThemeRegistry` + `useThemeRegistry` — runtime custom theme registration with base-theme inheritance

Each approved component must include:

1. A themed wrapper using semantic token-driven CSS modules.
2. A Storybook story that renders meaningful UI (not placeholder shell output).
3. A Vitest test that verifies core rendering and token/style data propagation.

## Storybook state

- Every approved component has a composed Storybook story.
- Storybook remains the canonical visual validation path before dedicated docs pages are built.

## Token policy for new component styling

1. Reuse existing semantic tokens first (`--ov-color-*`, `--ov-space-*`, `--ov-font-*`, `--ov-radius-*`).
2. Introduce new component tokens only when needed for reusable sizing/state values.
3. Keep token additions synchronized with `docs/TOKEN_CATALOG.md` and `docs/THEME_TOKEN_MAPPING.md`.

## Resource-intelligence controls

All controls are provider-neutral presentation. Import them from `@omniviewdev/base-ui`; no component fetches full resource inventories, evaluates CEL, infers identities or implements provider acquisition.

| Area | Public components | Integration contract |
| --- | --- | --- |
| Query authoring | `QueryInput`, `QueryBuilder`, `QueryAuthoring`, `QueryVariables` | Controlled drafts; cancellable host language/conversion callbacks. Half-open UTF-8 edits are mapped to DOM UTF-16 and normalized textarea offsets. Advanced unsupported code stays intact. Host owns schema meaning, guards, numeric admission and execution. |
| Prepared tables | `useDataTable`, `DataTable.VirtualBody` | External/manual result order and state; immutable keyed rows. Arbitrary expanded content mounts only while expanded and virtually visible. Retain acquisition/cache ownership outside the renderer when it must survive scrolling. |
| Visualization | `VisualizationPanel`, `VisualizationFields`, `VisualizationBindingEditor`, `ViewLayout` | Already selected bounded values and opaque field IDs; localized errors and permission states. Controlled layout editing does not persist documents or acquire query leases. |
| Explore and scopes | `ResourceScopePicker`, `ResourceGroupingControls`, `ExploreWorkspace` | Explicit host catalog selections and applicability. Empty dimensions never silently broaden to all values. No connection opens automatically. |
| Saved configuration | `SavedResourceManager` | Host-owned select/create/rename/save/delete/reset/import/export, confirmed deletion and recoverable drafts. Formats, migrations, persistence and secret-export policy belong to the host. |
| Navigation/search | `ResourceResultNavigation`, `ResourceSearchResults` | Opaque result/context forwarding with explicit navigation `requestKey`; externally ranked results and stale/disabled states, not a search engine. |
| Inspection | `QueryExplainPanel`, `ResourceIndexManager` | Host-reported work, coverage, actual versus estimated footprint and advice. Actions require reviewed approval; no fictional disk database or guaranteed speedup. |
| Relationships | `RelationshipRuleEditor`, `RelationshipPreview` | Host catalogs, typed draft conditions and bounded preview/provenance. Host owns matching, validation, scope access and persistence; non-ready access hides cached preview navigation. |

Storybook retains focused **Components/Query Authoring**, **Components/DataTable/Prepared results** and **Components/Visualization** stories. **Resource Intelligence/Integrated Workbench** demonstrates the Monaco CEL editor, typed variables and actual development-service evaluation results. Composition-only workspace, saved-resource admission and inspector fixture showcases have been removed from the catalog; their component APIs and behavioral tests remain.

Most presentation stories use explicitly labeled fixture callbacks and prepared data. The integrated CEL workbench instead requires the [real development language service](../tools/cel-language-service/README.md): `GOWORK=off go run .` from `tools/cel-language-service`. It performs actual Go CEL parsing/checking/evaluation over realistic native Pod field shapes and independent cloud/VM profiles. Missing optional fields and runtime errors remain distinguishable from nonmatches; bindings are separate typed data, never interpolated source.

Import `CelQueryEditor` from `@omniviewdev/editors` and supply it through `QueryAuthoring.renderEditor`. The editor accepts completion, checking, hover and signature callbacks. The development fetch adapter lives under editors' `src/development/cel-language-service`, not its public production barrel. CEL highlighting is lexical; schema/type/receiver applicability comes from the service, not a client evaluator. Integer receivers do not acquire invented string methods.

Automatic language requests use a 250 ms pause; explicit completion bypasses that wait. Context/document generations and cancellation prevent obsolete responses from appearing in another editor or scope. The native `QueryInput` remains a generic presentation component for unmigrated callers, not the integrated workbench's code editor.

Editor authoring now uses a focused **LSP 3.17** adapter over the same CEL engine: full document synchronization, completion, pull diagnostics, hover, signature help and cancellation, with per-client document/version isolation. Conventional clients can launch `GOWORK=off go run . -stdio`; the browser uses JSON-RPC over loopback `POST /lsp` with server-issued sessions. UTF-16 is the default position encoding; UTF-8 is negotiated when supported. Clients must supply the documented fixture initialization context. Catalog lookup and query evaluation remain separate `/profiles` and `/evaluate` APIs; old custom authoring routes are removed. No formatting, rename, workspace indexing or semantic-token engine is advertised. See the service README for capabilities, bounds and lifecycle.

The development service's integer-only numeric profile is explicitly limited and is not the production CEL numeric policy. Code/builder conversion is unavailable in this service; advanced code stays intact, and standalone visual-builder stories remain usable. Actual Wails/live result transport, provider acquisition, durable saved documents, full schema normalization and agent/CLI integration remain separate backend work.

## Controlled visualization layout interactions

`ViewLayout` in `components/visualization` remains a presentation primitive: the host supplies immutable keyed `items`, accepts or rejects `onItemsChange` requests, renders content, and owns configuration selection. This isolated interaction change does not alter package barrels.

- Editing uses existing dnd-kit pointer/Space–arrow–Space drag, Earlier/Later buttons, and pointer/arrow-key resize. Width stays within `1..columns`; height within `1..maxRowSpan`. Resize at a bound emits no change request.
- Reordering retains keyed content and handle focus. Removal recovers a disappeared focus target to the next panel, otherwise the previous panel, otherwise the empty layout. Recovery also applies to external removals and preview transitions; it does not take focus from a connected host control.
- `disabled` and `readOnly` block layout/configuration mutation while keeping editing controls discoverable and rendered content navigable. `editing={false}` hides editing controls without unmounting live panel content.
- New controlled items or constraints invalidate active reorders. Replacing a resizing item or changing constraints/editability invalidates its pointer gesture. Exact echoes of that resize's emitted item continue the gesture; hosts cloning or normalizing the item conservatively end it. Rendering/clamping never writes back automatically.
- Unavailable content is independent of layout editing; bindings and other item metadata are retained. The host must clear selected IDs that disappear rather than retaining stale configuration selection.

The existing `KeyboardAndPointerLayoutBuilder` story exercises host replacement during active gestures, rejected edits, read-only/disabled editing, unavailable renderer fixtures and selection recovery. Save/reset remain in-memory fixture controls, not persistence. See `docs/roadmap-progress/view-layout-interactions.md` for exercised verification and integration limits. This is a P33 presentation subset, not completion of P32/P33 or dashboard integration.
