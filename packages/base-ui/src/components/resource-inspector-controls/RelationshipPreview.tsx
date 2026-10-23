import { useId } from 'react';
import { Button } from '../button/Button';
import { Diagnostics } from './InspectorEvidence';
import type { RelationshipEndpoint, RelationshipPreviewData } from './types';
import styles from './ResourceInspectorControls.module.css';

export interface RelationshipPreviewProps {
  preview?: RelationshipPreviewData;
  state?: 'ready' | 'loading' | 'denied' | 'unavailable';
  message?: string;
  onNavigate?: (navigationId: string) => void;
}

const stateLabels = {
  matched: 'Matched',
  unmatched: 'Unmatched',
  ambiguous: 'Ambiguous',
  denied: 'Denied',
  unavailable: 'Unavailable',
};

function Endpoint({
  endpoint,
  onNavigate,
}: {
  endpoint: RelationshipEndpoint;
  onNavigate?: (navigationId: string) => void;
}) {
  const navigationId = endpoint.navigationId;
  return navigationId && onNavigate ? (
    <Button
      variant="ghost"
      onClick={() => onNavigate(navigationId)}
      aria-label={`Open ${endpoint.label}`}
    >
      {endpoint.label}
    </Button>
  ) : (
    <span>{endpoint.label}</span>
  );
}

export function RelationshipPreview({
  preview,
  state = 'ready',
  message,
  onNavigate,
}: RelationshipPreviewProps) {
  const headingId = useId();
  return (
    <section className={styles.Root} aria-labelledby={headingId} aria-busy={state === 'loading'}>
      <h3 id={headingId}>Relationship preview</h3>
      {state !== 'ready' ? (
        <p role="status">
          {state === 'loading'
            ? 'Preview pending…'
            : state === 'denied'
              ? 'Preview access denied'
              : 'Preview unavailable'}
          {message ? `: ${message}` : ''}
        </p>
      ) : null}
      {state === 'ready' && preview ? (
        <>
          <p>
            Bounded preview: {preview.edges.length} edges · limit {preview.limit}
            {preview.truncated ? ' · Truncated; not all relationships are shown' : ''}
          </p>
          <dl className={styles.Details}>
            <dt>Scope</dt>
            <dd>{preview.scope}</dd>
            <dt>Coverage</dt>
            <dd>{preview.coverage}</dd>
          </dl>
          <p>{preview.summary}</p>
          <Diagnostics diagnostics={preview.diagnostics} />
          <ul className={styles.List} aria-label="Relationship edges">
            {preview.edges.map((edge) => (
              <li className={styles.Card} key={edge.id}>
                <div className={styles.Row}>
                  <span className={styles.Status}>{stateLabels[edge.state]}</span>
                  <Endpoint
                    endpoint={edge.source}
                    onNavigate={
                      edge.state === 'denied' || edge.state === 'unavailable'
                        ? undefined
                        : onNavigate
                    }
                  />
                  <span aria-label="to">→</span>
                  {edge.target ? (
                    <Endpoint
                      endpoint={edge.target}
                      onNavigate={
                        edge.state === 'denied' || edge.state === 'unavailable'
                          ? undefined
                          : onNavigate
                      }
                    />
                  ) : (
                    <span>
                      {edge.state === 'unavailable'
                        ? 'Target unavailable'
                        : edge.state === 'denied'
                          ? 'Target access denied'
                          : edge.state === 'unmatched'
                            ? 'No matched target in this coverage'
                            : 'Target not supplied'}
                    </span>
                  )}
                </div>
                <p>{edge.detail}</p>
                <p>
                  {edge.provenance.origin === 'provider' ? 'Provider-defined' : 'User-defined'} ·{' '}
                  {edge.provenance.ruleLabel}
                </p>
                <p className={styles.Basis}>
                  Condition: {edge.provenance.condition} · Scope mapping:{' '}
                  {edge.provenance.scopeMapping}
                </p>
              </li>
            ))}
          </ul>
          {preview.edges.length === 0 ? (
            <p>No relationship examples in this bounded preview.</p>
          ) : null}
        </>
      ) : state === 'ready' ? (
        <p>No preview supplied. Run a host-validated bounded preview.</p>
      ) : null}
    </section>
  );
}
