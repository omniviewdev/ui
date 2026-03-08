import { createContext, useContext } from 'react';
import type {
  CommandListConfigContextValue,
  CommandListActionsContextValue,
  CommandListStore,
} from '../types';

// ---------------------------------------------------------------------------
// Context 1: Config (rarely changes)
// ---------------------------------------------------------------------------

export const CommandListConfigContext = createContext<CommandListConfigContextValue | null>(null);

export function useCommandListConfig(): CommandListConfigContextValue {
  const ctx = useContext(CommandListConfigContext);
  if (!ctx) {
    throw new Error(
      'CommandList compound components must be used within <CommandList.Root>',
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Context 2: Store (stable ref, items subscribe via useSyncExternalStore)
// ---------------------------------------------------------------------------

export const CommandListStoreContext = createContext<CommandListStore | null>(null);

export function useCommandListStoreContext(): CommandListStore {
  const ctx = useContext(CommandListStoreContext);
  if (!ctx) {
    throw new Error(
      'CommandList compound components must be used within <CommandList.Root>',
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Context 3: Actions (stable identity, never causes re-renders)
// ---------------------------------------------------------------------------

export const CommandListActionsContext = createContext<CommandListActionsContextValue | null>(null);

export function useCommandListActions(): CommandListActionsContextValue {
  const ctx = useContext(CommandListActionsContext);
  if (!ctx) {
    throw new Error(
      'CommandList compound components must be used within <CommandList.Root>',
    );
  }
  return ctx;
}
