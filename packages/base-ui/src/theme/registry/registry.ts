import {
  COLOR_TOKEN_KEYS,
  SYNTAX_TOKEN_KEYS,
  TERMINAL_TOKEN_KEYS,
} from '../generated/tokenKeys';
import { BUILT_IN_THEME_DEFINITIONS, BUILT_IN_THEME_IDS } from './builtIns';
import { validateKeys } from './keyTransform';
import type {
  ThemeDefinition,
  ThemeInfo,
  ThemeRegistry,
  ThemeRegistryEvent,
  ThemeRegistryListener,
} from './types';

function validateDefinition(def: ThemeDefinition): void {
  if (def.colors) {
    const invalid = validateKeys(Object.keys(def.colors), COLOR_TOKEN_KEYS);
    if (invalid.length > 0) {
      throw new Error(`Unknown color token key(s): ${invalid.join(', ')}`);
    }
  }
  if (def.syntax) {
    const invalid = validateKeys(Object.keys(def.syntax), SYNTAX_TOKEN_KEYS);
    if (invalid.length > 0) {
      throw new Error(`Unknown syntax token key(s): ${invalid.join(', ')}`);
    }
  }
  if (def.terminal) {
    const invalid = validateKeys(Object.keys(def.terminal), TERMINAL_TOKEN_KEYS);
    if (invalid.length > 0) {
      throw new Error(`Unknown terminal token key(s): ${invalid.join(', ')}`);
    }
  }
}

export function createThemeRegistry(): ThemeRegistry {
  const themes = new Map<string, ThemeDefinition>();
  const listeners = new Set<ThemeRegistryListener>();
  const injectedProperties = new Set<string>();
  let activeId = 'dark';

  for (const def of BUILT_IN_THEME_DEFINITIONS) {
    themes.set(def.id, def);
  }

  function emit(event: ThemeRegistryEvent): void {
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (err) {
        // A misbehaving listener must not break other subscribers.
        console.error('theme registry listener threw', err);
      }
    }
  }

  const registry: ThemeRegistry = {
    register(theme) {
      if (themes.has(theme.id)) {
        throw new Error(`Theme '${theme.id}' is already registered`);
      }
      validateDefinition(theme);
      themes.set(theme.id, theme);
      emit({ type: 'registered', id: theme.id });
    },
    unregister(id) {
      if (BUILT_IN_THEME_IDS.has(id)) {
        throw new Error(`Cannot unregister built-in theme '${id}'`);
      }
      if (!themes.has(id)) return;
      themes.delete(id);
      emit({ type: 'unregistered', id });
    },
    get(id) {
      return themes.get(id);
    },
    list(): ThemeInfo[] {
      return Array.from(themes.values()).map((t) => ({
        id: t.id,
        name: t.name,
        base: t.base,
        builtIn: BUILT_IN_THEME_IDS.has(t.id),
      }));
    },
    has(id) {
      return themes.has(id);
    },
    apply(_id) {
      throw new Error('apply() not yet implemented');
    },
    active() {
      return activeId;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  // Silence unused-var warnings for fields reserved for apply().
  void injectedProperties;
  void activeId;

  return registry;
}

/** Module-level singleton. */
export const themeRegistry: ThemeRegistry = createThemeRegistry();
