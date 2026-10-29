import { ThemeValidationError, validateThemeDefinition } from '../validation';
import { BUILT_IN_THEME_DEFINITIONS } from './builtIns';
import { BUILT_IN_THEME_BY_ID, BUILT_IN_THEMES } from './catalog';
import type {
  RegisteredTheme,
  ThemeDefinition,
  ThemeOwner,
  ThemeRegistry,
  ThemeRegistryListener,
  ThemeRegistrySnapshot,
  ThemeSummary,
} from './types';

const ownerMatches = (left: ThemeOwner, right: ThemeOwner) =>
  left.kind === right.kind && left.id === right.id;

const compareText = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0);

export function createThemeRegistry(): ThemeRegistry {
  const themes = new Map<string, Readonly<RegisteredTheme>>();
  const listeners = new Set<ThemeRegistryListener>();
  let snapshot: ThemeRegistrySnapshot;

  BUILT_IN_THEMES.forEach((summary, index) => {
    const definition = BUILT_IN_THEME_DEFINITIONS[index];
    if (!definition) throw new Error(`Missing built-in definition for "${summary.id}"`);
    themes.set(summary.id, Object.freeze({ ...summary, definition }));
  });

  const buildSnapshot = (): ThemeRegistrySnapshot => {
    const custom = [...themes.values()].filter(({ builtIn }) => !builtIn);
    custom.sort((left, right) => {
      const leftGroup = left.owner.kind === 'user' ? 0 : 1;
      const rightGroup = right.owner.kind === 'user' ? 0 : 1;
      return (
        leftGroup - rightGroup ||
        compareText(left.name, right.name) ||
        compareText(left.id, right.id)
      );
    });
    const summaries: readonly Readonly<ThemeSummary>[] = Object.freeze([
      ...BUILT_IN_THEMES,
      ...custom.map(({ id, name, base, appearance, description, builtIn, owner }) =>
        Object.freeze({ id, name, base, appearance, description, builtIn, owner }),
      ),
    ]);
    return Object.freeze({ themes: summaries });
  };

  snapshot = buildSnapshot();

  const notify = (): void => {
    for (const listener of [...listeners]) {
      try {
        listener();
      } catch {
        // A faulty consumer must not prevent other subscribers from observing mutation.
      }
    }
  };

  const invalidateSnapshot = (): void => {
    snapshot = buildSnapshot();
    notify();
  };

  const registry: ThemeRegistry = {
    register(theme: ThemeDefinition, owner: ThemeOwner): () => void {
      if (owner.kind === 'builtin') {
        throw new ThemeValidationError(
          'reserved_id',
          'owner.kind',
          'Only base-ui may register built-in themes',
        );
      }
      const definition = validateThemeDefinition(theme);
      const existing = themes.get(definition.id);
      if (existing) {
        throw new ThemeValidationError(
          existing.builtIn ? 'reserved_id' : 'duplicate_id',
          'id',
          existing.builtIn
            ? `Theme ID "${definition.id}" is reserved for a built-in theme`
            : `Theme "${definition.id}" is already registered`,
        );
      }
      const frozenOwner = Object.freeze({ ...owner });
      const registered: Readonly<RegisteredTheme> = Object.freeze({
        id: definition.id,
        name: definition.name,
        base: definition.base,
        appearance: BUILT_IN_THEME_BY_ID[definition.base].appearance,
        ...(definition.description === undefined ? {} : { description: definition.description }),
        builtIn: false,
        owner: frozenOwner,
        definition,
      });
      themes.set(definition.id, registered);
      invalidateSnapshot();

      let disposed = false;
      return () => {
        if (disposed) return;
        disposed = true;
        if (themes.get(definition.id) === registered) {
          themes.delete(definition.id);
          invalidateSnapshot();
        }
      };
    },

    unregister(id: string, owner: ThemeOwner): boolean {
      const registered = themes.get(id);
      if (!registered) return false;
      if (registered.builtIn) {
        throw new ThemeValidationError(
          'reserved_id',
          'id',
          `Cannot unregister built-in theme "${id}"`,
        );
      }
      if (!ownerMatches(registered.owner, owner)) {
        throw new ThemeValidationError(
          'owner_mismatch',
          'owner',
          `Theme "${id}" owner mismatch`,
        );
      }
      themes.delete(id);
      invalidateSnapshot();
      return true;
    },

    unregisterOwner(owner: ThemeOwner): number {
      if (owner.kind === 'builtin') {
        throw new ThemeValidationError(
          'reserved_id',
          'owner.kind',
          'Cannot unregister built-in themes',
        );
      }
      let removed = 0;
      for (const [id, registered] of themes) {
        if (!registered.builtIn && ownerMatches(registered.owner, owner)) {
          themes.delete(id);
          removed += 1;
        }
      }
      if (removed > 0) invalidateSnapshot();
      return removed;
    },

    get(id: string) {
      return themes.get(id);
    },

    has(id: string): boolean {
      return themes.has(id);
    },

    getSnapshot: () => snapshot,

    subscribe(listener: ThemeRegistryListener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  return registry;
}

export const themeRegistry: ThemeRegistry = createThemeRegistry();
