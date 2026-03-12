# Showcase Shell Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the `@omniview/showcase` SPA with a left-sidebar dock, home screen, and placeholder demos — a working shell ready for individual demo buildout.

**Architecture:** Vite SPA in `main/apps/showcase/`. A single `useState` drives which demo is active. The dock renders from an app registry; the content area lazy-loads the selected demo. All UI comes from `@omniview/base-ui`, `@omniview/ai-ui`, and `@omniview/editors` workspace packages.

**Tech Stack:** React 19, Vite 7, TypeScript, CSS Modules, `@omniview/base-ui` (ThemeProvider, IconButton, Tooltip, Stack, Separator, Card, Grid, Typography, Spinner, EmptyState, ThemeSwitcher)

**Spec:** `docs/superpowers/specs/2026-03-12-showcase-app-design.md`

---

## Chunk 1: Package Scaffold

### Task 1: Create package.json

**Files:**
- Create: `apps/showcase/package.json`

- [ ] **Step 1: Create the apps directory and package.json**

```json
{
  "name": "@omniview/showcase",
  "version": "0.0.1",
  "private": true,
  "description": "Demo showcase app built entirely from Omniview UI packages.",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.json --noEmit && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@omniview/base-ui": "workspace:*",
    "@omniview/ai-ui": "workspace:*",
    "@omniview/editors": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-icons": "^5.6.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "babel-plugin-react-compiler": "^1.0.0",
    "typescript": "^5.9.2",
    "vite": "^7.3.1"
  }
}
```

- [ ] **Step 2: Run pnpm install from monorepo root**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/main && pnpm install`
Expected: Lockfile updates, workspace links resolve.

---

### Task 2: Create vite.config.ts

**Files:**
- Create: `apps/showcase/vite.config.ts`

- [ ] **Step 1: Write vite config**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ],
  server: {
    port: 3000,
  },
});
```

Note: This is a SPA config (no `build.lib`), unlike the library packages.

---

### Task 3: Create tsconfig.json

**Files:**
- Create: `apps/showcase/tsconfig.json`

- [ ] **Step 1: Write tsconfig**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

---

### Task 4: Create index.html entry point

**Files:**
- Create: `apps/showcase/index.html`

- [ ] **Step 1: Write index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Omniview UI Showcase</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### Task 5: Create main.tsx entry

**Files:**
- Create: `apps/showcase/src/main.tsx`

- [ ] **Step 1: Write main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@omniview/base-ui';
import '@omniview/base-ui/styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
```

---

### Task 6: Create minimal App.tsx and verify dev server

**Files:**
- Create: `apps/showcase/src/App.tsx`

- [ ] **Step 1: Write minimal App.tsx**

```tsx
import { Typography } from '@omniview/base-ui';

export function App() {
  return <Typography variant="h1">Showcase</Typography>;
}
```

- [ ] **Step 2: Run dev server**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/main && pnpm --filter @omniview/showcase dev`
Expected: Vite starts on port 3000, page renders "Showcase" with themed text.

- [ ] **Step 3: Add root scripts**

Add to `main/package.json` scripts:

```json
"showcase": "pnpm --filter @omniview/showcase dev",
"showcase:build": "pnpm --filter @omniview/showcase build"
```

- [ ] **Step 4: Commit**

```bash
git add apps/showcase/ package.json pnpm-lock.yaml
git commit -m "feat(showcase): scaffold package with vite, react, theme"
```

---

## Chunk 2: App Registry and Demo Placeholders

### Task 7: Create the app registry

**Files:**
- Create: `apps/showcase/src/registry.ts`

- [ ] **Step 1: Write the registry**

```ts
import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import {
  LuFolder,
  LuGlobe,
  LuCode,
  LuBot,
  LuFileText,
  LuContainer,
  LuMessageCircle,
} from 'react-icons/lu';

export interface DemoApp {
  id: string;
  name: string;
  description: string;
  icon: ComponentType;
  component: LazyExoticComponent<ComponentType>;
}

export const apps: DemoApp[] = [
  {
    id: 'file-explorer',
    name: 'File Explorer',
    description: 'Navigate local and remote filesystems',
    icon: LuFolder,
    component: lazy(() => import('./demos/file-explorer')),
  },
  {
    id: 'web-browser',
    name: 'Web Browser',
    description: 'Tabbed browsing with groups and bookmarks',
    icon: LuGlobe,
    component: lazy(() => import('./demos/web-browser')),
  },
  {
    id: 'ide-editor',
    name: 'IDE Editor',
    description: 'Code editing with file tree and terminal',
    icon: LuCode,
    component: lazy(() => import('./demos/ide-editor')),
  },
  {
    id: 'ai-chat',
    name: 'AI Chat',
    description: 'Conversational AI with streaming and tool use',
    icon: LuBot,
    component: lazy(() => import('./demos/ai-chat')),
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Markdown note-taking with live preview',
    icon: LuFileText,
    component: lazy(() => import('./demos/notes')),
  },
  {
    id: 'container-management',
    name: 'Containers',
    description: 'Docker-style container dashboard',
    icon: LuContainer,
    component: lazy(() => import('./demos/container-management')),
  },
  {
    id: 'chat-app',
    name: 'Chat',
    description: 'Team messaging with channels and threads',
    icon: LuMessageCircle,
    component: lazy(() => import('./demos/chat-app')),
  },
];
```

---

### Task 8: Create placeholder demos

**Files:**
- Create: `apps/showcase/src/demos/file-explorer/index.tsx`
- Create: `apps/showcase/src/demos/web-browser/index.tsx`
- Create: `apps/showcase/src/demos/ide-editor/index.tsx`
- Create: `apps/showcase/src/demos/ai-chat/index.tsx`
- Create: `apps/showcase/src/demos/notes/index.tsx`
- Create: `apps/showcase/src/demos/container-management/index.tsx`
- Create: `apps/showcase/src/demos/chat-app/index.tsx`

- [ ] **Step 1: Create all 7 placeholder components**

`apps/showcase/src/demos/file-explorer/index.tsx`:
```tsx
import { EmptyState } from '@omniview/base-ui';
import { LuFolder } from 'react-icons/lu';

export default function FileExplorerDemo() {
  return <EmptyState icon={<LuFolder />} title="File Explorer" description="Coming soon" />;
}
```

`apps/showcase/src/demos/web-browser/index.tsx`:
```tsx
import { EmptyState } from '@omniview/base-ui';
import { LuGlobe } from 'react-icons/lu';

export default function WebBrowserDemo() {
  return <EmptyState icon={<LuGlobe />} title="Web Browser" description="Coming soon" />;
}
```

`apps/showcase/src/demos/ide-editor/index.tsx`:
```tsx
import { EmptyState } from '@omniview/base-ui';
import { LuCode } from 'react-icons/lu';

export default function IdeEditorDemo() {
  return <EmptyState icon={<LuCode />} title="IDE Editor" description="Coming soon" />;
}
```

`apps/showcase/src/demos/ai-chat/index.tsx`:
```tsx
import { EmptyState } from '@omniview/base-ui';
import { LuBot } from 'react-icons/lu';

export default function AiChatDemo() {
  return <EmptyState icon={<LuBot />} title="AI Chat" description="Coming soon" />;
}
```

`apps/showcase/src/demos/notes/index.tsx`:
```tsx
import { EmptyState } from '@omniview/base-ui';
import { LuFileText } from 'react-icons/lu';

export default function NotesDemo() {
  return <EmptyState icon={<LuFileText />} title="Notes" description="Coming soon" />;
}
```

`apps/showcase/src/demos/container-management/index.tsx`:
```tsx
import { EmptyState } from '@omniview/base-ui';
import { LuContainer } from 'react-icons/lu';

export default function ContainerManagementDemo() {
  return <EmptyState icon={<LuContainer />} title="Containers" description="Coming soon" />;
}
```

`apps/showcase/src/demos/chat-app/index.tsx`:
```tsx
import { EmptyState } from '@omniview/base-ui';
import { LuMessageCircle } from 'react-icons/lu';

export default function ChatAppDemo() {
  return <EmptyState icon={<LuMessageCircle />} title="Chat" description="Coming soon" />;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/showcase/src/registry.ts apps/showcase/src/demos/
git commit -m "feat(showcase): add app registry and placeholder demos"
```

---

## Chunk 3: Dock Component

### Task 9: Create the Dock component

**Files:**
- Create: `apps/showcase/src/Dock.tsx`
- Create: `apps/showcase/src/Dock.module.css`

- [ ] **Step 1: Write Dock.module.css**

```css
.dock {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 52px;
  height: 100%;
  padding: var(--ov-space-stack-sm) 0;
  background: var(--ov-color-bg-secondary);
  border-right: 1px solid var(--ov-color-border-default);
  gap: var(--ov-space-stack-xs);
  overflow-y: auto;
}

.apps {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ov-space-stack-xs);
  flex: 1;
}

.bottom {
  margin-top: auto;
}

.indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 2px 2px 0;
  background: var(--ov-color-accent-solid);
}

.iconWrapper {
  position: relative;
}
```

- [ ] **Step 2: Write Dock.tsx**

```tsx
import { useCallback, type KeyboardEvent } from 'react';
import { IconButton, Tooltip, ThemeSwitcher, Separator } from '@omniview/base-ui';
import { LuLayoutGrid } from 'react-icons/lu';
import { apps } from './registry';
import styles from './Dock.module.css';

interface DockProps {
  activeApp: string | null;
  onSelectApp: (id: string | null) => void;
}

export function Dock({ activeApp, onSelectApp }: DockProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Escape') {
        onSelectApp(null);
        return;
      }
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

      e.preventDefault();
      const buttons = Array.from(
        e.currentTarget.querySelectorAll<HTMLButtonElement>('button[aria-label]'),
      );
      const idx = buttons.indexOf(e.target as HTMLButtonElement);
      if (idx === -1) return;
      const next = e.key === 'ArrowDown'
        ? buttons[(idx + 1) % buttons.length]
        : buttons[(idx - 1 + buttons.length) % buttons.length];
      next?.focus();
    },
    [onSelectApp],
  );

  return (
    <nav
      className={styles.dock}
      aria-label="Demo apps"
      onKeyDown={handleKeyDown}
    >
      <Tooltip content="Home" placement="right">
        <IconButton
          variant={activeApp === null ? 'filled' : 'ghost'}
          color={activeApp === null ? 'accent' : 'neutral'}
          size="md"
          aria-label="Home"
          onClick={() => onSelectApp(null)}
        >
          <LuLayoutGrid />
        </IconButton>
      </Tooltip>

      <Separator />

      <div className={styles.apps} role="list">
        {apps.map((app) => (
          <div key={app.id} className={styles.iconWrapper} role="listitem">
            {activeApp === app.id && <div className={styles.indicator} />}
            <Tooltip content={app.name} placement="right">
              <IconButton
                variant={activeApp === app.id ? 'filled' : 'ghost'}
                color={activeApp === app.id ? 'accent' : 'neutral'}
                size="md"
                aria-label={app.name}
                onClick={() => onSelectApp(app.id)}
              >
                <app.icon />
              </IconButton>
            </Tooltip>
          </div>
        ))}
      </div>

      <div className={styles.bottom}>
        <Separator />
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Verify dock renders**

Temporarily import `Dock` in `App.tsx` to confirm it renders with icons and tooltips. Check that theme tokens apply (background, borders, accent on active). Remove the temporary wiring after verification — Task 11 will integrate it properly.

- [ ] **Step 4: Commit**

```bash
git add apps/showcase/src/Dock.tsx apps/showcase/src/Dock.module.css
git commit -m "feat(showcase): add Dock component with icon buttons and theme switcher"
```

---

## Chunk 4: Home Screen, Shell Layout, Integration

### Task 10: Create the Home screen

**Files:**
- Create: `apps/showcase/src/Home.tsx`
- Create: `apps/showcase/src/Home.module.css`

- [ ] **Step 1: Write Home.module.css**

```css
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--ov-space-stack-xl);
  gap: var(--ov-space-stack-lg);
}

.header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--ov-space-stack-xs);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--ov-space-stack-md);
  max-width: 800px;
  width: 100%;
}

.card {
  cursor: pointer;
  transition: border-color var(--ov-duration-fast) var(--ov-ease-default);
}

.card:hover {
  border-color: var(--ov-color-accent-solid);
}

.cardContent {
  display: flex;
  align-items: center;
  gap: var(--ov-space-stack-sm);
  padding: var(--ov-space-stack-md);
}

.iconBox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--ov-color-bg-tertiary);
  color: var(--ov-color-accent-solid);
  font-size: 20px;
  flex-shrink: 0;
}

.cardText {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
```

- [ ] **Step 2: Write Home.tsx**

```tsx
import { Typography, Card } from '@omniview/base-ui';
import { apps } from './registry';
import styles from './Home.module.css';

interface HomeProps {
  onSelectApp: (id: string) => void;
}

export function Home({ onSelectApp }: HomeProps) {
  return (
    <div className={styles.home}>
      <div className={styles.header}>
        <Typography variant="h1">Omniview Showcase</Typography>
        <Typography variant="body1" color="secondary">
          Interactive demos built entirely with Omniview UI
        </Typography>
      </div>

      <div className={styles.grid}>
        {apps.map((app) => (
          <Card
            key={app.id}
            className={styles.card}
            onClick={() => onSelectApp(app.id)}
          >
            <div className={styles.cardContent}>
              <div className={styles.iconBox}>
                <app.icon />
              </div>
              <div className={styles.cardText}>
                <Typography variant="subtitle2">{app.name}</Typography>
                <Typography variant="caption" color="secondary">
                  {app.description}
                </Typography>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

### Task 11: Wire up App.tsx shell layout

**Files:**
- Modify: `apps/showcase/src/App.tsx` (replace minimal placeholder)
- Create: `apps/showcase/src/App.module.css`

- [ ] **Step 1: Write App.module.css**

```css
.shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--ov-color-bg-primary);
  color: var(--ov-color-fg-primary);
}

.content {
  flex: 1;
  overflow: auto;
}
```

- [ ] **Step 2: Write App.tsx**

```tsx
import { Suspense, useState } from 'react';
import { Spinner } from '@omniview/base-ui';
import { apps } from './registry';
import { Dock } from './Dock';
import { Home } from './Home';
import styles from './App.module.css';

export function App() {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const activeDemo = apps.find((a) => a.id === activeApp);

  return (
    <div className={styles.shell}>
      <Dock activeApp={activeApp} onSelectApp={setActiveApp} />
      <main className={styles.content}>
        {activeDemo ? (
          <Suspense fallback={<Spinner />}>
            <activeDemo.component />
          </Suspense>
        ) : (
          <Home onSelectApp={setActiveApp} />
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Run dev server and verify full shell**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/main && pnpm showcase`

Verify:
- Home screen shows with title "Omniview Showcase" and 7 app cards
- Left dock shows home icon + 7 app icons + theme switcher at bottom
- Clicking a dock icon or card shows the "Coming soon" EmptyState for that demo
- Clicking the home icon returns to the card grid
- Active dock icon has accent highlight and indicator bar
- Theme switcher toggles dark/light mode
- Tooltips show app names on dock icon hover

- [ ] **Step 4: Commit**

```bash
git add apps/showcase/src/
git commit -m "feat(showcase): complete shell with dock, home screen, and lazy routing"
```

---

## Chunk 5: Polish and Validation

### Task 12: Add global reset styles

**Files:**
- Create: `apps/showcase/src/global.css`
- Modify: `apps/showcase/src/main.tsx` (add import)

- [ ] **Step 1: Write global.css**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#root {
  height: 100%;
  width: 100%;
}

body {
  font-family: var(--ov-font-sans);
  background: var(--ov-color-bg-primary);
  color: var(--ov-color-fg-primary);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Import in main.tsx**

Add `import './global.css';` before the App import in `main.tsx`.

- [ ] **Step 3: Typecheck**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/main && pnpm --filter @omniview/showcase exec tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Run lint**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/main && pnpm lint`
Expected: No new errors from showcase files.

- [ ] **Step 5: Commit**

```bash
git add apps/showcase/
git commit -m "feat(showcase): add global reset styles and pass typecheck"
```

---

### Task 13: Final verification

- [ ] **Step 1: Clean build**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/main && pnpm --filter @omniview/showcase build`
Expected: Build completes, output in `apps/showcase/dist/`.

- [ ] **Step 2: Preview production build**

Run: `cd /Users/joshuapare/Repos/omniviewdev/ui/main && pnpm --filter @omniview/showcase preview`
Expected: Same behavior as dev — dock, home screen, placeholder demos all work.

- [ ] **Step 3: Verify all 7 demo routes work**

Click each of the 7 dock icons. Each should show the EmptyState placeholder with the correct icon and name. Verify switching between them is instant (lazy chunks load once).

- [ ] **Step 4: Fix any issues and commit**

If verification uncovered issues, fix them now. Then commit all remaining changes:

```bash
git add apps/showcase/
git commit -m "feat(showcase): final polish and verification"
```

If no issues were found and everything was already committed, skip this step.
