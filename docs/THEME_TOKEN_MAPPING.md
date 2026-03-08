# Theme Token Mapping (Proposed v1)

This document maps semantic tokens to concrete values per theme mode.

## Themes

- `dark` (default)
- `light`
- `high-contrast-dark`
- `high-contrast-light`

Default visual direction:

- `dark`: native graphite baseline for Omniview
- `light`: low-glare neutral light
- `high-contrast-*`: accessibility-first modes

## Semantic color tokens

| Token                           | Dark                      | Light                    | HC Dark                   | HC Light               |
| ------------------------------- | ------------------------- | ------------------------ | ------------------------- | ---------------------- |
| `--ov-color-bg-base`            | `#141518`                 | `#f5f5f6`                | `#000000`                 | `#ffffff`              |
| `--ov-color-bg-surface`         | `#1a1c20`                 | `#ffffff`                | `#0b0b0b`                 | `#ffffff`              |
| `--ov-color-bg-surface-raised`  | `#202329`                 | `#fbfbfc`                | `#111111`                 | `#ffffff`              |
| `--ov-color-bg-surface-overlay` | `#252a31`                 | `#f7f8f9`                | `#181818`                 | `#ffffff`              |
| `--ov-color-bg-inset`           | `#111316`                 | `#eceef1`                | `#000000`                 | `#f4f4f4`              |
| `--ov-color-bg-elevated`        | `#2b3038`                 | `#ffffff`                | `#171717`                 | `#ffffff`              |
| `--ov-color-fg-default`         | `#e2e7ee`                 | `#1b1d22`                | `#ffffff`                 | `#000000`              |
| `--ov-color-fg-muted`           | `#a1a9b6`                 | `#4b5564`                | `#d7d7d7`                 | `#111111`              |
| `--ov-color-fg-subtle`          | `#7b8494`                 | `#6b7481`                | `#bcbcbc`                 | `#2d2d2d`              |
| `--ov-color-fg-disabled`        | `#5b6472`                 | `#9ea6b3`                | `#8d8d8d`                 | `#5c5c5c`              |
| `--ov-color-fg-inverse`         | `#0e1013`                 | `#f8f9fb`                | `#000000`                 | `#ffffff`              |
| `--ov-color-border-default`     | `#333944`                 | `#d4d8de`                | `#f0f0f0`                 | `#000000`              |
| `--ov-color-border-muted`       | `#2a2f37`                 | `#e4e7ec`                | `#ababab`                 | `#3a3a3a`              |
| `--ov-color-border-strong`      | `#4d5665`                 | `#7a8494`                | `#ffffff`                 | `#000000`              |
| `--ov-color-border-focus`       | `#7a96db`                 | `#476dce`                | `#ffffff`                 | `#000000`              |
| `--ov-color-brand-500`          | `#5a7fe2`                 | `#476dce`                | `#7fb3ff`                 | `#004ad7`              |
| `--ov-color-brand-400`          | `#7092e8`                 | `#5a7fe2`                | `#a6c8ff`                 | `#1d4ed8`              |
| `--ov-color-brand-300`          | `#89a7ee`                 | `#7092e8`                | `#c8deff`                 | `#2563eb`              |
| `--ov-color-accent-soft`        | `rgb(90 127 226 / 0.18)`  | `rgb(71 109 206 / 0.13)` | `rgb(127 179 255 / 0.25)` | `rgb(0 74 215 / 0.16)` |
| `--ov-color-accent-strong`      | `#89a7ee`                 | `#3d5fb0`                | `#d6e8ff`                 | `#0037a3`              |
| `--ov-color-success`            | `#3aad74`                 | `#2f9161`                | `#73ffa2`                 | `#006b2f`              |
| `--ov-color-success-soft`       | `rgb(58 173 116 / 0.17)`  | `rgb(47 145 97 / 0.12)`  | `rgb(115 255 162 / 0.25)` | `rgb(0 107 47 / 0.16)` |
| `--ov-color-warning`            | `#cf9030`                 | `#946221`                | `#ffd27d`                 | `#8a3f00`              |
| `--ov-color-warning-soft`       | `rgb(207 144 48 / 0.17)`  | `rgb(148 98 33 / 0.12)`  | `rgb(255 210 125 / 0.24)` | `rgb(138 63 0 / 0.16)` |
| `--ov-color-danger`             | `#c45f5f`                 | `#ad4f4f`                | `#ff9f9f`                 | `#8f0000`              |
| `--ov-color-danger-soft`        | `rgb(196 95 95 / 0.17)`   | `rgb(173 79 79 / 0.12)`  | `rgb(255 159 159 / 0.24)` | `rgb(143 0 0 / 0.16)`  |
| `--ov-color-info`               | `#7092e8`                 | `#476dce`                | `#b4d1ff`                 | `#0041bf`              |
| `--ov-color-info-soft`          | `rgb(112 146 232 / 0.17)` | `rgb(71 109 206 / 0.13)` | `rgb(180 209 255 / 0.24)` | `rgb(0 65 191 / 0.16)` |
| `--ov-color-state-hover`        | `rgb(161 169 182 / 0.11)` | `rgb(75 85 100 / 0.08)`  | `rgb(255 255 255 / 0.16)` | `rgb(0 0 0 / 0.08)`    |
| `--ov-color-state-pressed`      | `rgb(161 169 182 / 0.2)`  | `rgb(75 85 100 / 0.14)`  | `rgb(255 255 255 / 0.24)` | `rgb(0 0 0 / 0.14)`    |
| `--ov-color-state-selected`     | `rgb(90 127 226 / 0.2)`   | `rgb(71 109 206 / 0.14)` | `rgb(127 179 255 / 0.34)` | `rgb(0 74 215 / 0.2)`  |
| `--ov-color-state-focus-ring`   | `#7a96db`                 | `#476dce`                | `#ffffff`                 | `#000000`              |

## Shared semantic non-color tokens

| Token                                          | Value                                      |
| ---------------------------------------------- | ------------------------------------------ |
| `--ov-font-sans`                               | `var(--ov-primitive-font-sans)`            |
| `--ov-font-mono`                               | `var(--ov-primitive-font-mono)`            |
| `--ov-font-size-caption`                       | `var(--ov-primitive-font-size-12)`         |
| `--ov-font-size-body`                          | `var(--ov-primitive-font-size-14)`         |
| `--ov-font-size-title`                         | `var(--ov-primitive-font-size-18)`         |
| `--ov-font-weight-body`                        | `var(--ov-primitive-font-weight-regular)`  |
| `--ov-font-weight-label`                       | `var(--ov-primitive-font-weight-medium)`   |
| `--ov-font-weight-title`                       | `var(--ov-primitive-font-weight-semibold)` |
| `--ov-space-inline-control`                    | `var(--ov-primitive-space-3)`              |
| `--ov-space-stack-sm`                          | `var(--ov-primitive-space-2)`              |
| `--ov-space-stack-md`                          | `var(--ov-primitive-space-3)`              |
| `--ov-space-stack-lg`                          | `var(--ov-primitive-space-4)`              |
| `--ov-radius-control`                          | `var(--ov-primitive-radius-md)`            |
| `--ov-radius-surface`                          | `var(--ov-primitive-radius-lg)`            |
| `--ov-shadow-surface`                          | `var(--ov-primitive-shadow-md)`            |
| `--ov-size-button-font-size-sm`                | `var(--ov-font-size-caption)`              |
| `--ov-size-button-font-size-md`                | `var(--ov-font-size-body)`                 |
| `--ov-size-button-font-size-lg`                | `var(--ov-primitive-font-size-16)`         |
| `--ov-size-icon-button-icon-sm`                | `14px`                                     |
| `--ov-size-icon-button-icon-md`                | `16px`                                     |
| `--ov-size-icon-button-icon-lg`                | `18px`                                     |
| `--ov-size-button-group-gap`                   | `var(--ov-primitive-space-2)`              |
| `--ov-size-chip-radius`                        | `var(--ov-radius-control)`                 |
| `--ov-size-chip-group-gap`                     | `6px`                                      |
| `--ov-size-chip-height-sm`                     | `20px`                                     |
| `--ov-size-chip-height-md`                     | `24px`                                     |
| `--ov-size-chip-height-lg`                     | `28px`                                     |
| `--ov-size-chip-padding-inline-sm`             | `8px`                                      |
| `--ov-size-chip-padding-inline-md`             | `10px`                                     |
| `--ov-size-chip-padding-inline-lg`             | `12px`                                     |
| `--ov-size-chip-font-size-sm`                  | `var(--ov-primitive-font-size-11)`         |
| `--ov-size-chip-font-size-md`                  | `var(--ov-font-size-caption)`              |
| `--ov-size-chip-font-size-lg`                  | `var(--ov-primitive-font-size-13)`         |
| `--ov-size-chip-gap-sm`                        | `4px`                                      |
| `--ov-size-chip-gap-md`                        | `6px`                                      |
| `--ov-size-chip-gap-lg`                        | `8px`                                      |
| `--ov-size-chip-icon-size-sm`                  | `12px`                                     |
| `--ov-size-chip-icon-size-md`                  | `14px`                                     |
| `--ov-size-chip-icon-size-lg`                  | `16px`                                     |
| `--ov-size-avatar-sm`                          | `24px`                                     |
| `--ov-size-avatar-md`                          | `32px`                                     |
| `--ov-size-avatar-lg`                          | `40px`                                     |
| `--ov-size-avatar-font-size-sm`                | `var(--ov-font-size-caption)`              |
| `--ov-size-avatar-font-size-md`                | `var(--ov-primitive-font-size-13)`         |
| `--ov-size-avatar-font-size-lg`                | `var(--ov-font-size-body)`                 |
| `--ov-size-avatar-icon-size-sm`                | `12px`                                     |
| `--ov-size-avatar-icon-size-md`                | `16px`                                     |
| `--ov-size-avatar-icon-size-lg`                | `18px`                                     |
| `--ov-size-avatar-radius-rounded`              | `var(--ov-radius-surface)`                 |
| `--ov-size-avatar-group-overlap-sm`            | `8px`                                      |
| `--ov-size-avatar-group-overlap-md`            | `10px`                                     |
| `--ov-size-avatar-group-overlap-lg`            | `12px`                                     |
| `--ov-size-choice-control-sm`                  | `16px`                                     |
| `--ov-size-choice-control-md`                  | `18px`                                     |
| `--ov-size-choice-control-lg`                  | `20px`                                     |
| `--ov-size-choice-indicator-sm`                | `10px`                                     |
| `--ov-size-choice-indicator-md`                | `12px`                                     |
| `--ov-size-choice-indicator-lg`                | `14px`                                     |
| `--ov-size-choice-gap-sm`                      | `8px`                                      |
| `--ov-size-choice-gap-md`                      | `10px`                                     |
| `--ov-size-choice-gap-lg`                      | `12px`                                     |
| `--ov-size-choice-radius`                      | `var(--ov-primitive-radius-sm)`            |
| `--ov-size-switch-track-width-sm`              | `34px`                                     |
| `--ov-size-switch-track-width-md`              | `40px`                                     |
| `--ov-size-switch-track-width-lg`              | `46px`                                     |
| `--ov-size-switch-track-height-sm`             | `20px`                                     |
| `--ov-size-switch-track-height-md`             | `24px`                                     |
| `--ov-size-switch-track-height-lg`             | `28px`                                     |
| `--ov-size-switch-thumb-size-sm`               | `16px`                                     |
| `--ov-size-switch-thumb-size-md`               | `20px`                                     |
| `--ov-size-switch-thumb-size-lg`               | `24px`                                     |
| `--ov-size-switch-gap-sm`                      | `8px`                                      |
| `--ov-size-switch-gap-md`                      | `10px`                                     |
| `--ov-size-switch-gap-lg`                      | `12px`                                     |
| `--ov-size-list-item-gap`                      | `var(--ov-primitive-space-1)`              |
| `--ov-size-list-item-radius`                   | `var(--ov-radius-control)`                 |
| `--ov-size-list-item-height-sm`                | `24px`                                     |
| `--ov-size-list-item-height-md`                | `30px`                                     |
| `--ov-size-list-item-height-lg`                | `36px`                                     |
| `--ov-size-list-item-padding-inline-sm`        | `7px`                                      |
| `--ov-size-list-item-padding-inline-md`        | `10px`                                     |
| `--ov-size-list-item-padding-inline-lg`        | `12px`                                     |
| `--ov-size-list-group-label-font-size-sm`      | `var(--ov-font-size-caption)`              |
| `--ov-size-list-group-label-font-size-md`      | `var(--ov-primitive-font-size-13)`         |
| `--ov-size-list-group-label-font-size-lg`      | `var(--ov-font-size-body)`                 |
| `--ov-size-list-group-label-gap-top-sm`        | `2px`                                      |
| `--ov-size-list-group-label-gap-top-md`        | `4px`                                      |
| `--ov-size-list-group-label-gap-top-lg`        | `6px`                                      |
| `--ov-size-list-group-label-gap-after-sm`      | `4px`                                      |
| `--ov-size-list-group-label-gap-after-md`      | `6px`                                      |
| `--ov-size-list-group-label-gap-after-lg`      | `8px`                                      |
| `--ov-size-action-list-gap`                    | `var(--ov-primitive-space-1)`              |
| `--ov-size-card-action-font-size-sm`           | `var(--ov-font-size-caption)`              |
| `--ov-size-card-action-font-size-md`           | `var(--ov-font-size-body)`                 |
| `--ov-size-card-action-font-size-lg`           | `var(--ov-primitive-font-size-16)`         |
| `--ov-size-card-title-font-size-sm`            | `var(--ov-primitive-font-size-13)`         |
| `--ov-size-card-title-font-size-md`            | `var(--ov-font-size-body)`                 |
| `--ov-size-card-title-font-size-lg`            | `var(--ov-primitive-font-size-16)`         |
| `--ov-size-card-body-font-size-sm`             | `var(--ov-primitive-font-size-13)`         |
| `--ov-size-card-body-font-size-md`             | `var(--ov-font-size-body)`                 |
| `--ov-size-card-body-font-size-lg`             | `var(--ov-primitive-font-size-16)`         |
| `--ov-size-card-description-font-size-sm`      | `var(--ov-primitive-font-size-11)`         |
| `--ov-size-card-description-font-size-md`      | `var(--ov-font-size-caption)`              |
| `--ov-size-card-description-font-size-lg`      | `var(--ov-primitive-font-size-13)`         |
| `--ov-size-button-padding-inline-sm`           | `10px`                                     |
| `--ov-size-button-padding-inline-md`           | `12px`                                     |
| `--ov-size-button-padding-inline-lg`           | `22px`                                     |
| `--ov-size-action-list-item-padding-inline-sm` | `8px`                                      |
| `--ov-size-action-list-item-padding-inline-md` | `12px`                                     |
| `--ov-size-action-list-item-padding-inline-lg` | `14px`                                     |
| `--ov-size-action-list-icon-size-sm`           | `14px`                                     |
| `--ov-size-action-list-icon-size-md`           | `16px`                                     |
| `--ov-size-action-list-icon-size-lg`           | `18px`                                     |
| `--ov-size-action-list-shortcut-min-width-sm`  | `28px`                                     |
| `--ov-size-action-list-shortcut-min-width-md`  | `34px`                                     |
| `--ov-size-action-list-shortcut-min-width-lg`  | `40px`                                     |
| `--ov-duration-interactive`                    | `var(--ov-primitive-duration-fast)`        |
| `--ov-duration-panel`                          | `var(--ov-primitive-duration-normal)`      |
| `--ov-ease-standard`                           | `var(--ov-primitive-ease-standard)`        |

## IDE semantic alias defaults

These aliases provide full IDE coverage without forcing immediate per-feature color divergence.

### Chrome and layout aliases

| Token                        | Default mapping                     |
| ---------------------------- | ----------------------------------- |
| `--ov-color-titlebar-bg`     | `var(--ov-color-bg-surface)`        |
| `--ov-color-titlebar-fg`     | `var(--ov-color-fg-muted)`          |
| `--ov-color-menubar-bg`      | `var(--ov-color-bg-surface)`        |
| `--ov-color-activitybar-bg`  | `var(--ov-color-bg-inset)`          |
| `--ov-color-sidebar-bg`      | `var(--ov-color-bg-surface)`        |
| `--ov-color-panel-bg`        | `var(--ov-color-bg-surface-raised)` |
| `--ov-color-statusbar-bg`    | `var(--ov-color-bg-surface)`        |
| `--ov-color-statusbar-fg`    | `var(--ov-color-fg-muted)`          |
| `--ov-color-tab-active-bg`   | `var(--ov-color-bg-base)`           |
| `--ov-color-tab-inactive-bg` | `var(--ov-color-bg-surface)`        |
| `--ov-color-tab-active-fg`   | `var(--ov-color-fg-default)`        |
| `--ov-color-tab-inactive-fg` | `var(--ov-color-fg-subtle)`         |

### Editor and diff aliases

| Token                                  | Default mapping                 |
| -------------------------------------- | ------------------------------- |
| `--ov-color-editor-bg`                 | `var(--ov-color-bg-base)`       |
| `--ov-color-editor-fg`                 | `var(--ov-color-fg-default)`    |
| `--ov-color-editor-line-number`        | `var(--ov-color-fg-subtle)`     |
| `--ov-color-editor-line-number-active` | `var(--ov-color-fg-muted)`      |
| `--ov-color-editor-selection-bg`       | `var(--ov-color-accent-soft)`   |
| `--ov-color-editor-cursor`             | `var(--ov-color-accent-strong)` |
| `--ov-color-diff-insert-bg`            | `var(--ov-color-success-soft)`  |
| `--ov-color-diff-remove-bg`            | `var(--ov-color-danger-soft)`   |
| `--ov-color-diff-change-bg`            | `var(--ov-color-info-soft)`     |
| `--ov-color-gutter-added`              | `var(--ov-color-success)`       |
| `--ov-color-gutter-modified`           | `var(--ov-color-info)`          |
| `--ov-color-gutter-deleted`            | `var(--ov-color-danger)`        |

### List/input/action aliases

| Token                        | Default mapping                     |
| ---------------------------- | ----------------------------------- |
| `--ov-color-list-bg`         | `var(--ov-color-bg-surface)`        |
| `--ov-color-list-fg`         | `var(--ov-color-fg-default)`        |
| `--ov-color-list-hover-bg`   | `var(--ov-color-state-hover)`       |
| `--ov-color-list-active-bg`  | `var(--ov-color-state-selected)`    |
| `--ov-color-input-bg`        | `var(--ov-color-bg-surface-raised)` |
| `--ov-color-input-fg`        | `var(--ov-color-fg-default)`        |
| `--ov-color-input-border`    | `var(--ov-color-border-default)`    |
| `--ov-color-button-bg`       | `var(--ov-color-brand-500)`         |
| `--ov-color-button-fg`       | `var(--ov-color-fg-inverse)`        |
| `--ov-color-button-hover-bg` | `var(--ov-color-brand-400)`         |

### Terminal aliases

| Token                              | Default mapping                    |
| ---------------------------------- | ---------------------------------- |
| `--ov-color-terminal-bg`           | `var(--ov-color-bg-inset)`         |
| `--ov-color-terminal-fg`           | `var(--ov-color-fg-default)`       |
| `--ov-color-terminal-cursor`       | `var(--ov-color-accent-strong)`    |
| `--ov-color-terminal-selection-bg` | `var(--ov-color-accent-soft)`      |
| `--ov-color-ansi-black`            | `var(--ov-primitive-ansi-black)`   |
| `--ov-color-ansi-red`              | `var(--ov-primitive-ansi-red)`     |
| `--ov-color-ansi-green`            | `var(--ov-primitive-ansi-green)`   |
| `--ov-color-ansi-yellow`           | `var(--ov-primitive-ansi-yellow)`  |
| `--ov-color-ansi-blue`             | `var(--ov-primitive-ansi-blue)`    |
| `--ov-color-ansi-magenta`          | `var(--ov-primitive-ansi-magenta)` |
| `--ov-color-ansi-cyan`             | `var(--ov-primitive-ansi-cyan)`    |
| `--ov-color-ansi-white`            | `var(--ov-primitive-ansi-white)`   |

### Syntax aliases

| Token                   | Default mapping                  |
| ----------------------- | -------------------------------- |
| `--ov-syntax-comment`   | `var(--ov-color-fg-subtle)`      |
| `--ov-syntax-string`    | `var(--ov-primitive-green-400)`  |
| `--ov-syntax-number`    | `var(--ov-primitive-amber-400)`  |
| `--ov-syntax-keyword`   | `var(--ov-primitive-purple-400)` |
| `--ov-syntax-function`  | `var(--ov-primitive-blue-300)`   |
| `--ov-syntax-type`      | `var(--ov-primitive-cyan-300)`   |
| `--ov-syntax-variable`  | `var(--ov-color-fg-default)`     |
| `--ov-syntax-property`  | `var(--ov-primitive-blue-200)`   |
| `--ov-syntax-decorator` | `var(--ov-primitive-purple-300)` |
| `--ov-syntax-regexp`    | `var(--ov-primitive-red-300)`    |

Style defaults:

- `--ov-syntax-style-comment: italic`
- `--ov-syntax-style-keyword: normal`
- `--ov-syntax-style-function: normal`
- `--ov-syntax-style-type: normal`

## Omniview IDE alias defaults

Trivy/scan-specific aliases are intentionally excluded.

### Plugin lifecycle and marketplace aliases

| Token                                           | Default mapping               |
| ----------------------------------------------- | ----------------------------- |
| `--ov-color-plugin-phase-running`               | `var(--ov-color-success)`     |
| `--ov-color-plugin-phase-starting`              | `var(--ov-color-warning)`     |
| `--ov-color-plugin-phase-building`              | `var(--ov-color-warning)`     |
| `--ov-color-plugin-phase-validating`            | `var(--ov-color-warning)`     |
| `--ov-color-plugin-phase-recovering`            | `var(--ov-color-warning)`     |
| `--ov-color-plugin-phase-failed`                | `var(--ov-color-danger)`      |
| `--ov-color-plugin-phase-build-failed`          | `var(--ov-color-danger)`      |
| `--ov-color-plugin-phase-stopped`               | `var(--ov-color-fg-subtle)`   |
| `--ov-color-plugin-phase-connecting`            | `var(--ov-color-info)`        |
| `--ov-color-plugin-devmode`                     | `var(--ov-color-warning)`     |
| `--ov-color-plugin-official-badge`              | `var(--ov-color-brand-400)`   |
| `--ov-color-plugin-marketplace-rating-active`   | `var(--ov-color-warning)`     |
| `--ov-color-plugin-marketplace-rating-inactive` | `var(--ov-color-fg-disabled)` |
| `--ov-color-plugin-marketplace-download`        | `var(--ov-color-fg-muted)`    |
| `--ov-color-plugin-install-border`              | `var(--ov-color-brand-400)`   |
| `--ov-color-plugin-install-hover-bg`            | `var(--ov-color-accent-soft)` |
| `--ov-color-plugin-error-bg`                    | `var(--ov-color-danger-soft)` |
| `--ov-color-plugin-error-border`                | `var(--ov-color-danger)`      |
| `--ov-color-plugin-error-fg`                    | `var(--ov-color-danger)`      |

### Dev server and connection aliases

| Token                                          | Default mapping                |
| ---------------------------------------------- | ------------------------------ |
| `--ov-color-devserver-ready`                   | `var(--ov-color-success)`      |
| `--ov-color-devserver-building`                | `var(--ov-color-warning)`      |
| `--ov-color-devserver-error`                   | `var(--ov-color-danger)`       |
| `--ov-color-devserver-stopped`                 | `var(--ov-color-fg-subtle)`    |
| `--ov-color-devserver-connecting`              | `var(--ov-color-info)`         |
| `--ov-color-devserver-grpc-connected`          | `var(--ov-color-success)`      |
| `--ov-color-devserver-grpc-disconnected`       | `var(--ov-color-danger)`       |
| `--ov-color-devserver-action-start`            | `var(--ov-color-success)`      |
| `--ov-color-devserver-action-stop`             | `var(--ov-color-danger)`       |
| `--ov-color-devserver-action-restart-disabled` | `var(--ov-color-fg-disabled)`  |
| `--ov-color-devserver-overlay-scrim`           | `rgb(0 0 0 / 0.7)`             |
| `--ov-color-devserver-overlay-border`          | `var(--ov-color-danger)`       |
| `--ov-color-devserver-build-error`             | `var(--ov-color-danger)`       |
| `--ov-color-devserver-build-warning`           | `var(--ov-color-warning)`      |
| `--ov-color-connection-state-connected`        | `var(--ov-color-success)`      |
| `--ov-color-connection-state-syncing`          | `var(--ov-color-info)`         |
| `--ov-color-connection-state-error`            | `var(--ov-color-danger)`       |
| `--ov-color-connection-state-idle`             | `var(--ov-color-fg-subtle)`    |
| `--ov-color-connection-progress-track`         | `var(--ov-color-border-muted)` |
| `--ov-color-connection-progress-bar`           | `var(--ov-color-info)`         |
| `--ov-color-connection-group-header-bg`        | `var(--ov-color-state-hover)`  |
| `--ov-color-connection-skipped-fg`             | `var(--ov-color-fg-subtle)`    |
| `--ov-color-connection-forbidden-fg`           | `var(--ov-color-warning)`      |
| `--ov-color-connection-retry-action`           | `var(--ov-color-info)`         |
| `--ov-color-connection-disconnect-action`      | `var(--ov-color-danger)`       |

### Logs and terminal session aliases

| Token                                            | Default mapping                                  |
| ------------------------------------------------ | ------------------------------------------------ |
| `--ov-color-log-bg`                              | `var(--ov-color-bg-inset)`                       |
| `--ov-color-log-fg`                              | `var(--ov-color-fg-default)`                     |
| `--ov-color-log-muted`                           | `var(--ov-color-fg-muted)`                       |
| `--ov-color-log-line-hover-bg`                   | `var(--ov-color-state-hover)`                    |
| `--ov-color-log-system-row-bg`                   | `var(--ov-color-bg-surface)`                     |
| `--ov-color-log-level-error`                     | `var(--ov-color-danger)`                         |
| `--ov-color-log-level-warn`                      | `var(--ov-color-warning)`                        |
| `--ov-color-log-level-info`                      | `var(--ov-color-info)`                           |
| `--ov-color-log-level-debug`                     | `var(--ov-color-fg-subtle)`                      |
| `--ov-color-log-level-trace`                     | `var(--ov-color-fg-disabled)`                    |
| `--ov-color-log-search-match-bg`                 | `var(--ov-color-warning-soft)`                   |
| `--ov-color-log-search-match-active-bg`          | `var(--ov-color-warning)`                        |
| `--ov-color-log-search-match-fg`                 | `var(--ov-color-fg-inverse)`                     |
| `--ov-color-log-stream-error-banner-bg`          | `var(--ov-color-warning-soft)`                   |
| `--ov-color-log-stream-error-banner-border`      | `var(--ov-color-warning)`                        |
| `--ov-color-log-stream-error-banner-fg`          | `var(--ov-color-warning)`                        |
| `--ov-color-log-copy-flash`                      | `var(--ov-color-success-soft)`                   |
| `--ov-color-log-source-badge-bg-1..12`           | `theme palette-defined set (dark-muted)`         |
| `--ov-color-log-source-badge-fg-1..12`           | `theme palette-defined set (high-contrast text)` |
| `--ov-color-terminal-session-connecting-spinner` | `var(--ov-color-fg-subtle)`                      |
| `--ov-color-terminal-session-connecting-fg`      | `var(--ov-color-fg-subtle)`                      |
| `--ov-color-terminal-session-error-title`        | `var(--ov-color-danger)`                         |
| `--ov-color-terminal-session-error-detail`       | `var(--ov-color-fg-muted)`                       |
| `--ov-color-terminal-session-error-surface`      | `var(--ov-color-bg-inset)`                       |
| `--ov-color-terminal-session-error-border`       | `var(--ov-color-danger)`                         |
| `--ov-color-terminal-session-retry-border`       | `var(--ov-color-border-default)`                 |
| `--ov-color-terminal-session-retry-hover-bg`     | `var(--ov-color-state-hover)`                    |

### Footer, drawer, and resource editor aliases

| Token                                           | Default mapping                  |
| ----------------------------------------------- | -------------------------------- |
| `--ov-color-footer-chip-dev-active`             | `var(--ov-color-success)`        |
| `--ov-color-footer-chip-failed`                 | `var(--ov-color-danger)`         |
| `--ov-color-footer-chip-portforward`            | `var(--ov-color-success)`        |
| `--ov-color-footer-chip-operations-active`      | `var(--ov-color-info)`           |
| `--ov-color-footer-chip-operations-idle`        | `var(--ov-color-fg-subtle)`      |
| `--ov-color-operation-running`                  | `var(--ov-color-warning)`        |
| `--ov-color-operation-completed`                | `var(--ov-color-success)`        |
| `--ov-color-operation-error`                    | `var(--ov-color-danger)`         |
| `--ov-color-operation-duration-fg`              | `var(--ov-color-fg-subtle)`      |
| `--ov-color-portforward-open-action`            | `var(--ov-color-fg-default)`     |
| `--ov-color-portforward-close-action`           | `var(--ov-color-danger)`         |
| `--ov-color-bottomdrawer-handle`                | `var(--ov-color-brand-500)`      |
| `--ov-color-bottomdrawer-handle-hover`          | `var(--ov-color-brand-400)`      |
| `--ov-color-bottomdrawer-handle-active`         | `var(--ov-color-brand-300)`      |
| `--ov-color-bottomdrawer-tab-selected-bg`       | `var(--ov-color-state-selected)` |
| `--ov-color-bottomdrawer-tab-selected-border`   | `var(--ov-color-brand-400)`      |
| `--ov-color-bottomdrawer-tab-hover-bg`          | `var(--ov-color-state-hover)`    |
| `--ov-color-rightdrawer-tab-active-border`      | `var(--ov-color-brand-400)`      |
| `--ov-color-rightdrawer-tab-inactive-fg`        | `var(--ov-color-fg-muted)`       |
| `--ov-color-rightdrawer-tab-active-fg`          | `var(--ov-color-fg-default)`     |
| `--ov-color-resource-editor-submit`             | `var(--ov-color-brand-500)`      |
| `--ov-color-resource-editor-submit-disabled`    | `var(--ov-color-fg-disabled)`    |
| `--ov-color-resource-editor-cancel`             | `var(--ov-color-fg-default)`     |
| `--ov-color-resource-editor-reset`              | `var(--ov-color-warning)`        |
| `--ov-color-resource-editor-diff-toggle`        | `var(--ov-color-fg-default)`     |
| `--ov-color-resource-editor-parse-error-fg`     | `var(--ov-color-danger)`         |
| `--ov-color-resource-editor-parse-error-bg`     | `var(--ov-color-danger-soft)`    |
| `--ov-color-resource-editor-parse-error-border` | `var(--ov-color-danger)`         |
| `--ov-color-resource-drawer-header-bg`          | `var(--ov-color-bg-surface)`     |
| `--ov-color-resource-drawer-border`             | `var(--ov-color-border-default)` |
| `--ov-color-resource-status-healthy`            | `var(--ov-color-success)`        |
| `--ov-color-resource-status-pending`            | `var(--ov-color-info)`           |
| `--ov-color-resource-status-warning`            | `var(--ov-color-warning)`        |
| `--ov-color-resource-status-degraded`           | `var(--ov-color-warning)`        |
| `--ov-color-resource-status-error`              | `var(--ov-color-danger)`         |
| `--ov-color-resource-status-unknown`            | `var(--ov-color-fg-subtle)`      |

## Density mappings

### Compact

| Token                                          | Value                              |
| ---------------------------------------------- | ---------------------------------- |
| `--ov-control-height-sm`                       | `24px`                             |
| `--ov-control-height-md`                       | `30px`                             |
| `--ov-control-height-lg`                       | `34px`                             |
| `--ov-list-row-height`                         | `28px`                             |
| `--ov-panel-padding`                           | `12px`                             |
| `--ov-size-button-height-sm`                   | `24px`                             |
| `--ov-size-button-height-md`                   | `30px`                             |
| `--ov-size-button-height-lg`                   | `38px`                             |
| `--ov-size-icon-button-icon-sm`                | `12px`                             |
| `--ov-size-icon-button-icon-md`                | `14px`                             |
| `--ov-size-icon-button-icon-lg`                | `16px`                             |
| `--ov-size-button-group-gap`                   | `6px`                              |
| `--ov-size-chip-radius`                        | `var(--ov-radius-control)`         |
| `--ov-size-chip-group-gap`                     | `5px`                              |
| `--ov-size-chip-height-sm`                     | `18px`                             |
| `--ov-size-chip-height-md`                     | `22px`                             |
| `--ov-size-chip-height-lg`                     | `26px`                             |
| `--ov-size-chip-padding-inline-sm`             | `7px`                              |
| `--ov-size-chip-padding-inline-md`             | `9px`                              |
| `--ov-size-chip-padding-inline-lg`             | `11px`                             |
| `--ov-size-chip-font-size-sm`                  | `var(--ov-primitive-font-size-11)` |
| `--ov-size-chip-font-size-md`                  | `var(--ov-primitive-font-size-11)` |
| `--ov-size-chip-font-size-lg`                  | `var(--ov-font-size-caption)`      |
| `--ov-size-chip-gap-sm`                        | `3px`                              |
| `--ov-size-chip-gap-md`                        | `5px`                              |
| `--ov-size-chip-gap-lg`                        | `6px`                              |
| `--ov-size-chip-icon-size-sm`                  | `11px`                             |
| `--ov-size-chip-icon-size-md`                  | `13px`                             |
| `--ov-size-chip-icon-size-lg`                  | `15px`                             |
| `--ov-size-avatar-sm`                          | `22px`                             |
| `--ov-size-avatar-md`                          | `28px`                             |
| `--ov-size-avatar-lg`                          | `34px`                             |
| `--ov-size-avatar-font-size-sm`                | `var(--ov-primitive-font-size-11)` |
| `--ov-size-avatar-font-size-md`                | `var(--ov-font-size-caption)`      |
| `--ov-size-avatar-font-size-lg`                | `var(--ov-primitive-font-size-13)` |
| `--ov-size-avatar-icon-size-sm`                | `11px`                             |
| `--ov-size-avatar-icon-size-md`                | `14px`                             |
| `--ov-size-avatar-icon-size-lg`                | `16px`                             |
| `--ov-size-avatar-radius-rounded`              | `var(--ov-radius-control)`         |
| `--ov-size-avatar-group-overlap-sm`            | `7px`                              |
| `--ov-size-avatar-group-overlap-md`            | `8px`                              |
| `--ov-size-avatar-group-overlap-lg`            | `10px`                             |
| `--ov-size-choice-control-sm`                  | `14px`                             |
| `--ov-size-choice-control-md`                  | `16px`                             |
| `--ov-size-choice-control-lg`                  | `18px`                             |
| `--ov-size-choice-indicator-sm`                | `8px`                              |
| `--ov-size-choice-indicator-md`                | `10px`                             |
| `--ov-size-choice-indicator-lg`                | `12px`                             |
| `--ov-size-choice-gap-sm`                      | `7px`                              |
| `--ov-size-choice-gap-md`                      | `8px`                              |
| `--ov-size-choice-gap-lg`                      | `10px`                             |
| `--ov-size-choice-radius`                      | `3px`                              |
| `--ov-size-switch-track-width-sm`              | `30px`                             |
| `--ov-size-switch-track-width-md`              | `36px`                             |
| `--ov-size-switch-track-width-lg`              | `42px`                             |
| `--ov-size-switch-track-height-sm`             | `18px`                             |
| `--ov-size-switch-track-height-md`             | `22px`                             |
| `--ov-size-switch-track-height-lg`             | `26px`                             |
| `--ov-size-switch-thumb-size-sm`               | `14px`                             |
| `--ov-size-switch-thumb-size-md`               | `18px`                             |
| `--ov-size-switch-thumb-size-lg`               | `22px`                             |
| `--ov-size-switch-gap-sm`                      | `7px`                              |
| `--ov-size-switch-gap-md`                      | `8px`                              |
| `--ov-size-switch-gap-lg`                      | `10px`                             |
| `--ov-size-action-list-gap`                    | `2px`                              |
| `--ov-size-action-list-item-height-sm`         | `22px`                             |
| `--ov-size-action-list-item-height-md`         | `28px`                             |
| `--ov-size-action-list-item-height-lg`         | `34px`                             |
| `--ov-size-action-list-item-padding-inline-sm` | `7px`                              |
| `--ov-size-action-list-item-padding-inline-md` | `10px`                             |
| `--ov-size-action-list-item-padding-inline-lg` | `12px`                             |
| `--ov-size-action-list-icon-size-sm`           | `12px`                             |
| `--ov-size-action-list-icon-size-md`           | `14px`                             |
| `--ov-size-action-list-icon-size-lg`           | `16px`                             |
| `--ov-size-action-list-shortcut-min-width-sm`  | `24px`                             |
| `--ov-size-action-list-shortcut-min-width-md`  | `30px`                             |
| `--ov-size-action-list-shortcut-min-width-lg`  | `36px`                             |
| `--ov-size-button-padding-inline-sm`           | `8px`                              |
| `--ov-size-button-padding-inline-md`           | `10px`                             |
| `--ov-size-button-padding-inline-lg`           | `16px`                             |
| `--ov-size-card-padding-inline-sm`             | `10px`                             |
| `--ov-size-card-padding-inline-md`             | `12px`                             |
| `--ov-size-card-padding-inline-lg`             | `18px`                             |
| `--ov-size-card-padding-block-sm`              | `8px`                              |
| `--ov-size-card-padding-block-md`              | `12px`                             |
| `--ov-size-card-padding-block-lg`              | `16px`                             |
| `--ov-size-card-gap-sm`                        | `6px`                              |
| `--ov-size-card-gap-md`                        | `8px`                              |
| `--ov-size-card-gap-lg`                        | `12px`                             |
| `--ov-size-card-footer-padding-block-sm`       | `5px`                              |
| `--ov-size-card-footer-padding-block-md`       | `8px`                              |
| `--ov-size-card-footer-padding-block-lg`       | `10px`                             |
| `--ov-size-card-footer-gap-sm`                 | `6px`                              |
| `--ov-size-card-footer-gap-md`                 | `8px`                              |
| `--ov-size-card-footer-gap-lg`                 | `10px`                             |
| `--ov-size-card-action-height-sm`              | `22px`                             |
| `--ov-size-card-action-height-md`              | `28px`                             |
| `--ov-size-card-action-height-lg`              | `34px`                             |
| `--ov-size-card-action-padding-inline-sm`      | `7px`                              |
| `--ov-size-card-action-padding-inline-md`      | `9px`                              |
| `--ov-size-card-action-padding-inline-lg`      | `13px`                             |

### Comfortable

| Token                                          | Value                              |
| ---------------------------------------------- | ---------------------------------- |
| `--ov-control-height-sm`                       | `28px`                             |
| `--ov-control-height-md`                       | `36px`                             |
| `--ov-control-height-lg`                       | `42px`                             |
| `--ov-list-row-height`                         | `34px`                             |
| `--ov-panel-padding`                           | `16px`                             |
| `--ov-size-button-height-sm`                   | `28px`                             |
| `--ov-size-button-height-md`                   | `36px`                             |
| `--ov-size-button-height-lg`                   | `44px`                             |
| `--ov-size-icon-button-icon-sm`                | `14px`                             |
| `--ov-size-icon-button-icon-md`                | `16px`                             |
| `--ov-size-icon-button-icon-lg`                | `18px`                             |
| `--ov-size-button-group-gap`                   | `8px`                              |
| `--ov-size-chip-radius`                        | `var(--ov-radius-control)`         |
| `--ov-size-chip-group-gap`                     | `6px`                              |
| `--ov-size-chip-height-sm`                     | `20px`                             |
| `--ov-size-chip-height-md`                     | `24px`                             |
| `--ov-size-chip-height-lg`                     | `28px`                             |
| `--ov-size-chip-padding-inline-sm`             | `8px`                              |
| `--ov-size-chip-padding-inline-md`             | `10px`                             |
| `--ov-size-chip-padding-inline-lg`             | `12px`                             |
| `--ov-size-chip-font-size-sm`                  | `var(--ov-primitive-font-size-11)` |
| `--ov-size-chip-font-size-md`                  | `var(--ov-font-size-caption)`      |
| `--ov-size-chip-font-size-lg`                  | `var(--ov-primitive-font-size-13)` |
| `--ov-size-chip-gap-sm`                        | `4px`                              |
| `--ov-size-chip-gap-md`                        | `6px`                              |
| `--ov-size-chip-gap-lg`                        | `8px`                              |
| `--ov-size-chip-icon-size-sm`                  | `12px`                             |
| `--ov-size-chip-icon-size-md`                  | `14px`                             |
| `--ov-size-chip-icon-size-lg`                  | `16px`                             |
| `--ov-size-avatar-sm`                          | `24px`                             |
| `--ov-size-avatar-md`                          | `32px`                             |
| `--ov-size-avatar-lg`                          | `40px`                             |
| `--ov-size-avatar-font-size-sm`                | `var(--ov-font-size-caption)`      |
| `--ov-size-avatar-font-size-md`                | `var(--ov-primitive-font-size-13)` |
| `--ov-size-avatar-font-size-lg`                | `var(--ov-font-size-body)`         |
| `--ov-size-avatar-icon-size-sm`                | `12px`                             |
| `--ov-size-avatar-icon-size-md`                | `16px`                             |
| `--ov-size-avatar-icon-size-lg`                | `18px`                             |
| `--ov-size-avatar-radius-rounded`              | `var(--ov-radius-surface)`         |
| `--ov-size-avatar-group-overlap-sm`            | `8px`                              |
| `--ov-size-avatar-group-overlap-md`            | `10px`                             |
| `--ov-size-avatar-group-overlap-lg`            | `12px`                             |
| `--ov-size-choice-control-sm`                  | `16px`                             |
| `--ov-size-choice-control-md`                  | `18px`                             |
| `--ov-size-choice-control-lg`                  | `20px`                             |
| `--ov-size-choice-indicator-sm`                | `10px`                             |
| `--ov-size-choice-indicator-md`                | `12px`                             |
| `--ov-size-choice-indicator-lg`                | `14px`                             |
| `--ov-size-choice-gap-sm`                      | `8px`                              |
| `--ov-size-choice-gap-md`                      | `10px`                             |
| `--ov-size-choice-gap-lg`                      | `12px`                             |
| `--ov-size-choice-radius`                      | `var(--ov-primitive-radius-sm)`    |
| `--ov-size-switch-track-width-sm`              | `34px`                             |
| `--ov-size-switch-track-width-md`              | `40px`                             |
| `--ov-size-switch-track-width-lg`              | `46px`                             |
| `--ov-size-switch-track-height-sm`             | `20px`                             |
| `--ov-size-switch-track-height-md`             | `24px`                             |
| `--ov-size-switch-track-height-lg`             | `28px`                             |
| `--ov-size-switch-thumb-size-sm`               | `16px`                             |
| `--ov-size-switch-thumb-size-md`               | `20px`                             |
| `--ov-size-switch-thumb-size-lg`               | `24px`                             |
| `--ov-size-switch-gap-sm`                      | `8px`                              |
| `--ov-size-switch-gap-md`                      | `10px`                             |
| `--ov-size-switch-gap-lg`                      | `12px`                             |
| `--ov-size-action-list-gap`                    | `4px`                              |
| `--ov-size-action-list-item-height-sm`         | `24px`                             |
| `--ov-size-action-list-item-height-md`         | `30px`                             |
| `--ov-size-action-list-item-height-lg`         | `36px`                             |
| `--ov-size-action-list-item-padding-inline-sm` | `8px`                              |
| `--ov-size-action-list-item-padding-inline-md` | `12px`                             |
| `--ov-size-action-list-item-padding-inline-lg` | `14px`                             |
| `--ov-size-action-list-icon-size-sm`           | `14px`                             |
| `--ov-size-action-list-icon-size-md`           | `16px`                             |
| `--ov-size-action-list-icon-size-lg`           | `18px`                             |
| `--ov-size-action-list-shortcut-min-width-sm`  | `28px`                             |
| `--ov-size-action-list-shortcut-min-width-md`  | `34px`                             |
| `--ov-size-action-list-shortcut-min-width-lg`  | `40px`                             |
| `--ov-size-button-padding-inline-sm`           | `10px`                             |
| `--ov-size-button-padding-inline-md`           | `12px`                             |
| `--ov-size-button-padding-inline-lg`           | `22px`                             |
| `--ov-size-card-padding-inline-sm`             | `12px`                             |
| `--ov-size-card-padding-inline-md`             | `16px`                             |
| `--ov-size-card-padding-inline-lg`             | `24px`                             |
| `--ov-size-card-padding-block-sm`              | `10px`                             |
| `--ov-size-card-padding-block-md`              | `16px`                             |
| `--ov-size-card-padding-block-lg`              | `22px`                             |
| `--ov-size-card-gap-sm`                        | `8px`                              |
| `--ov-size-card-gap-md`                        | `12px`                             |
| `--ov-size-card-gap-lg`                        | `16px`                             |
| `--ov-size-card-footer-padding-block-sm`       | `6px`                              |
| `--ov-size-card-footer-padding-block-md`       | `10px`                             |
| `--ov-size-card-footer-padding-block-lg`       | `12px`                             |
| `--ov-size-card-footer-gap-sm`                 | `8px`                              |
| `--ov-size-card-footer-gap-md`                 | `10px`                             |
| `--ov-size-card-footer-gap-lg`                 | `12px`                             |
| `--ov-size-card-action-height-sm`              | `24px`                             |
| `--ov-size-card-action-height-md`              | `30px`                             |
| `--ov-size-card-action-height-lg`              | `38px`                             |
| `--ov-size-card-action-padding-inline-sm`      | `8px`                              |
| `--ov-size-card-action-padding-inline-md`      | `10px`                             |
| `--ov-size-card-action-padding-inline-lg`      | `16px`                             |

## Motion mappings

### Normal

- `--ov-duration-fast: 90ms`
- `--ov-duration-normal: 160ms`
- `--ov-duration-slow: 260ms`

### Reduced

- `--ov-duration-fast: 0ms`
- `--ov-duration-normal: 0ms`
- `--ov-duration-slow: 0ms`

## Layer mappings

- `--ov-z-base: var(--ov-primitive-z-base)`
- `--ov-z-sticky: var(--ov-primitive-z-sticky)`
- `--ov-z-dropdown: var(--ov-primitive-z-dropdown)`
- `--ov-z-popover: var(--ov-primitive-z-popover)`
- `--ov-z-modal: var(--ov-primitive-z-modal)`
- `--ov-z-toast: var(--ov-primitive-z-toast)`
- `--ov-z-tooltip: var(--ov-primitive-z-tooltip)`
