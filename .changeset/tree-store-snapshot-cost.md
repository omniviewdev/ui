---
'@omniviewdev/base-ui': patch
---

Avoid rebuilding flattened tree keys and copying unchanged state sets on focus and selection updates. Preserve immutable published snapshots and batched state notifications while committing only changed selection, expansion, and active-state slices.
