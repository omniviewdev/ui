import { useCallback } from 'react';
import type { Key, TreeConfigContextValue, TreeActionsContextValue, TreeStore } from '../types';

interface UseTreeFocusOptions {
  config: TreeConfigContextValue;
  actions: TreeActionsContextValue;
  store: TreeStore;
}

/**
 * Tree-specific keyboard navigation:
 * - ArrowRight: collapsed branch → expand; expanded branch → first child; leaf → no-op
 * - ArrowLeft: expanded branch → collapse; otherwise → parent
 * - ArrowUp/Down: navigate flattened list (skip disabled)
 * - Home/End: first/last visible item
 * - Enter/Space: select active item
 * - Ctrl+A: select all (multiple mode)
 * - *: expand all siblings at current depth
 */
export function useTreeFocus({ config, actions, store }: UseTreeFocusOptions) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const snapshot = store.getSnapshot();
      const keys = snapshot.flattenedKeys as Key[];
      if (keys.length === 0) return;

      const currentIndex = snapshot.activeKey != null
        ? keys.indexOf(snapshot.activeKey)
        : -1;

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
          const candidate = keys[idx]!;
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
          const k = keys[i]!;
          if (!snapshot.disabledKeys.has(k)) return k;
        }
        return null;
      };

      switch (event.key) {
        case 'ArrowDown': {
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

        case 'ArrowUp': {
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

        case 'ArrowRight': {
          event.preventDefault();
          if (snapshot.activeKey == null) break;
          const nodeMeta = store.getNodeMeta(snapshot.activeKey);
          if (!nodeMeta?.isBranch) break;

          if (!snapshot.expandedKeys.has(snapshot.activeKey)) {
            // Collapsed branch → expand
            actions.expand(snapshot.activeKey);
          } else {
            // Expanded branch → move to first child
            const next = findNextEnabled(currentIndex, 1);
            if (next != null) {
              actions.setActiveKey(next);
            }
          }
          break;
        }

        case 'ArrowLeft': {
          event.preventDefault();
          if (snapshot.activeKey == null) break;
          const nodeMeta = store.getNodeMeta(snapshot.activeKey);

          if (nodeMeta?.isBranch && snapshot.expandedKeys.has(snapshot.activeKey)) {
            // Expanded branch → collapse
            actions.collapse(snapshot.activeKey);
          } else if (nodeMeta?.parentKey != null) {
            // Move to parent
            actions.setActiveKey(nodeMeta.parentKey);
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

        case '*': {
          event.preventDefault();
          // Expand all siblings at the current depth
          if (snapshot.activeKey == null) break;
          const activeMeta = store.getNodeMeta(snapshot.activeKey);
          if (!activeMeta) break;

          const flatNodes = store.getFlatNodes();
          for (const node of flatNodes) {
            if (
              node.depth === activeMeta.depth &&
              node.parentKey === activeMeta.parentKey &&
              node.isBranch
            ) {
              actions.expand(node.key);
            }
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
