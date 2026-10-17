# @omniviewdev/ai-ui

## 3.0.3

### Patch Changes

- Updated dependencies [[`c92e05e`](https://github.com/omniviewdev/ui/commit/c92e05eb10251d59c9cf1b007b30391a6aca8bb4)]:
  - @omniviewdev/base-ui@0.4.3

## 3.0.2

### Patch Changes

- Updated dependencies [[`5ced267`](https://github.com/omniviewdev/ui/commit/5ced267acd03b140a9b4fc7485aec200bed0a39e)]:
  - @omniviewdev/base-ui@0.4.2

## 3.0.1

### Patch Changes

- [#51](https://github.com/omniviewdev/ui/pull/51) [`3ba3592`](https://github.com/omniviewdev/ui/commit/3ba35924bf90e732ada2ff21f0e67f66e02e2e8a) Thanks [@joshuapare](https://github.com/joshuapare)! - Restore a consistent boundary hierarchy across built-in themes: quiet structural rules and passive enclosures remain separate from necessary control-identification outlines, overlay perimeters, keyboard focus, selection, and semantic status accents.
  - Base UI adds public `color.border.control` and `color.border.overlay` tokens, repairs Separator custom-property cycles, and applies the appropriate roles to cards, table rules, controls, and overlays without adding outlines to intentionally borderless variants.
  - Editors use the control role for ObjectInspector search, the overlay role for CommandPalette, and muted structural rules for inspector toolbars and Markdown headings.
  - AI UI uses the control role for chat and message-editing fields and muted structural rules for conversation, artifact, code, reasoning, and tool-result dividers while retaining dedicated focus and semantic status treatments.

  Boundary guidance now documents single-owner composition and meaningful control/focus contrast rather than a blanket contrast floor for decorative lines. Theme audit coverage and the Storybook theme toolbar follow the built-in catalog, and the audit reports same-scope custom-property dependency cycles.

- Updated dependencies [[`3ba3592`](https://github.com/omniviewdev/ui/commit/3ba35924bf90e732ada2ff21f0e67f66e02e2e8a)]:
  - @omniviewdev/base-ui@0.4.1

## 3.0.0

### Patch Changes

- Updated dependencies [[`4428ab3`](https://github.com/omniviewdev/ui/commit/4428ab3e43016b952da8389d86f29a638b9e4163)]:
  - @omniviewdev/base-ui@0.4.0

## 2.0.0

### Patch Changes

- Updated dependencies [[`c3c8135`](https://github.com/omniviewdev/ui/commit/c3c81357b667fa42c678ce972b2eba169f13c3a9)]:
  - @omniviewdev/base-ui@0.3.0

## 1.0.2

### Patch Changes

- Updated dependencies [[`2a497a5`](https://github.com/omniviewdev/ui/commit/2a497a53ab5a7b34c625ed5fae3dd4d7d91db80e)]:
  - @omniviewdev/base-ui@0.2.2

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
