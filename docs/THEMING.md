# Theming Engine

Base UI's theme engine is controlled by the host. Components use static CSS
variables, while runtime changes are applied at a root element by
`ThemeProvider`.

## Host integration

Keep the requested theme ID in application state and pass it to the provider:

```tsx
const [themeId, setThemeId] = useState('dark');

<ThemeProvider themeId={themeId} onThemeChange={setThemeId} fallbackThemeId="void">
  <App />
</ThemeProvider>;
```

The provider has no storage behavior. The host is responsible for loading and
saving the selected ID. `useTheme().setTheme(id)` calls `onThemeChange`; it does
not mutate hidden provider state.

The provider applies `data-ov-theme`, `data-ov-density`, and `data-ov-motion`
to `document.documentElement` by default. A host can supply another `root`;
built-in palettes and density/motion selectors apply directly to that element.
Monaco and Xterm resolve tokens from their nearest themed ancestor, so editors
inside a non-document provider root use that root's built-in or custom palette.

## Resolution contract

`useTheme()` distinguishes selection from rendering:

- `requestedThemeId` is always the host's controlled `themeId`.
- `activeTheme` is the registered theme currently rendered.
- `isFallback` is true when the requested ID is unavailable.

An unknown requested ID resolves to `fallbackThemeId`, then to built-in `void`
if the configured fallback is also unknown. The requested ID is retained, so a
plugin theme becomes active automatically if it is registered later and falls
back safely when its plugin unloads.

## Theme files and tokens

Custom JSON uses the versioned `ThemeDefinitionV1` schema:

```ts
interface ThemeDefinitionV1 {
  schemaVersion: 1;
  id: string;
  name: string;
  base: BuiltInThemeId;
  author?: string;
  version?: string;
  description?: string;
  tokens: Partial<Record<ThemeTokenKey, string>>;
}
```

All overrides live in the single `tokens` map. The generated token catalog is
`packages/base-ui/src/theme/generated/tokenKeys.ts`; it defines the exhaustive
keys used by `ThemeDefinitionV1['tokens']` and metadata mapping each dotted key
to its `--ov-*` CSS variable and value kind. Its source is
`packages/base-ui/src/theme/styles.css`. Run
`pnpm --filter @omniviewdev/base-ui generate:token-keys` after changing theme
variables.

`validateThemeDefinition(unknownValue)` validates untrusted JSON before use.
Registration performs the same validation.

## Plugin and user ownership

Registry entries must have an explicit owner:

```ts
const owner = { kind: 'plugin', id: pluginId } as const;
const disposeTheme = themeRegistry.register(definition, owner);

// On plugin unload:
disposeTheme();
// Or remove every theme owned by the plugin:
themeRegistry.unregisterOwner(owner);
```

User themes use `{ kind: 'user', id }`. Owner checks prevent one plugin or user
from unregistering another owner's theme. Built-in ownership is reserved for
Base UI. Registration only adds a theme to the catalog; activation is performed
by changing the controlled provider `themeId`. `useThemeList()` provides a
reactive theme list for selectors.

Custom themes inherit every unspecified token from their built-in `base`.
Switching away from or unregistering a custom theme removes its inline
overrides, exposing base values again.

## Migration from the legacy engine

- Replace `initialTheme` with controlled `themeId` and `onThemeChange`.
- Remove `persist`; persistence belongs to the host.
- Merge split color, syntax, and terminal maps into `tokens`.
- Pass a `ThemeOwner` to `themeRegistry.register`.
- Replace registry `apply()` calls with host-state updates.
- Replace registry `active` reads with `useTheme().activeTheme`.

The package-level guide at `packages/base-ui/docs/THEMING.md` contains the
complete built-in catalog, schema example, validation details, and registry
API.

## Integration rules

1. Components use semantic tokens rather than primitives directly.
2. Component-specific hardcoded colors are forbidden unless intentional (for
   example, a brand logo).
3. Visual states use Base UI part attributes such as `data-disabled` and
   `data-highlighted`.
4. Add new variables to `styles.css` and regenerate the token catalog before
   use.
