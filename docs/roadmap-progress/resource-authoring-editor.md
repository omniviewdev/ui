# Resource authoring and CEL editor integration

Status: implementation and rebased verification complete; final CodeRabbit/CI acceptance pending.

PR: https://github.com/omniviewdev/ui/pull/69

## Ownership and source baseline

- Branch: `feature/resource-intelligence-table-ui`.
- Rebased onto `c437aca` after workspace/build #57, command-palette #58 and table interactions #59 merged.
- Preserves the merged table implementation and prepared-results story; table functionality is not reimplemented here.
- Owns new query-authoring, visualization, resource workspace/inspector presentation controls and CEL editor/development language service, associated tests/stories/exports and documentation.
- Coordinated minor changeset for base-ui and editors. No unrelated workspace/build commits included.

## Roadmap scope

Reusable presentation/editor subsets contribute evidence to P16–P21, P23–P25, P27–P28, P30–P31, P33, P35–P41 and P43. This PR does not complete those end-to-end packets. Production provider/schema/access contracts, numeric admission, resource acquisition, live query transport, persistence and host integration remain gated.

## Implemented behavior

- Controlled query input/builder/variables, visualization bindings/layout, resource scope/saved configuration/navigation/inspection presentation.
- Monaco CEL completion, diagnostics, hover and signatures with debounce, cancellation and document isolation.
- Real Go CEL fixture evaluation and focused stdio/loopback HTTP LSP subset; fixtures and integer-only policy are development constraints, not production conformance.
- Native input preserves document URI and excludes unsupported snippet candidates. Editor stories close documents and dispose adapters on teardown.
- Redundant composition-only stories removed; editor workbench and focused component stories retained.

## Integration gates

- Rebased verification passed: base-ui 1,531 tests across 137 files, editors 239 tests across 16 files, seven theme type tests, both package typechecks/builds, root Storybook build and Go race suite.
- Actual Chromium workbench: `resource.status.` offers conditions/phase/podIP; phase values offer Pending/Running; selecting Running and executing matches frontend-web and queue-worker, not batch-pending.
- Independent post-rebase boundary review found no Important/Critical issues. All three CodeRabbit corrections are implemented: named Explore save-action group, canonical declared CEL CSS color tokens, and first-supported LSP hover format negotiation with clean plaintext fallback.
- Correction verification: workspace controls 32 tests across four files; CEL editor 28 tests across five files; both typechecks; rebuilt Storybook; actual Chromium computed surface/text/focus colors match theme tokens. Go race suite passed, including seven HTTP hover negotiation cases; actual isolated HTTP exchanges proved Markdown, plaintext preference and missing-capability fallback. Completion/signature documentation remains plaintext.
- Changeset check and Storybook preview passed on the initial PR head. CodSpeed macro runner is blocked by organization billing, not a benchmark result. User explicitly approved a documented infrastructure exception after all runnable checks and CodeRabbit pass; no CI configuration or billing settings will be weakened.
- Admin bypass remains authorized for missing human approval; no unresolved correctness or runnable test failure is accepted.

## Shared tracking

- Parent roadmap: https://github.com/omniviewdev/omniview/issues/78
- Delivery project: https://github.com/orgs/omniviewdev/projects/13
- Editor packet: https://github.com/omniviewdev/ui/issues/62
- After merge, integration owner records the released-source evidence and remaining production acceptance in the host work-package/readiness ledger. No full packet should automatically close from this UI PR.

## P18 host feasibility evidence — 2026-10-24

**Bounded evidence, not full packet acceptance or design approval.** Issue [ui#61](https://github.com/omniviewdev/ui/issues/61) remains open. Reused the merged [UI69](https://github.com/omniviewdev/ui/pull/69) `CelQueryEditor` (which owns the existing internal `attachCelBridge`) and public `QueryInput`; no second editor, Resource Intelligence showcase, production adapter, table or layout implementation was added. Recommendation for independent review: reuse `CelQueryEditor` **on demand in CEL code mode**, not per row or as an always-mounted simple search field. The lightweight input is materially cheaper and remains the existing native-input alternative. Coordinator approval must be recorded before retained P19 work; this receipt does not freeze C09.

### Source and reproducibility

- Actual measured CLI-owned workspace `p18-editor-feasibility`, UUID `37c896d0-54e7-45d9-9d88-8d258efdb484`; host `fd50802230bd2df7f101c23fd85061c11dcd9aa8`, SDK `1e92fb518b117814acb504aaae1772ff39abcdef`, UI `229a060885acea203410b1b113c68e4016d81b97`. This receipt-only publication is integrated onto UI main `af5ed53bae3ed9e6fa666a1b5d5e0c9e676ad72f`, preserving UI71 and subsequent progress; that newer UI source is not silently substituted for the measured cohort, and no current-base runtime claim is made.
- Browser endpoint was the actual Wails host `http://127.0.0.1:34716/`, hash route `#/__p18-editor-feasibility`, generation `49faa3a3-afa6-45c0-9df3-1b3043fc2ce4`; boot UUID/generation and CLI selected host source agreed. Chrome `150.0.7871.24`, headless, 1440×1000; local development measurements, not shipping performance budgets.
- Every CLI/Go child used the clean private `baseline-env`, `GOWORK=off`, reviewed SDK and existing pinned link evidence. Launch used `workspace up --mode browser --watch=false`; the existing fixture service used `go run . -listen 127.0.0.1:16138` from `tools/cel-language-service`. Both candidates consumed its real cloud-profile LSP with the same 250ms debounce and 50-result limit; no canned completions, inventory fetch or client evaluator.
- Portable [P18 evidence bundle](evidence/p18-editor-feasibility-2026-10-24.zip), SHA-256 `af5a426899347589cfa197e7a36ebca72a26d0bc123605f091833eed8f0ea2b2`: actual browser samples, original measurement helpers, disposable source, recording, completion/overlay images, accessibility snapshots and native/restoration receipts. Its manifest records the exact cohort and original/published member hashes. HTTP(S)/WebSocket resource-URL queries/fragments and credential-shaped strings were sanitized; application routes such as the harmless `wails://localhost/#/__p18-editor-feasibility` remain. The immutable manifest's shorter “JSON URL queries/fragments” description is not a claim that every application fragment was removed. Numeric, Boolean and null observations were compared with the unchanged private originals. This does not turn preliminary/failed observations into acceptance. The retained disposable source hash is `bf513ffdb3c402c19058f3cb3b4317b2f6d45f97dbcc7d8691767a2f1f73d621`; the archive is evidence, not a retained application route.
- [Portable browser bootstrap](evidence/p18-browser-bootstrap.mjs) supplies a standalone Node/Playwright adapter for the **unchanged archived helpers**, without the private browser-Eval device. It creates fresh isolated browser contexts, installs worker instrumentation before navigation, checks the fresh descriptor/boot UUID, generation and recorded source cohort, captures first/warm latency, and runs two separate 20-cycle service-backed heap batches per candidate. It waits for completed adapter/document disposal before collecting CDP heap/DOM observations and closes its own contexts/browser. It never grants clipboard permissions or touches an OS clipboard. The adapter and worker initializer are supplied reproduction code, not recovered historical instrumentation. Independent portable-evidence source review approved the supplement without Important findings; `node --check` exited0.

The [portable execution receipt](evidence/p18-portable-browser-reproduction.json) records the subsequently exercised **actual Wails host** at the original fd508022/1e92fb5/UI229a060 cohort, generation `34afb19c-61e8-4a6a-803f-170a375a3a3c`. Under an explicit coordinator quiet grant, the exact bootstrap completed once in 41.28s using pinned Playwright1.50.1 / Chromium133.0.6943.16 and **built assets** (`--live-frontend=false`). Both candidates completed first1 + warm20 cycles and separate fresh-context20 +20 heap cycles against the real fixture service. Each heap page recorded40 adapter disposals; Monaco additionally recorded40 document closes and zero final live models. These new optimized-build/automation results are not timing-equivalent to the historical Chrome150/browser-Eval development measurements below and establish neither native acceptance nor a leak-free plateau. Raw mode0600 observations remain private; the linked allowlisted summary excludes request/resource URLs, headers and tokens and records the raw SHA-256.

After measurement, the actual workspace was stopped before removing the exact disposable page and two router additions. Router SHA-256 returned to `48e01ae2412fcf90ff8c4f2c026a32bd136144a059fb7251fe59e216132b003f`. Ordinary restored browser generation `7b50fea6-6ad4-4502-a828-ffa9e01d9743` then passed real host-confirmed identity, no experiment global/comparison DOM, settings Appearance/Editor and empty plugin inventory. The owned browser closed, canonical down reported stopped, and the owned fixture stopped (no16138 listener). Managed generated outputs were not reset or hand-adopted. This restoration smoke is DOM/identity evidence, not a new pixel/OS accessibility pass.

#### Portable reproduction prerequisites and sequence

Run only under an explicit coordinator verification/quiet grant. Use a **new owned, plugin-free CLI workspace**, not a reset of the preserved measured workspace. Select the exact host/SDK/UI commits above; source preparation, native pnpm12.14.0, Node, Go, Task and host prerequisites must already be available. The bootstrap resolves `@playwright/test` from the selected host's `e2e/package.json`, not a globally installed/new package. That historical checkout pins Playwright1.50.1; use its installed Chromium or supply an explicit owned executable as the optional final argument and retain the reported version. Do not silently reuse an authenticated user browser.

The historical `baseline-env` and actual successful link-protocol report were local operational prerequisites, **not members of the ZIP**. The following credential-cleared equivalent replaces the machine-specific wrapper. Resolve only reviewed tool binaries from the operator's PATH; `pnpm` must be the actual canonical native12.14.0 executable, not Corepack/a shell launcher. No ambient credential, proxy, kubeconfig, npm token, SSH agent, `GOFLAGS` or `go.work` selection is copied:

```sh
umask 077
RUN="$(mktemp -d /tmp/omniview-p18.XXXXXX)"
mkdir -m 700 "$RUN/home" "$RUN/tmp"
NODE="$(command -v node)"
PNPM="$(command -v pnpm)"
GO="$(command -v go)"
TASK="$(command -v task)"
SAFE_PATH="$(dirname "$NODE"):$(dirname "$PNPM"):$(dirname "$GO"):$(dirname "$TASK"):/usr/bin:/bin:/usr/sbin:/sbin"
p18env() {
  /usr/bin/env -i HOME="$RUN/home" PATH="$SAFE_PATH" TMPDIR="$RUN/tmp" \
    XDG_CONFIG_HOME="$RUN/home/.config" XDG_CACHE_HOME="$RUN/home/.cache" \
    XDG_DATA_HOME="$RUN/home/.local" GOWORK=off GOFLAGS= \
    OMNIVIEW_PNPM_EXECUTABLE="$PNPM" "$@"
}
```

Set absolute `HOST`, `SDK`, `WORKSPACE`, `BUNDLE` (extracted ZIP) and `BOOTSTRAP` (the linked `.mjs`) paths in the operator shell; all child commands go through `p18env`. Set `LINK_EVIDENCE` to a **real successful report produced on the selected cohort** using the SDK-aware protocol-probe recipe in [the pinned host workspace guide](https://github.com/omniviewdev/omniview/blob/fd50802230bd2df7f101c23fd85061c11dcd9aa8/docs/development-workspaces.md#bootstrap-the-local-cli-and-sources). The archived observations do not authorize fabricating/reusing asserted booleans as a new probe. Follow that same canonical guide to initialize the collection/register all three explicit source refs and create the new workspace without starting it. Private credentials/caches from another HOME are not prerequisites.

Copy `styled-disposable-host-comparison.tsx` from the bundle to the owned host's `ui/pages/p18-editor-feasibility.tsx`. Temporarily import `EditorFeasibility` from `../../pages/p18-editor-feasibility` in **`ui/features/router/routes.tsx`** and add `{ path: '__p18-editor-feasibility', Component: EditorFeasibility }` to the `/` CoreLayout's `children`. Do not modify the unused `ui/routes.tsx`. Preserve the saved public `@omniviewdev/editors/styles.css` import and the host/UI sibling directory layout used by the saved development-adapter import.

From the host directory, obtain the canonical CLI, then launch the existing cloud-fixture service in a separate owned terminal (its lifetime must remain tracked):

```sh
cd "$HOST"
DEV="$(p18env "$TASK" --silent dev:cli:build SDK_SOURCE="$SDK")"
# In a second shell with the same explicit private wrapper/paths:
cd "$WORKSPACE/ui/tools/cel-language-service"
p18env "$GO" run . -listen 127.0.0.1:16138
```

Back in the host directory/shell, after the real service is listening:

```sh
p18env "$DEV" workspace up --workspace "$WORKSPACE" --mode browser --mcp=false \
  --watch=false --reviewed-sdk-revision 1e92fb518b117814acb504aaae1772ff39abcdef \
  --link-evidence "$LINK_EVIDENCE" --timeout 20m --json
p18env "$DEV" workspace inspect --workspace "$WORKSPACE" --json > "$RUN/fresh-inspect.json"
p18env "$NODE" "$BOOTSTRAP" "$HOST/e2e/package.json" "$BUNDLE" \
  "$RUN/fresh-inspect.json" "$RUN/new-browser-observations.json"
```

Use the fresh **workspace inspect envelope**, not an archived descriptor or `instance inspect`'s different response shape. The runner navigates only the actual descriptor browser endpoint plus the saved hash route, never a guessed Vite URL. Each candidate gets one fresh context for first + 20 warm cycles and a different fresh context for before/after20/after40 forced-GC samples. Real fixture completion must become visible every cycle; unavailable service/identity/disposal is a failure, not a fallback. Worker records cover construction and explicit `terminate()` calls; CDP live targets are separate and do not prove automatic worker termination or a heap plateau.

The runner does not replay OS IME, clipboard, assistive technology, theme/overlay recording or all original manual browser interactions. Those remain documented original bounded observations, not bootstrap acceptance. New JSON is written exclusively to a new file with mode0600 and **may contain development HMR URL credentials**: keep it private until a separate sanitization/privacy review; never publish raw runner output.

Finally run canonical `workspace down`, remove only the exact disposable page/route additions, exercise the ordinary restored host under the same explicit grant, then down again and stop the owned fixture service. Preserve source/restoration/down evidence; do not reset/clean generated files or kill a listener with unknown ownership.

#### Disclosure audit and publication state

The existing independent privacy review approved scoped disclosure with no concrete credential/data leak identified; it inspected all textual members and sampled preserved media, not every video frame. A resumption audit of the unchanged ZIP confirmed 21 unique flat regular0644 members (no symlink, executable, absolute/traversal/backslash path), all published/original manifest hashes and sizes, and 26,016 unchanged numeric/Boolean/null values across the JSON members. No archive was repacked and no private original was changed. Workspace UUIDs, loopback endpoints and private temporary paths are provenance, not authorization tokens; the fixture catalog is development data, not acquired inventory.

The receipt, unchanged ZIP, portable bootstrap and allowlisted execution summary are published together as bounded evidence, not full ui#61 acceptance. The publication workspace `p18-evidence-publication-v2`, UUID `b39894b0-b1b8-4e87-8f84-341ac4cb4806`, selects UI main `af5ed53bae3ed9e6fa666a1b5d5e0c9e676ad72f` and the required host `6fcc62e05219bb31232ce06017db3d2b8c69be73` without starting or installing either. Current UI71/progress remains intact; only this receipt and its linked evidence are added. Portable source review, syntax checking and the actual original-cohort browser reproduction were exercised separately from publication-base integration. The integration owner retains selection approval, central-ledger/project reconciliation and all remaining native/OS/heap gates.

### Measured browser comparison

| Measurement (milliseconds unless noted) | Existing lightweight `QueryInput` | Existing Monaco `CelQueryEditor` |
| --- | --- | --- |
| First mount in an already-loaded host document, click to visible labeled textarea | 13.2 | 362.0 |
| First source-handler to mount callback (excludes automation transport) | 3.0 | 325.5 |
| First script focus to active textarea | 18.9 | 4.3 |
| Warm mount, 20 cycles: median / p95 | 8.6 / 13.6 | 29.4 / 40.8 |
| Warm script focus, 20 cycles: median / p95 | 8.2 / 8.8 | 1.7 / 2.1 |
| Candidate-isolated forced-GC JS heap: before / after20 / after40 cycles (bytes) | 40,847,960 / 43,393,624 / 44,087,332 | 40,917,660 / 48,583,568 / 49,331,620 |
| Model ownership after disposal | No Monaco model | Zero retained Monaco models |
| Completed adapter disposal callbacks in isolated run | 40/40 | 40/40, plus 40 document-close callbacks |

“First” is first editor/model mount, **not** a cold application process or standalone candidate download. Focus timings include browser automation/DOM focus, not OS focus or paint latency. The shell eagerly loads Monaco/shared dependencies, and the comparison imports both candidates, so common bytes/module heap cannot be attributed to one candidate. An uncached CDP network run observed 654 host-baseline requests / 39,631,949 encoded bytes; entering the disposable route added 5 requests / 131,757 bytes, including experiment/service/style overhead. Candidate mounts added 6 / 11,813 bytes and 9 / 12,518 bytes respectively, primarily fixture transport; the parent-page session does not include the workers' entire import graph. Resource Timing's default buffer saturated in an earlier sample; use the separate CDP network evidence rather than interpreting identical buffered totals as zero cost.

Monaco's first styled mount constructed two YAML workers and one editor worker through the **existing host** setup; native input constructed none. Repeated Monaco mounts caused worker churn: editor workers terminated; one global YAML worker remained at the final observed browser sample. This is not a claim that every worker should be destroyed with a model. The actual development worker entry responses were 4,854,810 bytes (YAML bundle) and 7,529 bytes (editor module entry, excluding its imports). In the consumed optimized native asset build, shared `editor.api` was 4,223,955 bytes and `editor.main` 1,776,853 bytes; editor worker 525,292 bytes, YAML worker 1,459,685 bytes; the disposable route was 32,554 bytes and editors CSS 8,238 bytes. These are selected build/dev costs, not a shipping gzip comparison.

Both isolated heap series still increased in the second batch (~0.69MB / ~0.75MB); CDP total node counts grew despite zero live editors/models. Detached/tooling/shared-state contributions were not causally isolated. Therefore **no leak-free plateau, per-editor retained-size estimate or native heap pass is established**. The final mixed interaction page also includes shared theme, language, module and tooling state. Lifecycle success is limited to actual model/document/adapter disposal and observed transport shutdown; request listeners ended before the last asynchronous shutdown/exit, so their 19/20 terminal RPC counts are not a claimed leak.

### Editing, accessibility and host overlays

- Both candidates obtained real cloud fields (`cpuCount`, `generation`, `name`, `publicIP`, `region`, `state`, `tags`). Enter changed exactly `resource.` → `resource.cpuCount` without submitting; native Enter after dismissal submitted once, while Monaco used Meta+Enter. Shift+Enter inserted a newline in both; plain Monaco Enter without a suggestion inserts a newline.
- Native Tab dismissed and moved to the following host button. Monaco Tab kept editor focus and inserted indentation. A compact host adapter must explicitly choose/document Tab focus behavior rather than assume `tabCompletion: 'off'` means Tab exits.
- A CRLF/multiline string containing `東京😀` reached both controlled documents through Chromium `Input.insertText`, normalized to LF without losing the Unicode text. **This is insertion/paste-equivalent simulation, not an OS clipboard pass.** The browser clipboard helper wrote only its shim while paste read the page clipboard; default/exact-context permission attempts and `page.browserContext().overridePermissions` did not obtain actual write permission. The exact-context CDP grant also reported context-not-found. No successful OS-global clipboard write was made.
- Chromium `Input.imeSetComposition` + Enter + a 350ms observation + commit produced composition events; neither candidate submitted or issued LSP work during composition. Synthetic Enter produced a newline in the native textarea preedit path but not Monaco. Real OS IME candidate selection/commit/cancellation remains unverified; this synthetic result must not be relabeled native IME success.
- Actual Chromium accessibility snapshots expose native `combobox` label, expanded state, listbox/options, active selection and described keyboard instructions; Monaco exposes its labeled multiline textbox and suggestion options. Monaco's visible shortcut hint is not connected with `aria-describedby` in the pinned component. These are AX-tree/DOM semantics, **not VoiceOver/NVDA announcement or screen-reader interaction proof**.
- Both candidates opened suggestions inside the real host `Popover`; screenshots retain geometry within the viewport. First Escape dismissed suggestions while leaving the host overlay open and editor focused. Actual host Appearance settings switched Void → Light → Void in a second private host tab; both editors/overlays updated their colors, rather than merely changing a CSS attribute by hand.
- Browser diagnostics include aborted LSP requests during cancellation/disposal and an aborted codicon request; the tool's bounded diagnostic ring dropped older entries. Do not claim an exhaustive zero-error run from it.

### Real native boundary and remaining acceptance

The live-frontend native launch failed readiness with CLI exit7 after 1200s (generation `bb4d225f-687d-46b4-9ac5-859d642a2351`); logs show actual native/MCP startup followed by Vite reoptimization/reload, not an authenticated native-ready surface. A distinct documented launch with `--mode native --mcp --watch=false --live-frontend=false` succeeded at generation `932901fb-ae90-4a63-84b8-00f525bdff2d`. Authenticated `main.AppService.GetInstanceInfo` matched the exact UUID, state root, generation, selected source and cohort. Actual `wails://localhost/` WebKit 605.1.15 rendered the labeled native textarea and a correctly styled 52px Monaco editor.

Native script-to-labeled-input observations were 30ms / 1778ms, and script-focus observations 1ms / 9ms; **not comparable to foreground native user latency**: the owned window reported `visible=false`, `document.hasFocus()=false` even after its ordinary show command. A synthetic repeated benchmark exceeded the MCP's 30s response deadline, and a longer wait lost its HTTP response; the final captured sample had zero models, 11 completed native-input and 10 completed Monaco adapter disposals (including the initial mounts), with corresponding Monaco document-close callbacks. This does not establish a completed native warm-latency benchmark.

The development fixture service rejects actual `Origin: wails://localhost` with HTTP403 (`only loopback browser origins permitted`), and the native UI displayed `Load failed`. No CORS policy, backend, host proxy or fallback was added for this experiment. WebKit exposes no `performance.memory`; the pinned MCP provides JavaScript/DOM simulation and structural snapshots, not native pixels, OS input, OS accessibility-tree/screen-reader control or a native heap profiler. Native completion/IME/paste/announcement and retained-heap acceptance therefore remain open. Required missing capabilities are an authorized real OS IME/clipboard/screen-reader interaction session and native memory tooling, plus a separately approved native-compatible authoritative authoring transport; installing Monaco or successful JS injection cannot substitute for them.

### Precise adapter/lifecycle requirements before retained integration

1. Consume the pinned public `CelQueryEditor`, `CelQueryEditorProps`, `CodeEditor.onMount`, `QueryInput` and presentation DTOs. `attachCelBridge` is internal, not a public package export. Actual locks resolve Monaco 0.52.2 and `@monaco-editor/react` 4.7.0; do not design from latest online APIs.
2. Import public `@omniviewdev/editors/styles.css` (exporting `dist/editors.css`) and preserve base-ui theme ownership. Omitting it in the first throwaway setup produced a 5px Monaco surface; that setup and its timings are explicitly excluded. Do not change the host shell or worker bootstrap as part of this receipt.
3. Mount one model per active authoring surface only; keep controlled text/version/context and stable document identity, typed data bindings, half-open UTF-8 edit validation and explicit UTF-16/CRLF/Unicode conversion. Define production schema/access generations and transport in C09/P19, not in this experiment.
4. Preserve one automatic debounce, immediate explicit completion, cancellation and stale-generation/model suppression. Close documents, abort pending channels and dispose registrations/markers/subscriptions on unmount/context change; detach/dispose the model/editor through existing ownership. Confirm shared worker lifetime separately from per-model disposal.
5. Explicitly specify completion acceptance versus execution, plain/Shift+Enter and Tab/focus policy, Escape ownership between suggestions and enclosing popovers, restored focus, connected accessible instructions/status and real assistive-technology behavior.
6. Prove foreground native input/transport/overlay behavior and investigate the non-plateau retained state before asserting production budgets or leak-free operation. Independent review and explicit coordinator selection approval are still required; no P19 implementation is authorized by the recommendation alone.

The temporary comparison page/import and active hash route were removed; the originally touched unused route also returned to its exact original source snapshot. Ordinary built-assets browser startup then reached generation `a61e2893-a4d3-4d05-95c3-987f48b0ceee`: the actual host details confirmed UUID/generation/state/source/cohort, experiment global was undefined, comparison count was zero, settings navigation worked and the plugin page showed the selected empty inventory (`No plugins installed`, marketplace unavailable). Ordinary pixel capture timed out; DOM/confirmed-identity evidence is retained without a screenshot-pass claim. The browser tab closed, canonical `workspace down` returned `launchPhase: stopped`, and the owned fixture service stopped with no listener left on16138. Only this narrow receipt is intended to remain. Coordinator owns durable publication links, selection approval and central readiness/project reconciliation; full ui#61 must not close from this browser/native subset alone.
