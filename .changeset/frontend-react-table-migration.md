---
"@omniviewdev/base-ui": minor
"@omniviewdev/ai-ui": major
"@omniviewdev/editors": major
---

Upgrade the shared frontend packages to React 19.3.1 and require React and React DOM ^19.3.1. AI UI now also requires react-icons ^5.7.0. Consumers must upgrade these peers together; the AI UI and editors major releases reflect the narrower peer contracts and their dependency on the new base UI release.

Migrate base UI DataTable from TanStack Table 8 to 9.3.1. This is a breaking pre-1.0 API change: use the exported DataTableColumnDef, DataTableInstance, DataTableRow, and DataTableColumn types instead of Table 8 types. DataTableFeatures now describes the TanStack feature registry; use DataTableFeatureFlags for presentation toggles. Update controlled state and persisted column pinning from left/right to start/end, and columnSizingInfo to columnResizing. Consumers that use TanStack APIs directly must migrate those calls to Table 9 as well.

Use Table 9 state subscriptions and shared feature definitions to keep sorting, filtering, grouping, selection, expansion, pagination, and column visibility reactive under the React Compiler. Preserve virtualized row updates and pinned-column geometry through resizing, unpinning, and repinning.

Upgrade AI UI and editors Markdown rendering to react-markdown 10.1.0. Keep reasoning-stream state, editor sizing, and object-inspector search expansion synchronized with React 19 rendering. Retain Monaco 0.52.2 while updating its worker imports for the upgraded build toolchain.
