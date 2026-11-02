---
"@omniviewdev/base-ui": patch
---

Let nested popovers and other popup controls consume Escape before the enclosing dialog closes, including when focus remains elsewhere in the dialog. Preserve normal dialog dismissal on the next unhandled Escape.
