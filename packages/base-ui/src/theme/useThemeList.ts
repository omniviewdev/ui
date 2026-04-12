import { useSyncExternalStore } from 'react';
import { themeRegistry } from './registry';
import type { ThemeInfo } from './registry';

let snapshot: ThemeInfo[] = themeRegistry.list();
const invalidate = () => {
  snapshot = themeRegistry.list();
};

// Subscribe once at module scope so all `useThemeList` consumers share the
// same cached snapshot. Individual listeners added via `useSyncExternalStore`
// are notified below.
themeRegistry.subscribe((event) => {
  if (event.type === 'registered' || event.type === 'unregistered') {
    invalidate();
  }
});

/**
 * React hook that returns the current list of registered themes (built-in +
 * custom) and re-renders the calling component whenever a theme is
 * registered or unregistered.
 */
export function useThemeList(): readonly ThemeInfo[] {
  return useSyncExternalStore(
    (listener) =>
      themeRegistry.subscribe((event) => {
        if (event.type === 'registered' || event.type === 'unregistered') {
          listener();
        }
      }),
    () => snapshot,
    () => snapshot,
  );
}
