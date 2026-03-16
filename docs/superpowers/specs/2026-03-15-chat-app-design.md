# Chat App Demo — Design Spec

## Goal

Build a full-fidelity Slack-like team messaging demo for the showcase app, exercising base-ui components in a realistic workplace chat scenario. All data is mock/local — no backend.

## Layout

Classic Slack three-column layout, plus a conditional fourth column for threads:

```
┌──────┬────────────────┬──────────────────────────────┬─────────────────┐
│      │                │                              │                 │
│ Rail │  Channel       │  Message Area                │  Thread Panel   │
│ 56px │  Sidebar       │  (flex)                      │  (~320px)       │
│      │  (~240px)      │                              │  (conditional)  │
│      │                │                              │                 │
└──────┴────────────────┴──────────────────────────────┴─────────────────┘
```

The sidebar is resizable via `ResizableSplitPane`. The thread panel slides in when a thread is opened.

## Components

### 1. Workspace Rail

- Vertical column, dark background (`--ov-color-bg-base`)
- Each workspace: `Avatar` with `shape="rounded"`, 36px, showing initials
- Active workspace: left-edge pill indicator (white, 3px wide, ~20px tall, rounded)
- Hover: `Tooltip` with workspace name
- `Separator` between workspaces and "Add workspace" button (`+` icon, circular)
- Bottom: current user `Avatar` (32px, circular) with `StatusDot` overlay for presence
- Mock data: 3 workspaces, "Omniview HQ" active

### 2. Channel Sidebar

- Header: workspace name + dropdown chevron (clickable, no-op)
- Two collapsible sections via `NavList` with section headers:
  - **Channels:** `#general`, `#engineering`, `#design`, `#random`, `#deployments`
  - **Direct Messages:** 4–5 users with small `Avatar`, name, `StatusDot` for presence
- Active channel: accent background highlight
- Unread channels: bold text + `Badge` count
- Bottom: ghost `IconButton` for "Add channel" and "Add DM"

### 3. Message Area

#### Channel Header
- Channel name (bold) with `#` prefix (or user avatar for DMs)
- Right side: member count, search icon, pinned icon, info icon (all ghost `IconButton`)

#### Message List
- Scrollable via `ScrollArea`
- Date separators: "Today", "Yesterday", "March 14"
- Each message: `Avatar` (36px, rounded-rect), display name (bold), timestamp (muted), body
- Compact grouping: consecutive messages from the same user within ~5 min collapse (no repeated avatar/name)
- Content types in mock data:
  - Plain text
  - `@mentions` (highlighted inline)
  - Code blocks (inline and multiline via `CodeBlock`)
  - Links (styled)
  - File attachment card (mock, non-functional)
- **Reactions:** row of emoji pills below message — emoji + count, `+` button. Clicking toggles the user's reaction (visual state only).
- **Thread indicator:** "N replies" link with stacked mini-avatars. Click opens thread panel.
- **Hover actions:** floating toolbar on hover — emoji react, reply in thread, bookmark, more (`ContextMenu`)

#### Message Composer
- Multiline `TextArea` with placeholder "Message #channel-name"
- Formatting toolbar: Bold, Italic, Strikethrough, Code, Link, Ordered List, Bulleted List (ghost `IconButton`, small)
- Right side: emoji picker button, attachment button, send button
- Typing indicator below: "Alice is typing..." with animated dots
- Built as a standalone `MessageComposer` component with a clean interface suitable for future extraction to base-ui

### 4. Thread Panel

- Fixed-width (~320px), right side, left border separator
- Header: "Thread" title + channel context ("# general"), close `IconButton`
- Parent message rendered at top (same component as main list)
- Thread replies below: same message format, slightly compact (28px avatars)
- Own `MessageComposer` at bottom, placeholder "Reply..."
- Shares message rendering components with main list via a `compact` prop

## State & Data Model

All state managed by a `useChat` hook (pattern matches `useBrowser` from web-browser demo).

### Types

```typescript
interface Workspace {
  id: string;
  name: string;
  avatar: string;       // initials or emoji
  channels: Channel[];
  users: User[];
}

interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  unreadCount: number;
  members: string[];     // user IDs
}

interface User {
  id: string;
  name: string;
  avatar: string;        // initials or emoji
  status: 'online' | 'away' | 'dnd' | 'offline';
}

interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  timestamp: number;
  reactions: Reaction[];
  replyCount: number;
}

interface Reaction {
  emoji: string;
  userIds: string[];
}
```

### Hook API

```typescript
interface UseChatReturn {
  // State
  currentUser: User;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  activeChannel: Channel;
  activeThread: Message | null;
  messages: Message[];          // for active channel
  threadMessages: Message[];    // replies for active thread (stored internally, not on Message)
  typingUsers: User[];

  // Actions
  switchWorkspace: (id: string) => void;
  switchChannel: (id: string) => void;
  openThread: (messageId: string) => void;
  closeThread: () => void;
  sendMessage: (content: string) => void;
  sendThreadReply: (content: string) => void;   // appends to activeThread, increments parent replyCount
  toggleReaction: (messageId: string, emoji: string) => void;  // adds/removes currentUser from reaction
}
```

### Mock Data

- 3 workspaces ("Omniview HQ" active)
- 5 channels + 4–5 DMs
- 6 users with mixed presence states
- ~15–20 messages across 3 channels, realistic workplace tone (PRs, deployments, design reviews)
- 2 threads with 3–5 replies each
- Message content includes plain text, @mentions, code blocks, links, and a file attachment card
- Typing indicator: simulated — randomly shows "X is typing..." for a few seconds after the user sends a message

## File Structure

```
apps/showcase/src/demos/chat-app/
├── index.tsx                    # Main assembly
├── index.module.css             # Layout styles
├── types.ts                     # All interfaces
├── data.ts                      # Mock workspaces, channels, users, messages
├── hooks/
│   └── useChat.ts               # All state management
└── components/
    ├── WorkspaceRail.tsx         # Workspace icon column
    ├── ChannelSidebar.tsx        # Channel/DM list
    ├── ChannelHeader.tsx         # Header bar above messages
    ├── MessageList.tsx           # Scrollable message area
    ├── MessageItem.tsx           # Single message rendering
    ├── MessageComposer.tsx       # Rich input with toolbar
    ├── ThreadPanel.tsx           # Thread side panel
    ├── ReactionBar.tsx           # Reaction pills row
    └── TypingIndicator.tsx       # "X is typing..." display
```

## base-ui Components Used

`ResizableSplitPane`, `NavList`, `Avatar`, `StatusDot`, `Badge`, `TextArea`, `IconButton`, `Button`, `ButtonGroup`, `Tooltip`, `Typography`, `Separator`, `Popover`, `Menu`, `ContextMenu`, `ScrollArea`, `CodeBlock`

## Scope Boundaries

**In scope:**
- All visual features described above
- Interactive state: switching workspaces/channels, opening/closing threads, sending messages (appended to local state), toggling reactions, typing indicators
- Hover actions toolbar on messages
- Rich composer with formatting toolbar (buttons are visual; they don't transform text, just demonstrate the toolbar UI)

**Out of scope:**
- Actual rich text editing (bold/italic rendering in composed messages)
- File upload functionality
- Search functionality (icon present, no implementation)
- Notifications / desktop alerts
- User profile panels
- Message editing or deletion
- Emoji picker popover (button present, no picker UI)
