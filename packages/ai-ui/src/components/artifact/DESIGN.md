# AIArtifact — Generated Artifact Panel

## Overview

A side-panel or embedded container for AI-generated artifacts — code files, YAML manifests, Helm charts, shell scripts, HTML previews, dashboards. This is the Claude Artifacts / ChatGPT Canvas pattern. For Omniview, the primary use cases are generated Kubernetes resources, configuration files, and runbooks.

The artifact panel sits alongside the chat conversation, typically in a resizable split view. It has a header with title/description, action buttons (copy, download, apply), and a scrollable content area.

## Architecture

The component is purely presentational — it doesn't manage file state or execution. The parent provides the content and handles actions (apply to cluster, save to file, etc.). It supports both embedded mode (inside a message) and panel mode (side panel via drawer/split-pane).

## Components

### AIArtifact

Root container. Can be used standalone or inside a layout.

```tsx
interface AIArtifactProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the artifact panel is open (for panel mode) */
  open?: boolean;
  /** Visual mode */
  variant?: 'embedded' | 'panel';
  children: ReactNode;
}
```

### AIArtifactHeader

Top section with title, description, and close button.

```tsx
interface AIArtifactHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
```

### AIArtifactTitle

Title text for the artifact.

```tsx
interface AIArtifactTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}
```

### AIArtifactDescription

Secondary description text.

```tsx
interface AIArtifactDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}
```

### AIArtifactClose

Close button (X icon). Fires `onClick` — parent handles state.

```tsx
interface AIArtifactCloseProps extends HTMLAttributes<HTMLButtonElement> {}
```

### AIArtifactActions

Action button group (copy, download, apply, etc.).

```tsx
interface AIArtifactActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
```

### AIArtifactAction

Individual action button with icon and optional tooltip.

```tsx
interface AIArtifactActionProps extends HTMLAttributes<HTMLButtonElement> {
  /** Tooltip text */
  tooltip?: string;
  /** Button label (for accessibility, may be visually hidden) */
  label: string;
  /** Icon component */
  icon?: ComponentType<{ size?: number }>;
  /** Destructive action styling */
  destructive?: boolean;
}
```

### AIArtifactContent

Scrollable content area for the artifact body.

```tsx
interface AIArtifactContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
```

## Usage

### Embedded in a message (inline artifact)
```tsx
<ChatBubble role="assistant" avatar={...}>
  <AIMarkdown content="Here's the updated deployment manifest:" />
  <AIArtifact variant="embedded">
    <AIArtifactHeader>
      <AIArtifactTitle>deployment.yaml</AIArtifactTitle>
      <AIArtifactActions>
        <AIArtifactAction icon={LuCopy} label="Copy" tooltip="Copy to clipboard" />
        <AIArtifactAction icon={LuDownload} label="Download" tooltip="Download file" />
        <AIArtifactAction icon={LuPlay} label="Apply" tooltip="Apply to cluster" />
      </AIArtifactActions>
    </AIArtifactHeader>
    <AIArtifactContent>
      <AICodeBlock code={yamlContent} language="yaml" showLineNumbers />
    </AIArtifactContent>
  </AIArtifact>
</ChatBubble>
```

### Side panel mode
```tsx
<ResizableSplitPane>
  <ChatMessageList ... />

  {artifact && (
    <AIArtifact variant="panel" open>
      <AIArtifactHeader>
        <AIArtifactTitle>{artifact.title}</AIArtifactTitle>
        <AIArtifactDescription>{artifact.description}</AIArtifactDescription>
        <AIArtifactClose onClick={() => setArtifact(null)} />
      </AIArtifactHeader>
      <AIArtifactActions>
        <AIArtifactAction icon={LuCopy} label="Copy" onClick={handleCopy} />
        <AIArtifactAction icon={LuSave} label="Save" onClick={handleSave} />
      </AIArtifactActions>
      <AIArtifactContent>
        {artifact.type === 'code' && (
          <AICodeBlock code={artifact.content} language={artifact.language} showLineNumbers />
        )}
        {artifact.type === 'markdown' && (
          <AIMarkdown content={artifact.content} />
        )}
      </AIArtifactContent>
    </AIArtifact>
  )}
</ResizableSplitPane>
```

### With LangGraph tool output
```tsx
// Agent generates a K8s manifest as a tool result
function handleToolResult(result: ToolResult) {
  if (result.artifact) {
    setArtifact({
      title: result.artifact.filename,
      content: result.artifact.content,
      language: result.artifact.language,
      type: 'code',
    });
  }
}
```

## Visual Design

**Embedded variant:**
- Bordered card within the message flow
- Compact header with filename and inline action icons
- No close button (it's part of the message)

**Panel variant:**
- Full-height side panel with subtle background
- Header with title, description, close button
- Sticky action bar
- Scrollable content area
- Subtle left border or shadow to separate from chat

## Base UI Dependencies

- `Card` (embedded container)
- `Drawer` or `ResizableSplitPane` (panel mode, handled by parent)
- `IconButton` (action buttons, close)
- `Tooltip` (action tooltips)
- `ScrollArea` (content scrolling)
- `CodeBlock` (code artifacts)
- `Typography` (title, description)
