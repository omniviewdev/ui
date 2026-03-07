import { useCallback, useRef } from 'react';
import type { ListActionsContextValue, ListStore } from '../types';
import { TYPEAHEAD_TIMEOUT_MS } from '../constants';

interface UseTypeaheadOptions {
  enabled: boolean;
  actions: ListActionsContextValue;
  store: ListStore;
}

/**
 * Typeahead search within list items.
 * Accumulates typed characters and focuses the first matching item.
 */
export function useTypeahead({ enabled, actions, store }: UseTypeaheadOptions) {
  const bufferRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleTypeahead = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!enabled) return;

      // Only handle printable single characters
      if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      // Don't interfere with Space for selection
      if (event.key === ' ') return;

      bufferRef.current += event.key.toLowerCase();
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        bufferRef.current = '';
      }, TYPEAHEAD_TIMEOUT_MS);

      const search = bufferRef.current;
      const keys = store.getRegisteredKeys();
      const snapshot = store.getSnapshot();

      for (const key of keys) {
        if (snapshot.disabledKeys.has(key)) continue;
        const textValue = store.getTextValue(key);
        if (textValue && textValue.toLowerCase().startsWith(search)) {
          actions.setActiveKey(key);
          break;
        }
      }
    },
    [enabled, actions, store],
  );

  return { handleTypeahead };
}
