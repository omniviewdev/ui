# Web Browser Demo Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chrome-style browser chrome simulator demo with functional iframes, driving a new `variant="pill"` enhancement to EditorTabs.

**Architecture:** The demo lives at `apps/showcase/src/demos/web-browser/` and uses a `useBrowser` hook for all state. A new `pill` variant is added to EditorTabs in base-ui (local type extension, CSS-only). The demo wires EditorTabs (pill variant) for tabs, Chip for bookmarks, Input for address bar, and Progress for loading state.

**Tech Stack:** React 19, CSS Modules, @omniview/base-ui, pnpm monorepo

**Spec:** `docs/superpowers/specs/2026-03-13-web-browser-demo-design.md`

---

## Chunk 1: EditorTabs `variant="pill"` Enhancement

### Task 1: Add pill variant CSS to EditorTabs

**Files:**
- Modify: `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:33-69` (variant section)
- Modify: `packages/base-ui/src/components/editor-tabs/EditorTabs.tsx:39` (type extension)

- [ ] **Step 1: Write the failing test**

Add the following test to the existing file `packages/base-ui/src/components/editor-tabs/EditorTabs.test.tsx`:

```tsx
it('applies pill variant data attribute', () => {
  const tabs: TabDescriptor[] = [
    { id: '1', title: 'Tab 1' },
    { id: '2', title: 'Tab 2' },
  ];
  renderWithTheme(<EditorTabs tabs={tabs} variant="pill" />);
  const root = screen.getByRole('tablist');
  expect(root).toHaveAttribute('data-ov-variant', 'pill');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/feat/demos && pnpm --filter @omniview/base-ui vitest run --testPathPattern editor-tabs/EditorTabs.test`
Expected: TypeScript error — `'pill'` is not assignable to `ComponentVariant`

- [ ] **Step 3: Extend variant type locally in EditorTabsProps**

In `packages/base-ui/src/components/editor-tabs/EditorTabs.tsx`, change line 39 from:

```tsx
export interface EditorTabsProps extends StyledComponentProps {
```

to:

```tsx
export interface EditorTabsProps extends Omit<StyledComponentProps, 'variant'> {
  /** Tab style variant. `'pill'` gives rounded top corners for browser-style tabs. */
  variant?: StyledComponentProps['variant'] | 'pill';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/feat/demos && pnpm --filter @omniview/base-ui vitest run --testPathPattern editor-tabs/EditorTabs.test`
Expected: PASS — the data attribute is set by `styleDataAttributes()` which accepts any string.

- [ ] **Step 5: Add pill variant CSS rules**

In `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css`, after the `ghost` variant block (after line 69), add:

```css
.Root[data-ov-variant='pill'] {
  --_ov-tab-bg: transparent;
  --_ov-tab-active-bg: var(--ov-color-surface-base);
  --_ov-tab-active-border: transparent;
  --_ov-tab-hover-bg: color-mix(in srgb, var(--ov-color-surface-base) 50%, transparent);
  --_ov-tab-divider: transparent;
  --_ov-group-header-bg: var(--ov-color-surface-sunken, var(--ov-color-surface-overlay));

  border-bottom-color: transparent;
}

/* Pill tabs: rounded top, no bottom border indicator */
.Root[data-ov-variant='pill'] .Tab {
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  margin-top: 4px;
  padding: 0 12px;
}

.Root[data-ov-variant='pill'] .Tab[data-active] {
  border-bottom: none;
}

.Root[data-ov-variant='pill'] .Tab[data-dirty]:not([data-active]) {
  border-bottom: none;
}

.Root[data-ov-variant='pill'] .Tab[data-active][data-dirty] {
  border-bottom: none;
}

/* Hide vertical dividers in pill mode */
.Root[data-ov-variant='pill'] .Tab::after {
  display: none;
}
```

- [ ] **Step 6: Verify visually — run showcase dev server**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/feat/demos && pnpm --filter @omniview/base-ui build`
Expected: Build succeeds with no errors.

- [ ] **Step 7: Run full EditorTabs test suite**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/feat/demos && pnpm --filter @omniview/base-ui vitest run --testPathPattern editor-tabs`
Expected: All tests pass, including new pill variant test.

- [ ] **Step 8: Commit**

```bash
git add packages/base-ui/src/components/editor-tabs/EditorTabs.tsx packages/base-ui/src/components/editor-tabs/EditorTabs.module.css packages/base-ui/src/components/editor-tabs/EditorTabs.test.tsx
git commit -m "feat(editor-tabs): add variant='pill' for rounded browser-style tabs"
```

---

## Chunk 2: Browser Demo Types, Data & Hook

### Task 2: Create types and default data

**Files:**
- Create: `apps/showcase/src/demos/web-browser/types.ts`
- Create: `apps/showcase/src/demos/web-browser/data.ts`

- [ ] **Step 1: Create types file**

Create `apps/showcase/src/demos/web-browser/types.ts`:

```ts
export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  loading: boolean;
  error?: 'blocked' | 'not-found';
  history: string[];
  historyIndex: number;
}

export interface Bookmark {
  id: string;
  label: string;
  url: string;
  favicon?: string;
}
```

- [ ] **Step 2: Create data file**

Create `apps/showcase/src/demos/web-browser/data.ts`:

```ts
import type { Bookmark } from './types';

export const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: 'bm-wiki', label: 'Wikipedia', url: 'https://en.wikipedia.org', favicon: '📖' },
  { id: 'bm-mdn', label: 'MDN Docs', url: 'https://developer.mozilla.org', favicon: '🔧' },
  { id: 'bm-example', label: 'Example', url: 'https://example.com', favicon: '🌐' },
  { id: 'bm-httpbin', label: 'HTTPBin', url: 'https://httpbin.org', favicon: '🔗' },
];

export const SPEED_DIAL_SITES = DEFAULT_BOOKMARKS;

export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function ensureProtocol(input: string): string {
  if (/^https?:\/\//i.test(input)) return input;
  return `https://${input}`;
}

export const NEW_TAB_URL = 'about:newtab';
```

- [ ] **Step 3: Commit**

```bash
git add apps/showcase/src/demos/web-browser/types.ts apps/showcase/src/demos/web-browser/data.ts
git commit -m "feat(web-browser): add types and default data"
```

### Task 3: Create CSS module for the browser demo

**Files:**
- Create: `apps/showcase/src/demos/web-browser/index.module.css`

**Note:** This must be created before the components in Chunk 3, since they import `styles from '../index.module.css'`.

- [ ] **Step 1: Create the CSS module**

Create `apps/showcase/src/demos/web-browser/index.module.css` with the full content shown in Task 8 below (same file — Task 8 is removed as it's handled here).

```css
/* ---------------------------------------------------------------------------
   Web Browser Demo — layout & component styles
   --------------------------------------------------------------------------- */

.browser {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--ov-color-surface-base);
  border-radius: 8px;
  overflow: hidden;
}

/* Tab bar: EditorTabs + new tab button */
.tabBar {
  display: flex;
  align-items: stretch;
  background: var(--ov-color-surface-sunken, var(--ov-color-surface-overlay));
}

.tabStrip {
  flex: 1;
  min-width: 0;
}

.newTabButton {
  flex-shrink: 0;
  align-self: center;
  margin-right: 4px;
}

/* Toolbar: nav buttons + address bar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--ov-color-surface-overlay);
}

.addressBar {
  flex: 1;
}

/* Bookmarks bar */
.bookmarksBar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--ov-color-surface-overlay);
  border-bottom: 1px solid var(--ov-color-border-default);
  font-size: var(--ov-primitive-font-size-12, 0.75rem);
}

/* Loading bar */
.loadingBar {
  height: 2px;
  flex-shrink: 0;
}

/* Content viewport */
.viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: var(--ov-color-surface-base);
}

.iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* New Tab Page */
.newTabPage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 32px;
  padding: 48px;
}

.newTabSearch {
  width: 100%;
  max-width: 480px;
}

.speedDial {
  display: grid;
  grid-template-columns: repeat(auto-fill, 100px);
  gap: 16px;
  justify-content: center;
}

.speedDialCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 8px;
  border: 1px solid var(--ov-color-border-default);
  background: var(--ov-color-surface-overlay);
  cursor: pointer;
  transition: background var(--ov-duration-interactive) var(--ov-ease-standard);
  font-family: inherit;
  color: inherit;
}

.speedDialCard:hover {
  background: var(--ov-color-surface-raised);
}

.speedDialIcon {
  font-size: 24px;
}

.speedDialLabel {
  font-size: var(--ov-primitive-font-size-12, 0.75rem);
  color: var(--ov-color-fg-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

/* Error Page */
.errorPage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: var(--ov-color-fg-muted);
}

.errorIcon {
  color: var(--ov-color-warning-400);
  margin-bottom: 8px;
}

.errorTitle {
  font-size: var(--ov-primitive-font-size-16, 1rem);
  font-weight: var(--ov-font-weight-heading, 600);
  color: var(--ov-color-fg-default);
  margin: 0;
}

.errorUrl {
  font-family: var(--ov-font-mono);
  font-size: var(--ov-primitive-font-size-13, 0.8125rem);
  color: var(--ov-color-fg-subtle);
  margin: 0;
}

.errorButton {
  margin-top: 8px;
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid var(--ov-color-border-default);
  background: var(--ov-color-surface-overlay);
  color: var(--ov-color-fg-default);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--ov-primitive-font-size-13, 0.8125rem);
}

.errorButton:hover {
  background: var(--ov-color-surface-raised);
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/showcase/src/demos/web-browser/index.module.css
git commit -m "feat(web-browser): add CSS module for browser demo"
```

### Task 4: Create useBrowser hook

**Files:**
- Create: `apps/showcase/src/demos/web-browser/hooks/useBrowser.ts`

- [ ] **Step 1: Create the hook**

Create `apps/showcase/src/demos/web-browser/hooks/useBrowser.ts`:

```ts
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { BrowserTab } from '../types';
import { NEW_TAB_URL, domainFromUrl } from '../data';

let nextId = 1;
function makeId(): string {
  return `tab-${nextId++}`;
}

function createTab(url: string = NEW_TAB_URL): BrowserTab {
  return {
    id: makeId(),
    title: url === NEW_TAB_URL ? 'New Tab' : domainFromUrl(url),
    url,
    loading: url !== NEW_TAB_URL,
    history: [url],
    historyIndex: 0,
  };
}

export interface UseBrowserReturn {
  tabs: BrowserTab[];
  activeTab: BrowserTab;
  activeTabId: string;

  addTab: (url?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  reorderTabs: (orderedIds: string[]) => void;

  navigate: (url: string) => void;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;
  canGoBack: boolean;
  canGoForward: boolean;

  onFrameLoad: () => void;
  onFrameError: () => void;
}

const BLOCKED_TIMEOUT_MS = 5000;

export function useBrowser(): UseBrowserReturn {
  const [tabs, setTabs] = useState<BrowserTab[]>(() => [createTab()]);
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) ?? tabs[0],
    [tabs, activeTabId],
  );

  const updateActiveTab = useCallback(
    (updater: (tab: BrowserTab) => BrowserTab) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? updater(t) : t)),
      );
    },
    [activeTabId],
  );

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startBlockedTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updateActiveTab((t) =>
        t.loading ? { ...t, loading: false, error: 'blocked' } : t,
      );
    }, BLOCKED_TIMEOUT_MS);
  }, [updateActiveTab]);

  const navigate = useCallback(
    (url: string) => {
      updateActiveTab((t) => {
        // Truncate forward history
        const trimmedHistory = t.history.slice(0, t.historyIndex + 1);
        return {
          ...t,
          url,
          title: domainFromUrl(url),
          loading: url !== NEW_TAB_URL,
          error: undefined,
          history: [...trimmedHistory, url],
          historyIndex: trimmedHistory.length,
        };
      });
      if (url !== NEW_TAB_URL) startBlockedTimeout();
    },
    [updateActiveTab, startBlockedTimeout],
  );

  const goBack = useCallback(() => {
    updateActiveTab((t) => {
      if (t.historyIndex <= 0) return t;
      const newIndex = t.historyIndex - 1;
      const url = t.history[newIndex];
      return {
        ...t,
        url,
        title: domainFromUrl(url),
        historyIndex: newIndex,
        loading: url !== NEW_TAB_URL,
        error: undefined,
      };
    });
    startBlockedTimeout();
  }, [updateActiveTab, startBlockedTimeout]);

  const goForward = useCallback(() => {
    updateActiveTab((t) => {
      if (t.historyIndex >= t.history.length - 1) return t;
      const newIndex = t.historyIndex + 1;
      const url = t.history[newIndex];
      return {
        ...t,
        url,
        title: domainFromUrl(url),
        historyIndex: newIndex,
        loading: url !== NEW_TAB_URL,
        error: undefined,
      };
    });
    startBlockedTimeout();
  }, [updateActiveTab, startBlockedTimeout]);

  const refresh = useCallback(() => {
    updateActiveTab((t) => ({ ...t, loading: true, error: undefined }));
    startBlockedTimeout();
  }, [updateActiveTab, startBlockedTimeout]);

  const addTab = useCallback(
    (url?: string) => {
      const tab = createTab(url);
      setTabs((prev) => [...prev, tab]);
      setActiveTabId(tab.id);
    },
    [],
  );

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== id);
        // If closing the last tab, open a new one
        if (next.length === 0) {
          const newTab = createTab();
          setActiveTabId(newTab.id);
          return [newTab];
        }
        // If closing active tab, switch to neighbor
        if (id === activeTabId) {
          const closedIndex = prev.findIndex((t) => t.id === id);
          const newActive = next[Math.min(closedIndex, next.length - 1)];
          setActiveTabId(newActive.id);
        }
        return next;
      });
    },
    [activeTabId],
  );

  const reorderTabs = useCallback((orderedIds: string[]) => {
    setTabs((prev) => {
      const map = new Map(prev.map((t) => [t.id, t]));
      return orderedIds.map((id) => map.get(id)!).filter(Boolean);
    });
  }, []);

  const onFrameLoad = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updateActiveTab((t) => ({ ...t, loading: false }));
  }, [updateActiveTab]);

  const onFrameError = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updateActiveTab((t) => ({ ...t, loading: false, error: 'blocked' }));
  }, [updateActiveTab]);

  return {
    tabs,
    activeTab,
    activeTabId,
    addTab,
    closeTab,
    setActiveTab: setActiveTabId,
    reorderTabs,
    navigate,
    goBack,
    goForward,
    refresh,
    canGoBack: activeTab.historyIndex > 0,
    canGoForward: activeTab.historyIndex < activeTab.history.length - 1,
    onFrameLoad,
    onFrameError,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/showcase/src/demos/web-browser/hooks/useBrowser.ts
git commit -m "feat(web-browser): add useBrowser state management hook"
```

---

## Chunk 3: Demo Components

### Task 5: BrowserToolbar component

**Files:**
- Create: `apps/showcase/src/demos/web-browser/components/BrowserToolbar.tsx`

- [ ] **Step 1: Create BrowserToolbar**

```tsx
import { useState, useCallback, useEffect, type KeyboardEvent } from 'react';
import {
  LuArrowLeft,
  LuArrowRight,
  LuRotateCw,
  LuLock,
} from 'react-icons/lu';
import { IconButton, Input } from '@omniview/base-ui';
import { ensureProtocol } from '../data';
import styles from '../index.module.css';

export interface BrowserToolbarProps {
  url: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
}

export function BrowserToolbar({
  url,
  canGoBack,
  canGoForward,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
}: BrowserToolbarProps) {
  const displayUrl = url === 'about:newtab' ? '' : url;
  const [inputValue, setInputValue] = useState(displayUrl);

  // Sync input when URL changes externally (tab switch, bookmark click)
  useEffect(() => {
    setInputValue(displayUrl);
  }, [displayUrl]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const trimmed = inputValue.trim();
        if (trimmed) onNavigate(ensureProtocol(trimmed));
      }
    },
    [inputValue, onNavigate],
  );

  return (
    <div className={styles.toolbar}>
      <IconButton
        variant="ghost"
        size="sm"
        dense
        aria-label="Back"
        disabled={!canGoBack}
        onClick={onBack}
      >
        <LuArrowLeft size={14} />
      </IconButton>
      <IconButton
        variant="ghost"
        size="sm"
        dense
        aria-label="Forward"
        disabled={!canGoForward}
        onClick={onForward}
      >
        <LuArrowRight size={14} />
      </IconButton>
      <IconButton
        variant="ghost"
        size="sm"
        dense
        aria-label="Refresh"
        onClick={onRefresh}
      >
        <LuRotateCw size={14} />
      </IconButton>
      <Input.Root size="sm" className={styles.addressBar}>
        <Input.Control
          startDecorator={<LuLock size={12} />}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setInputValue(displayUrl)}
          placeholder="Enter a URL…"
        />
      </Input.Root>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/showcase/src/demos/web-browser/components/BrowserToolbar.tsx
git commit -m "feat(web-browser): add BrowserToolbar component"
```

### Task 6: BookmarksBar component

**Files:**
- Create: `apps/showcase/src/demos/web-browser/components/BookmarksBar.tsx`

- [ ] **Step 1: Create BookmarksBar**

```tsx
import { Chip } from '@omniview/base-ui';
import type { Bookmark } from '../types';
import styles from '../index.module.css';

export interface BookmarksBarProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
}

export function BookmarksBar({ bookmarks, onNavigate }: BookmarksBarProps) {
  return (
    <div className={styles.bookmarksBar}>
      {bookmarks.map((bm) => (
        <Chip
          key={bm.id}
          size="sm"
          variant="ghost"
          clickable
          startDecorator={bm.favicon ? <span>{bm.favicon}</span> : undefined}
          onClick={() => onNavigate(bm.url)}
        >
          {bm.label}
        </Chip>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/showcase/src/demos/web-browser/components/BookmarksBar.tsx
git commit -m "feat(web-browser): add BookmarksBar component"
```

### Task 7: NewTabPage component

**Files:**
- Create: `apps/showcase/src/demos/web-browser/components/NewTabPage.tsx`

- [ ] **Step 1: Create NewTabPage**

```tsx
import { useState, useCallback, type KeyboardEvent } from 'react';
import { Input } from '@omniview/base-ui';
import { LuSearch } from 'react-icons/lu';
import { SPEED_DIAL_SITES, ensureProtocol } from '../data';
import styles from '../index.module.css';

export interface NewTabPageProps {
  onNavigate: (url: string) => void;
}

export function NewTabPage({ onNavigate }: NewTabPageProps) {
  const [search, setSearch] = useState('');

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && search.trim()) {
        onNavigate(ensureProtocol(search.trim()));
      }
    },
    [search, onNavigate],
  );

  return (
    <div className={styles.newTabPage}>
      <div className={styles.newTabSearch}>
        <Input.Root size="md">
          <Input.Control
            startDecorator={<LuSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or enter URL"
          />
        </Input.Root>
      </div>
      <div className={styles.speedDial}>
        {SPEED_DIAL_SITES.map((site) => (
          <button
            key={site.id}
            className={styles.speedDialCard}
            onClick={() => onNavigate(site.url)}
          >
            <span className={styles.speedDialIcon}>{site.favicon}</span>
            <span className={styles.speedDialLabel}>{site.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/showcase/src/demos/web-browser/components/NewTabPage.tsx
git commit -m "feat(web-browser): add NewTabPage component"
```

### Task 8: ErrorPage and BrowserViewport components

**Files:**
- Create: `apps/showcase/src/demos/web-browser/components/ErrorPage.tsx`
- Create: `apps/showcase/src/demos/web-browser/components/BrowserViewport.tsx`

- [ ] **Step 1: Create ErrorPage**

```tsx
import { LuShieldAlert } from 'react-icons/lu';
import styles from '../index.module.css';

export interface ErrorPageProps {
  url: string;
  onNewTab: () => void;
}

export function ErrorPage({ url, onNewTab }: ErrorPageProps) {
  return (
    <div className={styles.errorPage}>
      <LuShieldAlert size={48} className={styles.errorIcon} />
      <h2 className={styles.errorTitle}>This site can't be displayed in a frame</h2>
      <p className={styles.errorUrl}>{url}</p>
      <button className={styles.errorButton} onClick={onNewTab}>
        New Tab
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create BrowserViewport**

```tsx
import type { BrowserTab } from '../types';
import { NEW_TAB_URL } from '../data';
import { NewTabPage } from './NewTabPage';
import { ErrorPage } from './ErrorPage';
import styles from '../index.module.css';

export interface BrowserViewportProps {
  tab: BrowserTab;
  onNavigate: (url: string) => void;
  onFrameLoad: () => void;
  onFrameError: () => void;
  onNewTab: () => void;
}

export function BrowserViewport({
  tab,
  onNavigate,
  onFrameLoad,
  onFrameError,
  onNewTab,
}: BrowserViewportProps) {
  // Key forces iframe remount on URL/history change
  const iframeKey = `${tab.id}-${tab.historyIndex}`;

  if (tab.url === NEW_TAB_URL) {
    return (
      <div className={styles.viewport}>
        <NewTabPage onNavigate={onNavigate} />
      </div>
    );
  }

  if (tab.error) {
    return (
      <div className={styles.viewport}>
        <ErrorPage url={tab.url} onNewTab={onNewTab} />
      </div>
    );
  }

  return (
    <div className={styles.viewport}>
      <iframe
        key={iframeKey}
        src={tab.url}
        className={styles.iframe}
        title={tab.title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onLoad={onFrameLoad}
        onError={onFrameError}
      />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/showcase/src/demos/web-browser/components/ErrorPage.tsx apps/showcase/src/demos/web-browser/components/BrowserViewport.tsx
git commit -m "feat(web-browser): add ErrorPage and BrowserViewport components"
```

---

## Chunk 4: Demo Assembly

### Task 9: Wire up the main demo component

**Files:**
- Modify: `apps/showcase/src/demos/web-browser/index.tsx` (replace placeholder)

- [ ] **Step 1: Replace placeholder with full demo**

Replace the entire content of `apps/showcase/src/demos/web-browser/index.tsx`:

```tsx
import { useCallback, useMemo } from 'react';
import { LuPlus } from 'react-icons/lu';
import { EditorTabs, IconButton, Progress } from '@omniview/base-ui';
import type { TabDescriptor, ReorderMeta } from '@omniview/base-ui';
import { useBrowser } from './hooks/useBrowser';
import { BrowserToolbar } from './components/BrowserToolbar';
import { BookmarksBar } from './components/BookmarksBar';
import { BrowserViewport } from './components/BrowserViewport';
import { DEFAULT_BOOKMARKS, NEW_TAB_URL } from './data';
import styles from './index.module.css';

export default function WebBrowser() {
  const browser = useBrowser();

  // Map BrowserTab[] → TabDescriptor[] for EditorTabs
  const tabDescriptors: TabDescriptor[] = useMemo(
    () =>
      browser.tabs.map((t) => ({
        id: t.id,
        title: t.title,
        icon: t.favicon ? <span>{t.favicon}</span> : undefined,
        closable: true,
      })),
    [browser.tabs],
  );

  // Handle tab reorder from EditorTabs
  const handleReorder = useCallback(
    (nextTabs: TabDescriptor[], _meta: ReorderMeta) => {
      browser.reorderTabs(nextTabs.map((t) => t.id));
    },
    [browser.reorderTabs],
  );

  // Handle new tab via EditorTabs (if it exposes add button via onCloseTab pattern)
  const handleNewTab = useCallback(() => {
    browser.addTab();
  }, [browser.addTab]);

  return (
    <div className={styles.browser}>
      {/* Tab bar with + button */}
      <div className={styles.tabBar}>
        <EditorTabs
          tabs={tabDescriptors}
          activeId={browser.activeTabId}
          onActiveChange={browser.setActiveTab}
          onCloseTab={browser.closeTab}
          onReorder={handleReorder}
          variant="pill"
          size="sm"
          className={styles.tabStrip}
        />
        <IconButton
          variant="ghost"
          size="sm"
          dense
          aria-label="New tab"
          onClick={handleNewTab}
          className={styles.newTabButton}
        >
          <LuPlus size={14} />
        </IconButton>
      </div>

      {/* Navigation toolbar */}
      <BrowserToolbar
        url={browser.activeTab.url}
        canGoBack={browser.canGoBack}
        canGoForward={browser.canGoForward}
        onNavigate={browser.navigate}
        onBack={browser.goBack}
        onForward={browser.goForward}
        onRefresh={browser.refresh}
      />

      {/* Bookmarks bar */}
      <BookmarksBar
        bookmarks={DEFAULT_BOOKMARKS}
        onNavigate={browser.navigate}
      />

      {/* Loading indicator */}
      {browser.activeTab.loading && (
        <Progress size="sm" color="brand" className={styles.loadingBar} />
      )}

      {/* Content area */}
      <BrowserViewport
        tab={browser.activeTab}
        onNavigate={browser.navigate}
        onFrameLoad={browser.onFrameLoad}
        onFrameError={browser.onFrameError}
        onNewTab={handleNewTab}
      />
    </div>
  );
}
```

- [ ] **Step 2: Rebuild base-ui dist**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/feat/demos && pnpm --filter @omniview/base-ui build`
Expected: Build succeeds. This ensures the pill variant and type changes are available to the showcase app.

- [ ] **Step 3: Verify showcase dev server starts**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/feat/demos && pnpm --filter showcase dev`
Expected: Dev server starts on port 3000 with no compilation errors.

- [ ] **Step 4: Commit**

```bash
git add apps/showcase/src/demos/web-browser/index.tsx
git commit -m "feat(web-browser): wire up browser demo with EditorTabs pill variant"
```

- [ ] **Step 5: Run full base-ui test suite to confirm no regressions**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/feat/demos && pnpm --filter @omniview/base-ui vitest run`
Expected: All tests pass.

- [ ] **Step 6: Final commit if any adjustments needed**

```bash
git add -A
git status
# Only commit if there are changes
```
