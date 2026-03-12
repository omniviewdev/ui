# Showcase Demos — Design Spec

**Date:** 2026-03-12
**Status:** Draft
**Scope:** Four interactive demos (File Explorer, IDE Editor, AI Chat, Container Management) for the `@omniview/showcase` app.

## Purpose

Build four interactive demos that serve two goals:

1. **Prove completeness** — demonstrate that realistic applications can be built entirely from `@omniview/base-ui`, `@omniview/ai-ui`, and `@omniview/editors`
2. **Identify gaps** — surface missing components, composability problems, and missing patterns in the library

Each demo operates on mock data with no backend. All interactions (expand, click, sort, filter) work against in-memory fake data.

---

## Demo 1: File Explorer

### Overview

Dual-pane file manager (local + remote/S3) with a detail panel, following the classic three-column pattern.

### Layout

```
┌────────────────────────────────────────────────────────┐
│  Toolbar: ◀ ▶ ↑ | Search | Copy Move Delete New Folder│
├──────────────┬──────────────┬──────────────────────────┤
│              │              │  Detail Panel             │
│  Local       │  Remote      │  ┌──────────────────────┐│
│  TreeList    │  TreeList    │  │ DescriptionList      ││
│  + Breadcrumbs│ + Breadcrumbs│ │ (name, size, type,   ││
│              │              │  │  modified, perms)    ││
│              │              │  ├──────────────────────┤│
│              │              │  │ CodeBlock            ││
│              │              │  │ (file preview)       ││
│              │              │  └──────────────────────┘│
├──────────────┴──────────────┴──────────────────────────┤
│  StatusBar: 7 items • 3 folders, 4 files • 12.8 KB     │
└────────────────────────────────────────────────────────┘
```

All dividers are ResizableSplitPane (nested: outer splits local+remote from detail, inner splits local from remote).

### Components

| Component | Usage |
|-----------|-------|
| TreeList | File/folder hierarchy in both panes |
| Breadcrumbs | Current path in each pane |
| Toolbar | Top action bar with buttons and search |
| IconButton, Button | Toolbar actions |
| SearchInput | Filter tree nodes |
| ContextMenu | Right-click on files/folders (copy, move, rename, delete, new folder) |
| ResizableSplitPane | Three-column layout (nested) |
| DescriptionList | File metadata in detail panel |
| CodeBlock | File content preview in detail panel |
| StatusBar | Bottom bar with item counts and sizes |
| Toast | Action feedback ("File copied", "Folder created") |

### Mock Data

- **Local:** ~30 files/folders in a typical project structure (`src/`, `components/`, `hooks/`, `public/`, `package.json`, etc.)
- **Remote:** ~20 files/folders in an S3-like bucket (`assets/`, `images/`, `fonts/`, `backups/`, `config.yaml`)
- Text files have mock content for CodeBlock preview

### Interactions

- Expand/collapse folders in both trees
- Click a file → detail panel shows metadata + code preview
- Breadcrumbs update to reflect current folder; clicking a breadcrumb segment navigates up
- Right-click → ContextMenu with actions
- Toolbar buttons duplicate context menu actions for selected item
- Actions trigger Toast notifications but do not mutate the tree
- SearchInput filters visible nodes in the active pane

### Gap to Flag

**TreeList + dnd-kit integration:** Cross-pane drag-and-drop for file transfer is a natural interaction for a dual-pane file manager but is not supported. The TreeList component does not integrate with dnd-kit for external drop targets. This should be noted as a library gap.

---

## Demo 2: IDE Editor

### Overview

VS Code-style IDE with sidebar panels, tabbed editors supporting multiple content types, an integrated terminal, and a command palette.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ Icon │  Sidebar Panel    │  EditorTabs                    │
│ Strip│                   │  ┌──────────────────────────┐  │
│      │  (File Tree /     │  │ CodeEditor / DiffViewer  │  │
│ 📁   │   Search /        │  │ / MarkdownPreview        │  │
│ 🔍   │   Git Status)     │  │                          │  │
│ 🔀   │                   │  └──────────────────────────┘  │
│      │                   ├────────────────────────────────┤
│      │                   │  Terminal                      │
│      │                   │  $ npm run build               │
└──────┴───────────────────┴────────────────────────────────┘
```

ResizableSplitPane for sidebar | editor, and editor | terminal (vertical split).

### Sidebar Panels

Switched via an icon strip (IconButton column with Tooltip):

1. **File Tree** (default) — TreeList of a mock project. Click a file to open it in an editor tab.
2. **Search** — SearchInput + List showing mock find-in-files results with file path, line number, and matching text context.
3. **Git Status** — List with StatusDot (green/yellow/red) + Badge showing modified, staged, and untracked files.

### Editor Tabs

EditorTabs manages all open tabs. Tab content types:

- **2-3 CodeEditor tabs** — mock `.tsx`, `.css`, `.json` files with syntax highlighting
- **1 DiffViewer tab** — side-by-side diff of a mock file change (before/after)
- **1 MarkdownPreview tab** — rendered `README.md`

### Terminal

Terminal component in the bottom pane, resizable. Pre-loaded with mock build output. Pane can be toggled via CommandPalette.

### Command Palette

Triggered by **Ctrl+K**. Mock commands:

- Go to File (filters open files)
- Toggle Theme
- Toggle Terminal (show/hide terminal pane)
- Change Language

Selecting a command triggers the corresponding action.

### Components

| Component | Usage |
|-----------|-------|
| CodeEditor | Source code editing with syntax highlighting |
| DiffViewer | Side-by-side file diff |
| Terminal | Integrated terminal with mock output |
| CommandPalette | Ctrl+K command launcher |
| MarkdownPreview | README rendering |
| EditorTabs | Tab management for mixed content types |
| TreeList | File tree sidebar |
| List | Search results, git status |
| SearchInput | Find-in-files |
| StatusDot | Git file status indicators |
| Badge | File count badges |
| ResizableSplitPane | Sidebar/editor and editor/terminal splits |
| IconButton, Tooltip | Sidebar icon strip |
| Separator | Visual dividers |
| AppShell or DockLayout | Overall IDE frame |

### Mock Data

- ~20 files in tree (TypeScript project structure)
- 5 pre-opened tabs (3 code, 1 diff, 1 markdown)
- Terminal pre-loaded with mock `npm run build` output
- 10 mock search results
- 8 mock git status entries

### Gaps to Surface

- **DockLayout for icon-strip + panel switching:** Does DockLayout support the VS Code sidebar pattern well, or does it need custom wiring?
- **EditorTabs with mixed content types:** Does EditorTabs handle tabs that render completely different components (code editor, diff viewer, markdown preview) cleanly?

---

## Demo 3: AI Chat

### Overview

Full-featured AI chat interface with streaming responses, thinking blocks, tool calls, artifacts, conversation branching, and follow-up suggestions. First real consumer of the `@omniview/ai-ui` package.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  AIConversationHeader: 🤖 Claude 4 | Model ▾ | + | ⚙    │
├──────────────────────────────┬───────────────────────────┤
│                              │  AIArtifact Panel         │
│  ChatMessageList             │  ┌───────────────────────┐│
│  ┌────────────────────────┐  │  │ Header: fibonacci.py ││
│  │ Messages (scrollable)  │  │  │ Actions: Copy Apply ✕ ││
│  │ - User messages        │  │  ├───────────────────────┤│
│  │ - ThinkingBlock        │  │  │ Content               ││
│  │ - ToolCall/ToolResult  │  │  │ (CodeBlock)           ││
│  │ - AIMarkdown responses │  │  │                       ││
│  │ - AIBranch (1 message) │  │  │                       ││
│  │ - Citations + Sources  │  │  └───────────────────────┘│
│  └────────────────────────┘  │                           │
│  ChatSuggestions / AIFollowUp│                           │
│  ┌────────────────────────┐  │                           │
│  │ ChatInput              │  │                           │
│  └────────────────────────┘  │                           │
└──────────────────────────────┴───────────────────────────┘
```

Artifact panel is collapsible — hidden by default, slides in when an artifact is generated. ResizableSplitPane divides chat from artifact.

### Pre-built Conversation (loaded on mount)

Demonstrates all component types without user interaction:

1. **User message** — simple question
2. **Assistant response** — ThinkingBlock (collapsed, "2.1s") → AIMarkdown body
3. **User message** — request that triggers tool use
4. **Assistant response** — ToolCall (search tool) with ToolResult → AIMarkdown with AIInlineCitation references → AISources list
5. **Assistant message with branching** — AIBranch with 3 alternatives, user can navigate between them (← 1/3 →)
6. One message shows **AIContextIndicator** with attached source files

### Scripted Replay (user-triggered)

After the pre-built messages, ChatSuggestions appear. Clicking one or typing a message triggers a scripted sequence:

1. TypingIndicator appears
2. ThinkingBlock opens with streaming text
3. ToolCall appears, shows running state, resolves with ToolResult
4. Response streams in via StreamingText
5. Artifact panel opens with AIArtifact (code with header and actions)
6. AIFollowUp suggestions appear below the response
7. AIStopButton is visible during the streaming phase

### Components

| Component | Usage |
|-----------|-------|
| ChatMessageList | Virtualized scrollable message container |
| ChatBubble | Individual message rendering |
| ChatAvatar | Role-specific avatars |
| ChatInput | Multi-line input with submit |
| ChatSuggestions | Initial prompt suggestions |
| AIMessageActions | Copy, regenerate, edit actions per message |
| AIConversationHeader | Top bar with model selector |
| AIModelSelector | Model dropdown |
| AIMarkdown | Markdown response rendering |
| AICodeBlock | Code blocks within responses |
| AIInlineCitation | Numbered citation badges |
| AISources | Source reference list |
| AIFollowUp | Follow-up question chips |
| AIContextIndicator | Attached context sources |
| AIArtifact (compound) | Side panel artifact with header, actions, content |
| AIBranch (compound) | Branch navigation (prev/next/indicator) |
| ThinkingBlock | Collapsible thinking/reasoning display |
| ToolCall | Tool invocation with status and duration |
| ToolResult | Tool output card |
| StreamingText | Streaming text with cursor |
| TypingIndicator | Three-dot typing animation |
| AIStopButton | Stop generation button |
| ResizableSplitPane | Chat/artifact split |

### Mock Data

- 6 pre-built messages with varied content types
- 3 branch alternatives for one message
- 1 artifact (Python fibonacci function)
- 1 scripted replay sequence with simulated delays
- Mock tool results (search results with citations)

### Gaps to Surface

- **ChatMessageList with mixed content heights:** Messages containing thinking blocks, tool calls, and inline code have highly variable heights. Does the virtualizer handle this well?
- **Artifact panel pattern:** Is there a need for a dedicated layout component for the chat + artifact side panel pattern, or does ResizableSplitPane + conditional rendering suffice?
- **Streaming coordination:** Multiple components animate simultaneously during replay (thinking block, tool call, streaming text). Are there timing/coordination utilities needed?

---

## Demo 4: Container Management

### Overview

Docker Desktop-style container dashboard with a data table list view and a full-page detail view with tabbed inspection.

### List View (default)

```
┌──────────────────────────────────────────────────────────┐
│  FilterBar: [Status ▾] [Search by name/image...]  Clear  │
├──────────────────────────────────────────────────────────┤
│  DataTable                                               │
│  ☐ │ Name          │ Image        │ Status  │ CPU │ Mem  │
│  ──┼───────────────┼──────────────┼─────────┼─────┼──────│
│  ☐ │ ● api-server  │ node:20-slim │ Running │ ▰▰▱ │ 128M │
│  ☐ │ ● postgres-db │ postgres:16  │ Running │ ▰▱▱ │ 256M │
│  ☐ │ ○ redis-cache │ redis:7      │ Stopped │ --- │ ---  │
│  ☐ │ ● nginx-proxy │ nginx:latest │ Running │ ▰▱▱ │ 64M  │
│    │ ... (50+ rows, virtual scrolling)                   │
├──────────────────────────────────────────────────────────┤
│  Bulk: [▶ Start] [■ Stop] [🗑 Delete]  (when selected)  │
├──────────────────────────────────────────────────────────┤
│  StatusBar: RAM 4.13 GB  CPU 57%  Disk 12.4 GB          │
└──────────────────────────────────────────────────────────┘
```

**DataTable features exercised:**
- Column sorting (click headers)
- Column resizing (drag borders)
- Row selection with select-all checkbox
- Virtual scrolling (50+ rows)
- Inline Meter in CPU column
- StatusDot color-coded by container status
- Badge for status label
- IconButton group in actions column (stop/start/delete per row)
- Bulk actions toolbar appears when rows are selected

**FilterBar** at top filters by status and name/image text search.

### Detail View (click a container row)

Full page replacement with breadcrumb navigation back to list.

```
┌──────────────────────────────────────────────────────────┐
│  Breadcrumbs: Containers / api-server                    │
│  ← api-server  🔗 4ec0ff34  📦 node:20-slim             │
│  30000:30000  8080:8080     STATUS: ● Running  ■ ↻ ▶ 🗑  │
├──────────────────────────────────────────────────────────┤
│  Tabs: [Logs] [Inspect] [Stats] [Files]                  │
│  ┌──────────────────────────────────────────────────────┐│
│  │  (tab content area)                                  ││
│  │                                                      ││
│  │  Logs:    Terminal with scrolling color-coded logs    ││
│  │  Inspect: DescriptionList + ObjectInspector           ││
│  │  Stats:   Card.Group with Card.Stat + Meter           ││
│  │  Files:   TreeList of container filesystem            ││
│  └──────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────┤
│  StatusBar: RAM 4.13 GB  CPU 57%  Disk 12.4 GB          │
└──────────────────────────────────────────────────────────┘
```

**Detail header:** Back button (IconButton), container name (Typography.Heading), ID + image (Typography.Code), port links, StatusDot + status text, action buttons (stop, restart, play, delete).

**Tabs:**

| Tab | Components | Content |
|-----|-----------|---------|
| Logs | Terminal | Scrolling color-coded container logs |
| Inspect | DescriptionList + ObjectInspector | Top-level metadata + nested config JSON tree |
| Stats | Card.Group + Card.Stat + Meter | CPU, memory, network, disk with utilization meters |
| Files | TreeList | Mock container filesystem (`/app`, `/etc`, `/var/log`) |

### Components

| Component | Usage |
|-----------|-------|
| DataTable | Container list with sorting, filtering, resizing, selection, virtual scroll |
| FilterBar | Status and text filtering |
| Tabs | Detail view tab navigation |
| Terminal | Container log output |
| DescriptionList | Container metadata |
| ObjectInspector | Nested container config inspection |
| TreeList | Container filesystem |
| Card, Card.Stat, Card.Group | Stats overview |
| Meter | CPU/memory utilization (inline in table and in stats) |
| Badge | Container status labels |
| StatusDot | Status color indicators |
| Breadcrumbs | List ↔ detail navigation |
| IconButton, Button | Action buttons |
| Typography.Code | IDs, images, ports |
| StatusBar | Resource summary |
| Toolbar | Bulk actions |
| Toast | Action feedback |

### Mock Data

- 50 containers with realistic names (`api-server`, `postgres-db`, `redis-cache`, `nginx-proxy`, `worker-1` through `worker-45`, etc.)
- Realistic images (`node:20-slim`, `postgres:16`, `redis:7`, `nginx:latest`, `python:3.12`, etc.)
- Randomized CPU/memory/status values
- Each container has: mock logs (50 lines), config JSON (nested object), stats data, and a small filesystem tree

### Gaps to Surface

- **DataTable + FilterBar composability:** Do these components integrate naturally, or is glue code needed?
- **Meter at small inline sizes:** Does Meter render well inside a DataTable cell, or does it need a compact/inline variant?
- **Bulk action pattern:** Is there a standard pattern for "toolbar appears when rows selected" or does this need a new component?

---

## Cross-Demo Component Coverage

| Package | Component | File Explorer | IDE Editor | AI Chat | Container Mgmt |
|---------|-----------|:---:|:---:|:---:|:---:|
| base-ui | TreeList | ✓ | ✓ | | ✓ |
| base-ui | DataTable | | | | ✓ |
| base-ui | EditorTabs | | ✓ | | |
| base-ui | ResizableSplitPane | ✓ | ✓ | ✓ | |
| base-ui | Tabs | | | | ✓ |
| base-ui | Toolbar | ✓ | | | ✓ |
| base-ui | Breadcrumbs | ✓ | | | ✓ |
| base-ui | ContextMenu | ✓ | | | |
| base-ui | StatusBar | ✓ | | | ✓ |
| base-ui | FilterBar | | | | ✓ |
| base-ui | NavList/List | | ✓ | | |
| base-ui | SearchInput | ✓ | ✓ | | |
| base-ui | DescriptionList | ✓ | | | ✓ |
| base-ui | Card (compound) | | | | ✓ |
| base-ui | Badge | | ✓ | | ✓ |
| base-ui | StatusDot | | ✓ | | ✓ |
| base-ui | Meter | | | | ✓ |
| base-ui | Toast | ✓ | | | ✓ |
| base-ui | Dialog/Drawer | | | | |
| base-ui | DockLayout | | ✓ | | |
| base-ui | AppShell | | ✓ | | |
| base-ui | CodeBlock | ✓ | | | |
| editors | CodeEditor | | ✓ | | |
| editors | DiffViewer | | ✓ | | |
| editors | Terminal | | ✓ | | ✓ |
| editors | CommandPalette | | ✓ | | |
| editors | MarkdownPreview | | ✓ | | |
| editors | ObjectInspector | | | | ✓ |
| ai-ui | ChatMessageList | | | ✓ | |
| ai-ui | ChatBubble | | | ✓ | |
| ai-ui | ChatInput | | | ✓ | |
| ai-ui | ChatSuggestions | | | ✓ | |
| ai-ui | AIMessageActions | | | ✓ | |
| ai-ui | AIConversationHeader | | | ✓ | |
| ai-ui | AIModelSelector | | | ✓ | |
| ai-ui | AIMarkdown | | | ✓ | |
| ai-ui | AICodeBlock | | | ✓ | |
| ai-ui | AIInlineCitation | | | ✓ | |
| ai-ui | AISources | | | ✓ | |
| ai-ui | AIFollowUp | | | ✓ | |
| ai-ui | AIContextIndicator | | | ✓ | |
| ai-ui | AIArtifact (compound) | | | ✓ | |
| ai-ui | AIBranch (compound) | | | ✓ | |
| ai-ui | ThinkingBlock | | | ✓ | |
| ai-ui | ToolCall | | | ✓ | |
| ai-ui | ToolResult | | | ✓ | |
| ai-ui | StreamingText | | | ✓ | |
| ai-ui | TypingIndicator | | | ✓ | |
| ai-ui | AIStopButton | | | ✓ | |

## Known Gaps to Investigate

| Gap | Demo | Description |
|-----|------|-------------|
| TreeList + dnd-kit | File Explorer | No cross-pane drag-and-drop support for file transfer |
| DockLayout sidebar pattern | IDE Editor | May not support VS Code-style icon strip + switchable panels |
| EditorTabs mixed content | IDE Editor | Tabs rendering different component types (code, diff, preview) |
| ChatMessageList variable heights | AI Chat | Virtualizer handling of mixed-height messages |
| Artifact panel layout | AI Chat | May need a dedicated component for chat + side panel pattern |
| Streaming coordination | AI Chat | Timing utilities for multi-component animation sequences |
| DataTable + FilterBar | Container Mgmt | Integration glue between these two components |
| Meter inline variant | Container Mgmt | Rendering Meter inside DataTable cells at small sizes |
| Bulk action pattern | Container Mgmt | No standard component for "selection → toolbar" pattern |

## Conventions

- Each demo is self-contained in `apps/showcase/src/demos/<name>/`
- Mock data lives in `data.ts` within the demo folder
- Internal components live in `components/` subfolder
- No cross-demo imports
- Default export is the top-level component
- All styling via CSS Modules with `--ov-*` tokens
