# Component Status

This document reflects the current implementation state in `packages/base-ui/src/components`.

## Approved component set

These are the only components currently in scope and exported:

- `ActionList`
- `AlertDialog`
- `Autocomplete`
- `Avatar`
- `AvatarGroup`
- `Button`
- `ButtonGroup`
- `Card`
- `Checkbox`
- `CheckboxGroup`
- `Chip`
- `CodeBlock`
- `Combobox`
- `ContextMenu`
- `IconButton`
- `Input`
- `Menu`
- `MultiSelect`
- `NumberInput`
- `Popover`
- `Radio`
- `RadioGroup`
- `SearchInput`
- `Select`
- `Slider`
- `Switch`
- `Tabs`
- `TextField`
- `TextArea`
- `Tooltip`
- `ToggleButton`
- `ToggleButtonGroup`
- `Sheet`
- `Paper`
- `AspectRatio`
- `Banner`
- `Drawer`
- `Progress`
- `ScrollArea`
- `Spinner`

Each approved component must include:

1. A themed wrapper using semantic token-driven CSS modules.
2. A Storybook story that renders meaningful UI (not placeholder shell output).
3. A Vitest test that verifies core rendering and token/style data propagation.

## Storybook state

- Every approved component has a composed Storybook story.
- Storybook remains the canonical visual validation path before dedicated docs pages are built.

## Token policy for new component styling

1. Reuse existing semantic tokens first (`--ov-color-*`, `--ov-space-*`, `--ov-font-*`, `--ov-radius-*`).
2. Introduce new component tokens only when needed for reusable sizing/state values.
3. Keep token additions synchronized with `docs/TOKEN_CATALOG.md` and `docs/THEME_TOKEN_MAPPING.md`.
