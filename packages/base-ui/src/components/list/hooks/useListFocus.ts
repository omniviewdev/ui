import { useCallback } from 'react';
import type { Key, ListConfigContextValue, ListActionsContextValue, ListStore } from '../types';

interface UseListFocusOptions {
  config: ListConfigContextValue;
  actions: ListActionsContextValue;
  store: ListStore;
}

/**
 * Keyboard navigation handler for list components.
 * Implements roving focus with ArrowUp/Down, Home/End, Enter/Space,
 * Ctrl+A, and Shift+Arrow range selection.
 */
export function useListFocus({ config, actions, store }: UseListFocusOptions) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const keys = store.getRegisteredKeys();
      if (keys.length === 0) return;

      const snapshot = store.getSnapshot();
      const currentIndex = snapshot.activeKey != null ? keys.indexOf(snapshot.activeKey) : -1;

      const isVertical = config.orientation === 'vertical';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

      const findNextEnabled = (startIndex: number, direction: 1 | -1): Key | null => {
        let idx = startIndex;
        const len = keys.length;
        for (let i = 0; i < len; i++) {
          idx += direction;
          if (config.loopFocus) {
            idx = ((idx % len) + len) % len;
          } else if (idx < 0 || idx >= len) {
            return null;
          }
          const candidate = keys[idx] as Key;
          if (!snapshot.disabledKeys.has(candidate)) {
            return candidate;
          }
        }
        return null;
      };

      const findFirstEnabled = (): Key | null => {
        const found = keys.find((k) => !snapshot.disabledKeys.has(k));
        return found !== undefined ? found : null;
      };

      const findLastEnabled = (): Key | null => {
        for (let i = keys.length - 1; i >= 0; i--) {
          const k = keys[i] as Key;
          if (!snapshot.disabledKeys.has(k)) return k;
        }
        return null;
      };

      switch (event.key) {
        case nextKey: {
          event.preventDefault();
          const next = findNextEnabled(currentIndex, 1);
          if (next != null) {
            actions.setActiveKey(next);
            if (event.shiftKey && config.selectionMode === 'multiple') {
              actions.selectRange(next);
            }
          }
          break;
        }

        case prevKey: {
          event.preventDefault();
          const prev = findNextEnabled(currentIndex, -1);
          if (prev != null) {
            actions.setActiveKey(prev);
            if (event.shiftKey && config.selectionMode === 'multiple') {
              actions.selectRange(prev);
            }
          }
          break;
        }

        case 'Home': {
          event.preventDefault();
          const first = findFirstEnabled();
          if (first != null) actions.setActiveKey(first);
          break;
        }

        case 'End': {
          event.preventDefault();
          const last = findLastEnabled();
          if (last != null) actions.setActiveKey(last);
          break;
        }

        case 'Enter':
        case ' ': {
          event.preventDefault();
          if (snapshot.activeKey != null && config.selectionMode !== 'none') {
            if (config.selectionMode === 'multiple') {
              actions.toggle(snapshot.activeKey);
            } else {
              actions.select(snapshot.activeKey);
            }
          }
          break;
        }

        case 'a':
        case 'A': {
          if ((event.metaKey || event.ctrlKey) && config.selectionMode === 'multiple') {
            event.preventDefault();
            actions.selectAll();
          }
          break;
        }

        default:
          break;
      }
    },
    [config, actions, store],
  );

  return { handleKeyDown };
}
