# Web Browser Demo — Design Spec

## Purpose

A Chrome-style browser chrome simulator for the showcase app. Functional iframes load real URLs. The demo drives a new `variant="pill"` enhancement to EditorTabs in base-ui (rounded top corners instead of flat bottom-border indicator).

## Architecture

```
demos/web-browser/
  index.tsx              — top-level layout, wires useBrowser hook to components
  index.module.css       — demo-specific styles (toolbar, viewport, new-tab grid)
  types.ts               — BrowserTab, Bookmark types
  data.ts                — default bookmarks, speed-dial sites, iframe-friendly URLs
  hooks/useBrowser.ts    — all browser state + actions
  components/
    BrowserToolbar.tsx    — back/forward/refresh + address bar
    BookmarksBar.tsx      — row of Chip bookmarks
    NewTabPage.tsx        — search bar + speed-dial grid
    ErrorPage.tsx         — blocked-site error page
    BrowserViewport.tsx   — iframe wrapper with loading/error routing
```

## Data Model

```ts
interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;       // emoji or icon identifier
  loading: boolean;
  error?: 'blocked' | 'not-found';
  history: string[];
  historyIndex: number;
}

interface Bookmark {
  id: string;
  label: string;
  url: string;
  favicon?: string;
}
```

## Component Mapping

### Base-UI components consumed

| Component | Usage | Enhancement needed? |
|-----------|-------|---------------------|
| `EditorTabs` | Tab bar | Yes — new `variant="pill"` |
| `Chip` | Bookmarks bar items | No — uses existing `clickable` + `startDecorator` |
| `IconButton` | Nav buttons (back, forward, refresh) | No |
| `Input` | Address bar | No — uses `startDecorator` for lock icon |
| `Progress` | Loading bar between toolbar and content | No |

### Base-UI enhancement: `EditorTabs` `variant="pill"`

Add a new variant to `EditorTabs` that gives tabs:
- Rounded top corners (`border-radius: 8px 8px 0 0`)
- Raised active background (matches content area below)
- No bottom-border indicator (active state shown by background, not underline)
- Inactive tabs: transparent background, subtle hover

**Type approach:** The shared `ComponentVariant` type is `'solid' | 'soft' | 'outline' | 'ghost'`. Rather than widening this globally (which would affect every component), extend the variant type locally in `EditorTabsProps`: `variant?: ComponentVariant | 'pill'`. This keeps `pill` scoped to EditorTabs only.

**CSS override details:** The existing active-tab indicator is `border-bottom: 2px solid` on `.Tab[data-active]`. The pill variant CSS must:
- Remove `border-bottom` on all tabs within `[data-ov-variant="pill"]`
- Override `.Tab[data-active]` and `.Tab[data-dirty]` border-bottom rules
- Set active tab background to match the content area below
- Apply `border-radius: 8px 8px 0 0` to all tabs

Applied via `data-ov-variant="pill"` on the root, with CSS targeting `[data-ov-variant="pill"]` descendants.

### BrowserTab → TabDescriptor adapter

The top-level `index.tsx` maps `BrowserTab[]` to `TabDescriptor[]` for EditorTabs:
- `id` → `id`
- `title` → `title`
- `favicon` → `icon` (emoji wrapped in a span)
- `closable` → always `true`
- All other TabDescriptor fields use defaults

The `reorderTabs` handler receives `(nextTabs, meta)` from EditorTabs and reorders the `BrowserTab[]` to match.

### Demo-only components

- **BrowserToolbar** — row with `IconButton` (back, forward, refresh) + `Input` (address bar). Back/forward disabled state tied to `canGoBack`/`canGoForward` from hook.
- **BookmarksBar** — horizontal row of `Chip` components. Each chip is `clickable` with `startDecorator` for favicon emoji. Clicking navigates active tab.
- **NewTabPage** — centered layout with search input (navigates on Enter) + speed-dial grid of bookmark cards (icon + label). Shown when `url === 'about:newtab'`.
- **ErrorPage** — shown when `tab.error === 'blocked'`. Displays icon, message ("This site can't be displayed in a frame"), the blocked URL, and a "Try another site" button that goes to new tab page.
- **BrowserViewport** — routes between NewTabPage, ErrorPage, or iframe based on tab state. Wraps iframe in a container; listens to `onLoad` to clear loading state, uses a timeout to detect blocked sites.

## State Management: `useBrowser` Hook

```ts
interface UseBrowserReturn {
  tabs: BrowserTab[];
  activeTab: BrowserTab;
  activeTabId: string;

  // Tab management
  addTab: (url?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  reorderTabs: (nextTabs: TabDescriptor[], meta: ReorderMeta) => void;

  // Navigation
  navigate: (url: string) => void;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;
  canGoBack: boolean;
  canGoForward: boolean;

  // Iframe callbacks
  onFrameLoad: () => void;
  onFrameError: () => void;
}
```

### Navigation flow

1. User enters URL or clicks bookmark → `navigate(url)` called
2. Hook truncates any forward history beyond `historyIndex` (standard browser behavior: navigating from a back-state discards forward entries), then pushes URL, sets `loading: true`, clears `error`
3. BrowserViewport renders iframe with new `src`
4. On iframe `onLoad` → hook sets `loading: false`, clears timeout
5. On iframe `onerror` → `onFrameError` called, sets `error: 'blocked'`, clears loading
6. If iframe doesn't fire `onLoad` or `onerror` within ~5s → hook sets `error: 'blocked'`
7. Cross-origin titles: use domain name from URL as fallback title

### Last-tab behavior

Closing the last remaining tab automatically opens a new tab (`about:newtab`). The `tabs` array is never empty, and `activeTab` is always defined.

### New tab behavior

- `addTab()` creates tab with `url: 'about:newtab'`
- NewTabPage rendered by BrowserViewport when URL is `about:newtab`
- Search input on NewTabPage calls `navigate()` with entered URL (auto-prepends `https://` if no protocol)

## Default Data

### Bookmarks (iframe-friendly sites)

- Wikipedia (`https://en.wikipedia.org`)
- MDN Web Docs (`https://developer.mozilla.org`)
- Example.com (`https://example.com`)
- HTTPBin (`https://httpbin.org`)

### Speed-dial (same as bookmarks + extras)

Same set, displayed as cards with emoji favicons on the new tab page.

## Loading & Error States

### Loading indicator

Linear progress bar rendered in the top-level `index.tsx` layout, positioned between the bookmarks bar and the BrowserViewport. Uses existing `Progress` component. Visible only when `activeTab.loading === true`. Owned by the layout, not by any child component.

### Blocked site detection

Many sites set `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`, preventing iframe embedding. Detection strategy:
- Start a timeout (~5 seconds) when iframe `src` changes
- If `onLoad` fires, clear timeout → site loaded successfully
- If timeout expires without `onLoad` → set `error: 'blocked'`
- Some blocked sites do fire `onLoad` with an empty/error page — accept this limitation

### Error page

Clean, centered layout:
- Warning icon
- "This site can't be displayed in a frame"
- Monospace URL of the blocked site
- "New Tab" button → navigates to `about:newtab`

## Layout

Classic Chrome layout (top to bottom):
1. **Tab bar** — `EditorTabs` with `variant="pill"`, `+ ` button
2. **Toolbar** — back / forward / refresh + address bar
3. **Bookmarks bar** — row of `Chip` items
4. **Loading bar** — thin progress indicator (visible during load)
5. **Content area** — iframe / NewTabPage / ErrorPage (fills remaining space)

## Scope Boundaries

**In scope:**
- Tab management (add, close, reorder, switch)
- URL navigation via address bar
- Back/forward/refresh
- Bookmarks bar (static list from data)
- New tab page with search + speed dial
- Loading indicator
- Blocked site error page
- `variant="pill"` enhancement to EditorTabs

**Out of scope:**
- Editable bookmarks (add/remove/reorder)
- Tab pinning
- DevTools panel
- Download management
- Browser history panel
- Find in page
- Multiple windows
