# Contextual CEL Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Replace the query textarea experience with Monaco-backed contextual CEL editing and realistically evaluated examples.

**Architecture:** Monaco in editors owns lexical highlighting, editing and bounded candidate matching. A host-compatible language adapter supplies semantic candidates, checking, hover and signatures; a real Go CEL development service demonstrates this against fixture resources without claiming production Wails integration. Base-ui keeps toolbar/builder controls and accepts an editor composition slot, never imports editors.

**Tech Stack:** Existing React/Monaco 0.52.x/editor theme setup, TypeScript, Go with GOWORK=off, reviewed cel-go dependency in an isolated development-tool module.

**Spec:** User-approved design in conversation: contextual matches (`cccc` none, `cp` ranked), member/type/macro-variable context, actual debounce, rich documentation and syntax highlighting, real Pod CEL examples plus non-Kubernetes coverage.

## Global Constraints

- Work only in isolated resource-intelligence-ui worktrees; preserve user/mainline files. No automatic commits, merges or pushes.
- No client CEL evaluator or full inventory/schema processing; lexical highlighting and bounded completion matching are presentation work.
- No base-ui→editors dependency cycle. Production services are not replaced by fixture fallbacks.
- Development service must actually parse/check/evaluate CEL, refuse invalid expressions, bound input/evaluation and expose fixture identity clearly. No string-pattern fake evaluation or canned completion responses.
- Receiver functions obey CEL types. Integer members cannot be invented to fill a menu.
- One automatic debounce (initial 250ms), immediate explicit completion, cancellation and document/context generation protection. Do not stack Monaco and transport delays.
- Use existing workers/theme ownership, model-specific registrations and disposal; no global per-editor interference.
- All Go commands GOWORK=off; Wails bindings only task bindings if needed (not required for the development adapter).

## Task 1: Monaco editor and authoring composition

**Files:** Existing base-ui query-authoring/types.ts and QueryAuthoring.tsx; new editors/src/components/cel-query-editor directory; existing editor setup/theme helpers and public export barrels.

**Interface:** Existing QueryDocument/QueryLanguageRequest/QueryLanguageResponse remain source-version/context keyed with half-open UTF-8 edits. Extend presentation types with optional filterText/sortText/snippet metadata and separate hover/signature results as required; document exact types before consumers. Authoring gets an injected editor render callback using controlled document/change/context/availability/run props. Monaco adapter implements those callbacks, maps UTF-8↔Monaco positions and CancellationToken↔AbortSignal. Do not create a second production query editor renderer.

- [ ] Inspect existing CodeEditor/bootstrap/theme, current query scheduling and exports; inspect symbol references before changing public contracts.
- [ ] Define and communicate exact presentation adapter interfaces with Task 2 before implementation.
- [ ] Add regression cases for relevance/order, replacement ranges, debounce and cancellation, Unicode, multi-editor isolation and keyboard acceptance/submission.
- [ ] Implement CEL tokenization, compact growing editor, native suggestion documentation, snippets, hover/signatures/markers and scoped disposal.
- [ ] Preserve builder and code drafts across conversion; migrate workbench code mode and remove superseded production textarea rendering after all callers migrate.
- [ ] Run focused tests/types and actual browser proofs after edits settle; record measured automatic request timing and worker/model cleanup.

## Task 2: Real CEL development language service

**Files:** New isolated development tool under tools/cel-language-service with its own go.mod, Go source and meaningful Go tests; UI story adapter under an owned development/story directory. No host mainline dependency changes.

**Interface:** Bind loopback only. JSON requests carry document{text,version}, UTF-8 cursor, contextKey and fixture profile, no AbortSignal serialization. Completion response matches agreed Task 1 types. Separate check/evaluate/hover/signature endpoints share one environment/catalog; exact route names and payloads published to integration owner before consumers. Frontend aborts fetch; Go propagates request context cancellation.

- [ ] Inspect existing CEL evidence/profile limitations and select/pin an available reviewed dependency; verify supported profile, licensing and numeric boundaries rather than silently adopt the numeric prototype patch.
- [ ] Implement actual CEL parser/checker/evaluator using provider-neutral declared schemas and bindings; fixture profiles include Pod, cloud instance and VM with optional/map/array fields.
- [ ] Implement incomplete-expression completion context, receiver applicability, partial identifiers/replacement ranges, map keys/observed bounded values and macro-local scopes. Return actual names/types/documentation, never fixed cpu/minimumCpu lists.
- [ ] Test `cccc`, `cp`, nested member paths, string functions vs integer nonmembers, exists local variables, escaped strings/maps, malformed input and resource limits; compare evaluation outcomes against known fixture resources.
- [ ] Demonstrate Pod status/labels/containers/image predicates and typed variables, checked invalid overloads and absent fields, plus non-Kubernetes expressions. Numeric unsupported cases must be explicit, not incorrect success.
- [ ] Run the actual loopback service and exercise JSON endpoints with cancellation and expression results; document safe launch and dependency/profile limits.

## Task 3: Integrated stories, review and verification

**Files:** Existing ResourceWorkbench.stories.tsx, query-authoring/editor stories, component status and changelog.

- [ ] Connect real development adapter rather than static fixtureLanguage or Run counter; show explicit disconnected service state with launch instructions, never a fake success fallback.
- [ ] Include rich Pod and non-Kubernetes examples with selectable fixture resources, actual checking/evaluation results and contextual member/function suggestions.
- [ ] Review independent implementations and integrated boundaries; resolve Important/Critical findings with consumer-visible regressions.
- [ ] Verify actual browser typing/pause/request counts, popup details/signatures/highlighting, precise edits, macro scopes, theme/popover behavior, IME, denied/disconnected states, multi-editor isolation and disposal.
- [ ] Run affected tests/typechecks, build base-ui then editors and complete Storybook. Report unrelated existing Calendar suite timeout separately; do not suppress it.
- [ ] Update docs/changelog after smoke; preserve isolated worktrees and explicitly report production-host integration limits.
