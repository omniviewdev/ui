---
"@omniviewdev/base-ui": minor
"@omniviewdev/editors": minor
---

Add provider-neutral controlled query authoring, typed variable controls, visualization/binding/layout primitives and resource workspace/inspection controls. Add a compact Monaco CEL editor with contextual completion, diagnostics, hover, signature help and cancellation.

Keep resource/query semantics outside generic UI packages. The accompanying Go CEL and LSP workbench is development-only, fixture-backed and explicitly integer-only; it is not production resource acquisition, live query transport, persistence or permission enforcement. Retain the existing prepared-table and command-palette improvements already merged into main.
