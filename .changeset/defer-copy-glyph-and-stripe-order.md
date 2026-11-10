---
"@omniviewdev/base-ui": patch
---

Build the clipboard copy glyph on first hover or focus instead of mounting an SVG inside every hidden copy button. The labelled button stays in the DOM for keyboard and assistive-technology users, and copy feedback still appears without a prior hover.

Stripe table rows with a row-order data attribute instead of a positional `:nth-child()` selector. A positional selector made the browser restyle every mounted cell whenever a virtualized row was added or removed. Stripes now follow row order, so a virtual window that starts on an odd row, or an expanded detail row between two rows, no longer changes which rows are shaded.

Skip per-row slot objects and key strings in virtualized tables without expandable details. Row and detail item keys keep separate namespaces, so mounted rows keep their identity when details are enabled.

Reset cached row measurements when a virtualized table switches between measured and fixed-height rows. Hiding a wrapping or custom-content column no longer leaves stale offscreen row offsets and gaps in the viewport.

Seed repeated sorts from the previous result's row order, resolving every ID against the current input. Native adaptive sorting can reuse that order during sparse immutable updates instead of starting from shuffled source order again. TanStack still owns comparison, multi-sort, source-index tie ordering and nested sorting; clearing or disabling sorting restores the original source model.

Keep all rows when caller-provided IDs collide: skip the ordering hint unless it forms a complete permutation of the current input.

Keep fixed-height virtualization geometry independent of record updates. Uniform slot keys depend only on row size and index; React views still use record IDs, so reordering preserves editor state and focus. Changing the fixed height invalidates geometry immediately. Cell memoization also observes row identity and index so index-based content follows reordered records.

Allow immutable resource tables to skip repeated built-in text comparisons when the active sort values, IDs, and source positions remain unchanged. Callers opt in with `meta.dataTableImmutableRows` and must keep row originals immutable and accessors pure. Returned rows always come from the current model. A detected sort-value change stops this extra reuse path for that table instance; custom, multiple-column, and hierarchical sorts keep the existing sorting path.

Share one metric inspection tooltip root within each table instead of creating a floating root per cell. Keyboard focus targets, live values, reference details, and removed-row cleanup stay intact. Standalone metric cells retain their own tooltip roots.
