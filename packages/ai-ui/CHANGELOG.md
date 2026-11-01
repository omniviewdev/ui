# @omniviewdev/ai-ui

## 6.1.3

### Patch Changes

- Updated dependencies [[`1a1cb32`](https://github.com/omniviewdev/ui/commit/1a1cb321741b29849e35084b890f1f8f7b6b88dd), [`0c00dc1`](https://github.com/omniviewdev/ui/commit/0c00dc1bb776626a1fc8059239914f6ba360affa), [`0c00dc1`](https://github.com/omniviewdev/ui/commit/0c00dc1bb776626a1fc8059239914f6ba360affa)]:
  - @omniviewdev/base-ui@0.10.0

## 6.1.2

### Patch Changes

- Updated dependencies [[`21ae88e`](https://github.com/omniviewdev/ui/commit/21ae88e3cf3ffe24290c1e4466151c058f2180c2)]:
  - @omniviewdev/base-ui@0.9.1

## 6.1.1

### Patch Changes

- Updated dependencies [[`4bd528b`](https://github.com/omniviewdev/ui/commit/4bd528bdac42df112d78210ab5e7b03196626814)]:
  - @omniviewdev/base-ui@0.9.0

## 6.1.0

### Minor Changes

- [#81](https://github.com/omniviewdev/ui/pull/81) [`bc10c70`](https://github.com/omniviewdev/ui/commit/bc10c70bdff94ea943aa2b098cb740d2b62ea60b) Thanks [@joshuapare](https://github.com/joshuapare)! - Upgrade the shared frontend packages to React 19.3.1 and require React and React DOM ^19.3.1. AI UI now also requires react-icons ^5.7.0. These are minor releases under the project's release policy; consumers must upgrade these peers together and account for the narrower peer contracts.

  Migrate base UI DataTable from TanStack Table 8 to 9.3.1. This is a breaking pre-1.0 API change: use the exported DataTableColumnDef, DataTableInstance, DataTableRow, and DataTableColumn types instead of Table 8 types. DataTableFeatures now describes the TanStack feature registry; use DataTableFeatureFlags for presentation toggles. Update controlled state and persisted column pinning from left/right to start/end, and columnSizingInfo to columnResizing. Consumers that use TanStack APIs directly must migrate those calls to Table 9 as well.

  Use Table 9 state subscriptions and shared feature definitions to keep sorting, filtering, grouping, selection, expansion, pagination, and column visibility reactive under the React Compiler. Preserve virtualized row updates and pinned-column geometry through resizing, unpinning, and repinning.

  Upgrade AI UI and editors Markdown rendering to react-markdown 10.1.0. Keep reasoning-stream state, editor sizing, and object-inspector search expansion synchronized with React 19 rendering. Retain Monaco 0.52.2 while updating its worker imports for the upgraded build toolchain.

### Patch Changes

- Updated dependencies [[`bc10c70`](https://github.com/omniviewdev/ui/commit/bc10c70bdff94ea943aa2b098cb740d2b62ea60b)]:
  - @omniviewdev/base-ui@0.8.0

## 6.0.2

### Patch Changes

- Updated dependencies [[`33d4122`](https://github.com/omniviewdev/ui/commit/33d412248ef4c39409e94087d976fc9621517d58)]:
  - @omniviewdev/base-ui@0.7.2

## 6.0.1

### Patch Changes

- Updated dependencies [[`85f5396`](https://github.com/omniviewdev/ui/commit/85f53969f336f14aff348894f2e83a2ed69a30a0)]:
  - @omniviewdev/base-ui@0.7.1

## 6.0.0

### Patch Changes

- Updated dependencies [[`a3c205f`](https://github.com/omniviewdev/ui/commit/a3c205f386c0593dcc27ce62d9f67e5224c35afc)]:
  - @omniviewdev/base-ui@0.7.0

## 5.0.0

### Patch Changes

- Updated dependencies [[`229a060`](https://github.com/omniviewdev/ui/commit/229a060885acea203410b1b113c68e4016d81b97), [`6c046bf`](https://github.com/omniviewdev/ui/commit/6c046bf19e332e8250d3aa66daaf5f092e600c5e)]:
  - @omniviewdev/base-ui@0.6.0

## 4.0.0

### Patch Changes

- [#57](https://github.com/omniviewdev/ui/pull/57) [`74e3d0b`](https://github.com/omniviewdev/ui/commit/74e3d0bb267a235d27e29a0499c66d150e74cc25) Thanks [@joshuapare](https://github.com/joshuapare)! - Keep the shared Markdown remark plugin list compatible with react-markdown's mutable plugin-list contract without allocating a new list per render. Give story metadata explicit public Meta types so declaration checks do not expose pnpm's private store paths.

  Emit complete declaration trees into isolated build outputs without reading or writing the active dist entry; keep rolled declarations for standalone publishing. Fail the build on declaration compiler errors instead of reporting successful output.

  Keep calendar focus and its displayed month synchronized during navigation without reciprocal update effects. Focus editable-list fields when editing starts so a deferred animation frame cannot interrupt input in another field.

  Retain pnpm's 24-hour release-age protection for third-party registry packages, exempting only the coordinated `@omniviewdev/*` release cohort.

- Updated dependencies [[`74e3d0b`](https://github.com/omniviewdev/ui/commit/74e3d0bb267a235d27e29a0499c66d150e74cc25), [`3c5b5fc`](https://github.com/omniviewdev/ui/commit/3c5b5fc0cb50bef541b536e865b5aceabb667d9a)]:
  - @omniviewdev/base-ui@0.5.0

## 3.0.3

### Patch Changes

- Updated dependencies [[`c92e05e`](https://github.com/omniviewdev/ui/commit/c92e05eb10251d59c9cf1b007b30391a6aca8bb4)]:
  - @omniviewdev/base-ui@0.4.3

## 3.0.2

### Patch Changes

- Updated dependencies [[`5ced267`](https://github.com/omniviewdev/ui/commit/5ced267acd03b140a9b4fc7485aec200bed0a39e)]:
  - @omniviewdev/base-ui@0.4.2

## 3.0.1

### Patch Changes

- [#51](https://github.com/omniviewdev/ui/pull/51) [`3ba3592`](https://github.com/omniviewdev/ui/commit/3ba35924bf90e732ada2ff21f0e67f66e02e2e8a) Thanks [@joshuapare](https://github.com/joshuapare)! - Restore a consistent boundary hierarchy across built-in themes: quiet structural rules and passive enclosures remain separate from necessary control-identification outlines, overlay perimeters, keyboard focus, selection, and semantic status accents.
  - Base UI adds public `color.border.control` and `color.border.overlay` tokens, repairs Separator custom-property cycles, and applies the appropriate roles to cards, table rules, controls, and overlays without adding outlines to intentionally borderless variants.
  - Editors use the control role for ObjectInspector search, the overlay role for CommandPalette, and muted structural rules for inspector toolbars and Markdown headings.
  - AI UI uses the control role for chat and message-editing fields and muted structural rules for conversation, artifact, code, reasoning, and tool-result dividers while retaining dedicated focus and semantic status treatments.

  Boundary guidance now documents single-owner composition and meaningful control/focus contrast rather than a blanket contrast floor for decorative lines. Theme audit coverage and the Storybook theme toolbar follow the built-in catalog, and the audit reports same-scope custom-property dependency cycles.

- Updated dependencies [[`3ba3592`](https://github.com/omniviewdev/ui/commit/3ba35924bf90e732ada2ff21f0e67f66e02e2e8a)]:
  - @omniviewdev/base-ui@0.4.1

## 3.0.0

### Patch Changes

- Updated dependencies [[`4428ab3`](https://github.com/omniviewdev/ui/commit/4428ab3e43016b952da8389d86f29a638b9e4163)]:
  - @omniviewdev/base-ui@0.4.0

## 2.0.0

### Patch Changes

- Updated dependencies [[`c3c8135`](https://github.com/omniviewdev/ui/commit/c3c81357b667fa42c678ce972b2eba169f13c3a9)]:
  - @omniviewdev/base-ui@0.3.0

## 1.0.2

### Patch Changes

- Updated dependencies [[`2a497a5`](https://github.com/omniviewdev/ui/commit/2a497a53ab5a7b34c625ed5fae3dd4d7d91db80e)]:
  - @omniviewdev/base-ui@0.2.2

## 1.0.1

### Patch Changes

- [#43](https://github.com/omniviewdev/ui/pull/43) [`dfccc76`](https://github.com/omniviewdev/ui/commit/dfccc76c1d3bbf702f1a2dbc8d8e600d024dc1da) Thanks [@joshuapare](https://github.com/joshuapare)! - Fix published `.d.ts` emission:
  - ai-ui: removed tsconfig `paths` entry that pulled base-ui source into the dts rollup (caused 77 TS6059/TS6307 errors and malformed types in 0.1.0/0.1.1). Cross-package types now resolve through the workspace package like editors does, with a vite `resolve.alias` for dev.
  - ai-ui and editors: exclude `**/*.stories.{ts,tsx}` and `**/*.test.{ts,tsx}` from the dts plugin so storybook/test files don't leak into the published types (eliminates 14 TS2742 errors).

- Updated dependencies [[`dfccc76`](https://github.com/omniviewdev/ui/commit/dfccc76c1d3bbf702f1a2dbc8d8e600d024dc1da)]:
  - @omniviewdev/base-ui@0.2.1

## 1.0.0

### Patch Changes

- [#41](https://github.com/omniviewdev/ui/pull/41) [`5ef6e1b`](https://github.com/omniviewdev/ui/commit/5ef6e1b4731a67350096efb8ac48aebf655133d1) Thanks [@joshuapare](https://github.com/joshuapare)! - Fix vite config externals regex so `@omniviewdev/*` packages are correctly externalized instead of bundled.

- Updated dependencies [[`5ef6e1b`](https://github.com/omniviewdev/ui/commit/5ef6e1b4731a67350096efb8ac48aebf655133d1)]:
  - @omniviewdev/base-ui@0.2.0
