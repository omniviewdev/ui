import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkspaceActionResult } from './types';

/** Ignores completions after cancellation/unmount, including hosts that cannot abort work. */
export function useWorkspaceAction() {
  const current = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<WorkspaceActionResult | null>(null);

  useEffect(
    () => () => {
      current.current?.abort();
      current.current = null;
    },
    [],
  );

  const cancel = useCallback(() => {
    current.current?.abort();
    current.current = null;
    setPending(false);
    setResult(null);
  }, []);
  async function run(action: (signal: AbortSignal) => Promise<WorkspaceActionResult>) {
    if (current.current) return;
    const controller = new AbortController();
    current.current = controller;
    setResult(null);
    setPending(true);
    try {
      const next = await action(controller.signal);
      if (current.current === controller) setResult(next);
    } catch (error) {
      if (current.current === controller) {
        setResult({
          status: 'error',
          message: error instanceof Error ? error.message : 'The host operation failed.',
        });
      }
    } finally {
      if (current.current === controller) {
        current.current = null;
        setPending(false);
      }
    }
  }

  return { pending, result, run, cancel };
}
