---
"@omniviewdev/ai-ui": patch
"@omniviewdev/editors": patch
---

Fix published `.d.ts` emission:

- ai-ui: removed tsconfig `paths` entry that pulled base-ui source into the dts rollup (caused 77 TS6059/TS6307 errors and malformed types in 0.1.0/0.1.1). Cross-package types now resolve through the workspace package like editors does, with a vite `resolve.alias` for dev.
- ai-ui and editors: exclude `**/*.stories.{ts,tsx}` and `**/*.test.{ts,tsx}` from the dts plugin so storybook/test files don't leak into the published types (eliminates 14 TS2742 errors).
