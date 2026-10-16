import type { BuiltInThemeId, ThemeSummary } from './types';

class ImmutableSet<T> extends Set<T> {
  #locked = false;

  constructor(values: readonly T[]) {
    super();
    for (const value of values) super.add(value);
    this.#locked = true;
  }

  override add(value: T): this {
    if (this.#locked) throw new TypeError('Cannot mutate an immutable set');
    return super.add(value);
  }

  override delete(value: T): boolean {
    if (this.#locked) throw new TypeError('Cannot mutate an immutable set');
    return super.delete(value);
  }

  override clear(): void {
    if (this.#locked) throw new TypeError('Cannot mutate an immutable set');
    super.clear();
  }
}

const builtinOwner = () => Object.freeze({ kind: 'builtin', id: 'base-ui' } as const);
const summary = (
  id: BuiltInThemeId,
  name: string,
  appearance: 'dark' | 'light',
  description: string,
): Readonly<ThemeSummary> =>
  Object.freeze({ id, name, base: id, appearance, description, builtIn: true, owner: builtinOwner() });

export const BUILT_IN_THEMES: readonly Readonly<ThemeSummary>[] = Object.freeze([
  summary('void', 'Void', 'dark', 'Ultra-deep warm-neutral theme'),
  summary('dark', 'Dark', 'dark', 'Balanced dark theme'),
  summary('light', 'Light', 'light', 'Balanced light theme'),
  summary('obsidian', 'Obsidian', 'dark', 'Cool near-black theme'),
  summary('carbon', 'Carbon', 'dark', 'Neutral graphite theme'),
  summary('solarized-dark', 'Solarized Dark', 'dark', 'Solarized dark theme'),
  summary('solarized-light', 'Solarized Light', 'light', 'Solarized light theme'),
  summary('high-contrast-dark', 'High Contrast Dark', 'dark', 'High-contrast dark theme'),
  summary('high-contrast-light', 'High Contrast Light', 'light', 'High-contrast light theme'),
]);
export const BUILT_IN_THEME_BY_ID: Readonly<Record<BuiltInThemeId, Readonly<ThemeSummary>>> =
  Object.freeze(
    Object.fromEntries(BUILT_IN_THEMES.map((theme) => [theme.id, theme])) as Record<
      BuiltInThemeId,
      Readonly<ThemeSummary>
    >,
  );

export const BUILT_IN_THEME_IDS: ReadonlySet<BuiltInThemeId> = Object.freeze(
  new ImmutableSet(BUILT_IN_THEMES.map(({ id }) => id as BuiltInThemeId)),
);

export function isBuiltInThemeId(id: string): id is BuiltInThemeId {
  return BUILT_IN_THEME_IDS.has(id as BuiltInThemeId);
}
