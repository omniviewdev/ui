import { useId, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import styles from './ResourceWorkspaceControls.module.css';

export interface ExploreWorkspaceProps {
  title?: string;
  scope: ReactNode;
  query: ReactNode;
  variables?: ReactNode;
  grouping?: ReactNode;
  results: ReactNode;
  saveActions?: ReactNode;
  status?: ReactNode;
  inspector?: ReactNode;
  loading?: boolean;
  className?: string;
}

/** Composition only. Hosts retain query leases, routing, rendering and all query semantics. */
export function ExploreWorkspace({
  title = 'Explore',
  scope,
  query,
  variables,
  grouping,
  results,
  saveActions,
  status,
  inspector,
  loading,
  className,
}: ExploreWorkspaceProps) {
  const id = useId();
  return (
    <section className={cn(styles.Workspace, className)} aria-labelledby={`${id}-title`}>
      <header className={styles.Header}>
        <h1 id={`${id}-title`} className={styles.Title}>
          {title}
        </h1>
        {saveActions ? (
          <div role="group" aria-label="Explore save actions">
            {saveActions}
          </div>
        ) : null}
      </header>
      <a className={styles.SkipLink} href={`#${id}-results`}>
        Skip to results
      </a>
      <div className={styles.Columns}>
        <aside className={styles.Root} aria-label="Explore sources">
          {scope}
        </aside>
        <div className={styles.Main}>
          <section aria-label="Explore query">{query}</section>
          {variables ? <section aria-label="Explore variables">{variables}</section> : null}
          {grouping ? <section aria-label="Explore grouping">{grouping}</section> : null}
          {status ? <div role="status">{status}</div> : null}
          <section
            id={`${id}-results`}
            tabIndex={-1}
            aria-label="Explore results"
            aria-busy={loading}
          >
            {results}
          </section>
        </div>
        {inspector ? <aside aria-label="Explore inspector">{inspector}</aside> : null}
      </div>
    </section>
  );
}
