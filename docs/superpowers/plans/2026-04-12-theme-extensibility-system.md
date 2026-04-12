# Theme Extensibility System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add runtime theme extensibility to `@omniviewdev/base-ui` — the IDE (driven by Go) can register custom `ThemeDefinition` objects, apply them at runtime, and fall back to a built-in base for any non-overridden tokens.

**Architecture:** A module-level `themeRegistry` singleton owns all theme state (built-in + custom) and owns the `data-ov-theme` / `data-ov-theme-custom` attributes + `style.colorScheme` on `document.documentElement`. `ThemeProvider` delegates theme activation to the registry and mirrors the active id into React state via event subscription. Custom themes layer CSS custom property overrides via `document.documentElement.style.setProperty`; the inline styles beat the stylesheet's `:root[data-ov-theme='<base>']` block, giving fallback semantics for free.

**Tech Stack:** TypeScript 5.9, React 19, Vite 5, Vitest + jsdom, Storybook 10, `@base-ui/react`, `tsd` (for type-level tests). Source location: `/Users/joshuapare/Repos/omniviewdev/omniview-ui/packages/base-ui/`.

**Spec:** `docs/superpowers/specs/2026-04-12-library-readiness-for-ide-migration-design.md`

---

## Working Directory & Worktree

All file paths in this plan are relative to the base-ui package:
`/Users/joshuapare/Repos/omniviewdev/omniview-ui/packages/base-ui/`

Create a worktree for this work before starting:

```bash
cd /Users/joshuapare/Repos/omniviewdev/omniview-ui
git worktree add worktrees/omniview-ui/theme-extensibility -b feat/theme-extensibility
cd worktrees/omniview-ui/theme-extensibility/packages/base-ui
```

Install dependencies and verify baseline tests pass before making changes:

```bash
cd /Users/joshuapare/Repos/omniviewdev/omniview-ui/worktrees/omniview-ui/theme-extensibility
pnpm install
pnpm --filter @omniviewdev/base-ui test
pnpm --filter @omniviewdev/base-ui build
```

Expected: all existing tests pass; build emits no errors.

---

## File Structure

**New files:**

- `packages/base-ui/scripts/generate-token-keys.ts` — build-time script that parses `styles.css` and emits typed key unions
- `packages/base-ui/src/theme/generated/tokenKeys.ts` — generated file (committed) containing `ColorTokenKey`, `SyntaxTokenKey`, `TerminalTokenKey` unions
- `packages/base-ui/src/theme/registry/types.ts` — `ThemeDefinition`, `BuiltInThemeMode`, `ThemeInfo`, `ThemeRegistry`, `ThemeRegistryEvent`
- `packages/base-ui/src/theme/registry/builtIns.ts` — pre-registered built-in theme stubs
- `packages/base-ui/src/theme/registry/keyTransform.ts` — dotted-key → CSS variable name transform + pure validation helpers
- `packages/base-ui/src/theme/registry/registry.ts` — singleton implementation
- `packages/base-ui/src/theme/registry/index.ts` — barrel
- `packages/base-ui/src/theme/useThemeRegistry.ts` — new hook
- `packages/base-ui/src/theme/registry/registry.test.ts` — unit tests for the registry
- `packages/base-ui/src/theme/registry/keyTransform.test.ts` — unit tests for pure helpers
- `packages/base-ui/src/theme/registry/builtIns.test.ts` — ensures every built-in theme mode has a stub
- `packages/base-ui/src/theme/ThemeProvider.test.tsx` — integration tests for provider + registry
- `packages/base-ui/src/theme/types.test-d.ts` — type-level tests using `tsd`
- `packages/base-ui/.storybook/themeDecorator.tsx` — toolbar decorator that lists all registered themes
- `packages/base-ui/.storybook/sampleCustomThemes.ts` — one sample custom theme for Storybook
- `packages/base-ui/src/theme/__snapshots__/` — visual regression snapshots (committed)

**Modified files:**

- `packages/base-ui/src/theme/types.ts` — widen `ThemeMode`, export `BuiltInThemeMode`
- `packages/base-ui/src/theme/ThemeProvider.tsx` — remove `data-ov-theme` writes, subscribe to registry, handle deferred registration
- `packages/base-ui/src/theme/context.ts` — no change expected; included if needed
- `packages/base-ui/src/theme/index.ts` — export new types, registry, hook
- `packages/base-ui/package.json` — add `tsd` devDependency, add `generate:token-keys` script
- `packages/base-ui/vite.config.ts` — only if needed to run the generator pre-build (likely not needed since the generated file is committed)
- `packages/base-ui/.storybook/preview.tsx` — wire the new theme decorator and sample custom theme
- `packages/base-ui/docs/THEMING.md` — add custom theme authoring guide section

Each file has one clear responsibility. Pure transforms (`keyTransform.ts`) are separated from stateful singletons (`registry.ts`) so they can be tested independently.

---

## Task 1: Token Key Generator Script

**Files:**
- Create: `packages/base-ui/scripts/generate-token-keys.ts`
- Create: `packages/base-ui/src/theme/generated/tokenKeys.ts` (output artifact, committed)
- Create: `packages/base-ui/scripts/generate-token-keys.test.ts`
- Modify: `packages/base-ui/package.json` (add script entry and `tsx` devDep if not present)

The generator parses `packages/base-ui/src/theme/styles.css` for CSS custom property definitions matching `--ov-color-*`, `--ov-syntax-*`, `--ov-terminal-*`, converts each to its dotted-key form (strip `--ov-` prefix, replace `-` with `.`), deduplicates, and emits three union type declarations.

**Important note on the transform**: the dotted-key form uses dots only where the CSS variable uses hyphens **between semantic groups**. Since the existing tokens already use hyphens as the only separator (e.g., `--ov-color-bg-base`), the transform is a simple 1:1 replacement. This keeps the transform deterministic and reversible.

- [ ] **Step 1: Write the failing test**

Create `packages/base-ui/scripts/generate-token-keys.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { extractTokenKeys } from './generate-token-keys';

describe('extractTokenKeys', () => {
  it('extracts color, syntax, and terminal keys from css input', () => {
    const css = `
      :root {
        --ov-color-bg-base: #000;
        --ov-color-fg-default: #fff;
        --ov-syntax-comment: #888;
        --ov-terminal-red: #c00;
        --ov-primitive-gray-0: #090a0c;
        --ov-size-button-sm: 28px;
      }
      :root[data-ov-theme='light'] {
        --ov-color-bg-base: #eef0f3;
      }
    `;
    const result = extractTokenKeys(css);
    expect(result.colors.sort()).toEqual(['color.bg.base', 'color.fg.default']);
    expect(result.syntax).toEqual(['syntax.comment']);
    expect(result.terminal).toEqual(['terminal.red']);
  });

  it('deduplicates keys defined in multiple theme blocks', () => {
    const css = `
      :root { --ov-color-bg-base: #000; }
      :root[data-ov-theme='light'] { --ov-color-bg-base: #fff; }
    `;
    const result = extractTokenKeys(css);
    expect(result.colors).toEqual(['color.bg.base']);
  });

  it('ignores primitives, sizes, and non-ov variables', () => {
    const css = `
      :root {
        --ov-primitive-gray-0: #000;
        --ov-size-button-md: 36px;
        --ov-duration-fast: 90ms;
        --other-lib-var: red;
      }
    `;
    const result = extractTokenKeys(css);
    expect(result.colors).toEqual([]);
    expect(result.syntax).toEqual([]);
    expect(result.terminal).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/joshuapare/Repos/omniviewdev/omniview-ui/worktrees/omniview-ui/theme-extensibility
pnpm --filter @omniviewdev/base-ui exec vitest run scripts/generate-token-keys.test.ts
```

Expected: FAIL — module `./generate-token-keys` not found.

- [ ] **Step 3: Implement the extractor as a pure function**

Create `packages/base-ui/scripts/generate-token-keys.ts`:

```typescript
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const PREFIXES = ['color', 'syntax', 'terminal'] as const;
type Prefix = typeof PREFIXES[number];

export interface ExtractedKeys {
  colors: string[];
  syntax: string[];
  terminal: string[];
}

const VAR_RE = /--ov-([a-z]+)-([a-z0-9-]+)\s*:/g;

export function extractTokenKeys(css: string): ExtractedKeys {
  const buckets: Record<Prefix, Set<string>> = {
    color: new Set(),
    syntax: new Set(),
    terminal: new Set(),
  };
  for (const match of css.matchAll(VAR_RE)) {
    const prefix = match[1] as Prefix;
    const rest = match[2];
    if (!PREFIXES.includes(prefix)) continue;
    // Convert hyphens to dots to produce the dotted token key form.
    buckets[prefix].add(`${prefix}.${rest.replaceAll('-', '.')}`);
  }
  return {
    colors: Array.from(buckets.color).sort(),
    syntax: Array.from(buckets.syntax).sort(),
    terminal: Array.from(buckets.terminal).sort(),
  };
}

export function renderTypesFile(keys: ExtractedKeys): string {
  const union = (items: string[]) =>
    items.length === 0 ? 'never' : items.map((k) => `  | '${k}'`).join('\n');
  return `// AUTO-GENERATED by scripts/generate-token-keys.ts. Do not edit by hand.
// Regenerate with: pnpm generate:token-keys

export type ColorTokenKey =
${union(keys.colors)};

export type SyntaxTokenKey =
${union(keys.syntax)};

export type TerminalTokenKey =
${union(keys.terminal)};

export const COLOR_TOKEN_KEYS: ReadonlySet<ColorTokenKey> = new Set([
${keys.colors.map((k) => `  '${k}',`).join('\n')}
]) as ReadonlySet<ColorTokenKey>;

export const SYNTAX_TOKEN_KEYS: ReadonlySet<SyntaxTokenKey> = new Set([
${keys.syntax.map((k) => `  '${k}',`).join('\n')}
]) as ReadonlySet<SyntaxTokenKey>;

export const TERMINAL_TOKEN_KEYS: ReadonlySet<TerminalTokenKey> = new Set([
${keys.terminal.map((k) => `  '${k}',`).join('\n')}
]) as ReadonlySet<TerminalTokenKey>;
`;
}

function main() {
  const here = resolve(__dirname, '..');
  const input = readFileSync(resolve(here, 'src/theme/styles.css'), 'utf8');
  const output = resolve(here, 'src/theme/generated/tokenKeys.ts');
  const keys = extractTokenKeys(input);
  const content = renderTypesFile(keys);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, content, 'utf8');
  console.log(
    `Generated ${output} (${keys.colors.length} color, ${keys.syntax.length} syntax, ${keys.terminal.length} terminal)`,
  );
}

if (require.main === module) main();
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run scripts/generate-token-keys.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Add `generate:token-keys` script to package.json**

In `packages/base-ui/package.json`, add to the `scripts` block:

```json
"generate:token-keys": "tsx scripts/generate-token-keys.ts"
```

Ensure `tsx` is a devDependency (it is standard in this repo; add `"tsx": "^4.19.0"` under `devDependencies` if missing).

- [ ] **Step 6: Run the generator and commit the generated file**

```bash
pnpm --filter @omniviewdev/base-ui generate:token-keys
```

Expected output: `Generated .../src/theme/generated/tokenKeys.ts (N color, M syntax, K terminal)` with N, M, K > 0.

Inspect the generated file to confirm the unions contain sensible keys (e.g., `color.bg.base`, `syntax.comment`, `terminal.red`).

- [ ] **Step 7: Commit**

```bash
git add packages/base-ui/scripts/generate-token-keys.ts \
        packages/base-ui/scripts/generate-token-keys.test.ts \
        packages/base-ui/src/theme/generated/tokenKeys.ts \
        packages/base-ui/package.json
git commit -m "feat(base-ui): add token key generator for theme registry"
```

---

## Task 2: Registry Types

**Files:**
- Create: `packages/base-ui/src/theme/registry/types.ts`

These are pure type definitions with no runtime. No tests needed for types themselves; type-level tests follow in Task 11.

- [ ] **Step 1: Create the types file**

Create `packages/base-ui/src/theme/registry/types.ts`:

```typescript
import type {
  ColorTokenKey,
  SyntaxTokenKey,
  TerminalTokenKey,
} from '../generated/tokenKeys';

/** The built-in modes that a custom theme can inherit from. */
export type BuiltInThemeMode =
  | 'dark'
  | 'light'
  | 'high-contrast-dark'
  | 'high-contrast-light'
  | 'obsidian'
  | 'carbon'
  | 'void';

export const BUILT_IN_THEME_MODES: readonly BuiltInThemeMode[] = [
  'dark',
  'light',
  'high-contrast-dark',
  'high-contrast-light',
  'obsidian',
  'carbon',
  'void',
];

export const LIGHT_THEME_MODES: ReadonlySet<BuiltInThemeMode> = new Set([
  'light',
  'high-contrast-light',
]);

export interface ThemeDefinition {
  /** Stable identifier, used for persistence and activation. */
  id: string;
  /** Human-readable display name. */
  name: string;
  /** The built-in mode this theme inherits from. */
  base: BuiltInThemeMode;
  /** Optional author metadata. */
  author?: string;
  /** Optional version string. */
  version?: string;
  /** UI chrome color overrides, keyed by dotted token path. */
  colors?: Partial<Record<ColorTokenKey, string>>;
  /** Syntax highlighting overrides. */
  syntax?: Partial<Record<SyntaxTokenKey, string>>;
  /** Terminal ANSI palette overrides. */
  terminal?: Partial<Record<TerminalTokenKey, string>>;
}

export interface ThemeInfo {
  id: string;
  name: string;
  base: BuiltInThemeMode;
  builtIn: boolean;
}

export type ThemeRegistryEvent =
  | { type: 'registered'; id: string }
  | { type: 'unregistered'; id: string }
  | { type: 'applied'; id: string };

export type ThemeRegistryListener = (event: ThemeRegistryEvent) => void;

export interface ThemeRegistry {
  register(theme: ThemeDefinition): void;
  unregister(id: string): void;
  get(id: string): ThemeDefinition | undefined;
  list(): ThemeInfo[];
  has(id: string): boolean;
  apply(id: string): void;
  active(): string;
  subscribe(listener: ThemeRegistryListener): () => void;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/base-ui/src/theme/registry/types.ts
git commit -m "feat(base-ui): define theme registry types"
```

---

## Task 3: Key Transform & Validation Helpers

**Files:**
- Create: `packages/base-ui/src/theme/registry/keyTransform.ts`
- Create: `packages/base-ui/src/theme/registry/keyTransform.test.ts`

Pure functions: dotted-key → CSS variable name, CSS variable name → dotted-key, and validation that a set of dotted keys are all in a known set.

- [ ] **Step 1: Write failing tests**

Create `packages/base-ui/src/theme/registry/keyTransform.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { dottedKeyToCssVar, validateKeys } from './keyTransform';
import {
  COLOR_TOKEN_KEYS,
  SYNTAX_TOKEN_KEYS,
  TERMINAL_TOKEN_KEYS,
} from '../generated/tokenKeys';

describe('dottedKeyToCssVar', () => {
  it('transforms dotted key to ov-prefixed CSS variable', () => {
    expect(dottedKeyToCssVar('color.bg.base')).toBe('--ov-color-bg-base');
    expect(dottedKeyToCssVar('syntax.comment')).toBe('--ov-syntax-comment');
    expect(dottedKeyToCssVar('terminal.red')).toBe('--ov-terminal-red');
  });

  it('handles deeper hierarchies with multiple dots', () => {
    expect(dottedKeyToCssVar('color.bg.surface.raised')).toBe(
      '--ov-color-bg-surface-raised',
    );
  });
});

describe('validateKeys', () => {
  it('returns empty array when all keys are valid', () => {
    const valid = [...COLOR_TOKEN_KEYS].slice(0, 2);
    expect(validateKeys(valid, COLOR_TOKEN_KEYS)).toEqual([]);
  });

  it('returns unknown keys as invalid', () => {
    expect(validateKeys(['color.bg.base', 'color.bogus.nope'], COLOR_TOKEN_KEYS))
      .toEqual(['color.bogus.nope']);
  });

  it('handles empty input', () => {
    expect(validateKeys([], COLOR_TOKEN_KEYS)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/registry/keyTransform.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement helpers**

Create `packages/base-ui/src/theme/registry/keyTransform.ts`:

```typescript
/** Convert a dotted token key to its CSS custom property name. */
export function dottedKeyToCssVar(key: string): string {
  return `--ov-${key.replaceAll('.', '-')}`;
}

/** Return the subset of `keys` that are NOT in `known`. */
export function validateKeys<T extends string>(
  keys: readonly string[],
  known: ReadonlySet<T>,
): string[] {
  const invalid: string[] = [];
  for (const key of keys) {
    if (!(known as ReadonlySet<string>).has(key)) invalid.push(key);
  }
  return invalid;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/registry/keyTransform.test.ts
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/theme/registry/keyTransform.ts \
        packages/base-ui/src/theme/registry/keyTransform.test.ts
git commit -m "feat(base-ui): add theme registry key transform helpers"
```

---

## Task 4: Built-in Theme Stubs

**Files:**
- Create: `packages/base-ui/src/theme/registry/builtIns.ts`
- Create: `packages/base-ui/src/theme/registry/builtIns.test.ts`

Built-ins are represented as `ThemeDefinition` objects with no override fields. The registry uses them for display (`list()`), for the guard against un-registering built-ins, and for the `base` lookup when applying.

- [ ] **Step 1: Write failing test**

Create `packages/base-ui/src/theme/registry/builtIns.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { BUILT_IN_THEME_DEFINITIONS } from './builtIns';
import { BUILT_IN_THEME_MODES } from './types';

describe('BUILT_IN_THEME_DEFINITIONS', () => {
  it('has one definition per built-in mode', () => {
    const ids = BUILT_IN_THEME_DEFINITIONS.map((t) => t.id).sort();
    expect(ids).toEqual([...BUILT_IN_THEME_MODES].sort());
  });

  it('every definition uses itself as base', () => {
    for (const def of BUILT_IN_THEME_DEFINITIONS) {
      expect(def.base).toBe(def.id);
    }
  });

  it('no definition has override fields', () => {
    for (const def of BUILT_IN_THEME_DEFINITIONS) {
      expect(def.colors).toBeUndefined();
      expect(def.syntax).toBeUndefined();
      expect(def.terminal).toBeUndefined();
    }
  });

  it('has a human-readable name for each definition', () => {
    for (const def of BUILT_IN_THEME_DEFINITIONS) {
      expect(def.name.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/registry/builtIns.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `packages/base-ui/src/theme/registry/builtIns.ts`:

```typescript
import type { ThemeDefinition } from './types';

export const BUILT_IN_THEME_DEFINITIONS: readonly ThemeDefinition[] = [
  { id: 'dark', name: 'Dark', base: 'dark' },
  { id: 'light', name: 'Light', base: 'light' },
  { id: 'high-contrast-dark', name: 'High Contrast Dark', base: 'high-contrast-dark' },
  { id: 'high-contrast-light', name: 'High Contrast Light', base: 'high-contrast-light' },
  { id: 'obsidian', name: 'Obsidian', base: 'obsidian' },
  { id: 'carbon', name: 'Carbon', base: 'carbon' },
  { id: 'void', name: 'Void', base: 'void' },
];

export const BUILT_IN_THEME_IDS: ReadonlySet<string> = new Set(
  BUILT_IN_THEME_DEFINITIONS.map((t) => t.id),
);
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/registry/builtIns.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/theme/registry/builtIns.ts \
        packages/base-ui/src/theme/registry/builtIns.test.ts
git commit -m "feat(base-ui): add built-in theme definitions"
```

---

## Task 5: Registry Core — Registration & Events

**Files:**
- Create: `packages/base-ui/src/theme/registry/registry.ts`
- Create: `packages/base-ui/src/theme/registry/registry.test.ts`

This task focuses on the in-memory state: `register`, `unregister`, `get`, `list`, `has`, `subscribe`. `apply()` will be added in Task 6. We build registration first so tests for `apply()` can rely on it.

- [ ] **Step 1: Write failing tests (registration only)**

Create `packages/base-ui/src/theme/registry/registry.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createThemeRegistry } from './registry';
import type { ThemeDefinition, ThemeRegistry, ThemeRegistryEvent } from './types';

function makeCustom(id: string, base: 'dark' | 'light' = 'dark'): ThemeDefinition {
  return { id, name: id, base };
}

describe('themeRegistry — registration', () => {
  let registry: ThemeRegistry;
  beforeEach(() => {
    registry = createThemeRegistry();
  });

  it('lists all 7 built-ins by default', () => {
    const info = registry.list();
    expect(info).toHaveLength(7);
    expect(info.every((i) => i.builtIn)).toBe(true);
  });

  it('registers a custom theme and exposes it via get/has/list', () => {
    registry.register(makeCustom('solarized-dark'));
    expect(registry.has('solarized-dark')).toBe(true);
    expect(registry.get('solarized-dark')?.id).toBe('solarized-dark');
    expect(registry.list().map((i) => i.id)).toContain('solarized-dark');
    expect(registry.list().find((i) => i.id === 'solarized-dark')?.builtIn).toBe(false);
  });

  it('throws when registering a duplicate id', () => {
    registry.register(makeCustom('dup'));
    expect(() => registry.register(makeCustom('dup'))).toThrow(/already registered/i);
  });

  it('throws when registering an id that collides with a built-in', () => {
    expect(() => registry.register(makeCustom('dark'))).toThrow(/already registered/i);
  });

  it('throws when registering unknown color token keys', () => {
    expect(() =>
      registry.register({
        id: 'bad-color',
        name: 'bad',
        base: 'dark',
        colors: { 'color.bogus.key': '#000' } as never,
      }),
    ).toThrow(/unknown.*color.*key/i);
  });

  it('unregisters a custom theme', () => {
    registry.register(makeCustom('temp'));
    registry.unregister('temp');
    expect(registry.has('temp')).toBe(false);
  });

  it('unregister is a no-op for unknown ids', () => {
    expect(() => registry.unregister('never-existed')).not.toThrow();
  });

  it('throws when attempting to unregister a built-in', () => {
    expect(() => registry.unregister('dark')).toThrow(/cannot unregister.*built-in/i);
  });

  it('emits registered and unregistered events', () => {
    const events: ThemeRegistryEvent[] = [];
    const unsubscribe = registry.subscribe((e) => events.push(e));
    registry.register(makeCustom('a'));
    registry.unregister('a');
    unsubscribe();
    registry.register(makeCustom('b'));
    expect(events).toEqual([
      { type: 'registered', id: 'a' },
      { type: 'unregistered', id: 'a' },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/registry/registry.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement registration + events**

Create `packages/base-ui/src/theme/registry/registry.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/registry/registry.test.ts
```

Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/theme/registry/registry.ts \
        packages/base-ui/src/theme/registry/registry.test.ts
git commit -m "feat(base-ui): theme registry registration & events"
```

---

## Task 6: Registry `apply()` — DOM Writes

**Files:**
- Modify: `packages/base-ui/src/theme/registry/registry.ts`
- Modify: `packages/base-ui/src/theme/registry/registry.test.ts`

Implement the full `apply()` flow: SSR guard, lookup, clear previous overrides, set `data-ov-theme` / `data-ov-theme-custom` / `colorScheme`, inject CSS variable overrides for custom themes, emit event.

- [ ] **Step 1: Add failing tests for apply()**

Append to `packages/base-ui/src/theme/registry/registry.test.ts`:

```typescript
import { afterEach } from 'vitest';

describe('themeRegistry — apply()', () => {
  let registry: ThemeRegistry;
  beforeEach(() => {
    registry = createThemeRegistry();
    document.documentElement.removeAttribute('data-ov-theme');
    document.documentElement.removeAttribute('data-ov-theme-custom');
    document.documentElement.style.cssText = '';
  });
  afterEach(() => {
    document.documentElement.removeAttribute('data-ov-theme');
    document.documentElement.removeAttribute('data-ov-theme-custom');
    document.documentElement.style.cssText = '';
  });

  it('throws when applying an unknown id', () => {
    expect(() => registry.apply('ghost')).toThrow(/unknown theme/i);
  });

  it('sets data-ov-theme and colorScheme for a built-in', () => {
    registry.apply('light');
    expect(document.documentElement.getAttribute('data-ov-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-ov-theme-custom')).toBe(null);
    expect(document.documentElement.style.colorScheme).toBe('light');
    registry.apply('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('writes CSS variable overrides for a custom theme and sets data-ov-theme-custom', () => {
    registry.register({
      id: 'solarized-dark',
      name: 'Solarized Dark',
      base: 'dark',
      colors: { 'color.bg.base': '#002b36' },
      syntax: { 'syntax.comment': '#586e75' },
      terminal: { 'terminal.red': '#dc322f' },
    });
    registry.apply('solarized-dark');
    expect(document.documentElement.getAttribute('data-ov-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-ov-theme-custom')).toBe('solarized-dark');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('#002b36');
    expect(document.documentElement.style.getPropertyValue('--ov-syntax-comment')).toBe('#586e75');
    expect(document.documentElement.style.getPropertyValue('--ov-terminal-red')).toBe('#dc322f');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('clears previous overrides when switching to a built-in', () => {
    registry.register({
      id: 'sol',
      name: 'sol',
      base: 'dark',
      colors: { 'color.bg.base': '#002b36' },
    });
    registry.apply('sol');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('#002b36');
    registry.apply('light');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('');
    expect(document.documentElement.getAttribute('data-ov-theme-custom')).toBe(null);
  });

  it('clears previous overrides when switching between custom themes with different keys', () => {
    registry.register({ id: 'a', name: 'a', base: 'dark', colors: { 'color.bg.base': '#111' } });
    registry.register({ id: 'b', name: 'b', base: 'dark', colors: { 'color.fg.default': '#eee' } });
    registry.apply('a');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('#111');
    registry.apply('b');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--ov-color-fg-default')).toBe('#eee');
  });

  it('updates active() after apply()', () => {
    registry.apply('light');
    expect(registry.active()).toBe('light');
  });

  it('is idempotent — reapplies and emits event even if already active', () => {
    const events: ThemeRegistryEvent[] = [];
    registry.subscribe((e) => events.push(e));
    registry.apply('dark');
    registry.apply('dark');
    const applied = events.filter((e) => e.type === 'applied');
    expect(applied).toEqual([
      { type: 'applied', id: 'dark' },
      { type: 'applied', id: 'dark' },
    ]);
  });

  it('sets colorScheme light for high-contrast-light base', () => {
    registry.register({ id: 'lc', name: 'lc', base: 'high-contrast-light' });
    registry.apply('lc');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/registry/registry.test.ts
```

Expected: FAIL — the new `apply()` tests fail (`apply() not yet implemented`).

- [ ] **Step 3: Replace registry.ts with the full implementation**

Replace `packages/base-ui/src/theme/registry/registry.ts` with:

```typescript
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
  let activeId = 'dark';

  for (const def of BUILT_IN_THEME_DEFINITIONS) {
    themes.set(def.id, def);
  }

  function emit(event: ThemeRegistryEvent): void {
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (err) {
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

export const themeRegistry: ThemeRegistry = createThemeRegistry();
```

- [ ] **Step 4: Run all registry tests to verify they pass**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/registry/registry.test.ts
```

Expected: PASS (all 17 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/theme/registry/registry.ts \
        packages/base-ui/src/theme/registry/registry.test.ts
git commit -m "feat(base-ui): implement theme registry apply() with DOM writes"
```

---

## Task 7: SSR Guard Test

**Files:**
- Modify: `packages/base-ui/src/theme/registry/registry.test.ts`

Verify `apply()` does not throw when `document` is undefined and still updates internal state + emits the event.

- [ ] **Step 1: Add failing test**

Append to `packages/base-ui/src/theme/registry/registry.test.ts`:

```typescript
describe('themeRegistry — SSR guard', () => {
  it('apply() does not throw when document is undefined; still updates active() and emits', () => {
    const registry = createThemeRegistry();
    const events: ThemeRegistryEvent[] = [];
    registry.subscribe((e) => events.push(e));
    const originalDoc = globalThis.document;
    // @ts-expect-error — simulate SSR
    delete globalThis.document;
    try {
      expect(() => registry.apply('light')).not.toThrow();
      expect(registry.active()).toBe('light');
      expect(events.filter((e) => e.type === 'applied')).toEqual([
        { type: 'applied', id: 'light' },
      ]);
    } finally {
      globalThis.document = originalDoc;
    }
  });
});
```

- [ ] **Step 2: Run to verify it passes**

The implementation already handles `typeof document === 'undefined'`. Run:

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/registry/registry.test.ts
```

Expected: PASS.

If it fails, trace where in `apply()` the SSR guard is missing and add it before committing.

- [ ] **Step 3: Commit**

```bash
git add packages/base-ui/src/theme/registry/registry.test.ts
git commit -m "test(base-ui): verify theme registry SSR guard"
```

---

## Task 8: Registry Barrel Export

**Files:**
- Create: `packages/base-ui/src/theme/registry/index.ts`
- Modify: `packages/base-ui/src/theme/index.ts`

Expose the public surface.

- [ ] **Step 1: Create the registry barrel**

Create `packages/base-ui/src/theme/registry/index.ts`:

```typescript
export {
  themeRegistry,
  createThemeRegistry,
} from './registry';
export type {
  ThemeDefinition,
  ThemeInfo,
  ThemeRegistry,
  ThemeRegistryEvent,
  ThemeRegistryListener,
  BuiltInThemeMode,
} from './types';
export { BUILT_IN_THEME_MODES } from './types';
```

- [ ] **Step 2: Re-export from the theme barrel**

Read the existing `packages/base-ui/src/theme/index.ts`, then append:

```typescript
export * from './registry';
```

If there are naming conflicts (e.g. `BuiltInThemeMode` vs existing `ThemeMode`), resolve by exporting the new types explicitly and leaving existing exports untouched.

- [ ] **Step 3: Verify the package still builds**

```bash
pnpm --filter @omniviewdev/base-ui build
```

Expected: successful build, no TS errors.

- [ ] **Step 4: Commit**

```bash
git add packages/base-ui/src/theme/registry/index.ts \
        packages/base-ui/src/theme/index.ts
git commit -m "feat(base-ui): export theme registry public API"
```

---

## Task 9: Widen `ThemeMode` Type & Update types.ts

**Files:**
- Modify: `packages/base-ui/src/theme/types.ts`

`ThemeMode` widens to accept any registered theme id while preserving autocomplete for built-ins.

- [ ] **Step 1: Read current types.ts**

Confirm contents — should match the snapshot captured during spec review:

```typescript
export type ThemeMode = 'dark' | 'light' | 'high-contrast-dark' | 'high-contrast-light' | 'obsidian' | 'carbon' | 'void';
// ...etc
```

- [ ] **Step 2: Edit types.ts**

Replace the `ThemeMode` declaration with:

```typescript
import type { BuiltInThemeMode } from './registry/types';

/**
 * A theme identifier. Built-in mode ids autocomplete; any registered custom
 * theme id is also accepted.
 */
export type ThemeMode = BuiltInThemeMode | (string & {});
```

Keep `ThemeDensity`, `ThemeMotion`, `ThemeState`, `ThemeContextValue` unchanged.

- [ ] **Step 3: Run typecheck**

```bash
pnpm --filter @omniviewdev/base-ui exec tsc -p tsconfig.json --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/base-ui/src/theme/types.ts
git commit -m "refactor(base-ui): widen ThemeMode to accept custom theme ids"
```

---

## Task 10: `useThemeRegistry` Hook

**Files:**
- Create: `packages/base-ui/src/theme/useThemeRegistry.ts`
- Create: `packages/base-ui/src/theme/useThemeRegistry.test.tsx`
- Modify: `packages/base-ui/src/theme/index.ts`

A thin hook returning the singleton registry so consumers can register/list/apply imperatively.

- [ ] **Step 1: Write failing test**

Create `packages/base-ui/src/theme/useThemeRegistry.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useThemeRegistry } from './useThemeRegistry';
import { themeRegistry } from './registry';

describe('useThemeRegistry', () => {
  it('returns the module singleton', () => {
    const { result } = renderHook(() => useThemeRegistry());
    expect(result.current).toBe(themeRegistry);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/useThemeRegistry.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `packages/base-ui/src/theme/useThemeRegistry.ts`:

```typescript
import { themeRegistry } from './registry';
import type { ThemeRegistry } from './registry';

/** Returns the module-level theme registry singleton. */
export function useThemeRegistry(): ThemeRegistry {
  return themeRegistry;
}
```

Add to `packages/base-ui/src/theme/index.ts`:

```typescript
export { useThemeRegistry } from './useThemeRegistry';
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/useThemeRegistry.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/theme/useThemeRegistry.ts \
        packages/base-ui/src/theme/useThemeRegistry.test.tsx \
        packages/base-ui/src/theme/index.ts
git commit -m "feat(base-ui): add useThemeRegistry hook"
```

---

## Task 11: ThemeProvider Refactor — Delegate to Registry

**Files:**
- Modify: `packages/base-ui/src/theme/ThemeProvider.tsx`
- Create: `packages/base-ui/src/theme/ThemeProvider.test.tsx`

The provider stops writing `data-ov-theme` directly, subscribes to registry `applied` events, handles deferred registration for stored-but-not-yet-registered ids, and auto-applies on matching `registered` events.

- [ ] **Step 1: Write failing tests**

Create `packages/base-ui/src/theme/ThemeProvider.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';
import { themeRegistry } from './registry';

function Reader() {
  const { theme } = useTheme();
  return <div data-testid="theme">{theme}</div>;
}

function reset() {
  // Unregister any non-built-in themes that tests may have registered.
  for (const info of themeRegistry.list()) {
    if (!info.builtIn) themeRegistry.unregister(info.id);
  }
  themeRegistry.apply('dark');
  document.documentElement.removeAttribute('data-ov-theme');
  document.documentElement.removeAttribute('data-ov-theme-custom');
  document.documentElement.style.cssText = '';
  window.localStorage.clear();
}

describe('ThemeProvider + themeRegistry integration', () => {
  beforeEach(() => reset());
  afterEach(() => reset());

  it('applies initialTheme on mount (built-in)', () => {
    render(
      <ThemeProvider initialTheme="light" persist={false}>
        <Reader />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-ov-theme')).toBe('light');
  });

  it('re-renders when the registry applies a theme externally', () => {
    render(
      <ThemeProvider initialTheme="dark" persist={false}>
        <Reader />
      </ThemeProvider>,
    );
    act(() => {
      themeRegistry.apply('light');
    });
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('defers apply for unregistered stored id and auto-applies on registration', () => {
    window.localStorage.setItem('ov-theme-mode', 'solarized-dark');
    render(
      <ThemeProvider initialTheme="dark" persist>
        <Reader />
      </ThemeProvider>,
    );
    // Pending — no custom theme registered yet, provider fell back to initial.
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    act(() => {
      themeRegistry.register({
        id: 'solarized-dark',
        name: 'Solarized Dark',
        base: 'dark',
        colors: { 'color.bg.base': '#002b36' },
      });
    });
    // Registration triggers auto-apply.
    expect(screen.getByTestId('theme').textContent).toBe('solarized-dark');
    expect(document.documentElement.getAttribute('data-ov-theme-custom')).toBe(
      'solarized-dark',
    );
  });

  it('persists the active theme id to localStorage across applies', () => {
    render(
      <ThemeProvider initialTheme="dark" persist>
        <Reader />
      </ThemeProvider>,
    );
    act(() => {
      themeRegistry.apply('light');
    });
    expect(window.localStorage.getItem('ov-theme-mode')).toBe('light');
  });

  it('unsubscribes from registry events on unmount', () => {
    const { unmount } = render(
      <ThemeProvider initialTheme="dark" persist={false}>
        <Reader />
      </ThemeProvider>,
    );
    unmount();
    // After unmount, an external apply should not throw via stale listener.
    expect(() => themeRegistry.apply('light')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/ThemeProvider.test.tsx
```

Expected: FAIL — the current provider writes `data-ov-theme` itself without going through the registry, so the "re-renders when registry applies externally" test fails (state doesn't sync).

- [ ] **Step 3: Refactor the provider**

Replace `packages/base-ui/src/theme/ThemeProvider.tsx` with:

```typescript
import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { ThemeContext } from './context';
import { themeRegistry } from './registry';
import type { ThemeDensity, ThemeMode, ThemeMotion } from './types';

const DENSITY_ATTR = 'data-ov-density';
const MOTION_ATTR = 'data-ov-motion';

const THEME_STORAGE_KEY = 'ov-theme-mode';
const DENSITY_STORAGE_KEY = 'ov-theme-density';
const MOTION_STORAGE_KEY = 'ov-theme-motion';

export interface ThemeProviderProps extends PropsWithChildren {
  initialTheme?: ThemeMode;
  initialDensity?: ThemeDensity;
  initialMotion?: ThemeMotion;
  persist?: boolean;
}

function getStored(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

const isThemeDensity = (v: string): v is ThemeDensity => v === 'compact' || v === 'comfortable';
const isThemeMotion = (v: string): v is ThemeMotion => v === 'normal' || v === 'reduced';

export function ThemeProvider({
  children,
  initialTheme = 'dark',
  initialDensity = 'comfortable',
  initialMotion = 'normal',
  persist = true,
}: ThemeProviderProps) {
  // --- THEME ---
  // Resolve an initial theme id. If localStorage has a registered id, use that;
  // otherwise fall back to `initialTheme` and remember the pending id (if any)
  // so we can auto-apply it when a matching `registered` event arrives.
  const pendingThemeIdRef = useRef<string | null>(null);
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (!persist) return initialTheme;
    const stored = getStored(THEME_STORAGE_KEY);
    if (stored && themeRegistry.has(stored)) return stored;
    if (stored) pendingThemeIdRef.current = stored;
    return initialTheme;
  });

  // Apply the initial theme through the registry once on mount and subscribe
  // to registry events so external applies (e.g. via useThemeRegistry) stay
  // in sync, and so that a deferred registered theme auto-applies.
  useEffect(() => {
    themeRegistry.apply(theme);
    const unsubscribe = themeRegistry.subscribe((event) => {
      if (event.type === 'applied') {
        setThemeState(event.id);
        if (persist && typeof window !== 'undefined') {
          window.localStorage.setItem(THEME_STORAGE_KEY, event.id);
        }
      } else if (event.type === 'registered') {
        if (pendingThemeIdRef.current === event.id) {
          pendingThemeIdRef.current = null;
          themeRegistry.apply(event.id);
        }
      }
    });
    return unsubscribe;
    // Intentionally only on mount. `theme` state is updated via the subscriber.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = (next: ThemeMode) => {
    themeRegistry.apply(next);
    // State update flows through the `applied` listener above.
  };

  // --- DENSITY ---
  const [density, setDensity] = useState<ThemeDensity>(() => {
    if (!persist) return initialDensity;
    const stored = getStored(DENSITY_STORAGE_KEY);
    return stored && isThemeDensity(stored) ? stored : initialDensity;
  });
  useEffect(() => {
    document.documentElement.setAttribute(DENSITY_ATTR, density);
    if (persist) window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
  }, [density, persist]);

  // --- MOTION ---
  const [motion, setMotion] = useState<ThemeMotion>(() => {
    if (!persist) return initialMotion;
    const stored = getStored(MOTION_STORAGE_KEY);
    return stored && isThemeMotion(stored) ? stored : initialMotion;
  });
  useEffect(() => {
    document.documentElement.setAttribute(MOTION_ATTR, motion);
    if (persist) window.localStorage.setItem(MOTION_STORAGE_KEY, motion);
  }, [motion, persist]);

  const value = useMemo(
    () => ({ theme, density, motion, setTheme, setDensity, setMotion }),
    [theme, density, motion],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/ThemeProvider.test.tsx src/theme/registry/registry.test.ts
```

Expected: PASS (all provider + registry tests green).

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/src/theme/ThemeProvider.tsx \
        packages/base-ui/src/theme/ThemeProvider.test.tsx
git commit -m "refactor(base-ui): delegate theme activation to registry"
```

---

## Task 12: Type-Level Tests

**Files:**
- Create: `packages/base-ui/src/theme/types.test-d.ts`
- Modify: `packages/base-ui/package.json` (add `tsd` devDep + `test:types` script)

`tsd` validates compile-time type invariants.

- [ ] **Step 1: Add the `tsd` devDependency**

In `packages/base-ui/package.json`:

```json
"devDependencies": {
  "...": "...",
  "tsd": "^0.31.0"
},
"scripts": {
  "...": "...",
  "test:types": "tsd --files src/theme/types.test-d.ts"
}
```

Run `pnpm install` from the workspace root.

- [ ] **Step 2: Write the type-level tests**

Create `packages/base-ui/src/theme/types.test-d.ts`:

```typescript
import { expectError, expectType } from 'tsd';
import type {
  BuiltInThemeMode,
  ThemeDefinition,
} from './registry/types';
import type {
  ColorTokenKey,
  SyntaxTokenKey,
  TerminalTokenKey,
} from './generated/tokenKeys';

// BuiltInThemeMode accepts the 7 known ids.
expectType<BuiltInThemeMode>('dark');
expectType<BuiltInThemeMode>('light');
expectType<BuiltInThemeMode>('obsidian');

// BuiltInThemeMode rejects bogus ids.
// @ts-expect-error
expectType<BuiltInThemeMode>('not-a-theme');

// ThemeDefinition requires id, name, base.
expectError<ThemeDefinition>({ name: 'x', base: 'dark' } as unknown as ThemeDefinition);
expectError<ThemeDefinition>({ id: 'x', base: 'dark' } as unknown as ThemeDefinition);

// colors keys must be ColorTokenKey; bogus keys are rejected.
expectError<ThemeDefinition>({
  id: 'x',
  name: 'x',
  base: 'dark',
  colors: { 'not.a.real.key': '#000' } as Partial<Record<ColorTokenKey, string>>,
});

// Valid picks: grab one known key from each union so this test is stable
// across additions. (If the union is empty we fall through; unlikely.)
type AnyColor = ColorTokenKey extends never ? never : ColorTokenKey;
type AnySyntax = SyntaxTokenKey extends never ? never : SyntaxTokenKey;
type AnyTerminal = TerminalTokenKey extends never ? never : TerminalTokenKey;

const ok: ThemeDefinition = {
  id: 'ok',
  name: 'ok',
  base: 'dark',
  colors: {} as Partial<Record<AnyColor, string>>,
  syntax: {} as Partial<Record<AnySyntax, string>>,
  terminal: {} as Partial<Record<AnyTerminal, string>>,
};
expectType<ThemeDefinition>(ok);
```

- [ ] **Step 3: Run the type tests**

```bash
pnpm --filter @omniviewdev/base-ui test:types
```

Expected: passes (no type errors reported).

- [ ] **Step 4: Commit**

```bash
git add packages/base-ui/src/theme/types.test-d.ts \
        packages/base-ui/package.json \
        pnpm-lock.yaml
git commit -m "test(base-ui): add type-level tests for theme registry"
```

---

## Task 13: Storybook — Sample Custom Theme & Toolbar

**Files:**
- Create: `packages/base-ui/.storybook/sampleCustomThemes.ts`
- Modify: `packages/base-ui/.storybook/preview.tsx` (or `preview.ts`)

Register a sample custom theme ("Solarized Dark") and update the theme dropdown to list all registered themes.

- [ ] **Step 1: Create the sample theme**

Create `packages/base-ui/.storybook/sampleCustomThemes.ts`:

```typescript
import type { ThemeDefinition } from '../src/theme/registry';

export const SOLARIZED_DARK: ThemeDefinition = {
  id: 'solarized-dark',
  name: 'Solarized Dark',
  base: 'dark',
  author: 'Ethan Schoonover',
  colors: {
    'color.bg.base': '#002b36',
    'color.bg.surface': '#073642',
    'color.fg.default': '#839496',
    'color.fg.muted': '#657b83',
    'color.brand.500': '#268bd2',
  },
  syntax: {
    'syntax.comment': '#586e75',
    'syntax.string': '#2aa198',
    'syntax.keyword': '#859900',
  },
  terminal: {
    'terminal.red': '#dc322f',
    'terminal.green': '#859900',
    'terminal.blue': '#268bd2',
  },
};
```

- [ ] **Step 2: Read the current preview file**

Look at `packages/base-ui/.storybook/preview.tsx` (or `.ts`) to understand the existing theme toolbar structure.

- [ ] **Step 3: Update the preview to register the sample theme and list all registered themes**

Edit `.storybook/preview.tsx` so that:

1. Before the default export, register the sample:
   ```typescript
   import { themeRegistry } from '../src/theme/registry';
   import { SOLARIZED_DARK } from './sampleCustomThemes';

   if (!themeRegistry.has(SOLARIZED_DARK.id)) themeRegistry.register(SOLARIZED_DARK);
   ```
2. The `globalTypes.theme.toolbar.items` array (if present) is replaced with an array built from `themeRegistry.list()` so custom themes appear automatically. If the existing preview uses a static list, replace it like:
   ```typescript
   theme: {
     description: 'Theme',
     defaultValue: 'dark',
     toolbar: {
       title: 'Theme',
       items: themeRegistry.list().map((t) => ({ value: t.id, title: t.name })),
     },
   },
   ```
3. The decorator (if already present) that sets `data-ov-theme` directly must be removed — applying via `themeRegistry.apply(context.globals.theme)` is what drives DOM state now.

Ensure the existing density/motion toolbars are untouched.

- [ ] **Step 4: Run Storybook and verify the toolbar**

```bash
pnpm --filter @omniviewdev/base-ui storybook
```

Open the Storybook UI (typically http://localhost:6006). Confirm:
- The theme dropdown lists all 7 built-ins PLUS "Solarized Dark"
- Selecting "Solarized Dark" visibly changes a test component's background
- `document.documentElement` in DevTools shows `data-ov-theme="dark"` and `data-ov-theme-custom="solarized-dark"`

Stop Storybook with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add packages/base-ui/.storybook/sampleCustomThemes.ts \
        packages/base-ui/.storybook/preview.tsx
git commit -m "feat(base-ui): register sample custom theme in Storybook"
```

---

## Task 14: Visual Regression Snapshot Baseline

**Files:**
- Create: `packages/base-ui/src/theme/__snapshots__/registry-visual.test.tsx`

A compact visual snapshot suite that renders a handful of representative components under each built-in theme plus the sample custom theme. These snapshots catch accidental token-leakage regressions.

- [ ] **Step 1: Write the snapshot test**

Create `packages/base-ui/src/theme/__snapshots__/registry-visual.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { TextField } from '../../components/text-field';
import { themeRegistry } from '../registry';

const SAMPLE = {
  id: 'solarized-dark-fixture',
  name: 'Solarized Dark Fixture',
  base: 'dark' as const,
  colors: { 'color.bg.base': '#002b36', 'color.fg.default': '#839496' },
};

function Fixture() {
  return (
    <div>
      <Button>click</Button>
      <Card>
        <div>card body</div>
      </Card>
      <TextField placeholder="type here" />
    </div>
  );
}

describe('visual regression — representative components under each theme', () => {
  beforeEach(() => {
    if (!themeRegistry.has(SAMPLE.id)) themeRegistry.register(SAMPLE);
  });

  for (const info of themeRegistry.list()) {
    it(`matches snapshot under theme '${info.id}'`, () => {
      themeRegistry.apply(info.id);
      const { container } = render(<Fixture />);
      // Capture both the outer HTML and the resolved theme attributes so
      // snapshots regress when attribute behavior changes.
      const shape = {
        html: container.innerHTML,
        dataOvTheme: document.documentElement.getAttribute('data-ov-theme'),
        dataOvThemeCustom: document.documentElement.getAttribute('data-ov-theme-custom'),
        colorScheme: document.documentElement.style.colorScheme,
      };
      expect(shape).toMatchSnapshot();
    });
  }
});
```

Note: component import paths (`'../../components/button'` etc.) must match the package's actual layout. If components are exported from a central `components/index.ts`, use that instead (e.g., `import { Button, Card, TextField } from '../../components'`). Verify against the current codebase before running.

- [ ] **Step 2: Run the test to generate initial snapshots**

```bash
pnpm --filter @omniviewdev/base-ui exec vitest run src/theme/__snapshots__/registry-visual.test.tsx
```

Expected: PASS; a `__snapshots__` directory is created with the baseline.

- [ ] **Step 3: Inspect the snapshot**

Open the generated `.snap` file and verify each theme produces a distinct shape (different `data-ov-theme` per built-in; custom theme has `data-ov-theme-custom` populated).

- [ ] **Step 4: Commit**

```bash
git add packages/base-ui/src/theme/__snapshots__/
git commit -m "test(base-ui): visual regression snapshots for themed components"
```

---

## Task 15: Update THEMING Docs

**Files:**
- Modify: `packages/base-ui/docs/THEMING.md` (or create a section within it)

Add an "Authoring Custom Themes" section documenting `ThemeDefinition`, the dotted token key format, the `base` inheritance model, and the Wails/Go integration pattern.

- [ ] **Step 1: Read the current THEMING.md**

- [ ] **Step 2: Append (or insert) the authoring guide**

Add a section (see spec `docs/superpowers/specs/2026-04-12-library-readiness-for-ide-migration-design.md` "Theme Definition Format" and "Runtime Application" for content to summarize) covering:

1. The `ThemeDefinition` shape with a short code example.
2. Token key discovery (point to `src/theme/generated/tokenKeys.ts`).
3. How `base` inheritance works: any unspecified token falls back to the declared built-in base.
4. Registration API: `themeRegistry.register(def)` / `themeRegistry.apply(id)`.
5. The `useThemeRegistry()` hook.
6. The Wails/Go integration pattern (register via bindings from Go), matching the diagram in the spec.
7. A note on validation: unknown keys throw; bad color values silently no-op at CSS apply time.

Write in the voice and style of the rest of THEMING.md.

- [ ] **Step 3: Commit**

```bash
git add packages/base-ui/docs/THEMING.md
git commit -m "docs(base-ui): document custom theme authoring"
```

---

## Task 16: COMPONENT_STATUS Update & Final Verification

**Files:**
- Modify: `packages/base-ui/docs/COMPONENT_STATUS.md`

Note the new theme extensibility surface alongside the existing ThemeProvider entry.

- [ ] **Step 1: Update COMPONENT_STATUS.md**

Add a line under the theming section:

```markdown
- ✅ `ThemeRegistry` + `useThemeRegistry` — runtime custom theme registration with base-theme inheritance
```

- [ ] **Step 2: Run the full package build and test suite**

```bash
pnpm --filter @omniviewdev/base-ui test
pnpm --filter @omniviewdev/base-ui build
pnpm --filter @omniviewdev/base-ui test:types
```

Expected: all green; dist output contains the new exports (`ThemeDefinition`, `themeRegistry`, `useThemeRegistry`).

- [ ] **Step 3: Verify the public API surface of the built package**

```bash
cat packages/base-ui/dist/index.d.ts | grep -E "themeRegistry|ThemeDefinition|useThemeRegistry|ThemeRegistry"
```

Expected: each symbol appears in the bundled declaration file.

- [ ] **Step 4: Commit**

```bash
git add packages/base-ui/docs/COMPONENT_STATUS.md
git commit -m "docs(base-ui): note theme registry in component status"
```

- [ ] **Step 5: Push branch for review**

```bash
git push -u origin feat/theme-extensibility
```

---

## Self-Review Checklist (run before submitting PR)

- [ ] All 16 tasks committed; no uncommitted changes (`git status` clean)
- [ ] `pnpm --filter @omniviewdev/base-ui test` — all unit + integration tests pass
- [ ] `pnpm --filter @omniviewdev/base-ui test:types` — type-level tests pass
- [ ] `pnpm --filter @omniviewdev/base-ui build` — clean build
- [ ] Storybook manual check: theme dropdown lists all registered themes; applying Solarized Dark updates the page
- [ ] `grep -r "data-ov-theme" packages/base-ui/src/theme/ThemeProvider.tsx` shows no direct writes (ownership moved to registry)
- [ ] Generated `tokenKeys.ts` is committed and regenerating it in a clean clone produces identical output
