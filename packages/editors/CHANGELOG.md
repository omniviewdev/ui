# @omniviewdev/editors

## 1.0.1

### Patch Changes

- [#43](https://github.com/omniviewdev/ui/pull/43) [`dfccc76`](https://github.com/omniviewdev/ui/commit/dfccc76c1d3bbf702f1a2dbc8d8e600d024dc1da) Thanks [@joshuapare](https://github.com/joshuapare)! - Fix published `.d.ts` emission:
  - ai-ui: removed tsconfig `paths` entry that pulled base-ui source into the dts rollup (caused 77 TS6059/TS6307 errors and malformed types in 0.1.0/0.1.1). Cross-package types now resolve through the workspace package like editors does, with a vite `resolve.alias` for dev.
  - ai-ui and editors: exclude `**/*.stories.{ts,tsx}` and `**/*.test.{ts,tsx}` from the dts plugin so storybook/test files don't leak into the published types (eliminates 14 TS2742 errors).

- Updated dependencies [[`dfccc76`](https://github.com/omniviewdev/ui/commit/dfccc76c1d3bbf702f1a2dbc8d8e600d024dc1da)]:
  - @omniviewdev/base-ui@0.2.1

## 1.0.0

### Patch Changes

- [#41](https://github.com/omniviewdev/ui/pull/41) [`5ef6e1b`](https://github.com/omniviewdev/ui/commit/5ef6e1b4731a67350096efb8ac48aebf655133d1) Thanks [@joshuapare](https://github.com/joshuapare)! - Fix vite config externals regex so `@omniviewdev/*` packages are correctly externalized instead of bundled.

- Updated dependencies [[`5ef6e1b`](https://github.com/omniviewdev/ui/commit/5ef6e1b4731a67350096efb8ac48aebf655133d1)]:
  - @omniviewdev/base-ui@0.2.0
