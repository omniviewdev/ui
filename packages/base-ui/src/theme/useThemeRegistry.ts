import { themeRegistry } from './registry';
import type { ThemeRegistry } from './registry';

/** Returns the module-level theme registry singleton. */
export function useThemeRegistry(): ThemeRegistry {
  return themeRegistry;
}
