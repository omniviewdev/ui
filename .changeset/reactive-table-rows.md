---
'@omniviewdev/base-ui': patch
---

Keep DataTable rows, headers, pagination, filters, column visibility, loading cells, and persisted state reactive when TanStack updates its stable table controller. Use the existing React Compiler opt-out at live table readers instead of copying the controller, and exercise library memoization in interaction tests.
