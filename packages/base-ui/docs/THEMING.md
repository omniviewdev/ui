# Theming — `@omniviewdev/base-ui`

The library ships seven built-in themes and a token system based on CSS custom properties. Every visual token is prefixed `--ov-`, defined in `src/theme/styles.css`, and switched by setting a `data-ov-theme` attribute on `<html>`.

## Built-in themes

| id                   | Appearance |
|----------------------|------------|
| `dark`               | Default dark |
| `light`              | Default light |
| `high-contrast-dark` | Dark, WCAG-enhanced contrast |
| `high-contrast-light`| Light, WCAG-enhanced contrast |
| `obsidian`           | Dark — cool slate tones |
| `carbon`             | Dark — warm charcoal |
| `void`               | Dark — near-black, minimal |

Switch between them via `ThemeProvider`'s `setTheme` or the `useTheme` hook:

```tsx
const { setTheme } = useTheme();
setTheme('obsidian');
```

## Density and motion

`ThemeProvider` also exposes `density` (`compact` | `comfortable`) and `motion` (`normal` | `reduced`). These map to `data-ov-density` and `data-ov-motion` on `<html>` and are picked up by component stylesheets automatically.

---

## Authoring Custom Themes

Custom themes extend a built-in by overriding specific tokens. Everything else falls through to the base theme's stylesheet values — no token duplication required.

### The `ThemeDefinition` shape

```typescript
interface ThemeDefinition {
  id: string;                                         // stable, unique identifier
  name: string;                                       // display name
  base: BuiltInThemeMode;                             // one of the 7 built-ins above
  author?: string;
  version?: string;
  colors?: Partial<Record<ColorTokenKey, string>>;    // UI chrome overrides
  syntax?: Partial<Record<SyntaxTokenKey, string>>;   // syntax highlighting overrides
  terminal?: Partial<Record<TerminalTokenKey, string>>; // terminal ANSI palette overrides
}
```

A minimal JSON example — a "Solarized Dark" theme that only touches a handful of tokens:

```json
{
  "id": "solarized-dark",
  "name": "Solarized Dark",
  "base": "dark",
  "author": "Ethan Schoonover",
  "version": "1.0.0",
  "colors": {
    "color.bg.base":    "#002b36",
    "color.bg.surface": "#073642",
    "color.bg.inset":   "#073642",
    "color.bg.elevated":"#586e75",
    "color.brand.500":  "#268bd2",
    "color.accent.strong": "#2aa198"
  },
  "syntax": {
    "syntax.keyword":   "#859900",
    "syntax.string":    "#2aa198",
    "syntax.comment":   "#586e75",
    "syntax.function":  "#268bd2",
    "syntax.variable":  "#cb4b16",
    "syntax.number":    "#d33682"
  }
}
```

Any token not listed falls back to the `dark` base — so the theme is forward-compatible with new tokens added to the library in future releases.

### Token key discovery

Valid keys for `colors`, `syntax`, and `terminal` are generated from `styles.css` and live in:

```
src/theme/generated/tokenKeys.ts
```

The types `ColorTokenKey`, `SyntaxTokenKey`, and `TerminalTokenKey` exported from that file are the exhaustive string-literal unions. If you have TypeScript available, the compiler enforces them; if you are writing raw JSON (e.g., for a Go-backed plugin), the registry enforces them at `register()` time.

**Dotted notation maps directly to CSS custom properties:**

```
color.bg.base  →  --ov-color-bg-base
syntax.keyword →  --ov-syntax-keyword
```

The rule is: replace every `.` with `-` and prepend `--ov-`. The library handles this conversion internally — you never write the `--ov-` form in a `ThemeDefinition`.

Regenerate the token keys file after editing `styles.css`:

```bash
pnpm generate:token-keys
```

### Base inheritance model

Every custom theme declares exactly one `base`. At `apply()` time the registry:

1. Sets `data-ov-theme="<base>"` on `<html>` — activating the base stylesheet block.
2. Injects each override as an inline CSS custom property on `:root` — overriding just those tokens.

Tokens you do not override continue to resolve from the base stylesheet. This means:

- Your theme stays correct even when new tokens are added to the library.
- You only need to specify the tokens that differ from the base.
- Removing an override (e.g., via `unregister` + `register`) automatically restores the base value.

### Registration API

The module-level singleton `themeRegistry` is the entry point:

```typescript
import { themeRegistry } from '@omniviewdev/base-ui';

// Register once — typically at app startup or when a plugin loads.
themeRegistry.register(myThemeDefinition);

// Activate.
themeRegistry.apply('solarized-dark');

// List all themes (built-in + registered).
const themes = themeRegistry.list(); // ThemeInfo[]

// Unregister a custom theme (built-ins cannot be unregistered).
themeRegistry.unregister('solarized-dark');
```

`register()` throws for:
- A duplicate `id` — `"Theme 'solarized-dark' is already registered"`.
- Unknown token keys — `"Unknown color token key(s): color.bg.typo"`.

`apply()` throws if the `id` was never registered.

### The `useThemeRegistry()` hook

For React components that need direct registry access (e.g., a theme picker):

```tsx
import { useThemeRegistry } from '@omniviewdev/base-ui';

function ThemePicker() {
  const registry = useThemeRegistry();
  const themes = registry.list();
  return (
    <select onChange={(e) => registry.apply(e.target.value)}>
      {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
    </select>
  );
}
```

`useThemeRegistry()` returns the module-level singleton — the same instance used by `ThemeProvider`. It does not subscribe to changes on its own; pair it with `registry.subscribe()` or read state through `useTheme()` if you need reactivity.

### Wails / Go integration pattern

The library handles rendering only. Loading theme files from disk, fetching from an API, caching, and bundling are the Go backend's responsibility. The typical flow:

```
Go backend                      React frontend
┌────────────────────┐          ┌────────────────────────────┐
│ Read theme files   │          │ @omniviewdev/base-ui       │
│  from disk, API,   │          │                            │
│  or bundled assets │  Wails   │  useThemeRegistry()        │
│                    │ ───────► │   .register(theme)         │
│ Parse, validate    │          │   .apply(id)               │
│ Cache in Go layer  │          │                            │
└────────────────────┘          └────────────────────────────┘
```

A typical Wails binding on the Go side:

```go
// ThemeService exposes theme management to the frontend.
type ThemeService struct {
    themes map[string]ThemeDefinition
}

func (s *ThemeService) LoadTheme(path string) (*ThemeDefinition, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, err
    }
    var def ThemeDefinition
    if err := json.Unmarshal(data, &def); err != nil {
        return nil, err
    }
    s.themes[def.ID] = def
    return &def, nil
}
```

And on the React side, called via the generated Wails bindings:

```typescript
import { LoadTheme } from '../wailsjs/go/app/ThemeService';
import { themeRegistry } from '@omniviewdev/base-ui';

async function loadAndApplyTheme(path: string) {
  const def = await LoadTheme(path);
  themeRegistry.register(def);
  themeRegistry.apply(def.id);
}
```

The library intentionally has no file I/O, no HTTP client, and no caching layer. These belong in the host application.

### Validation semantics

| Condition | When caught | Behavior |
|-----------|-------------|----------|
| Duplicate `id` | `register()` | Throws `Error` |
| Unknown token key | `register()` | Throws `Error`, lists all bad keys |
| Invalid CSS value (e.g. `"not-a-color"`) | Browser parse time | Silently ignored — CSS spec behavior |
| Unknown `base` | TypeScript compile time | Type error; no runtime check |

Unknown token keys are caught eagerly at `register()` — not deferred to `apply()` — so a plugin that ships a bad key fails immediately with a clear message rather than silently applying a broken theme.

Invalid color values (`"not-a-color"`, `"#ZZZZZZ"`) are set as-is on `:root`. The browser ignores invalid custom property values when they are consumed, falling back to the inherited value. This matches how CSS normally behaves and avoids the overhead of a color parser in the library.
