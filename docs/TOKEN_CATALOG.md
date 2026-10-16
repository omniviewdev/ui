# Token Catalog Index

This is the index for token specifications and authoritative implementation sources.

## Authoritative sources

1. Shipped values and aliases: [`styles.css`](../packages/base-ui/src/theme/styles.css)
2. Public dotted keys, CSS variables, and value kinds: [generated token catalog](../packages/base-ui/src/theme/generated/tokenKeys.ts)
3. Supported built-in IDs and appearance metadata: [registry catalog](../packages/base-ui/src/theme/registry/catalog.ts)
4. Semantic role selection and composition: [theming guidelines](THEMING.md#boundary-design)

Regenerate public keys with `pnpm --filter @omniviewdev/base-ui generate:token-keys`
after changing theme variables. The generated metadata describes the schema;
per-theme palette values remain in CSS, not in a parallel manual table.

## Supporting specs

1. Primitive design guidance: `docs/THEME_PRIMITIVES.md`
2. Source-linked semantic mappings: `docs/THEME_TOKEN_MAPPING.md`
3. IDE-grade token families: `docs/IDE_TOKEN_CATALOG.md`
4. Omniview functionality audit: `docs/OMNIVIEW_TOKEN_AUDIT.md`

## Boundary roles

`color.border.muted`, `color.border.default`, and `color.border.strong` are
structural roles. `color.border.control` identifies controls where an outline is
necessary; `color.border.overlay` owns an overlay perimeter and currently aliases
the ordinary default boundary in each built-in. `color.border.focus` and
`color.state.focus.ring` remain dedicated focus cues. Selection and status retain
their own semantic roles. Use one intentional neutral boundary owner per edge;
do not substitute text colors or impose a decorative-line contrast floor.

## Canonical token prefixes

- Primitives: `--ov-primitive-*`
- Semantic UI: `--ov-color-*`, `--ov-font-*`, `--ov-space-*`, `--ov-size-*`, `--ov-radius-*`
- Syntax: `--ov-syntax-*`
- Motion/layers: `--ov-duration-*`, `--ov-ease-*`, `--ov-z-*`, `--ov-opacity-*`

## Reserved alias families (pre-declared)

These are intentionally reserved now to avoid future rename churn:

- `--ov-color-profile-*`
- `--ov-color-scrollbar-*`
- `--ov-color-popup-*`
- `--ov-color-notification-*`
- `--ov-color-banner-*`
- `--ov-color-kbd-*`
- `--ov-color-table-*`
- `--ov-color-breadcrumb-*`
- `--ov-color-snippet-*`
- `--ov-color-comments-*`
- `--ov-color-editor-sticky-*`
- `--ov-color-editor-codelens-*`
- `--ov-color-editor-lightbulb-*`
- `--ov-color-chart-*`
- `--ov-color-link-*`
- `--ov-color-icon-*`
- `--ov-color-peek-*`
- `--ov-color-plugin-*`
- `--ov-color-devserver-*`
- `--ov-color-connection-*`
- `--ov-color-log-*`
- `--ov-color-terminal-session-*`
- `--ov-color-operation-*`
- `--ov-color-portforward-*`
- `--ov-color-footer-chip-*`
- `--ov-color-bottomdrawer-*`
- `--ov-color-rightdrawer-*`
- `--ov-color-resource-editor-*`
- `--ov-color-resource-drawer-*`
- `--ov-color-resource-status-*`
- `--ov-size-bottomdrawer-*`
- `--ov-opacity-bottomdrawer-*`

## Domain scope note

Omniview v1 token scope excludes legacy Trivy-specific theming requirements.

## Governance rule

No component may introduce a new token prefix outside this catalog without updating:

1. `docs/TOKEN_CATALOG.md`
2. `docs/IDE_TOKEN_CATALOG.md` (if IDE-specific)
3. `docs/THEME_REVIEW_CHECKLIST.md`
