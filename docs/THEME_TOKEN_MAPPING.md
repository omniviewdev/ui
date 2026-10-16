# Theme Token Mapping

## Authoritative palette and token sources

Do not copy per-theme hex values into this document. The former proposed
four-theme palette table diverged from the shipped styles and omitted built-ins.
Use these sources together:

- [Static CSS declarations](../packages/base-ui/src/theme/styles.css): actual
  palette values, semantic aliases, and density/motion declarations. Follow
  `var()` aliases in the active theme rather than treating an alias as a color.
- [Built-in catalog](../packages/base-ui/src/theme/registry/catalog.ts): supported
  theme IDs and appearance metadata. Storybook's theme toolbar and the theme
  coverage audit consume this catalog rather than maintaining separate lists.
- [Generated public token keys and metadata](../packages/base-ui/src/theme/generated/tokenKeys.ts):
  supported dotted keys, CSS variable names, and value kinds. This is a schema
  catalog, not a second palette-value table.
- [Theming guidelines](THEMING.md#boundary-design): role selection and composition.

For theme JSON, `color.border.control` maps to `--ov-color-border-control`,
and `color.border.overlay` maps to `--ov-color-border-overlay`.
Regenerate the public catalog with
`pnpm --filter @omniviewdev/base-ui generate:token-keys` when variables change.

## Boundary roles

Use `border-muted` for structural hairlines and row rules, `border-default`
for passive enclosures, and `border-strong` for intentional structural emphasis.
Necessary control-identification outlines use `border-control`; overlay
perimeters use `border-overlay`. Keyboard focus remains `border-focus` /
`state-focus-ring`. Selection and status use their own semantic roles.
No neutral boundary role derives from foreground/text colors.

Structural boundaries are deliberately quieter than control outlines in normal
themes, including Solarized. Required control-identification and state cues
must meet applicable non-text contrast requirements against their actual adjacent
colors; decorative boundaries do not inherit a universal 3:1 floor.
High-contrast themes retain intentionally strong boundaries. Status borders
retain their semantic accent rather than a neutral or text-derived substitute.

Each built-in `border-overlay` currently aliases its own `border-default`;
keep the separate role so an overlay can diverge when a theme requires it.
Neutral Separators use the muted boundary role, independently of their text
labels. Their default compact-density stroke is one CSS pixel; explicit size
tiers remain available.

The `Layout/Separator/BoundaryRegression` Storybook fixture covers actual
horizontal, vertical, and labeled borders across built-ins on both base and
surface backgrounds. Run its browser assertions when changing these roles:
computed stroke/color and geometry, not data attributes or token declarations
alone, establish that a divider is visible. The static cycle audit complements
this browser coverage; it does not replace it.

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

## Semantic color aliases

The shipped IDE, syntax, terminal, and Omniview domain alias mappings are in
[`styles.css`](../packages/base-ui/src/theme/styles.css); the
[generated catalog](../packages/base-ui/src/theme/generated/tokenKeys.ts)
identifies which aliases are public. The former manual alias tables included
obsolete names and control outlines mapped to passive boundaries. Do not use
those proposed mappings as an implementation contract.

Feature-specific aliases keep their semantic intent: structural shell edges
remain structural, required control outlines use the control role, and
status/selection/focus accents must not be flattened into neutral boundaries.
See [boundary design](THEMING.md#boundary-design) before changing an alias.

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
