---
"@omniviewdev/base-ui": patch
---

DataTable.VirtualBody: re-render cells when a row's data or the column definitions change, so rows updated in place with a stable `getRowId` no longer show stale values. Add `onRowClick` and `getRowProps` props.
