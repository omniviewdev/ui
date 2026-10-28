---
'@omniviewdev/base-ui': patch
---

Keep DataTable rows, headers, pagination, filters, column visibility, loading cells, and persisted state reactive when TanStack updates its stable table controller. Use the existing React Compiler opt-out at live table readers instead of copying the controller, and exercise library memoization in interaction tests.

Share memoized layout styles across cells of each visible column, invalidating on real sizing, pinning, visibility, ordering, grouping, and column-option changes. Row data and custom cell renderers remain live and are never cached by controller identity.
