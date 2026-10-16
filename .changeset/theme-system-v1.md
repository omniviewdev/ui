---
'@omniviewdev/base-ui': minor
'@omniviewdev/editors': major
---

Replace the persisted uncontrolled theme provider with a controlled, owner-aware theme engine; add nine complete built-in themes, versioned custom-theme validation, and typed registry errors. Element-scoped providers now apply their full palette, while Monaco and Xterm resolve and normalize colors from the nearest active theme registration. Editors 2.0.0 removes the previous `useEditorTheme` return contract and changes `buildMonacoTheme` to accept a built-in base plus an optional themed element.
