# Token Catalog Index

This is the master index for token specifications.

## Primary specs

1. Primitive values: `docs/THEME_PRIMITIVES.md`
2. Theme-mode semantic mappings: `docs/THEME_TOKEN_MAPPING.md`
3. IDE-grade token families: `docs/IDE_TOKEN_CATALOG.md`
4. Omniview functionality audit: `docs/OMNIVIEW_TOKEN_AUDIT.md`

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
