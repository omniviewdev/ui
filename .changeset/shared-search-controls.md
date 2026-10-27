---
'@omniviewdev/base-ui': minor
---

Add SearchTrigger, a native search-dialog button that shares Input's shell, radius, sizing, variants, and focus styling.

Fit trailing shortcut badges to SearchTrigger's control size with equal top, bottom, and end insets.

Add optional Hotkey keys for accessible chords with consistent modifier sizing and a default plus separator. Existing plain children remain supported.

Add CommandList.ItemContent, ItemMeta, and ItemDisabledReason for compact two-line command rows with aligned icons and trailing metadata. Center the complete content block within each themed item boundary across densities while keeping icons aligned with titles. Preserve existing inline row composition.

Fix competing hover and keyboard highlights in CommandList. Keep one active row while keyboard scrolling moves content under a stationary pointer, and return selection to the pointer when it moves.
