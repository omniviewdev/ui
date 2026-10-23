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
