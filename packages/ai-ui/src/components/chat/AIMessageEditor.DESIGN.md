# AIMessageEditor — Inline Message Editing

## Overview

Allows users to edit a previously sent message and regenerate the AI response. This is a core interaction for conversation branching — editing a message creates a new branch from that point. The editor replaces the message content inline (not a modal).

## Architecture

The editor is a mode that `ChatBubble` can enter. When active, the message text is replaced with an editable textarea and save/cancel controls. On save, the parent handles re-submission (creating a branch, calling `sendMessage` with the edited text, etc.).

Two approaches — either a standalone component that wraps/replaces message content, or an editing mode built into ChatBubble. We go with standalone for composability.

## Components

### AIMessageEditor

Inline editor that replaces message content during editing.

```tsx
interface AIMessageEditorProps extends HTMLAttributes<HTMLDivElement> {
  /** Initial text content to edit */
  defaultValue: string;
  /** Called with the edited text when the user saves */
  onSave: (value: string) => void;
  /** Called when the user cancels editing */
  onCancel: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the save action is in progress (disables controls) */
  saving?: boolean;
  /** Auto-focus the textarea on mount (default: true) */
  autoFocus?: boolean;
}
```

## Usage

### In a chat message
```tsx
function UserMessage({ message, onEdit }) {
  const [editing, setEditing] = useState(false);

  return (
    <ChatBubble role="user" avatar={...}>
      {editing ? (
        <AIMessageEditor
          defaultValue={message.text}
          onSave={(text) => {
            onEdit(message.id, text);  // triggers branch creation
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <p>{message.text}</p>
          <AIMessageActions onEdit={() => setEditing(true)} />
        </>
      )}
    </ChatBubble>
  );
}
```

### With AI SDK
```tsx
const { sendMessage } = useChat();

function handleEdit(messageId: string, newText: string) {
  // AI SDK: sending with a messageId forks the conversation
  sendMessage({ text: newText, messageId });
}
```

### With LangGraph
```tsx
function handleEdit(checkpointId: string, newText: string) {
  // Fork from checkpoint, submit new user message
  thread.update_state(checkpointId, { messages: [{ role: 'user', content: newText }] });
}
```

## Visual Design

- Textarea matches the message width, auto-expands vertically
- Two small buttons below: "Save" (primary) and "Cancel" (ghost)
- Subtle border/background to distinguish edit mode from display mode
- Keyboard: Enter+Shift for newlines, Escape to cancel
- Save button shows spinner when `saving=true`

## Base UI Dependencies

- `TextArea` (auto-expanding textarea)
- `Button` (save/cancel)
- `Spinner` (saving state)
