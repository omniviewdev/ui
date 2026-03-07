import { createContext, useContext } from 'react';
import type {
  ListConfigContextValue,
  ListActionsContextValue,
  ListStore,
} from '../types';

// ---------------------------------------------------------------------------
// Context 1: Config (rarely changes)
// ---------------------------------------------------------------------------

export const ListConfigContext = createContext<ListConfigContextValue | null>(null);

export function useListConfig(): ListConfigContextValue {
  const ctx = useContext(ListConfigContext);
  if (!ctx) {
    throw new Error(
      'List compound components must be used within <List.Root>',
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Context 2: Store (stable ref, items subscribe via useSyncExternalStore)
// ---------------------------------------------------------------------------

export const ListStoreContext = createContext<ListStore | null>(null);

export function useListStoreContext(): ListStore {
  const ctx = useContext(ListStoreContext);
  if (!ctx) {
    throw new Error(
      'List compound components must be used within <List.Root>',
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Context 3: Actions (stable identity, never causes re-renders)
// ---------------------------------------------------------------------------

export const ListActionsContext = createContext<ListActionsContextValue | null>(null);

export function useListActions(): ListActionsContextValue {
  const ctx = useContext(ListActionsContext);
  if (!ctx) {
    throw new Error(
      'List compound components must be used within <List.Root>',
    );
  }
  return ctx;
}
