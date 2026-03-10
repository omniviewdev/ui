# AIStepDivider — Agentic Step Boundary

## Overview

A visual separator marking boundaries between agentic steps in a multi-step AI response. When an AI agent runs multiple tool-call-then-respond cycles, the Vercel AI SDK emits `{ type: 'step-start' }` parts between each cycle. This component renders those boundaries.

In LangGraph, steps correspond to graph node transitions — each node execution is a step.

## Architecture

Simple presentational component. No internal state. Can optionally show a step number, label, or timestamp.

## Components

### AIStepDivider

A horizontal divider with optional label indicating a new step in the agent's execution.

```tsx
interface AIStepDividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Step number (1-based). If omitted, renders as a plain divider. */
  step?: number;
  /** Custom label (overrides default "Step N" text) */
  label?: string;
  /** Timestamp for when this step started */
  timestamp?: Date;
  /** Visual variant */
  variant?: 'line' | 'pill';
}
```

## Usage

### Basic — plain step marker
```tsx
<AIStepDivider />
```

### Numbered step
```tsx
<AIStepDivider step={2} />
// Renders: ——— Step 2 ———
```

### Custom label
```tsx
<AIStepDivider label="Agent re-evaluating after tool results" />
```

### In a message parts loop (AI SDK integration)
```tsx
{message.parts.map((part, i) => {
  switch (part.type) {
    case 'step-start':
      return <AIStepDivider key={i} step={stepCount++} />;
    case 'text':
      return <AIMarkdown key={i} content={part.text} />;
    case 'reasoning':
      return <ThinkingBlock key={i} content={part.text} />;
  }
})}
```

### In a LangGraph flow
```tsx
{nodes.map((node, i) => (
  <Fragment key={node.id}>
    {i > 0 && <AIStepDivider step={i + 1} label={node.name} />}
    <NodeContent node={node} />
  </Fragment>
))}
```

## Visual Design

**`variant="line"` (default):**
```
────────── Step 2 ──────────
```
Thin horizontal rule with centered label. Muted color, small font.

**`variant="pill"`:**
```
            [ Step 2 ]
```
Rounded pill/chip centered on a faint divider line.

## Base UI Dependencies

- `Separator` (horizontal rule)
- `Chip` (pill variant)
- `Typography` (label text)
