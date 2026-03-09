# Component Status

This document reflects the current implementation state in `packages/base-ui/src/components`, `packages/base-ui/src/hooks`, and `packages/base-ui/src/system`.

## Approved component set

These are the only components currently in scope and exported:

- `Accordion`
- `ActionList`
- `AppShell`
- `AlertDialog`
- `AspectRatio`
- `Autocomplete`
- `Avatar`
- `AvatarGroup`
- `Badge`
- `Banner`
- `Box`
- `Breadcrumbs`
- `Button`
- `ButtonGroup`
- `Card`
- `Checkbox`
- `CheckboxGroup`
- `Chip`
- `ClipboardText`
- `CodeBlock`
- `Combobox`
- `ConfirmButton`
- `Container`
- `ContextMenu`
- `DescriptionList`
- `Dialog`
- `DockLayout`
- `Drawer`
- `EmptyState`
- `FormField`
- `FormSection`
- `Grid`
- `IconButton`
- `Image`
- `ImageList`
- `Input`
- `Menu`
- `MultiSelect`
- `NumberInput`
- `Pagination`
- `Paper`
- `Popover`
- `Progress`
- `Radio`
- `RadioGroup`
- `ResizableSplitPane`
- `ScrollArea`
- `SearchInput`
- `Select`
- `Separator`
- `Sheet`
- `Skeleton`
- `Slider`
- `Spinner`
- `SplitButton`
- `Stack`
- `StatusDot`
- `Stepper`
- `Switch`
- `Tabs`
- `TagInput`
- `TextField`
- `TextArea`
- `Toast`
- `Tooltip`
- `ToggleButton`
- `ToggleButtonGroup`
- `Toolbar`

## Approved hooks and utilities

- `statusToColor` — Maps semantic status strings to component colors (`system/status.ts`)
- `useDebouncedCallback` — Debounced callback hook with cancel/flush (`hooks/useDebouncedCallback.ts`)
- `useDebouncedValue` — Debounced value hook (`hooks/useDebouncedValue.ts`)

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
