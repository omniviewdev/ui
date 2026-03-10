# Collapsible — Animated Expand/Collapse Primitive

## Overview

A low-level primitive for smoothly expanding and collapsing content. This is the foundational building block for:

- **Accordion** (multi-item, exclusive toggle) — should be refactored to use this internally
- **ThinkingBlock** (ai-ui) — collapsible reasoning text
- **ChainOfThought** (ai-ui) — collapsible investigation steps
- **AIArtifact** (ai-ui) — collapsible artifact details
- **ToolCall** (ai-ui) — collapsible tool arguments/results
- Any future component needing animated show/hide

Currently, the Accordion, ThinkingBlock, and ChainOfThought all independently implement the same CSS Grid `grid-template-rows: 0fr → 1fr` pattern. This primitive extracts that into a reusable component.

## Architecture

Uses CSS Grid `grid-template-rows` for smooth height animation — the only approach that animates to/from `auto` height without JavaScript measurement. The component is headless in spirit — it provides the collapse behavior and animation, but no trigger/header. The parent controls open state.

Compound component pattern: `Collapsible` (root context + wrapper), `CollapsibleTrigger` (optional toggle button), `CollapsibleContent` (the animated region).

## Components

### Collapsible

Root container and context provider.

```tsx
interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled default open state */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Animation speed */
  animation?: 'default' | 'fast' | 'none';
  /** Disable interaction */
  disabled?: boolean;
  children: ReactNode;
}
```

### CollapsibleTrigger

Optional toggle button. Clicks toggle the open state. Renders as a `<button>` by default.

```tsx
interface CollapsibleTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  /** Render as a different element (e.g., 'div' for custom triggers) */
  asChild?: boolean;
  children: ReactNode;
}
```

### CollapsibleContent

The animated content region. Uses CSS Grid for smooth height transition.

```tsx
interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Force mount even when collapsed (for SEO or measuring) */
  forceMount?: boolean;
  children: ReactNode;
}
```

## Hook

### useCollapsible

Access collapse state from any descendant.

```tsx
interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
  disabled: boolean;
}

function useCollapsible(): CollapsibleContextValue;
```

## Usage

### Basic
```tsx
<Collapsible>
  <CollapsibleTrigger>Show details</CollapsibleTrigger>
  <CollapsibleContent>
    <p>Hidden content that animates in.</p>
  </CollapsibleContent>
</Collapsible>
```

### Controlled
```tsx
const [open, setOpen] = useState(false);

<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleContent>
    <p>Controlled by parent.</p>
  </CollapsibleContent>
</Collapsible>
```

### In AI components (ThinkingBlock refactored)
```tsx
// Before: hand-rolled CSS Grid in ThinkingBlock
<div className={styles.CollapseWrapper} aria-hidden={!isOpen}>
  <div className={styles.CollapseInner}>...</div>
</div>

// After: uses Collapsible from base-ui
<Collapsible open={isOpen} onOpenChange={toggle} animation="default">
  <CollapsibleContent>
    <p className={styles.Text}>{content}</p>
  </CollapsibleContent>
</Collapsible>
```

### In Accordion (refactored)
```tsx
// Accordion.Item internally uses Collapsible
<Collapsible open={expanded} onOpenChange={() => toggle(id)} disabled={disabled}>
  <CollapsibleTrigger className={styles.Header}>
    {title}
  </CollapsibleTrigger>
  <CollapsibleContent>
    {children}
  </CollapsibleContent>
</Collapsible>
```

## CSS

```css
.Root {
  /* No visual styling — purely structural */
}

.Content {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition: grid-template-rows var(--ov-collapsible-duration, 200ms) var(--ov-ease-standard, ease);
}

.Root[data-ov-open='true'] .Content {
  grid-template-rows: 1fr;
}

.ContentInner {
  overflow: hidden;
  min-height: 0;
}

/* Animation variants */
.Root[data-ov-animation='fast'] .Content {
  --ov-collapsible-duration: 100ms;
}

.Root[data-ov-animation='none'] .Content {
  transition: none;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .Content { transition: none; }
}

:root[data-ov-motion='reduced'] .Content {
  transition: none;
}
```

## Data Attributes

- `data-ov-open="true|false"` on root
- `data-ov-disabled="true"` when disabled
- `data-ov-animation="default|fast|none"`
- `aria-expanded` on trigger
- `aria-hidden` on content when collapsed

## Testing

- Renders children when open
- Hides content via `aria-hidden` when collapsed
- Toggles on trigger click
- Controlled mode: responds to `open` prop changes
- Calls `onOpenChange` on toggle
- Disabled state prevents toggling
- Forwards ref
- Merges className
