---
'@omniviewdev/base-ui': patch
---

Add `Card.Action placement="inline"` so independent actions participate in flex and grid headers without consumer positioning overrides. Preserve existing corner placement by default.

Add `StatusDot variant="outline"` for hollow state indicators that retain their outer size and theme-derived status color. Solid indicators remain the default. Both variants retain existing labels, sizing, pulse, and reduced-motion behavior.

Add an optional `IconPicker uploadFields` slot for caller-owned upload metadata inside the picker, keeping its external icon-only trigger compact. Keep palette cells square when the viewport constrains larger picker sizes.

Align keyed-search suggestion metadata at the trailing edge. Hide decorative submenu carets from accessible names so keyboard and assistive-tool navigation uses the actual item label.

Keep default `Select.Portal` content in its owning Dialog overlay, above the modal surface and footer. Preserve explicit portal containers and normal body portals outside dialogs.
