# Migration Plan

## Phase -1: Spec approval (current)

Deliverables:

1. Repository guidelines and contribution rules.
2. ESLint/Prettier baseline.
3. Primitive token values and semantic mapping across themes.
4. Theme review checklist sign-off.

Exit criteria:

- Token and primitive docs are approved before package implementation starts.

## Phase 0: Foundation (this repository)

Deliverables:

1. Base UI library package scaffold.
2. CSS variable token system with runtime theme provider.
3. Showcase app with side-by-side component validation.
4. Docs for architecture, tokens, and contribution rules.

Exit criteria:

- Theme can switch at runtime across all sample components.
- No CSS-in-JS runtime dependency exists in the new package.

## Phase 1: Primitive baseline

Build and validate:

1. Button
2. Input/TextField
3. Select
4. Tabs
5. Checkbox/Switch/Radio
6. Tooltip/Popover/Dialog/Drawer

Exit criteria:

- Keyboard and ARIA behavior match Base UI defaults.
- Component APIs are stable and documented.

## Phase 2: Layout and navigation baseline

Build and validate:

1. App shell primitives
2. Menus and context menus
3. Toolbar patterns
4. Panel split/layout abstractions

Exit criteria:

- Existing IDE shell can render on new primitives without MUI.

## Phase 3: Domain component migration

Migrate package slices in this order:

1. Typography and common components
2. Inputs and forms
3. Table and cells
4. Navigation and overlays
5. Domain and AI-specific blocks

Exit criteria:

- Old MUI package can be removed from the consuming app.

## Phase 4: Cleanup and hardening

1. Remove dead theme/token shims.
2. Lock final API and token naming.
3. Add visual regressions and performance benchmarks.

Exit criteria:

- Production release candidate with migration guide complete.

## Mapping table (initial)

- `@mui/material/Button` -> `@base-ui/react/button` + `IdeButton`
- `@mui/material/TextField` -> `@base-ui/react/field` + `IdeTextField`
- `@mui/material/Tabs` -> `@base-ui/react/tabs` + `IdeTabs`
- `@mui/material/Select` -> `@base-ui/react/select` + `IdeSelect`
