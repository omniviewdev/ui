---
"@omniviewdev/base-ui": patch
---

Move the `'use no memo'` directive from module top into the `useDataTable` function body so rollup stops stripping it. Restores the React Compiler opt-out for the data-table hook.
