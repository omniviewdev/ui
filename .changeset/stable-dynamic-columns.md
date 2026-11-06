---
'@omniviewdev/base-ui': patch
---

Preserve declared column widths when columns are added, hidden, or resized. Tables scroll horizontally instead of squeezing cells below their declared widths, and regular and virtualized rows stay aligned with headers.

Let responsive components fill the cell content slot instead of collapsing inside its intrinsic-width wrapper. Preserve centered and right-aligned text.

Support punctuation-bearing column IDs through collision-free internal CSS variable keys. Callers keep their original IDs.
