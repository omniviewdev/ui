import { createContext, useContext } from 'react';
import type {
  TreeConfigContextValue,
  TreeActionsContextValue,
  TreeStore,
} from '../types';

// ---------------------------------------------------------------------------
// Context 1: Config (rarely changes)
// ---------------------------------------------------------------------------

export const TreeConfigContext = createContext<TreeConfigContextValue | null>(null);

export function useTreeConfig(): TreeConfigContextValue {
  const ctx = useContext(TreeConfigContext);
  if (!ctx) {
    throw new Error(
      'TreeList compound components must be used within <TreeList.Root>',
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Context 2: Store (stable ref, items subscribe via useSyncExternalStore)
// ---------------------------------------------------------------------------

export const TreeStoreContext = createContext<TreeStore | null>(null);

export function useTreeStoreContext(): TreeStore {
  const ctx = useContext(TreeStoreContext);
  if (!ctx) {
    throw new Error(
      'TreeList compound components must be used within <TreeList.Root>',
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Context 3: Actions (stable identity, never causes re-renders)
// ---------------------------------------------------------------------------

export const TreeActionsContext = createContext<TreeActionsContextValue | null>(null);

export function useTreeActions(): TreeActionsContextValue {
  const ctx = useContext(TreeActionsContext);
  if (!ctx) {
    throw new Error(
      'TreeList compound components must be used within <TreeList.Root>',
    );
  }
  return ctx;
}
