# Theming — `@omniviewdev/base-ui`

Base UI ships nine built-in themes and a controlled React provider. Components
consume static CSS custom properties; changing a theme only updates attributes
and custom properties on the configured root.

## Built-in themes

| id                    | Appearance |
| --------------------- | ---------- |
| `void`                | Dark       |
| `dark`                | Dark       |
| `light`               | Light      |
| `obsidian`            | Dark       |
| `carbon`              | Dark       |
| `solarized-dark`      | Dark       |
| `solarized-light`     | Light      |
| `high-contrast-dark`  | Dark       |
| `high-contrast-light` | Light      |

## Controlled provider

`ThemeProvider` does not persist theme selection and does not own it. Pass the
requested ID through `themeId`, and update application state from
`onThemeChange`:

```tsx
import { ThemeProvider } from '@omniviewdev/base-ui';
import { useState } from 'react';

export function App() {
  const [themeId, setThemeId] = useState('dark');

  return (
    <ThemeProvider
      themeId={themeId}
      onThemeChange={setThemeId}
      fallbackThemeId="void"
      initialDensity="comfortable"
      initialMotion="normal"
    >
      <Workspace />
    </ThemeProvider>
  );
}
```

`useTheme()` exposes:

- `requestedThemeId`: the controlled ID, including when it cannot be resolved.
- `activeTheme`: the resolved `ThemeSummary`.
- `isFallback`: whether the requested ID was unavailable.
- `density`, `motion`, and their local setters.
- `setTheme`: a request callback that invokes `onThemeChange`; it does not
  mutate provider state itself.

By default the provider writes `data-ov-theme`, `data-ov-density`, and
`data-ov-motion` to `document.documentElement`. Supply `root` to target another
element. Use one provider per root. Overlapping providers use last-writer
ownership to prevent stale cleanup from clobbering the current provider; this
is not a nesting or restoration API.

The host owns persistence. Load a saved ID before rendering (or update host
state after loading it) and persist changes in `onThemeChange`.

## Custom-theme schema

JSON themes use the versioned `ThemeDefinitionV1` shape:

```ts
interface ThemeDefinitionV1 {
  schemaVersion: 1;
  id: string;
  name: string;
  base:
    | 'void'
    | 'dark'
    | 'light'
    | 'obsidian'
    | 'carbon'
    | 'solarized-dark'
    | 'solarized-light'
    | 'high-contrast-dark'
    | 'high-contrast-light';
  author?: string;
  version?: string;
  description?: string;
  tokens: Partial<Record<ThemeTokenKey, string>>;
}
```

`ThemeDefinition` is currently an alias for `ThemeDefinitionV1`.

```json
{
  "schemaVersion": 1,
  "id": "plugin:acme/ocean",
  "name": "Acme Ocean",
  "base": "dark",
  "author": "Acme",
  "version": "1.0.0",
  "tokens": {
    "color.bg.base": "#071a2b",
    "color.bg.surface": "#0b2942",
    "color.fg.default": "#d7eefc",
    "syntax.keyword": "#38bdf8",
    "color.ansi.blue": "#38bdf8"
  }
}
```

Call `validateThemeDefinition(input)` when accepting unknown JSON. It returns a
validated, frozen definition or throws `ThemeValidationError` with a stable
`code` and `path`. Registration also validates definitions. Validation rejects
unsupported schema versions, malformed metadata, unknown bases or tokens, and
unsupported color or font-style values.

## Token discovery

Custom themes use one dotted `tokens` map for UI colors, syntax highlighting,
and terminal/ANSI colors. Dotted keys map to CSS variables by replacing `.` with `-` and adding
`--ov-`:

```text
color.bg.base    -> --ov-color-bg-base
syntax.keyword   -> --ov-syntax-keyword
color.ansi.blue  -> --ov-color-ansi-blue
```

The authoritative CSS declarations are in `src/theme/styles.css`. The
generated catalog is `src/theme/generated/tokenKeys.ts`; it contains the
exhaustive `ThemeTokenKey` union and `THEME_TOKEN_METADATA` (CSS variable and
value kind for each key). `ThemeDefinitionV1['tokens']` exposes that generated
key union through the public schema type. Regenerate the catalog after changing
theme variables:

```bash
pnpm --filter @omniviewdev/base-ui generate:token-keys
```

Do not maintain separate color, syntax, or terminal override maps.

## Owner-aware registration

Every custom registration declares who owns it:

```tsx
import { themeRegistry, type ThemeDefinitionV1, type ThemeOwner } from '@omniviewdev/base-ui';

const owner: ThemeOwner = { kind: 'plugin', id: 'acme' };
const definition: ThemeDefinitionV1 = {
  schemaVersion: 1,
  id: 'plugin:acme/ocean',
  name: 'Acme Ocean',
  base: 'dark',
  tokens: { 'color.bg.base': '#071a2b' },
};

const dispose = themeRegistry.register(definition, owner);

// Plugin unload may use the registration disposer...
dispose();

// ...or remove all themes belonging to that plugin at once.
themeRegistry.unregisterOwner(owner);
```

Supported owners are `{ kind: 'plugin'; id: string }` and
`{ kind: 'user'; id: string }`. The `{ kind: 'builtin'; id: 'base-ui' }`
owner is reserved for Base UI. IDs are globally unique. `unregister(id, owner)`
requires the matching owner, built-ins cannot be removed, and the disposer
returned by `register` is idempotent.

Use `themeRegistry.get(id)` or `has(id)` for lookup. For reactive lists, use
`useThemeList()`; it subscribes to immutable registry snapshots. Direct
consumers can use `getSnapshot()` and `subscribe()`.

Registration does not activate a theme. To select it, update the host's
controlled `themeId`:

```tsx
const { setTheme } = useTheme();
setTheme('plugin:acme/ocean');
```

## Resolution and fallback semantics

The provider resolves the requested theme on every registry update:

1. Use `themeId` when that ID is registered.
2. Otherwise use the registered `fallbackThemeId` (default: `void`).
3. If that fallback ID is also unavailable, use built-in `void`.

`requestedThemeId` remains unchanged during fallback, while `activeTheme`
describes what is rendered and `isFallback` is `true`. This lets a host keep a
plugin theme selected while the plugin is unavailable: registering it later
automatically activates it; unloading it falls back without erasing the
selection.

A custom theme activates its built-in `base` stylesheet and applies only its
token overrides. Missing tokens inherit from the base, including tokens added
by future Base UI releases. Removing or switching away from a custom theme
cleans up all of its inline overrides.

## Removed APIs

The production cutover removes the previous uncontrolled and imperative
contracts:

- `ThemeProvider` no longer accepts `persist` or `initialTheme`.
- Custom definitions no longer have split color, syntax, or terminal token
  maps; use the single `tokens` map.
- The registry no longer exposes `apply()` or `active`.
- `register()` now requires a `ThemeOwner` and returns a disposer.

Hosts must control `themeId`, perform their own persistence, register themes
with owners, and select themes by updating provider state.
