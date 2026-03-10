# Monaco + YAML: Compatibility Notes

This document records the compatibility constraints and known issues between
`monaco-editor`, `monaco-yaml`, and `monaco-worker-manager` so that future
maintainers (or a potential fork) have full context.

---

## Version Matrix (as of March 2025)

| Package                | Version  | Notes                                           |
| ---------------------- | -------- | ----------------------------------------------- |
| `monaco-editor`        | `0.52.2` | Latest in the 0.52 line; **required** for yaml  |
| `monaco-yaml`          | `5.4.1`  | Peer dep says `>=0.36` but only tested on 0.52  |
| `monaco-worker-manager`| `2.0.1`  | Transitive dep of `monaco-yaml`                 |

## Why Not Monaco 0.55?

Monaco 0.55 introduced two breaking changes that are **fundamentally
incompatible** with `monaco-yaml@5.4.1` (via `monaco-worker-manager@2.0.1`):

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

**This is not patchable.** The worker initialization protocol in 0.55 is
structurally incompatible with how `monaco-worker-manager` bootstraps workers.

### Summary

```text
monaco-editor@0.55 + monaco-yaml@5.4.1 = broken (hangs on "Loading...")
monaco-editor@0.52 + monaco-yaml@5.4.1 = working (completions + validation)
```

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

## If We Fork `monaco-yaml`

Key areas to consider:

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
