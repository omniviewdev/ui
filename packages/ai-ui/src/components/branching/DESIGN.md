# AIBranch — Conversation Branching

## Overview

Enables users to edit a message mid-conversation and explore alternate AI responses, with navigation between branches. This is a core ChatGPT UX pattern. Maps directly to LangGraph's checkpoint/branching system and the Vercel AI SDK's `regenerate({ messageId })`.

## Architecture

A message can have multiple branches (alternate responses). The user edits a message or clicks "regenerate", creating a new branch. A selector shows "2 of 3" with prev/next arrows so the user can navigate between branches.

Branch state is managed by the parent (the chat controller), not internally — this keeps it compatible with any backend (LangChain, AI SDK, custom).

## Components

### AIBranch

Context provider and container. Wraps a set of branched messages.

```tsx
interface AIBranchProps extends HTMLAttributes<HTMLDivElement> {
  /** Total number of branches */
  count: number;
  /** Currently active branch index (0-based) */
  active: number;
  /** Called when the user navigates to a different branch */
  onChange?: (index: number) => void;
  children: ReactNode;
}
```

### AIBranchContent

Renders the content for the currently active branch. Only the active branch's children are mounted.

```tsx
interface AIBranchContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Branch index this content belongs to */
  index: number;
  children: ReactNode;
}
```

### AIBranchSelector

Navigation UI: previous/next arrows with page indicator. Designed to sit in a message's action bar or below a message.

```tsx
interface AIBranchSelectorProps extends HTMLAttributes<HTMLDivElement> {
  /** Alignment hint for positioning (e.g., left for user messages, right for assistant) */
  align?: 'start' | 'end';
}
```

### AIBranchPrevious / AIBranchNext

Individual navigation buttons. Automatically disabled at boundaries.

```tsx
interface AIBranchPreviousProps extends HTMLAttributes<HTMLButtonElement> {}
interface AIBranchNextProps extends HTMLAttributes<HTMLButtonElement> {}
```

### AIBranchIndicator

Page indicator showing "2 of 3".

```tsx
interface AIBranchIndicatorProps extends HTMLAttributes<HTMLSpanElement> {}
```

## Usage

```tsx
<AIBranch count={3} active={activeBranch} onChange={setActiveBranch}>
  <ChatBubble role="assistant" avatar={...}>
    <AIBranchContent index={0}>
      <AIMarkdown content={branch0Response} />
    </AIBranchContent>
    <AIBranchContent index={1}>
      <AIMarkdown content={branch1Response} />
    </AIBranchContent>
    <AIBranchContent index={2}>
      <AIMarkdown content={branch2Response} />
    </AIBranchContent>
  </ChatBubble>

  <AIBranchSelector align="end" />
</AIBranch>
```

## Integration

### Vercel AI SDK
```tsx
// regenerate() creates a new branch for the same message
const { regenerate } = useChat();
// Edit triggers: sendMessage with messageId to fork
```

### LangGraph
```tsx
// Each checkpoint is a potential branch point
// Use thread.get_state(checkpoint_id) to load alternate branches
// Branch metadata stored in thread state
```

## Base UI Dependencies

- `IconButton` (navigation arrows)
- `Typography` or plain `<span>` (page indicator)
- `lucide-react`: `LuChevronLeft`, `LuChevronRight`
