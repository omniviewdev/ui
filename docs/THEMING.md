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
Providers that share a root form an ordered owner stack: the most recently
applied provider controls the root, and its cleanup restores the newest
surviving provider. Cleaning up the last provider removes the theme attributes,
inline theme-token overrides, and `color-scheme` while retaining unrelated
host-owned styles.

Xterm resolves tokens per terminal from its nearest themed ancestor. Monaco
0.52 themes are page-global: each `CodeEditor` or `DiffViewer` builds the shared
theme from its own nearest themed ancestor when it mounts or updates, and that
last update changes every Monaco editor on the page. Separate provider roots do
not isolate simultaneous Monaco palettes.

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

## Control sizing and resting surfaces

The five public sizes use the same single-row outer-height scale across Button,
IconButton, Input, SearchInput, TextField, Select, MultiSelect, TagInput, and
NumberInput. Heights describe the control shell, not labels or helper text:

| Density                    | xs   | sm   | md   | lg   | xl   |
| -------------------------- | ---- | ---- | ---- | ---- | ---- |
| Base (no density override) | 18px | 22px | 26px | 32px | 40px |
| Compact                    | 18px | 24px | 30px | 38px | 40px |
| Comfortable                | 18px | 28px | 36px | 44px | 48px |

`--ov-control-height-*` defines the canonical scale; existing
`--ov-size-button-height-*` tokens alias it. Field typography and inline padding
reuse the corresponding button tier tokens. Match adjacent controls by `size`
rather than adding local pixel-height overrides.

Typing, selecting, and clearing do not change single-row field height; nested
clear, trigger, and remove buttons fit inside the parent shell. TagInput may
intentionally grow when tags wrap. Narrow MultiSelect chip rows scroll
horizontally, keeping removal controls keyboard-reachable without overlapping
the clear button, trigger, or neighboring fields.

Resting field surfaces agree for the same color and variant: soft mixes the
raised surface with the accent's soft color, solid mixes the surface with the
accent, and outline/ghost stay transparent. Neutral fields use neutral hover
and control-boundary colors rather than selection-state blue. Popup selections
retain their semantic accents. TagInput uses the neutral soft surface without
adding a variant prop.

Checkbox and radio marks, switch tracks, chips, and badge markers intentionally
use compact scales rather than full field heights. Their visual tiers must still
increase monotonically at each density. RadioGroup styling applies to direct
Radio, Radio.Item, compound Radio.Root, and RadioGroup.Item compositions; explicit
item props take precedence.

Prefer default filled controls in ordinary forms instead of forcing outline
on every component. Empty checkbox/radio marks retain a thin identification
boundary because fill alone disappears against raised surfaces. Switch thumbs
retain an identifiable edge and stay inside their tracks at both endpoints,
including transparent variants. Do not weaken global control or focus tokens
to quiet decorative enclosures.

For `Popover.Trigger` and `Tooltip.Trigger` composition, explicit trigger
size/color/variant props override valid library style values explicitly supplied
on a rendered element; remaining values inherit the context/defaults independently.
Unrelated native or generic props (such as an input's numeric `size`) remain
unchanged and do not override inherited styling. Render functions keep the
existing resolved-props and state contract.

## Boundary design

Choose a boundary by its job, not by the brightness of nearby text. The CSS
source and [generated catalog](../packages/base-ui/src/theme/generated/tokenKeys.ts)
are authoritative; [token mapping](THEME_TOKEN_MAPPING.md) links to the live
palette rather than duplicating per-theme colors.

| Intent                                   | CSS token                                                | Typical use                                                          |
| ---------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| Quiet structural rule                    | `--ov-color-border-muted`                                | Table row rule, separator, subsection divider                        |
| Ordinary passive enclosure               | `--ov-color-border-default`                              | Card or panel perimeter when a frame is necessary                    |
| Intentional structural emphasis          | `--ov-color-border-strong`                               | Deliberately emphasized structural edge, not every nested box        |
| Necessary control-identification outline | `--ov-color-border-control`                              | Input, selector trigger, or choice control identified by its outline |
| Overlay perimeter                        | `--ov-color-border-overlay`                              | Open selector/menu popup, popover, dialog perimeter                  |
| Keyboard focus                           | `--ov-color-border-focus`, `--ov-color-state-focus-ring` | Visible keyboard focus cue, separate from an idle outline            |
| Selection or status                      | Appropriate `state-selected`, brand, or status token     | Active item, selected state, warning/error/success accent            |

`color.border.control` and `color.border.overlay` are the public JSON keys.
Every built-in defines the two CSS tokens. Overlay currently aliases the
theme's ordinary default boundary, but its distinct role allows intentional
theme-specific contrast without brightening passive structure.
Do not derive boundary roles from foreground tokens or add compatibility aliases.

### One boundary owner

Each shell edge or logical group has one intentional boundary owner. If a
parent panel draws an edge, its child content must not draw the same edge again.
Prefer spacing or a surface change before adding another enclosure. A table
owns its row rules; a card wrapping it need not repeat a full inner frame.

For a nested inspector, let the outer card/panel own the perimeter. Subsection
headings and content share that surface; use spacing and, when useful, one muted
separator between sibling sections. Do not stack neutral full-strength frames
around each field group. A semantic left status accent can remain: it conveys
status rather than owning a duplicate neutral enclosure.

### Controls, overlays, focus, and accessibility

Review closed and opened selectors separately. The trigger is a control and may
need `border-control`; its popup owns an overlay perimeter. Reusing the trigger's
bright identification outline for every menu edge defeats the hierarchy.
Controls already identified by contrasting background, text, or icons need not
gain an outline solely because a control token exists.

Required control-identification cues and non-text state indicators, including
author-supplied focus indicators, must achieve at least 3:1 against the applicable
adjacent colors under WCAG 1.4.11. Inspect the actual component surface and state,
not just a token swatch on the page background. Text has its own contrast
requirements. Keep keyboard focus visible and distinct from selection, hover,
and status; a selected row is not necessarily keyboard-focused.

There is no universal 3:1 floor for decorative card outlines, table rules, or
redundant separators. A line becomes meaningful rather than decorative when it
is necessary to understand content or identify a control/state; review that
case against the applicable contrast requirement. In normal themes, structural
muted/default/strong boundaries stay quieter than necessary control outlines.
High-contrast themes intentionally retain stronger boundaries instead of being
forced into the normal-theme quietness ladder. Preserve visible semantic status
accents and do not rely on hue alone to convey status.

### Regression and audit evidence

Use every theme in the [built-in catalog](../packages/base-ui/src/theme/registry/catalog.ts),
including Solarized and both high-contrast themes. Check nested sections, table
row rules, horizontal/vertical/labeled Separators, opened selectors, and keyboard
focus on their actual backgrounds in Chromium against the changed source/build.
Data attributes, jsdom snapshots, and repeated declarations alone cannot establish
visible stroke, geometry, resolved color, accessible contrast, or boundary ownership.

`pnpm audit:ui` retains the full audit report and fails on new High findings.
The theme scanner loads the built-in catalog; the custom-property scanner parses
CSS with the existing PostCSS toolchain and reports local dependency cycles as
High. A fallback referencing the same cyclic property does not rescue it.
The static scanner joins repeated identical selectors in the same at-rule
context, respects declaration order/importance, and includes fallback dependencies.
It deliberately does not merge different selectors: inherited parent values
have already been computed, and a parent/child reference chain is not a
same-element cycle. Arbitrary intersecting selectors and runtime inline overrides
still require browser coverage. Do not regenerate the High baseline to hide
new findings.

Run the audit scanner graph/parser regressions with:

```bash
node --test scripts/audit/scanners/custom-property-cycles.test.mjs scripts/audit/scanners/theme-coverage.test.mjs
```

### Design and accessibility references

- [W3C: Understanding Non-text Contrast, including boundaries and focus](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html):
  distinguishes necessary control/state information from optional boundaries;
  does not require every control to have an outline.
- [Carbon: role-based color tokens](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview)
  and [layering guidance](https://www.carbondesignsystem.com/building-blocks/foundations/color/guidelines):
  pair surface, field, and border roles with their actual layer. This informs
  our static semantic roles; it does not introduce a contextual layer runtime.
- [NN/g: The Principle of Common Region](https://www.nngroup.com/articles/common-region/):
  enclosures communicate grouping strongly; excess borders add clutter when
  proximity already communicates the grouping.
- [VS Code: Theme Color reference](https://code.visualstudio.com/api/references/theme-color):
  separates widget/control boundaries, focus borders, selection, and additional
  high-contrast borders rather than treating every edge as the same role.
