import { useCallback } from 'react';
import type {
  CommandListConfigContextValue,
  CommandListActionsContextValue,
  CommandListStore,
} from '../types';

interface UseCommandListFocusOptions {
  config: CommandListConfigContextValue;
  actions: CommandListActionsContextValue;
  store: CommandListStore;
}

/**
 * Keyboard navigation handler for command list.
 * Handles ArrowUp/Down, Enter, Escape, Home/End.
 */
export function useCommandListFocus({
  config,
  actions,
  store,
}: UseCommandListFocusOptions) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const items = store.getItems();
      if (items.length === 0 && event.key !== 'Escape') return;

      const snapshot = store.getSnapshot();

      const findNextEnabled = (startIndex: number, direction: 1 | -1): number => {
        const len = items.length;
        let idx = startIndex;
        for (let i = 0; i < len; i++) {
          idx += direction;
          if (config.loopFocus) {
            idx = ((idx % len) + len) % len;
          } else if (idx < 0 || idx >= len) {
            return -1;
          }
          if (!items[idx]!.disabled) {
            return idx;
          }
        }
        return -1;
      };

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const next = findNextEnabled(snapshot.activeIndex, 1);
          if (next >= 0) actions.moveActive(next - snapshot.activeIndex);
          break;
        }

        case 'ArrowUp': {
          event.preventDefault();
          const prev = findNextEnabled(snapshot.activeIndex, -1);
          if (prev >= 0) actions.moveActive(prev - snapshot.activeIndex);
          break;
        }

        case 'Home': {
          event.preventDefault();
          const first = items.findIndex((i) => !i.disabled);
          if (first >= 0) store.setActiveIndex(first);
          break;
        }

        case 'End': {
          event.preventDefault();
          for (let i = items.length - 1; i >= 0; i--) {
            if (!items[i]!.disabled) {
              store.setActiveIndex(i);
              break;
            }
          }
          break;
        }

        case 'Enter': {
          event.preventDefault();
          if (snapshot.activeKey != null) {
            const activeItem = items[snapshot.activeIndex];
            if (activeItem && !activeItem.disabled) {
              actions.invoke(snapshot.activeKey);
            }
          }
          break;
        }

        case 'Escape': {
          event.preventDefault();
          actions.dismiss();
          break;
        }

        default:
          break;
      }
    },
    [config.loopFocus, actions, store],
  );

  return { handleKeyDown };
}
