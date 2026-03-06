# Theme Primitives (Proposed v1)

This document defines raw primitive values. Components do not consume these directly.

## Color primitives

### Neutral scale

| Token                      | Value     |
| -------------------------- | --------- |
| `--ov-primitive-gray-0`    | `#090a0c` |
| `--ov-primitive-gray-50`   | `#111214` |
| `--ov-primitive-gray-100`  | `#15171a` |
| `--ov-primitive-gray-150`  | `#1a1c20` |
| `--ov-primitive-gray-200`  | `#202329` |
| `--ov-primitive-gray-300`  | `#292e36` |
| `--ov-primitive-gray-400`  | `#373f4a` |
| `--ov-primitive-gray-500`  | `#4f5968` |
| `--ov-primitive-gray-600`  | `#6c7788` |
| `--ov-primitive-gray-700`  | `#9aa4b5` |
| `--ov-primitive-gray-800`  | `#c8ced8` |
| `--ov-primitive-gray-900`  | `#e2e7ee` |
| `--ov-primitive-gray-950`  | `#eef2f7` |
| `--ov-primitive-gray-1000` | `#f7f9fc` |

### Accent scale (blue)

| Token                     | Value     |
| ------------------------- | --------- |
| `--ov-primitive-blue-100` | `#dce5fb` |
| `--ov-primitive-blue-200` | `#bacbf7` |
| `--ov-primitive-blue-300` | `#89a7ee` |
| `--ov-primitive-blue-400` | `#7092e8` |
| `--ov-primitive-blue-500` | `#5a7fe2` |
| `--ov-primitive-blue-600` | `#476dce` |
| `--ov-primitive-blue-700` | `#3d5fb0` |
| `--ov-primitive-blue-800` | `#354f8f` |
| `--ov-primitive-blue-900` | `#2d4276` |

### Success scale (green)

| Token                      | Value     |
| -------------------------- | --------- |
| `--ov-primitive-green-100` | `#d8f4e5` |
| `--ov-primitive-green-200` | `#b7e8cf` |
| `--ov-primitive-green-300` | `#81d9aa` |
| `--ov-primitive-green-400` | `#57c48a` |
| `--ov-primitive-green-500` | `#3aad74` |
| `--ov-primitive-green-600` | `#2f9161` |
| `--ov-primitive-green-700` | `#297a53` |
| `--ov-primitive-green-800` | `#245f43` |
| `--ov-primitive-green-900` | `#1f4d37` |

### Warning scale (amber)

| Token                      | Value     |
| -------------------------- | --------- |
| `--ov-primitive-amber-100` | `#fdf0d8` |
| `--ov-primitive-amber-200` | `#f8deb0` |
| `--ov-primitive-amber-300` | `#efc777` |
| `--ov-primitive-amber-400` | `#e2ad4d` |
| `--ov-primitive-amber-500` | `#cf9030` |
| `--ov-primitive-amber-600` | `#b17727` |
| `--ov-primitive-amber-700` | `#946221` |
| `--ov-primitive-amber-800` | `#794f1c` |
| `--ov-primitive-amber-900` | `#654219` |

### Danger scale (red)

| Token                    | Value     |
| ------------------------ | --------- |
| `--ov-primitive-red-100` | `#f9dfdf` |
| `--ov-primitive-red-200` | `#f2c0c0` |
| `--ov-primitive-red-300` | `#e79a9a` |
| `--ov-primitive-red-400` | `#d97777` |
| `--ov-primitive-red-500` | `#c45f5f` |
| `--ov-primitive-red-600` | `#ad4f4f` |
| `--ov-primitive-red-700` | `#944444` |
| `--ov-primitive-red-800` | `#783939` |
| `--ov-primitive-red-900` | `#613131` |

### Secondary accent scale (purple)

| Token                       | Value     |
| --------------------------- | --------- |
| `--ov-primitive-purple-100` | `#ede9fe` |
| `--ov-primitive-purple-200` | `#ddd6fe` |
| `--ov-primitive-purple-300` | `#c4b5fd` |
| `--ov-primitive-purple-400` | `#a78bfa` |
| `--ov-primitive-purple-500` | `#8b5cf6` |
| `--ov-primitive-purple-600` | `#7c3aed` |
| `--ov-primitive-purple-700` | `#6d28d9` |
| `--ov-primitive-purple-800` | `#5b21b6` |
| `--ov-primitive-purple-900` | `#4c1d95` |

### Info spectrum (cyan)

| Token                     | Value     |
| ------------------------- | --------- |
| `--ov-primitive-cyan-100` | `#cffafe` |
| `--ov-primitive-cyan-200` | `#a5f3fc` |
| `--ov-primitive-cyan-300` | `#67e8f9` |
| `--ov-primitive-cyan-400` | `#22d3ee` |
| `--ov-primitive-cyan-500` | `#06b6d4` |
| `--ov-primitive-cyan-600` | `#0891b2` |
| `--ov-primitive-cyan-700` | `#0e7490` |
| `--ov-primitive-cyan-800` | `#155e75` |
| `--ov-primitive-cyan-900` | `#164e63` |

### ANSI terminal primitives

| Token                                | Value     |
| ------------------------------------ | --------- |
| `--ov-primitive-ansi-black`          | `#1f2430` |
| `--ov-primitive-ansi-red`            | `#f7768e` |
| `--ov-primitive-ansi-green`          | `#9ece6a` |
| `--ov-primitive-ansi-yellow`         | `#e0af68` |
| `--ov-primitive-ansi-blue`           | `#7aa2f7` |
| `--ov-primitive-ansi-magenta`        | `#bb9af7` |
| `--ov-primitive-ansi-cyan`           | `#7dcfff` |
| `--ov-primitive-ansi-white`          | `#c0caf5` |
| `--ov-primitive-ansi-bright-black`   | `#414868` |
| `--ov-primitive-ansi-bright-red`     | `#f7768e` |
| `--ov-primitive-ansi-bright-green`   | `#b9f27c` |
| `--ov-primitive-ansi-bright-yellow`  | `#ffcf82` |
| `--ov-primitive-ansi-bright-blue`    | `#9ab8ff` |
| `--ov-primitive-ansi-bright-magenta` | `#c7a9ff` |
| `--ov-primitive-ansi-bright-cyan`    | `#a6e3ff` |
| `--ov-primitive-ansi-bright-white`   | `#e6ecff` |

## Typography primitives

| Token                                 | Value                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `--ov-primitive-font-sans`            | `"Inter Variable", "SF Pro Text", "Segoe UI", -apple-system, sans-serif` |
| `--ov-primitive-font-mono`            | `"JetBrains Mono Variable", "SF Mono", "Cascadia Mono", monospace`       |
| `--ov-primitive-font-size-11`         | `0.6875rem`                                                              |
| `--ov-primitive-font-size-12`         | `0.75rem`                                                                |
| `--ov-primitive-font-size-13`         | `0.8125rem`                                                              |
| `--ov-primitive-font-size-14`         | `0.875rem`                                                               |
| `--ov-primitive-font-size-16`         | `1rem`                                                                   |
| `--ov-primitive-font-size-18`         | `1.125rem`                                                               |
| `--ov-primitive-font-weight-regular`  | `400`                                                                    |
| `--ov-primitive-font-weight-medium`   | `500`                                                                    |
| `--ov-primitive-font-weight-semibold` | `600`                                                                    |
| `--ov-primitive-line-height-tight`    | `1.2`                                                                    |
| `--ov-primitive-line-height-normal`   | `1.45`                                                                   |
| `--ov-primitive-line-height-relaxed`  | `1.6`                                                                    |

## Space primitives

| Token                     | Value  |
| ------------------------- | ------ |
| `--ov-primitive-space-0`  | `0px`  |
| `--ov-primitive-space-1`  | `4px`  |
| `--ov-primitive-space-2`  | `8px`  |
| `--ov-primitive-space-3`  | `12px` |
| `--ov-primitive-space-4`  | `16px` |
| `--ov-primitive-space-5`  | `20px` |
| `--ov-primitive-space-6`  | `24px` |
| `--ov-primitive-space-8`  | `32px` |
| `--ov-primitive-space-10` | `40px` |
| `--ov-primitive-space-12` | `48px` |

## Radius primitives

| Token                        | Value   |
| ---------------------------- | ------- |
| `--ov-primitive-radius-none` | `0px`   |
| `--ov-primitive-radius-sm`   | `4px`   |
| `--ov-primitive-radius-md`   | `6px`   |
| `--ov-primitive-radius-lg`   | `10px`  |
| `--ov-primitive-radius-xl`   | `14px`  |
| `--ov-primitive-radius-pill` | `999px` |

## Shadow primitives

| Token                      | Value                           |
| -------------------------- | ------------------------------- |
| `--ov-primitive-shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.24)`   |
| `--ov-primitive-shadow-md` | `0 6px 18px rgb(0 0 0 / 0.28)`  |
| `--ov-primitive-shadow-lg` | `0 16px 36px rgb(0 0 0 / 0.34)` |

## Motion primitives

| Token                            | Value                           |
| -------------------------------- | ------------------------------- |
| `--ov-primitive-duration-fast`   | `90ms`                          |
| `--ov-primitive-duration-normal` | `160ms`                         |
| `--ov-primitive-duration-slow`   | `260ms`                         |
| `--ov-primitive-ease-standard`   | `cubic-bezier(0.2, 0, 0, 1)`    |
| `--ov-primitive-ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` |

## Opacity primitives

| Token                                 | Value  |
| ------------------------------------- | ------ |
| `--ov-primitive-opacity-disabled`     | `0.45` |
| `--ov-primitive-opacity-muted`        | `0.7`  |
| `--ov-primitive-opacity-drag-preview` | `0.55` |

## Layer primitives

| Token                       | Value |
| --------------------------- | ----- |
| `--ov-primitive-z-base`     | `0`   |
| `--ov-primitive-z-sticky`   | `40`  |
| `--ov-primitive-z-dropdown` | `100` |
| `--ov-primitive-z-popover`  | `120` |
| `--ov-primitive-z-modal`    | `160` |
| `--ov-primitive-z-toast`    | `180` |
| `--ov-primitive-z-tooltip`  | `220` |

## Layout primitives

| Token                              | Value   |
| ---------------------------------- | ------- |
| `--ov-primitive-titlebar-height`   | `36px`  |
| `--ov-primitive-toolbar-height`    | `42px`  |
| `--ov-primitive-statusbar-height`  | `24px`  |
| `--ov-primitive-activitybar-width` | `46px`  |
| `--ov-primitive-sidebar-width`     | `280px` |
| `--ov-primitive-sidebar-width-min` | `220px` |
| `--ov-primitive-sidebar-width-max` | `420px` |
| `--ov-primitive-panel-width-min`   | `320px` |
| `--ov-primitive-panel-width-max`   | `860px` |
| `--ov-primitive-tab-height`        | `34px`  |
