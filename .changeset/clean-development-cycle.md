---
'@omniviewdev/base-ui': patch
'@omniviewdev/ai-ui': patch
'@omniviewdev/editors': minor
---

Clean workspace lint, formatting, type checks, and UI audit errors without weakening checks or changing test assertions.

Correct React 19 JSX declarations in the pinned drag dependency and build portable root and metrics declaration bundles. Preserve the date picker's compound Calendar API without a recursive declaration.

Use maintained TanStack Table v9 subscriptions and compiler-safe virtualizer snapshots. Correct select-all header indeterminate state, preserve table caches, and replace story console callbacks with Storybook actions.

Move styling to semantic tokens, align inline-style auditing with supported CSS-variable bindings and public style passthrough, and generate formatter-clean audit reports. Resolve browser localization correctly and remove ineffective editor lazy loading.

Preserve exported metrics declarations in managed workspace builds. Invalidate table rows, pinned column layouts, and pagination totals from subscribed snapshots even when consumers narrow their table subscription. Inspect non-null assertions in the shared inline-style policy instead of allowing them to bypass checks.

Remove the exported, permanently disabled `editorSchemas.debugState()` helper and its dormant console logging. This editor cleanup is a minor release because the method was present in the public type surface; callers should remove debugState calls.
