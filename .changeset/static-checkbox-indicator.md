---
"@omniviewdev/base-ui": patch
---

Render the default, always-mounted checkbox mark as a CSS-only decorative span. Root state still controls checked and indeterminate marks, keyboard input, focus, and accessibility. Avoid registering animation-completion probes for each unchecked checkbox mounted by a virtualized table. Custom indicators and indicators that unmount retain the existing animated primitive.

Keep fixed-height table ranges stable while the viewport moves inside their overscan buffer. Reuse the same range until a four-row boundary changes, rather than scheduling React work for every crossed row. Variable-height and expanded-detail tables retain their existing range behavior.
