# @omniviewdev/base-ui

## 0.2.0

### Minor Changes

- [#41](https://github.com/omniviewdev/ui/pull/41) [`5ef6e1b`](https://github.com/omniviewdev/ui/commit/5ef6e1b4731a67350096efb8ac48aebf655133d1) Thanks [@joshuapare](https://github.com/joshuapare)! - - Desktop-native consistency sweep: expanded `ComponentSize` to 5-tier (`xs`/`sm`/`md`/`lg`/`xl`) and `ComponentColor` to 8 values (adds `discovery` and `secondary`). Sizing tokens shifted to desktop-native scale (18/22/26/32/40px). IconButton removes the `dense` prop in favor of size tokens.
  - Theme extensibility: third-party theme registry so consumers can register custom themes without forking.
  - Date, time, and date-range pickers with sectioned guided input.
