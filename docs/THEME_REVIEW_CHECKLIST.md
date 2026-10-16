# Theme Review Checklist

Use this checklist to review token system changes during implementation.

## Naming and scope

- [ ] Token prefixes are consistent (`--ov-*`, `--ov-primitive-*`).
- [ ] No duplicate semantic tokens with overlapping intent.
- [ ] Desktop shell dimension tokens cover all Wails layout regions.

## Color system

- [ ] Dark theme defaults are acceptable for primary IDE usage.
- [ ] Light theme values are legible and low-glare.
- [ ] High contrast themes provide sufficient contrast for text and controls.
- [ ] Status colors are distinguishable and not only hue-dependent.

## Boundary hierarchy and ownership

- [ ] Use [boundary design guidance](THEMING.md#boundary-design): muted structural rules, default passive enclosures, strong intentional structural emphasis, control identification, overlay perimeter, and dedicated focus roles.
- [ ] No neutral boundary role derives from foreground/text tokens.
- [ ] Each edge/group has one intentional owner; nested inspectors use spacing, shared surfaces, or muted separators rather than repeated neutral frames.
- [ ] Required control outlines and meaningful non-text state/focus cues meet applicable contrast against their actual adjacent colors; no blanket 3:1 requirement is imposed on decorative lines.
- [ ] Controls identified by background/content are not given unnecessary outlines.
- [ ] Closed selector triggers and open popup perimeters use their separate roles; keyboard focus, selection, and status remain distinct.
- [ ] Semantic status accents (including a left status edge) remain visible rather than being removed with redundant neutral borders.
- [ ] Normal themes retain quiet structural roles; high-contrast themes retain intentional stronger boundaries.
- [ ] Palette values come from `packages/base-ui/src/theme/styles.css`, public keys from the generated catalog, and built-in IDs from the registry catalog—not another manual theme list/table.

## IDE surface coverage

- [ ] Window chrome tokens are defined (title bar, status bar, activity bar, side bar, panel).
- [ ] Editor core tokens are defined (selection, cursor, line numbers, gutters, minimap, diff).
- [ ] Terminal and full ANSI palette tokens are defined.
- [ ] Syntax token colors and semantic modifiers are defined.
- [ ] Source control, debug, testing, and chat token families are defined.
- [ ] Reserved alias families are acceptable for future divergence without renaming churn.

## Omniview surface coverage

- [ ] Plugin lifecycle tokens cover `Running`, `Failed`, `BuildFailed`, `Starting`, `Building`, `Recovering`, `Validating`, `Stopped`, and `Connecting`.
- [ ] Dev server aggregate status tokens cover `ready`, `building`, `error`, `stopped`, and `connecting`.
- [ ] Connection watch/sync tokens cover connected/syncing/error/idle and progress bars.
- [ ] Log viewer tokens cover levels `error`, `warn`, `info`, `debug`, and `trace`.
- [ ] Log stream event states are themed for reconnecting/reconnected/stream ended/stream error UX.
- [ ] Footer chips cover failed plugins, active dev servers, operations, and port-forward sessions.
- [ ] Drawer handle and tab affordance tokens exist for bottom drawer and right drawer.
- [ ] Resource editor/diff flow tokens exist for submit/cancel/reset/diff/parse error states.
- [ ] Marketplace metadata tokens exist for ratings, download indicators, official badges, and install actions.
- [ ] Resource status tokens cover Kubernetes-style runtime states (healthy/pending/warning/degraded/error/unknown).

## Typography

- [ ] Font families align with desired native desktop feel.
- [ ] Font scale supports dense data-heavy UI and inspector panels.
- [ ] Mono token choices are acceptable for logs, code, and tables.

## Interaction and accessibility

- [ ] Focus ring tokens are visible in all themes.
- [ ] Hover/pressed/selected states are clear but not visually noisy.
- [ ] Reduced motion token behavior is acceptable.
- [ ] Chromium checks exercise actual changed artifacts on base/surface backgrounds across the built-in catalog: nested sections, table rows, horizontal/vertical/labeled Separators, opened selectors, and keyboard focus.
- [ ] Visual regressions inspect computed stroke/color/geometry and ownership, not just part attributes or repeated token declarations.

## Density and layout

- [ ] Compact density is suitable for power users.
- [ ] Comfortable density is suitable for general usage.
- [ ] Control heights and row heights align with existing interaction patterns.

## Governance

- [ ] Token addition/change process in `REPOSITORY_GUIDELINES.md` is acceptable.
- [ ] Migration phase ordering in `MIGRATION_PLAN.md` is acceptable.
- [ ] Tooling policy (`pnpm`, ESLint, Prettier) is acceptable.
- [ ] Omniview feature audit in `docs/OMNIVIEW_TOKEN_AUDIT.md` is acceptable.
- [ ] Legacy Trivy-specific tokens are explicitly excluded from v1 scope.
- [ ] Custom-property graph/parser regressions and `pnpm audit:ui` run; new High cycles are fixed, not hidden by regenerating the baseline.
- [ ] Release notes follow the existing changeset convention only after smoke evidence is recorded.
