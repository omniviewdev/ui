import {
  COLOR_TOKEN_KEYS,
  SYNTAX_TOKEN_KEYS,
  TERMINAL_TOKEN_KEYS,
} from '../generated/tokenKeys';
import { BUILT_IN_THEME_DEFINITIONS, BUILT_IN_THEME_IDS } from './builtIns';
import { dottedKeyToCssVar, validateKeys } from './keyTransform';
import { LIGHT_THEME_MODES } from './types';
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
  let activeId: string | null = null;

  for (const def of BUILT_IN_THEME_DEFINITIONS) {
    themes.set(def.id, def);
  }

  function emit(event: ThemeRegistryEvent): void {
    for (const listener of [...listeners]) {
      try {
        listener(event);
      } catch (err) {
        // A misbehaving listener must not break other subscribers.
        console.error('theme registry listener threw', err);
      }
    }
  }

  function clearInjectedProperties(): void {
    if (typeof document === 'undefined') return;
    const style = document.documentElement.style;
    for (const prop of injectedProperties) {
      style.removeProperty(prop);
    }
    injectedProperties.clear();
  }

  function applyOverrides(section: Record<string, string> | undefined): void {
    if (!section || typeof document === 'undefined') return;
    const style = document.documentElement.style;
    for (const [key, value] of Object.entries(section)) {
      const cssVar = dottedKeyToCssVar(key);
      style.setProperty(cssVar, value);
      injectedProperties.add(cssVar);
    }
  }

  function setAttributes(def: ThemeDefinition): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-ov-theme', def.base);
    const isBuiltIn = BUILT_IN_THEME_IDS.has(def.id);
    if (isBuiltIn) {
      root.removeAttribute('data-ov-theme-custom');
    } else {
      root.setAttribute('data-ov-theme-custom', def.id);
    }
    root.style.colorScheme = LIGHT_THEME_MODES.has(def.base) ? 'light' : 'dark';
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
      const removed = themes.get(id);
      if (!removed) return;
      const wasActive = activeId === id;
      themes.delete(id);
      emit({ type: 'unregistered', id });
      if (wasActive) {
        // Reconcile DOM + activeId by falling back to the removed theme's base.
        registry.apply(removed.base);
      }
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
    apply(id) {
      const def = themes.get(id);
      if (!def) throw new Error(`Unknown theme '${id}'`);
      clearInjectedProperties();
      setAttributes(def);
      if (!BUILT_IN_THEME_IDS.has(def.id)) {
        applyOverrides(def.colors as Record<string, string> | undefined);
        applyOverrides(def.syntax as Record<string, string> | undefined);
        applyOverrides(def.terminal as Record<string, string> | undefined);
      }
      activeId = id;
      emit({ type: 'applied', id });
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

  return registry;
}

/** Module-level singleton. */
export const themeRegistry: ThemeRegistry = createThemeRegistry();
