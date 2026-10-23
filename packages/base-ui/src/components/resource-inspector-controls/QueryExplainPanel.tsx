import { useId } from 'react';
import { Diagnostics, Evidence } from './InspectorEvidence';
import type { QueryExplain } from './types';
import styles from './ResourceInspectorControls.module.css';

export interface QueryExplainPanelProps {
  explain?: QueryExplain;
  state?: 'ready' | 'loading' | 'denied' | 'unavailable';
  message?: string;
}

export function QueryExplainPanel({ explain, state = 'ready', message }: QueryExplainPanelProps) {
  const headingId = useId();
  return (
    <section className={styles.Root} aria-labelledby={headingId} aria-busy={state === 'loading'}>
      <h2 id={headingId}>Query explain</h2>
      {state !== 'ready' ? (
        <p role="status">
          {state === 'loading'
            ? 'Loading query explain…'
            : state === 'denied'
              ? 'Query explain access denied'
              : 'Query explain unavailable'}
          {message ? `: ${message}` : ''}
        </p>
      ) : null}
      {state === 'ready' && explain ? (
        <>
          <h3>{explain.queryLabel}</h3>
          <dl className={styles.Details}>
            <dt>Scope</dt>
            <dd>{explain.scope}</dd>
            <dt>Coverage</dt>
            <dd>{explain.coverage}</dd>
            <dt>Freshness</dt>
            <dd>{explain.freshness}</dd>
            <dt>Plan selection</dt>
            <dd>{explain.selectionReason}</dd>
            {explain.measuredAt ? (
              <>
                <dt>Measured at</dt>
                <dd>{explain.measuredAt}</dd>
              </>
            ) : null}
          </dl>
          <ol className={styles.List} aria-label="Host plan stages">
            {explain.stages.map((stage) => (
              <li className={styles.Card} key={stage.id}>
                <h4>{stage.label}</h4>
                <p>{stage.description}</p>
                <p className={styles.Muted}>
                  Indexes:{' '}
                  {stage.indexIds.length
                    ? stage.indexIds.join(', ')
                    : 'None; scan or non-index stage'}
                </p>
                <div className={styles.Grid}>
                  {stage.work.map((work, index) => (
                    <Evidence key={`${work.label}-${index}`} evidence={work} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
          {explain.stages.length === 0 ? <p>No plan stages supplied by the host.</p> : null}
          <Diagnostics diagnostics={explain.diagnostics} />
        </>
      ) : state === 'ready' ? (
        <p>No query explain has been supplied.</p>
      ) : null}
    </section>
  );
}
