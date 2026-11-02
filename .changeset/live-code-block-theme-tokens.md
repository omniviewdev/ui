---
'@omniviewdev/base-ui': patch
'@omniviewdev/ai-ui': patch
'@omniviewdev/editors': patch
---

Make `CodeBlock` use live syntax and semantic CSS tokens instead of fixed light/dark palettes. Custom themes now control highlighted tokens and syntax font styles without remounting code blocks, while preserving code typography, line numbers, and copying.

Publish AI UI and editors alongside base UI so their workspace peer dependencies target the same compatible base UI release.
