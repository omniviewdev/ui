# Fixture CEL development language service

This isolated development tool demonstrates real CEL authoring and fixture evaluation. It is **not** a Wails service, production catalog, acquisition system, or authorization boundary. It changes no host Go dependencies. There is no client CEL evaluator or disconnected fixture-success fallback.

```sh
cd tools/cel-language-service
GOWORK=off go run .
# explicit alternative loopback port:
GOWORK=off go run . -listen 127.0.0.1:6131
# conventional editor clients (no HTTP listener or dependency):
GOWORK=off go run . -stdio
# regression suite:
GOWORK=off go test ./... -count=1
```

The default listener is `http://127.0.0.1:6130`; non-loopback listeners are rejected. Browser origins must also be loopback. Stop with Ctrl-C. The development adapter lives at `packages/editors/src/development/cel-language-service/index.ts`, not the production package barrel.

## Dependency and semantic boundary

The service pins the available upstream [`cel.dev/cel-go v0.32.0`](https://github.com/google/cel-go/tree/v0.32.0), licensed [Apache-2.0](https://github.com/google/cel-go/blob/v0.32.0/LICENSE), and its Go module checksums. The cached upstream module declares `cel.dev/cel-go`; no numeric prototype fork, replacement directive, or evaluator patch is used. Apache-2.0 license/notice obligations still apply when redistributing dependencies. The development tool does not establish mixed floating-point/integer correctness for production. Accordingly this **development-only integer numeric profile** admits exact int64 fields and decimal-string parameters and rejects double literals and `double(...)` conversion throughout the parsed expression (including nested collections/macros). It is not a decision to restrict the production profile. Exact generation `9007199254740993` remains exact end to end. Explicit `dyn` does not introduce double values because neither fixture admission nor accepted expressions supply them.

The provider-neutral catalog declares object, list, string-keyed string-map, string, int64 and bool types through runtime protobuf descriptors. A value adapter deliberately preserves provider optional-field absence instead of protobuf default scalar values: `has` reports false, and unguarded missing access returns a per-resource CEL error, not a false match. These are complete fixtures only. Nullable/union schemas, arbitrary provider schema ingestion, partial acquisition coverage, inventory, and real host services are not implemented or implied. Native CEL checker/evaluator semantics and receiver overloads remain authoritative.

The Pod profile is a deliberately declared subset of native Kubernetes field paths, not the complete Kubernetes schema. CPU requests use `container.resources.requests["cpu"]` **quantity strings** such as `"500m"`; no numeric quantity parser or fabricated `cpuRequestMilli` field is provided. Readiness uses `status.conditions` entries with `type == "Ready"` and `status == "True"` (a string, not a fabricated `status.ready` boolean). Native integer examples use `containerPort` and an exact int64 `minimumPort` binding.

## Focused LSP 3.17 authoring

Both transports use the same dispatcher and existing `Service.Complete/Check/Hover/Signature` engine. Supported methods are `initialize`, `initialized`, `shutdown`, `exit`, full-sync `textDocument/didOpen`, `didChange`, `didClose`, `completion`, `hover`, `signatureHelp`, pull `diagnostic`, and `$/cancelRequest`. No push diagnostics, incremental edits, resolve, formatting, rename, indexing, workspace diagnostics or execution requests are advertised.

Initialize with standard client capabilities and explicit development context:

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{"general":{"positionEncodings":["utf-16","utf-8"]}},"initializationOptions":{"profileId":"pod","resourceType":"Pod"}}}
```

`profileId` must be `pod`, `cloud` or `vm`; `resourceType` is optional descriptive metadata (at most 256 bytes), not authority or schema selection. Context is immutable for the session: shut down and initialize another session to change it. External clients must supply these initialization options too; there is no custom HTTP dependency or URI-based authorization convention. Document URIs are arbitrary absolute URIs (at most 2048 bytes), isolated per client. Use `languageId:"cel"` and integer document versions; changes contain exactly one full `{text}` replacement and strictly increase the version. Invalid notifications are ignored without changing the last accepted snapshot. Close documents when their editor is disposed.

`initialized` must follow the initialize response before authoring requests. Shutdown returns `result:null`; then send `exit`. Stdio exits successfully after shutdown/exit, and unsuccessfully on exit without shutdown or invalid framing. EOF closes all documents and pending requests. Every admitted cancelled request returns terminal JSON-RPC error `-32800`; changed/closed document snapshots return `-32801`. Other standard errors include parse `-32700`, invalid request `-32600`, unknown method `-32601`, invalid params `-32602`, and not initialized `-32002`. Resource admission failures use `-32000`.

**Stdio:** `-stdio` reads/writes standard `Content-Length: <UTF8 byte count>\r\n\r\n<JSON>` frames. stdout contains protocol frames only; errors go to stderr. Optional `Content-Type: application/vscode-jsonrpc; charset=utf-8` is accepted. Headers are limited to 8 KiB, messages to 32 KiB; duplicate lengths, invalid lengths, non-UTF8 content types and truncated frames terminate the connection. Requests may complete out of order; document notifications are applied in input order and cancellation remains readable during semantic work.

**Loopback HTTP:** `POST /lsp` accepts one JSON-RPC object with `Content-Type: application/json`. Initialize **without** a session header. A successful initialize response issues a random `X-CEL-LSP-Session` response header; send it on every later POST, including notifications. Clients cannot choose session IDs. JSON-RPC responses use HTTP 200; valid notifications use 204 with no body. Unknown/expired session IDs use 404, wrong media types 415, oversized bodies 413, and session capacity 429. CORS permits only loopback browser origins and exposes/allows the session header. `exit` immediately deletes the session; abandoned sessions expire after 30 minutes without HTTP activity. Browser fetch cancellation and explicit `$/cancelRequest` both reach the same dispatcher. This is a local development transport, not production authentication.

Default positions use UTF-16; the first offered supported `utf-8`/`utf-16` encoding is selected. Incoming positions convert to CEL UTF8 byte offsets; outgoing edit/hover/diagnostic ranges convert back to the negotiated line/character units. Unicode surrogate/byte splits are rejected, line-end positions clamp according to LSP, and CRLF is one line ending.

Completion items retain relevance `sortText`, source-compatible `filterText`, full replacement `textEdit`, plaintext documentation and type label details. Snippets are emitted only when the client advertises `textDocument.completion.completionItem.snippetSupport`; otherwise engine placeholders become plain text defaults. Kinds map field→5, function→3, parameter/local→6, observed value→12. Pull diagnostics return full reports. Hover selects the first supported `markdown` or `plaintext` entry in `textDocument.hover.contentFormat`, falling back to plaintext when absent or unsupported. Both render the same inferred name, type and documentation; plaintext has no service-added Markdown delimiters. Completion and signature documentation remain plaintext regardless of hover preferences. The editor owns its single 250ms debounce and stale-result protection; the transport does not debounce. Documentation is treated as untrusted text. Valid JSON-RPC notification envelopes never receive JSON-RPC responses, including unknown methods and invalid notification parameters.

Candidates come from the actual environment/catalog, applicable receiver overloads, macro-local declarations, and bounded fixture map-key/string observations. Root cloud `cp` ranks displayed `cpuCount` before `minimumCpu` and inserts `resource.cpuCount`; after `resource.` it inserts only `cpuCount`. Observed candidates display decoded values but preserve compatible raw escaped filter prefixes and replace the remaining literal content safely. No second semantic engine is introduced.

Bounds: 64 HTTP sessions, 16 open documents per session, 8 pending requests per session, 8192 UTF8 bytes per document, 32 KiB JSON message/body, 8 KiB stdio headers, four concurrent semantic/evaluation operations, 1-second authoring deadline, parser recursion 64, and 100 completion results. These are development budgets, not measured production recommendations.

## Separate fixture catalog and evaluation APIs

`GET /profiles` returns `{profiles, engine, limits}` with field documentation, parameter declarations/defaults, fixture summaries and executable examples. Fixture IDs are `pod-web`, `pod-pending`, `pod-worker`, `cloud-api`, `cloud-dev`, `vm-build`, `vm-idle`. Catalog lookup never initializes an LSP session.

`POST /evaluate` remains a separate development API requiring `Content-Type: application/json`:

```json
{
  "document": {"text": "resource.status.phase == desiredPhase", "version": 1},
  "cursor": {"offset": 37, "unit": "utf8-byte"},
  "contextKey": "story-context-revision",
  "fixtureProfile": "pod"
}
```

It uses UTF8 byte offsets and echoes `documentVersion`/`contextKey`. Results contain `{fixtureId,label,provider,resource,matched?,error?}`; checking errors prevent evaluation and runtime errors remain distinct from nonmatches. Optional `bindings` supplies exactly all declared parameters as `{kind:"int64"|"string"|"bool",value:string}`; integers are canonical signed int64 decimal strings, booleans `"true"`/`"false"`. Omitted bindings use fixture defaults; values never interpolate into source. Unknown fields, missing/null required fields and `bindings:null` are rejected. Evaluation limits remain 200ms and CEL cost 10,000 with cancellation checks every 16 comprehensions. The old `/complete`, `/check`, `/hover`, `/signature` authoring routes are removed; there is no compatibility fallback.

## Actual CEL examples

- Pod lifecycle: `resource.status.phase == desiredPhase`
- Pod labels: `resource.metadata.labels["app.kubernetes.io/name"] == "frontend"`
- Container image: `resource.spec.containers.exists(c, c.name == "web" && c.image.startsWith(imagePrefix))`
- Nested correlated ports: `resource.spec.containers.exists(c, c.ports.exists(p, p.name == "http" && p.containerPort == 8080))`
- Typed native integer: `resource.spec.containers.exists(c, c.ports.exists(p, p.containerPort >= minimumPort))`
- CPU quantity string: `resource.spec.containers.exists(c, c.resources.requests["cpu"] == "500m")`
- Optional presence and readiness: `has(resource.status.podIP) && resource.status.conditions.exists(c, c.type == "Ready" && c.status == "True")`
- Cloud tags: `resource.cpuCount >= minimumCpu && resource.tags.exists(t, t.key == "env" && t.value == "prod")`
- Exact integer: `resource.generation == 9007199254740993` (cloud profile)
- VM hardware: `resource.hardware.cpu >= minimumCpu && resource.powerState == "running"`

No code↔builder conversion is advertised by this tool; complex expressions are never reverse-converted using hardcoded source patterns.
