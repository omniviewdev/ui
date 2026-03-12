# Showcase App — Design Spec

**Date:** 2026-03-12
**Status:** Draft

## Purpose

A single-page demo application that proves the completeness of the Omniview UI component library by building 7 realistic, interactive applications entirely from `@omniview/base-ui`, `@omniview/ai-ui`, and `@omniview/editors`. The showcase serves two audiences:

1. **Internal team** — exposes gaps in the component library (components, patterns, and utilities we haven't realized we need yet)
2. **Plugin authors** — demonstrates what can be built with the UI system

## Architecture

### Package Location

```
main/apps/showcase/
```

A Vite SPA (not library mode) within the existing pnpm workspace. The `apps/*` glob is already configured in `pnpm-workspace.yaml`.

### Dependencies

- `@omniview/base-ui: "workspace:*"`
- `@omniview/ai-ui: "workspace:*"`
- `@omniview/editors: "workspace:*"`
- `react` and `react-dom` as dependencies
- `vite` for build and dev server

No external UI libraries. Everything is built from our own packages.

### File Structure

```
main/apps/showcase/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx              # ReactDOM.createRoot entry
    ├── App.tsx               # Shell: Dock + content area
    ├── App.module.css
    ├── registry.ts           # App registry
    └── demos/
        ├── file-explorer/
        │   └── index.tsx
        ├── web-browser/
        │   └── index.tsx
        ├── ide-editor/
        │   └── index.tsx
        ├── ai-chat/
        │   └── index.tsx
        ├── notes/
        │   └── index.tsx
        ├── container-management/
        │   └── index.tsx
        └── chat-app/
            └── index.tsx
```

## Shell Design

### Layout

Full viewport, two regions:

```
┌──────┬──────────────────────────────────┐
│      │                                  │
│ Dock │        Active Demo App           │
│      │        (or home screen)          │
│      │                                  │
└──────┴──────────────────────────────────┘
```

- **Left dock:** ~52px wide vertical icon strip
- **Content area:** fills remaining space

### State Management

Simple `useState<AppId | null>(null)`:

- `null` renders the home screen
- A valid `AppId` renders that demo inside `<Suspense>` with a `Spinner` fallback

No URL routing. No external state libraries.

### App Registry

```ts
export interface DemoApp {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  component: React.LazyExoticComponent<React.ComponentType>;
}

export const apps: DemoApp[] = [
  { id: 'file-explorer', name: 'File Explorer', description: '...', icon: FolderIcon, component: lazy(() => import('./demos/file-explorer')) },
  // ... one entry per demo
];
```

Adding a new demo = add a folder + add a registry entry.

## Dock Component

Built entirely from base-ui primitives:

- **`Stack`** — vertical layout of icons
- **`IconButton`** — each app icon
- **`Tooltip`** — app name on hover
- **`Separator`** — visual divider from content area

### Behavior

- Icons centered vertically with consistent gap
- Active app indicated by accent highlight (left-edge bar or accent background)
- Top: home/logo icon that returns to home screen (`setActiveApp(null)`)
- Bottom: `ThemeSwitcher` for toggling dark/light mode during demos
- Keyboard navigation: arrow keys move focus between dock icons, Enter activates, Escape returns to home screen. Relies on native `IconButton` focus handling and a `keyDown` handler on the dock container.

### Styling

CSS module using `--ov-*` tokens exclusively:

- Dock background: `--ov-color-bg-secondary`
- Borders: `--ov-color-border-default`
- Active indicator: `--ov-color-accent-*`
- No hardcoded colors

## Home Screen

Shown when no app is selected (`activeApp === null`).

A grid of cards showing all 7 demos. Each card displays the app icon, name, and one-line description. Clicking a card sets the active app (same as clicking the dock icon).

**Components used:** `Card`, `Grid`, `Typography` from base-ui.

## Demo Apps

### Interactivity Level

Interactive with mock data. Each demo works against in-memory fake data — navigable, clickable, responsive — but has no backend. Examples:

- File explorer navigates a fake directory tree
- AI chat sends/receives fake messages with simulated delay
- IDE opens fake files in Monaco editor

### Conventions

- Each demo is self-contained in `src/demos/<name>/`
- Mock data in `data.ts` within the demo folder
- Internal components in `components/` subfolder if needed
- No cross-demo imports
- Each demo fills the content area using `AppShell` or equivalent layout from base-ui
- Default export is the top-level component

### Placeholder Pattern

Until a demo is built out, it exports a component rendering `EmptyState` from base-ui with the app's icon, name, and "Coming soon" message. This keeps the showcase runnable at all times.

### Demo Catalog

| Demo | Primary Packages | Key Components |
|------|-----------------|----------------|
| File Explorer | base-ui | TreeList, Toolbar, Breadcrumbs, ContextMenu, StatusBar, ResizableSplitPane |
| Web Browser | base-ui | EditorTabs, Input, ActionList, Menu |
| IDE Editor | base-ui, editors | CodeEditor, EditorTabs, TreeList, CommandPalette, Terminal, ResizableSplitPane |
| AI Chat | base-ui, ai-ui | ChatMessageList, ChatBubble, ChatInput, AIMarkdown, ThinkingBlock, ToolCall |
| Notes | base-ui, editors | MarkdownPreview, TreeList, EditorTabs, Toolbar |
| Container Mgmt | base-ui | DataTable, Tabs, StatusDot, Badge, Card, DescriptionList, Timeline |
| Chat App | base-ui | NavList, Avatar, Input, Typography, Separator, Badge |

File Explorer covers both local and remote (S3/SFTP) exploration patterns. The Slack-like chat is the "Chat App" entry.

## Build Scope

**This spec covers the shell only.** Each demo will be designed and built in its own subsequent session. The shell deliverable includes:

- Package scaffolding (package.json, vite config, tsconfig)
- Shell layout (App.tsx with dock and content area)
- Dock component
- Home screen with card grid
- App registry with all 7 entries
- Placeholder components for all 7 demos
- Working `pnpm dev` that serves the showcase

## Scripts

Root `package.json` additions:

```json
{
  "showcase": "pnpm --filter @omniview/showcase dev",
  "showcase:build": "pnpm --filter @omniview/showcase build"
}
```
