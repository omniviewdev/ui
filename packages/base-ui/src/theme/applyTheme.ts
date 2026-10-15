import { dottedKeyToCssVar } from './registry/keyTransform';
import type { RegisteredTheme } from './registry';

interface RootThemeOwner {
  token: symbol;
  properties: Set<string>;
}

export interface ThemeRootApplier {
  apply(theme: Readonly<RegisteredTheme>): void;
  cleanup(): void;
}

const ROOT_THEME_OWNER = new WeakMap<HTMLElement, RootThemeOwner>();

export function createThemeRootApplier(root: HTMLElement): ThemeRootApplier {
  const token = Symbol('ThemeRootApplier');

  return {
    apply(theme) {
      const previousOwner = ROOT_THEME_OWNER.get(root);
      if (previousOwner) {
        for (const property of previousOwner.properties) root.style.removeProperty(property);
      }

      const properties = new Set<string>();
      ROOT_THEME_OWNER.set(root, { token, properties });
      root.dataset.ovTheme = theme.builtIn ? theme.id : theme.base;
      if (theme.builtIn) delete root.dataset.ovThemeCustom;
      else root.dataset.ovThemeCustom = theme.id;
      root.style.colorScheme = theme.appearance;

      if (!theme.builtIn) {
        for (const [key, value] of Object.entries(theme.definition.tokens)) {
          if (value === undefined) continue;
          const property = dottedKeyToCssVar(key);
          root.style.setProperty(property, value);
          properties.add(property);
        }
      }
    },

    cleanup() {
      const owner = ROOT_THEME_OWNER.get(root);
      if (owner?.token !== token) return;
      for (const property of owner.properties) root.style.removeProperty(property);
      delete root.dataset.ovThemeCustom;
      ROOT_THEME_OWNER.delete(root);
    },
  };
}
