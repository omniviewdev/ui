---
"@omniviewdev/base-ui": patch
---

Fix left- and right-pinned columns in fixed-height virtual tables by keeping horizontal scrolling on the table viewport. Preserve exact row heights and clip oversized content within each cell instead of the row. Add a browser regression story covering both pinned edges, horizontal scrolling, and oversized cell content.
