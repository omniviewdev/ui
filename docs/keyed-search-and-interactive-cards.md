# Keyed search and interactive cards

These are domain-neutral base-ui components. Cluster connection lifecycle, result matching, persistent history, folders, icons and saved lenses belong to the application. See [delivery and preservation tracking](cluster-explorer-delivery.md).

## KeyedSearch

```tsx
import { useMemo, useState } from 'react';
import {
  KeyedSearch,
  createKeyedSearchIndex,
  parseKeyedSearch,
  type KeyedSearchField,
} from '@omniviewdev/base-ui';

const fields: readonly KeyedSearchField[] = [
  { name: 'region', label: 'Region', values: ['us-east-1', 'eu-west-1'] },
  { name: 'owner', label: 'Owner', values: ['Platform team', 'Product team'] },
];

function Search({ openSelected }: { openSelected: () => void }) {
  const [query, setQuery] = useState('');
  const index = useMemo(() => createKeyedSearchIndex(fields), []);
  const parsed = useMemo(() => parseKeyedSearch(query, index), [query, index]);

  return (
    <KeyedSearch
      query={query}
      onQueryChange={setQuery}
      fields={fields}
      aria-label="Search workspaces"
      placeholder={'Search… region:us-east-1 owner:"Platform team"'}
      onSubmit={() => {
        if (parsed.diagnostics.length === 0) openSelected();
      }}
    />
  );
}
```

Fields and value candidates are synchronous data. Keep the field array stable to avoid rebuilding its index. Matching uses precomputed case-folded candidate documents; suggestion rendering is bounded (20 by default, at most 100). Large remote catalogs should be indexed by their owner rather than introducing network calls in a keystroke render path.

### Editing and parsing

- Free text and `field:value` terms may mix. Field names are case-insensitive; parsed values preserve case for the consumer's matching policy.
- Single or double quotes group spaces. Inside quotes, backslashes escape the enclosing quote or another backslash.
- Token spans are half-open UTF-16 offsets, matching native input selection APIs. The original source and every token's raw text remain available.
- Unknown keys remain filters and emit diagnostics. Unclosed quotes remain editable and emit diagnostics. Do not silently discard either case when filtering production data.
- Completion follows the current caret, including existing terms in the middle of a query. It replaces only that token; surrounding text remains unchanged.
- Native text selection, clipboard, horizontal scrolling and IME remain native. Syntax is a non-interactive, aria-hidden overlay using `--ov-syntax-property`, `--ov-syntax-punctuation` and `--ov-syntax-string`.
- Autocapitalization, autocorrection and spellchecking are disabled. Forced-colors presentation falls back to visible native text.

### Keyboard ownership

While suggestions are open, arrows select suggestions, Enter/Tab inserts, and Escape dismisses. A completed value dismisses the menu; a completed field immediately opens its values. Control/Command+Space reopens suggestions.

Unhandled keys reach the supplied `onKeyDown`. When Enter is unhandled, `onSubmit` receives the parsed query and keyboard event. The consuming list should preselect its first result and use unhandled arrows for result navigation. Do not open a preview automatically before normal navigation. Disabled/read-only inputs do not complete or submit. IME confirmation must not be interpreted as completion or navigation.

Use `onParsedQueryChange` when the application needs a parsed-query callback; do not combine it with another state writer that recreates the same query on every callback.

The popup is scoped to the owning input root so nested theme and inline custom-token overrides remain effective. It uses fixed positioning and available viewport dimensions. Test containing clipping/transform contexts when embedding in a new host.

## Interactive Card

```tsx
<Card interactive selected={active} size="sm">
  <Card.Header>
    <Card.Eyebrow>Workspace</Card.Eyebrow>
    <Card.Title>
      <Card.ActionArea as="a" href={href} stretched aria-current={active ? 'true' : undefined}>
        {name}
      </Card.ActionArea>
    </Card.Title>
    <Card.Action>
      <Menu.Root>
        <Menu.Trigger aria-label={`Actions for ${name}`}>⋯</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner align="end">
            <Menu.Popup>
              <Menu.LinkItem href={settingsHref}>Settings</Menu.LinkItem>
              <Menu.Item onClick={toggleFavorite}>Toggle favorite</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Card.Action>
  </Card.Header>
</Card>
```

`interactive` opts into semantic hover/selection styling. `selected` controls appearance only: the owner supplies correct ARIA semantics for its navigation or selection model. Card does not add `aria-selected` to an arbitrary section.

Use native `Card.ActionArea as="a"` for navigation or `as="button"` for actions. Keep the stretched title-level control inside `Card.Header` → `Card.Title`; keep independent controls in sibling `Card.Action` slots. Never place an overflow button inside another button or link. The existing div ActionArea remains available for existing compositions.

Root `disabled` disables primary ActionAreas. Sibling actions remain caller-controlled, allowing settings or recovery actions for an unavailable item. Native buttons use native disabled behavior; disabled anchors suppress navigation and leave the tab order. A disabled card is not a selection state.

The selected surface and leading rail do not change content geometry. The rail uses an inset shadow on the logical inline-start edge and inherits the card's full corner radius, so its ends curve smoothly into the outline rather than forming a square vertical strip. Hover, selected and focus are separate: keyboard focus adds a ring without removing the selected rail. Existing motion preferences and `prefers-reduced-motion` disable transitions.

### Theme contract

New public aliases resolve on `:root` and every `[data-ov-theme]` boundary:

| Alias                             | Default semantic source       |
| --------------------------------- | ----------------------------- |
| `--ov-color-card-bg`              | `--ov-color-bg-surface`       |
| `--ov-color-card-border`          | `--ov-color-border-default`   |
| `--ov-color-card-hover-bg`        | `--ov-color-bg-control-hover` |
| `--ov-color-card-hover-border`    | `--ov-color-border-strong`    |
| `--ov-color-card-selected-bg`     | `--ov-color-state-selected`   |
| `--ov-color-card-selected-border` | `--ov-color-accent-strong`    |
| `--ov-size-card-selection-rail`   | 3px                           |
| `--ov-size-card-focus-ring-width` | 2px                           |

No built-in palette changed. Custom themes may override these aliases or their semantic sources. Components do not branch on theme ID. The registry token catalog includes these aliases, so custom-theme validation accepts them. New themes still need visual/accessibility review; semantic inheritance is not a proof that arbitrary token combinations have sufficient contrast.

Both components support `xs`, `sm`, `md`, `lg`, `xl`, compact/comfortable density and existing text-size preferences. Consumers own fixed card height and long-name truncation; keep full identity available through an accessible name, tooltip or explicit details action.

## Storybook and verification

Run `pnpm --filter @omniviewdev/base-ui storybook` and use `Components/KeyedSearch` and `Components/Card/Interactive`. Base-ui Storybook exposes theme, density, motion and text-size controls; the text-size options match the five native preferences.

See [verification evidence](roadmap-progress/cluster-explorer-components.md) for actual exercised combinations, screenshots and check results. This PR does not implement the Kubernetes explorer or the reusable icon picker.
