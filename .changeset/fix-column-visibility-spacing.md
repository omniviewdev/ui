---
'@omniviewdev/base-ui': patch
---

Use shared spacing tokens between column visibility checkboxes. The portaled popup cannot inherit private spacing variables from the table root.

Honor the shared extra-small text scale in text primitives and small tooltips. Align status dots and their labels using one font size and line height, including when global UI text size changes.

Allow tables to fill bounded flex layouts with scrolling confined to their container. Leading row, footer, and skeleton cell insets match their vertical padding; trailing cells use the compact shared inset. Headers retain normal cell padding so column labels do not crowd the table edges.
