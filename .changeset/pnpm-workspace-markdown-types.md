---
'@omniviewdev/ai-ui': patch
'@omniviewdev/base-ui': patch
'@omniviewdev/editors': patch
---

Keep the shared Markdown remark plugin list compatible with react-markdown's mutable plugin-list contract without allocating a new list per render. Give story metadata explicit public Meta types so declaration checks do not expose pnpm's private store paths.

Emit complete declaration trees into isolated build outputs without reading or writing the active dist entry; keep rolled declarations for standalone publishing. Fail the build on declaration compiler errors instead of reporting successful output.

Keep calendar focus and its displayed month synchronized during navigation without reciprocal update effects. Focus editable-list fields when editing starts so a deferred animation frame cannot interrupt input in another field.

Retain pnpm's 24-hour release-age protection for third-party registry packages, exempting only the coordinated `@omniviewdev/*` release cohort.
