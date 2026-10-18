---
"@omniviewdev/ai-ui": patch
"@omniviewdev/base-ui": patch
"@omniviewdev/editors": patch
---

Keep the shared Markdown remark plugin list compatible with react-markdown's mutable plugin-list contract without allocating a new list per render. Give story metadata explicit public Meta types so declaration checks do not expose pnpm's private store paths.

Emit complete declaration trees into isolated build outputs without reading or writing the active dist entry; keep rolled declarations for standalone publishing. Fail the build on declaration compiler errors instead of reporting successful output.
