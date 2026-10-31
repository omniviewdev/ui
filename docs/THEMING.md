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

Neutral buttons and labeled selection triggers use the shared opaque control
surface for filled and outline variants; ghost variants stay transparent.
Text-entry fields keep their existing variant surfaces and required boundaries.
Explicit semantic colors and popup selections retain their accents. TagInput
uses the neutral soft surface without adding a variant prop.

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

## Native control language

Buttons, dropdown triggers, menu items, and selection controls share one visual
hierarchy. Ordinary actions use neutral content and surfaces; primary actions,
selection, focus, and semantic status retain their dedicated accents. Do not
make every idle outline, hover, or press blue. Preserve destructive semantics
rather than promoting a destructive action to the primary role.

Apple's [button guidance](https://developer.apple.com/design/human-interface-guidelines/buttons)
supports clear labels/icons, explicit press feedback, and prominence through
style rather than size. Its [color guidance](https://developer.apple.com/design/human-interface-guidelines/color)
supports consistent semantic roles and restrained emphasis. Our application
uses these principles, not a pixel-perfect imitation of AppKit or Liquid Glass.
Reference screenshots are inspiration, not a native platform specification.
Keep existing heights, padding, radii, density tiers, hit areas, and public APIs
unchanged in this visual refinement.

### Quiet chrome, identifiable controls

Use `--ov-color-border-chrome` for decorative control outlines only when a
visible label or sufficiently contrasting icon independently identifies the
control. It aliases `--ov-color-border-default`, so each theme, including
high-contrast variants, retains its own boundary treatment. A nearby field
label alone does not identify an otherwise invisible empty editing area.

Keep `--ov-color-border-control` for required boundaries: empty inputs,
unchecked checkboxes/radios, and any selector or choice whose presence/state
depends on its edge. Keep identifying checkmarks, arrows, switch thumbs,
selected-state cues, and keyboard focus visible. Quiet chrome must not replace
those cues or weaken high-contrast variants.

Neutral filled controls use `--ov-color-bg-control` (raised surface),
`--ov-color-bg-control-hover` (90% control surface, 10% default foreground), and
`--ov-color-bg-control-pressed` (84% control surface, 16% default foreground).
These sRGB mixes produce opaque fills for opaque theme inputs, avoiding
background-dependent alpha overlays. These weights and palette values are
local design choices, not Apple-prescribed colors. Apple allows appropriate
macOS transparency; opaque fills here provide predictable contrast across our
layered, themeable desktop UI. Preserve intentional transparent/ghost variants.

Define these aliases on both `:root` and every `[data-ov-theme]` root so nested
themes resolve their own palette instead of inheriting resolved parent colors.
Selected segments use the pressed control fill, distinct from inactive hover.
Ghost Select and MultiSelect controls remain transparent at rest and use the
unmixed hover/pressed state tokens for visible interaction feedback.

### Default dark contrast measurements

Snapshot: 2026-10-31, values from
[`styles.css`](../packages/base-ui/src/theme/styles.css), default `:root`/dark
palette. This is a local before/after comparison, not a second theme catalog.
Replacing the strong outline on a decorative edge reduces its contrast as follows:

| Adjacent surface | Surface color | Required-boundary color `#6c7788` | Decorative chrome `#343840` |
| ---------------- | ------------- | -------------------------------- | -------------------------- |
| Base | `#181a1c` | 3.85:1 | 1.48:1 |
| Surface / overlay | `#1f2125` | 3.56:1 | 1.37:1 |
| Raised / control | `#272a30` | 3.17:1 | 1.22:1 |
| Inset | `#131416` | 4.07:1 | 1.57:1 |
| Elevated | `#2e323a` | 2.84:1 | 1.09:1 |

The quiet outline intentionally does not meet 3:1 and cannot identify a control
by itself. The strong token also falls below 3:1 against the elevated surface
(unrounded 2.835539830484767:1); retaining its name/value is not proof of
compliance. Required boundaries there need a compliant surface pairing or
another sufficient identifying cue.

| Neutral state | Opaque sRGB fill, channels on 0–255 scale | Default text `#cccccc` | Muted icon `#9d9d9d` | Focus `#7a96db` against fill |
| ------------- | --------------------------------------- | ---------------------- | -------------------- | -------------------------- |
| Rest | `(39, 42, 48)` | 8.96:1 | 5.30:1 | 4.94:1 |
| Hover | `(55.5, 58.2, 63.6)` | 7.08:1 | 4.19:1 | 3.90:1 |
| Pressed | `(65.4, 67.92, 72.96)` | 6.09:1 | 3.60:1 | 3.36:1 |

Calculated with an sRGB evaluation script: normalize channels to 0–1, linearize
with `c / 12.92` when `c <= 0.04045`, otherwise `((c + 0.055) / 1.055) ** 2.4`;
then `L = 0.2126 R + 0.7152 G + 0.0722 B` and contrast is
`(Llighter + 0.05) / (Ldarker + 0.05)`. Mix channels in sRGB before linearizing;
retain fractional channels and compare unrounded ratios to thresholds. Tables
round only for display. These calculations are not rendered-component evidence
or a claim that every accent, theme, icon, or focus placement passes.

### Rendered workspace evidence

Captured on 2026-10-31 using the real browser-mode host and managed Kubernetes
plugin in `omniview-dev` workspace `native-controls-20261031`. Host, UI, plugin,
and SDK worktrees started from freshly fetched `origin/main`. These are actual
application screenshots, not static mockups or browser-injected style previews.

- [Dashboard and namespace selector, Dark](native-controls-dashboard-dark.png).
- [Pod toolbar and selected node filter, Dark](native-controls-pods-dark.png).
- [Pod toolbar, Light](native-controls-pods-light.png).
- [Pod toolbar, High Contrast Dark](native-controls-pods-hc-dark.png).
- [Primary and secondary dialog actions, Dark](native-controls-actions-dark.png).

The managed build completed for shared UI packages, runtime, host, and plugin.
Browser smoke exercised dropdown opening, keyboard node selection, persisted
filter chips, theme switching, and dialog opening/cancellation. No resource was
created or changed. Rendered neutral-outline button assertions confirmed
`rgb(39, 42, 48)` resting fill, `rgb(52, 56, 64)` idle border, distinct opaque
hover/pressed fills, and `rgb(122, 150, 219)` keyboard focus border/ring.
High Contrast Dark retained its `rgb(240, 240, 240)` button boundary.

The development badge showed “Stale” after documentation/screenshot writes.
The cause was not independently isolated. The state assertions above verified
the changed CSS in the running application despite that badge.
Native AppKit rendering and every custom theme were not verified.

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
| Decorative control chrome                | `--ov-color-border-chrome`                               | Outline redundant with a visible identifying label or icon           |
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
not just a token swatch on the page background. Normal-size active control
labels require at least 4.5:1 against their actual fill under WCAG 1.4.3.
Decorative-outline exemption applies only when independently identifying
content remains sufficient. Keep keyboard focus visible and distinct from
selection, hover, and status; a selected row is not necessarily keyboard-focused.

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
- [W3C: Understanding Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html):
  normal text requires 4.5:1; large text has a separate 3:1 threshold.
- [W3C: Understanding Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html):
  keyboard focus must remain visible; a decorative border is not its substitute.
  [Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
  additionally defines area and same-pixel focused/unfocused contrast at AAA;
  do not mislabel that criterion as an AA requirement.
- [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons),
  [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode),
  and [Color](https://developer.apple.com/design/human-interface-guidelines/color):
  use semantic, appearance-adaptive roles and explicit state feedback. Review
  light/dark appearances and increased contrast; Dark Mode recommends 4.5:1
  foreground/background contrast and aiming for 7:1 with custom colors,
  especially small text. This does not prescribe our hex values or require
  every decorative outline to reach text contrast.
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
