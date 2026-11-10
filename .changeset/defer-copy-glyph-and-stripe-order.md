---
"@omniviewdev/base-ui": patch
---

Build the clipboard copy glyph on first hover or focus instead of mounting an SVG inside every hidden copy button. The labelled button stays in the DOM for keyboard and assistive-technology users, and copy feedback still appears without a prior hover.

Stripe table rows with a row-order data attribute instead of a positional `:nth-child()` selector. A positional selector made the browser restyle every mounted cell whenever a virtualized row was added or removed. Stripes now follow row order, so a virtual window that starts on an odd row, or an expanded detail row between two rows, no longer changes which rows are shaded.

Skip per-row slot objects and key strings in virtualized tables without expandable details. Row and detail item keys keep separate namespaces, so mounted rows keep their identity when details are enabled.

Reset cached row measurements when a virtualized table switches between measured and fixed-height rows. Hiding a wrapping or custom-content column no longer leaves stale offscreen row offsets and gaps in the viewport.

Seed repeated sorts from the previous result's row order, resolving every ID against the current input. Native adaptive sorting can reuse that order during sparse immutable updates instead of starting from shuffled source order again. TanStack still owns comparison, multi-sort, source-index tie ordering and nested sorting; clearing or disabling sorting restores the original source model.
