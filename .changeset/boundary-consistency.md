---
'@omniviewdev/base-ui': patch
'@omniviewdev/editors': patch
'@omniviewdev/ai-ui': patch
---

Restore a consistent boundary hierarchy across built-in themes: quiet structural rules and passive enclosures remain separate from necessary control-identification outlines, overlay perimeters, keyboard focus, selection, and semantic status accents.

- Base UI adds public `color.border.control` and `color.border.overlay` tokens, repairs Separator custom-property cycles, and applies the appropriate roles to cards, table rules, controls, and overlays without adding outlines to intentionally borderless variants.
- Editors use the control role for ObjectInspector search, the overlay role for CommandPalette, and muted structural rules for inspector toolbars and Markdown headings.
- AI UI uses the control role for chat and message-editing fields and muted structural rules for conversation, artifact, code, reasoning, and tool-result dividers while retaining dedicated focus and semantic status treatments.

Boundary guidance now documents single-owner composition and meaningful control/focus contrast rather than a blanket contrast floor for decorative lines. Theme audit coverage and the Storybook theme toolbar follow the built-in catalog, and the audit reports same-scope custom-property dependency cycles.
