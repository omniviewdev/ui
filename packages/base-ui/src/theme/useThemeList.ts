import { useSyncExternalStore } from 'react';
import { themeRegistry } from './registry';
import type { ThemeRegistry } from './registry';

export function useThemeList(registry: ThemeRegistry = themeRegistry) {
  return useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot,
  ).themes;
}
