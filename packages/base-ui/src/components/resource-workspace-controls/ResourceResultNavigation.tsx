import { useEffect, useId } from 'react';
import { Button } from '../button/Button';
import type { ResourceNavigationResult, WorkspaceActionResult } from './types';
import { useWorkspaceAction } from './useWorkspaceAction';
import styles from './ResourceWorkspaceControls.module.css';

export interface ResourceResultNavigationProps<TResource, TContext> {
  result: ResourceNavigationResult<TResource>;
  /** Passed intact to the host so opening a drawer/route can retain the originating workspace. */
  context: TContext;
  /** Host destination/context generation. Change to cancel a pending navigation; object identity is irrelevant. */
  requestKey: string | number;
  onNavigate: (
    result: ResourceNavigationResult<TResource>,
    context: TContext,
    signal: AbortSignal,
  ) => Promise<WorkspaceActionResult>;
}

export function ResourceResultNavigation<TResource, TContext>({
  result,
  context,
  requestKey,
  onNavigate,
}: ResourceResultNavigationProps<TResource, TContext>) {
  const action = useWorkspaceAction();
  const id = useId();
  const { cancel } = action;
  useEffect(() => cancel, [requestKey, cancel]);
  return (
    <div className={styles.Root} aria-busy={action.pending}>
      <Button
        variant="ghost"
        aria-label={`Open ${result.label}`}
        aria-describedby={id}
        disabled={action.pending || Boolean(result.disabledReason)}
        onClick={() => {
          void action.run((signal) => onNavigate(result, context, signal));
        }}
      >
        {result.label}
      </Button>
      <p id={id} className={styles.Description}>
        {result.provenance}
        {result.disabledReason ? ` · ${result.disabledReason}` : ''}
      </p>
      {action.pending ? (
        <Button size="sm" onClick={action.cancel}>
          Cancel navigation
        </Button>
      ) : null}
      {action.result ? (
        <p role={action.result.status === 'success' ? 'status' : 'alert'}>
          {action.result.message ?? action.result.status}
        </p>
      ) : null}
    </div>
  );
}
