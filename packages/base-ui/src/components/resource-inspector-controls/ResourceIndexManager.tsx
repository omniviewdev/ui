import { useId, useState } from 'react';
import { Button } from '../button/Button';
import { Progress } from '../progress/Progress';
import { Evidence, Footprint } from './InspectorEvidence';
import { useInspectorAction } from './useInspectorAction';
import type {
  InspectorAsyncContext,
  ResourceIndexAction,
  ResourceIndexAdvice,
  ResourceIndexDefinition,
  ResourceIndexInventory,
} from './types';
import styles from './ResourceInspectorControls.module.css';

export interface ResourceIndexManagerProps {
  indexes: readonly ResourceIndexInventory[];
  /** Host-admitted create definitions, including schema/scope/storage/data policy. */
  proposals: readonly ResourceIndexDefinition[];
  advice: readonly ResourceIndexAdvice[];
  onAction: (action: ResourceIndexAction, context: InspectorAsyncContext) => Promise<void>;
  state?: 'ready' | 'loading' | 'denied' | 'unavailable';
  message?: string;
}

type Approval = {
  kind: 'create' | 'rebuild' | 'drop';
  id: string;
  definition: ResourceIndexDefinition;
  indexKind?: ResourceIndexInventory['kind'];
  invalidated: boolean;
};

/** Copy only approval-relevant scalar fields, never a mutable host inventory object. */
function snapshotDefinition(definition: ResourceIndexDefinition): ResourceIndexDefinition {
  const { id, label, provider, resourceType, scope, path, valueType, schema, storage, dataPolicy } =
    definition;
  return { id, label, provider, resourceType, scope, path, valueType, schema, storage, dataPolicy };
}

function DefinitionDetails({ definition }: { definition: ResourceIndexDefinition }) {
  return (
    <dl className={styles.Details}>
      <dt>Provider / type</dt>
      <dd>
        {definition.provider} / {definition.resourceType}
      </dd>
      <dt>Scope</dt>
      <dd>{definition.scope}</dd>
      <dt>Path / type</dt>
      <dd>
        {definition.path} · {definition.valueType}
      </dd>
      <dt>Schema</dt>
      <dd>{definition.schema}</dd>
      <dt>Storage</dt>
      <dd>{definition.storage === 'memory' ? 'Memory only' : 'Persisted'}</dd>
      <dt>Data policy</dt>
      <dd>{definition.dataPolicy}</dd>
    </dl>
  );
}

export function ResourceIndexManager({
  indexes,
  proposals,
  advice,
  onAction,
  state = 'ready',
  message,
}: ResourceIndexManagerProps) {
  const headingId = useId();
  const [proposalId, setProposalId] = useState('');
  const [approval, setApproval] = useState<Approval | null>(null);
  const selectedProposal = proposals.find((proposal) => proposal.id === proposalId) ?? proposals[0];
  const approvedIndex =
    approval && approval.kind !== 'create'
      ? indexes.find((index) => index.id === approval.id)
      : undefined;
  const approvedDefinition =
    approval?.kind === 'create'
      ? proposals.find((proposal) => proposal.id === approval.id)
      : approvedIndex;
  const definitionChanged = Boolean(
    approval &&
    approvedDefinition &&
    (JSON.stringify(snapshotDefinition(approvedDefinition)) !==
      JSON.stringify(approval.definition) ||
      (approval.kind !== 'create' && approvedIndex?.kind !== approval.indexKind)),
  );
  if (approval && definitionChanged && !approval.invalidated) {
    setApproval({ ...approval, invalidated: true });
  }
  const allowed =
    state === 'ready' &&
    Boolean(approvedDefinition) &&
    !definitionChanged &&
    !approval?.invalidated &&
    (approval?.kind === 'create' ||
      Boolean(approvedIndex?.actions.includes(approval?.kind === 'drop' ? 'drop' : 'rebuild')));
  const action = useInspectorAction(
    `${state}:${approval?.kind ?? 'inventory'}:${approval?.id ?? ''}:${allowed}`,
  );

  function review(
    kind: Approval['kind'],
    definition: ResourceIndexDefinition,
    indexKind?: ResourceIndexInventory['kind'],
  ) {
    setApproval({
      kind,
      id: definition.id,
      definition: snapshotDefinition(definition),
      indexKind,
      invalidated: false,
    });
  }

  function canCancelBuild(indexId: string) {
    // This UI serializes host requests. Only cancellation of the rebuild being awaited
    // may interrupt that request; creation, dropping and other indexes remain untouched.
    return (
      !action.pending ||
      (action.pending === 'approve' &&
        approval?.kind === 'rebuild' &&
        approval.id === indexId &&
        allowed)
    );
  }

  function cancelBuild(indexId: string, operationId: string) {
    if (!canCancelBuild(indexId)) return;
    if (action.pending) action.cancel();
    action.run(
      'cancel-build',
      (context) => onAction({ kind: 'cancel', operationId }, context),
      () => setApproval(null),
    );
  }

  function approve() {
    if (!approval || !approvedDefinition || !allowed) return;
    const request: ResourceIndexAction =
      approval.kind === 'create'
        ? { kind: 'create', definition: approval.definition }
        : { kind: approval.kind, indexId: approval.id };
    action.run(
      'approve',
      (context) => onAction(request, context),
      () => setApproval(null),
    );
  }

  return (
    <section
      className={styles.Root}
      aria-labelledby={headingId}
      aria-busy={state === 'loading' || Boolean(action.pending)}
    >
      <h2 id={headingId}>Resource indexes</h2>
      <p className={styles.Muted}>
        Optional accelerators, not the source of truth. Dropping an index never deletes provider
        data or saved views.
      </p>
      {state !== 'ready' ? (
        <p role="status">
          {state === 'loading'
            ? 'Loading indexes…'
            : state === 'denied'
              ? 'Index access denied'
              : 'Index inventory unavailable'}
          {message ? `: ${message}` : ''}
        </p>
      ) : (
        <>
          <ul className={styles.List} aria-label="Index inventory">
            {indexes.map((index) => (
              <li className={styles.Card} key={index.id}>
                <div className={styles.Row}>
                  <h3>{index.label}</h3>
                  <span className={styles.Status}>
                    {index.kind === 'metadata' ? 'Metadata' : 'Document path'}
                  </span>
                  <span className={styles.Status}>{index.state}</span>
                </div>
                <DefinitionDetails definition={index} />
                <dl className={styles.Details}>
                  <dt>Coverage</dt>
                  <dd>{index.coverage}</dd>
                  <dt>Freshness</dt>
                  <dd>{index.freshness}</dd>
                  {index.generation ? (
                    <>
                      <dt>Generation</dt>
                      <dd>{index.generation}</dd>
                    </>
                  ) : null}
                  <dt>Memory</dt>
                  <dd>
                    <Footprint footprint={index.memory} />
                  </dd>
                  <dt>Disk</dt>
                  <dd>
                    <Footprint footprint={index.disk} />
                  </dd>
                  {index.quota ? (
                    <>
                      <dt>Budget</dt>
                      <dd>{index.quota}</dd>
                    </>
                  ) : null}
                  <dt>References</dt>
                  <dd>
                    {index.references.length
                      ? index.references
                          .map((reference) => `${reference.label} → ${reference.queryLabel}`)
                          .join('; ')
                      : 'No references reported by the host'}
                  </dd>
                  <dt>Fallback</dt>
                  <dd>{index.fallback}</dd>
                </dl>
                {index.failure ? <p className={styles.Error}>{index.failure}</p> : null}
                {index.operation ? (
                  <>
                    <p role="status">{index.operation.label}</p>
                    <Progress
                      aria-label={`${index.label} build progress`}
                      value={index.operation.progress}
                    />
                    {index.operation.cancellable ? (
                      <Button
                        disabled={!canCancelBuild(index.id)}
                        title={
                          canCancelBuild(index.id)
                            ? undefined
                            : 'Finish the unrelated pending index request before canceling this build.'
                        }
                        onClick={() => index.operation && cancelBuild(index.id, index.operation.id)}
                      >
                        Cancel build {index.label}
                      </Button>
                    ) : (
                      <p className={styles.Muted}>Cancellation unavailable for this operation.</p>
                    )}
                  </>
                ) : null}
                <div className={styles.Row}>
                  {index.actions.includes('rebuild') ? (
                    <Button
                      disabled={Boolean(action.pending)}
                      onClick={() => review('rebuild', index, index.kind)}
                    >
                      Rebuild {index.label}
                    </Button>
                  ) : null}
                  {index.actions.includes('drop') ? (
                    <Button
                      disabled={Boolean(action.pending)}
                      onClick={() => review('drop', index, index.kind)}
                    >
                      Drop {index.label}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {indexes.length === 0 ? <p>No indexes reported in this scope.</p> : null}
          {proposals.length > 0 ? (
            <div className={styles.Card}>
              <h3>Create a managed index</h3>
              <label className={styles.Field}>
                Host-admitted definition
                <select
                  className={styles.Select}
                  value={selectedProposal?.id ?? ''}
                  disabled={Boolean(action.pending)}
                  onChange={(event) => setProposalId(event.target.value)}
                >
                  {proposals.map((proposal) => (
                    <option key={proposal.id} value={proposal.id}>
                      {proposal.label}
                    </option>
                  ))}
                </select>
              </label>
              {selectedProposal ? <DefinitionDetails definition={selectedProposal} /> : null}
              <Button
                disabled={!selectedProposal || Boolean(action.pending)}
                onClick={() => selectedProposal && review('create', selectedProposal)}
              >
                Review creation
              </Button>
            </div>
          ) : null}
          <section className={styles.Root} aria-label="View index advice">
            <h3>View dependencies and advice</h3>
            <p className={styles.Muted}>
              Benefit is not guaranteed; compare before/after measurements.
            </p>
            {advice.length === 0 ? <p>No index recommendations supplied by the host.</p> : null}
            {advice.map((item) => (
              <article className={styles.Card} key={item.id}>
                <h4>
                  {item.viewLabel} → {item.queryLabel}
                </h4>
                <p>
                  Referenced indexes: {item.indexIds.length ? item.indexIds.join(', ') : 'None'}
                </p>
                <p>{item.recommendation}</p>
                <p>
                  Confidence: {item.confidence} · {item.basis}
                </p>
                <Evidence evidence={item.benefit} />
                <Evidence evidence={item.writeCost} />
                <dl className={styles.Details}>
                  <dt>Memory cost</dt>
                  <dd>
                    <Footprint footprint={item.memory} />
                  </dd>
                  <dt>Disk cost</dt>
                  <dd>
                    <Footprint footprint={item.disk} />
                  </dd>
                </dl>
                {item.beforeAfter ? (
                  <p>
                    Before: {item.beforeAfter.before} · After: {item.beforeAfter.after} ·{' '}
                    {item.beforeAfter.basis}
                  </p>
                ) : null}
                {item.proposalId &&
                proposals.some((proposal) => proposal.id === item.proposalId) ? (
                  <Button
                    disabled={Boolean(action.pending)}
                    onClick={() => {
                      const proposal = proposals.find(
                        (candidate) => candidate.id === item.proposalId,
                      );
                      if (proposal) review('create', proposal);
                    }}
                  >
                    Review suggested index for {item.viewLabel}
                  </Button>
                ) : null}
              </article>
            ))}
          </section>
          {approval ? (
            <section className={styles.Approval} aria-label={`Approve ${approval.kind}`}>
              <h3>
                Approve {approval.kind}: {approval.definition.label}
              </h3>
              <DefinitionDetails definition={approval.definition} />
              {approval.kind === 'drop' ? (
                <>
                  <p>
                    Referenced by:{' '}
                    {approvedIndex?.references.length
                      ? approvedIndex.references.map((reference) => reference.label).join(', ')
                      : 'No references reported by the host'}
                  </p>
                  <p>
                    Dropping preserves query correctness using scan fallback; it may increase query
                    cost. Provider data and views are not deleted.
                  </p>
                </>
              ) : approval.kind === 'rebuild' ? (
                <p>
                  Rebuild uses host-managed catch-up and activation. Fallback:{' '}
                  {approvedIndex?.fallback}
                </p>
              ) : (
                <p>
                  Creation may consume memory, disk and update budget. Only approve the displayed
                  scope, schema and data policy.
                </p>
              )}
              {definitionChanged || approval.invalidated ? (
                <p role="status">
                  The reviewed index definition changed. Dismiss and review the updated scope,
                  schema, storage and data policy.
                </p>
              ) : null}
              {!allowed ? (
                <p role="status">
                  This action is no longer available. Dismiss and refresh the inventory.
                </p>
              ) : null}
              <div className={styles.Row}>
                <Button disabled={!allowed || Boolean(action.pending)} onClick={approve}>
                  {action.pending === 'approve' ? 'Approving…' : `Approve ${approval.kind}`}
                </Button>
                <Button disabled={Boolean(action.pending)} onClick={() => setApproval(null)}>
                  Dismiss
                </Button>
              </div>
            </section>
          ) : null}
        </>
      )}
      {action.pending ? (
        <p role="status">
          Request pending. Host-owned work may continue after request cancellation.
        </p>
      ) : null}
      {action.error ? (
        <p role="alert" className={styles.Error}>
          {action.error}
        </p>
      ) : null}
    </section>
  );
}
