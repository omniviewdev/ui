# Monaco + YAML: Compatibility Notes

This document records the compatibility constraints and known issues between
`monaco-editor`, `monaco-yaml`, and `monaco-worker-manager` so that future
maintainers (or a potential fork) have full context.

---

## Version Matrix (as of October 2026)

| Package                 | Version  | Notes                                            |
| ----------------------- | -------- | ------------------------------------------------ |
| `monaco-editor`         | `0.52.2` | Retained compatibility baseline                 |
| `monaco-yaml`           | `5.5.1`  | YAML integration; retains worker-manager below   |
| `monaco-worker-manager` | `2.0.1`  | Uses the legacy worker creation/startup contract |

### Upgrade boundary

Monaco `0.57.0` was built and exercised in a real browser during the frontend
upgrade. Resolving the worker import path was insufficient: YAML validation
failed with `Missing requestHandler or method: doValidation`. The manager still
passes `moduleId` and `createData`, while newer Monaco expects an explicit
`Worker`. Monaco `0.55.1` already uses that incompatible API, so it is not a safe
intermediate target.

Keep `0.52.2` until the maintained YAML fork below supports the new worker API.

The editor test resolver includes the `module` package field explicitly because
Monaco 0.52 has no `main` or `exports` entry. This uses its declared ESM entry,
not a private API alias or a worker monkey-patch.
Temporary import resolvers and dependency patches are not retained.

## Historical Monaco 0.55 / monaco-yaml 5.4.1 Issues

The older failures below identify the same unsupported worker contract; a
constructor-only workaround does not establish validation or completion support.

### 1. `WebWorker` constructor crash

In `vs/base/browser/webWorkerFactory.js`, the `WebWorker` class constructor
tries `'then' in descriptorOrWorker` (line ~110). When `descriptorOrWorker` is
`undefined` — which happens because `monaco-worker-manager` doesn't pass
`opts.worker` — this crashes with:

```text
TypeError: Cannot use 'in' operator to search for 'then' in undefined
```

**Workaround attempted:** Monkey-patching `monaco.editor.createWebWorker` to
inject `opts.worker` from `MonacoEnvironment.getWorker`. This prevents the
crash but doesn't fix completions.

### 2. Worker protocol mismatch (`$initialize` consumed)

Monaco 0.55's `WebWorkerClient` (in `vs/base/common/worker/webWorker.js`) sends
a `$initialize` message to the worker. Inside the worker, two different
initialization paths compete:

- **Default workers** (`editor.worker.js`): Use a single-message protocol via
  `start()` → `WebWorkerServer` — this works fine.
- **monaco-worker-manager workers** (yaml, etc.): Use `common/initialize.js`
  which creates a **two-message** protocol. The first message is consumed by
  `initialize()` before `WebWorkerServer` is even created. The `$initialize`
  message from `WebWorkerClient` is therefore never processed by
  `WebWorkerServer`, causing the proxy to hang forever at "Loading...".

At the time, changing only the worker constructor did not fix the observed
initialization protocol mismatch.

### Summary

```text
monaco-editor@0.55 + monaco-yaml@5.4.1 = broken (hangs on "Loading...")
monaco-editor@0.52 + monaco-yaml@5.4.1 = working (completions + validation)
```

## Page-global theme model

Monaco stores themes and the active theme at page scope. Passing a theme
through `editor.create(...)` or `editor.updateOptions({ theme })` does not
isolate it to that editor. `CodeEditor` and `DiffViewer` therefore share the
single `ov-theme` registration and activate it with `monaco.editor.setTheme`.

Each component still reads tokens from its nearest themed ancestor when it
mounts or receives a theme registration update. The component that updates
last rebuilds `ov-theme`, and every Monaco editor on the page displays that
palette. Applications that need simultaneous independently themed editors must
use separate documents or frames; separate Base UI provider roots are not
sufficient.

## Vite Worker Loading

Monaco workers in Vite require special handling:

### `?worker` imports (current approach)

```ts
import YamlWorker from './yaml.worker?worker';
```

Vite bundles each worker with its dependencies, transforming CJS → ESM. This is
necessary because `yaml-language-server` (used by `monaco-yaml`) depends on
CJS-only packages like `path-browserify`. Without bundling, native ESM workers
fail with `module is not defined`.

### Storybook `viteFinal` config

```ts
viteFinal(config) {
  config.optimizeDeps ??= {};
  // monaco-editor is too large for esbuild pre-bundling
  config.optimizeDeps.exclude ??= [];
  config.optimizeDeps.exclude.push('monaco-editor');
  // Pre-bundle yaml worker so CJS deps become ESM
  config.optimizeDeps.include ??= [];
  config.optimizeDeps.include.push('monaco-yaml/yaml.worker.js');
  return config;
}
```

## Schema Registration

Schemas are registered at runtime via the `EditorSchemaRegistry` singleton.
The `configureMonacoYaml()` call happens once at setup time (side-effect import),
returning a `{ update, dispose }` handle. The registry calls `handle.update()`
whenever schemas change.

### Schema URI Bug — YAML(768) "No schema request service"

```text
Unable to load schema from '...'. No schema request service available YAML(768)
```

This error has **two** causes:

#### 1. Custom protocol URIs (e.g. `k8s://`)

Schema URIs must use `https://`. Custom protocols cause `monaco-yaml` to attempt
a fetch even with `enableSchemaRequest: false`.

#### 2. URI normalization mismatch (the deeper bug)

`yaml-language-server`'s `JSONSchemaService` has a bug: it stores schema handles
keyed by `normalizeId(uri)` (which runs `URI.parse(uri).toString()`) but looks
them up via `createCombinedSchema` → `getOrAddSchemaHandle` using the **raw** URI
from `filePatternAssociations`. If `URI.parse` changes the URI (e.g. encoding
`::` to `%3A%3A`), the lookup misses the stored handle and creates a new one
**without** the inline schema content, triggering a fetch attempt.

**Fix:** Schema URIs must be "URI-safe" — avoid characters that `URI.parse`
normalizes differently. Use `encodeURIComponent()` for dynamic segments:

```ts
// BAD — :: gets normalized by URI.parse, causing handle lookup miss
uri: `https://omniview.dev/schemas/k8s/core::v1::Pod`

// GOOD — encoded segment survives URI normalization
uri: `https://omniview.dev/schemas/k8s/${encodeURIComponent('core::v1::Pod')}`
```

## Tracked follow-up: maintained YAML fork

Deferred from this frontend upgrade by explicit decision. No fork is created
in this change.

- [ ] Create an Omniview-maintained fork of `monaco-yaml`.
- [ ] Remove `monaco-worker-manager`; support explicit native worker injection
  and configuration/startup for the selected Monaco version.
- [ ] Verify real browser validation, schema completion, live schema updates,
  idle recreation, and disposal in both Vite dev and bundled-worker delivery.
- [ ] Publish the fork and upgrade host, UI libraries, and Kubernetes together.

Implementation considerations:

1. **Drop `monaco-worker-manager` dependency** — use Monaco's built-in
   `createWebWorker` directly with explicit worker injection. This would fix
   Monaco 0.55+ compatibility.

2. **Worker initialization** — replace the two-message `common/initialize.js`
   protocol with the single-message `start()` pattern that Monaco's own workers
   use (compatible across all versions).

3. **Schema URI handling** — fix the `normalizeId` mismatch bug in
   `JSONSchemaService` (store and look up with the same normalized key).
   Allow custom URI protocols without requiring `enableSchemaRequest: true`.
   The schema object is already provided inline; the URI should just be an
   identifier, not a fetch target.

4. **`yaml-language-server` bundling** — the LSP server has heavy CJS
   dependencies. A fork could pre-bundle or replace them to simplify worker
   loading.

5. **Singleton enforcement** — `configureMonacoYaml` currently throws if called
   twice. A fork could support reconfiguration or multiple instances for
   different editor contexts.
