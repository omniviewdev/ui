import { useEffect, useRef, useState } from 'react';
import type { InspectorAsyncContext } from './types';

/** UI request state only; cancellation does not claim that host-owned work has stopped. */
export function useInspectorAction(contextKey: string) {
  const active = useRef<{ controller: AbortController; key: string } | null>(null);
  const currentKey = useRef(contextKey);
  currentKey.current = contextKey;
  const [state, setState] = useState<{ key: string; pending?: string; error?: string }>({
    key: contextKey,
  });

  // A context transition invalidates presentation state permanently, including A → B → A.
  // Reset during render so an abandoned request is never exposed again before an effect runs.
  if (state.key !== contextKey) {
    setState({ key: contextKey });
  }

  useEffect(
    () => () => {
      active.current?.controller.abort();
      active.current = null;
    },
    [contextKey],
  );

  function cancel() {
    active.current?.controller.abort();
    active.current = null;
    setState({ key: contextKey });
  }

  function run(
    label: string,
    action: (context: InspectorAsyncContext) => Promise<void>,
    onSuccess?: () => void,
  ) {
    if (active.current?.key === contextKey) return;
    active.current?.controller.abort();
    const request = { controller: new AbortController(), key: contextKey };
    active.current = request;
    setState({ key: contextKey, pending: label });
    void (async () => {
      try {
        await action({ signal: request.controller.signal });
        if (
          active.current !== request ||
          currentKey.current !== request.key ||
          request.controller.signal.aborted
        )
          return;
        active.current = null;
        setState({ key: contextKey });
        onSuccess?.();
      } catch (error: unknown) {
        if (
          active.current !== request ||
          currentKey.current !== request.key ||
          request.controller.signal.aborted
        )
          return;
        active.current = null;
        setState({
          key: contextKey,
          error: error instanceof Error ? error.message : 'Request failed. Please try again.',
        });
      }
    })();
  }

  return {
    pending: state.key === contextKey ? state.pending : undefined,
    error: state.key === contextKey ? state.error : undefined,
    run,
    cancel,
  };
}
