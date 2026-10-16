import { dottedKeyToCssVar } from './registry/keyTransform';
import type { RegisteredTheme } from './registry';

interface RootThemeEntry {
  token: symbol;
  theme: Readonly<RegisteredTheme>;
  properties: Map<string, string>;
}

interface RootThemeOwners {
  entries: RootThemeEntry[];
  appliedProperties: Set<string>;
}

export interface ThemeRootApplier {
  apply(theme: Readonly<RegisteredTheme>): void;
  cleanup(): void;
}

const ROOT_THEME_OWNERS = new WeakMap<HTMLElement, RootThemeOwners>();

function renderCurrentTheme(root: HTMLElement, owners: RootThemeOwners): void {
  for (const property of owners.appliedProperties) root.style.removeProperty(property);
  owners.appliedProperties.clear();

  const current = owners.entries.at(-1);
  if (!current) {
    delete root.dataset.ovTheme;
    delete root.dataset.ovThemeCustom;
    root.style.removeProperty('color-scheme');
    ROOT_THEME_OWNERS.delete(root);
    return;
  }

  root.dataset.ovTheme = current.theme.builtIn ? current.theme.id : current.theme.base;
  if (current.theme.builtIn) delete root.dataset.ovThemeCustom;
  else root.dataset.ovThemeCustom = current.theme.id;
  root.style.colorScheme = current.theme.appearance;

  for (const [property, value] of current.properties) {
    root.style.setProperty(property, value);
    owners.appliedProperties.add(property);
  }
}

export function createThemeRootApplier(root: HTMLElement): ThemeRootApplier {
  const token = Symbol('ThemeRootApplier');

  return {
    apply(theme) {
      let owners = ROOT_THEME_OWNERS.get(root);
      if (!owners) {
        owners = { entries: [], appliedProperties: new Set() };
        ROOT_THEME_OWNERS.set(root, owners);
      }

      const previousIndex = owners.entries.findIndex((entry) => entry.token === token);
      if (previousIndex >= 0) owners.entries.splice(previousIndex, 1);

      const properties = new Map<string, string>();
      if (!theme.builtIn) {
        for (const [key, value] of Object.entries(theme.definition.tokens)) {
          if (value !== undefined) properties.set(dottedKeyToCssVar(key), value);
        }
      }
      owners.entries.push({ token, theme, properties });
      renderCurrentTheme(root, owners);
    },

    cleanup() {
      const owners = ROOT_THEME_OWNERS.get(root);
      if (!owners) return;
      const index = owners.entries.findIndex((entry) => entry.token === token);
      if (index < 0) return;
      const wasCurrent = index === owners.entries.length - 1;
      owners.entries.splice(index, 1);
      if (wasCurrent) renderCurrentTheme(root, owners);
    },
  };
}
