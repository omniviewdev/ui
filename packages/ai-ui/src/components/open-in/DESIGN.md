# AIOpenIn — Open Query in External AI

## Overview

A dropdown menu for opening the current query or conversation in external AI platforms — ChatGPT, Claude, Perplexity, etc. Provides quick interop when users want to continue a conversation in a different tool or get a second opinion.

Modeled after MUI Treasury's `ai-open-in` component.

## Architecture

Simple menu component. The parent provides the query text. Each menu item constructs the appropriate URL for the target platform and opens it in a new tab. Pre-built items are provided for common platforms, with support for custom entries.

## Components

### AIOpenIn

Context provider with the query text.

```tsx
interface AIOpenInProps extends HTMLAttributes<HTMLDivElement> {
  /** The query/prompt text to send to external platforms */
  query: string;
  children: ReactNode;
}
```

### AIOpenInTrigger

Button that opens the menu.

```tsx
interface AIOpenInTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  /** Button label (default: "Open in...") */
  label?: string;
}
```

### AIOpenInMenu

The dropdown menu container.

```tsx
interface AIOpenInMenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
```

### AIOpenInItem

Individual menu item. Can be a pre-built platform or custom.

```tsx
interface AIOpenInItemProps extends HTMLAttributes<HTMLButtonElement> {
  /** Platform identifier (for pre-built items) */
  platform?: 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'github-copilot';
  /** Custom label (overrides platform default) */
  label?: string;
  /** Custom icon */
  icon?: ReactNode;
  /** Custom URL builder (overrides platform default) */
  buildUrl?: (query: string) => string;
  /** Called on click (alternative to URL navigation) */
  onClick?: () => void;
}
```

### AIOpenInSeparator

Menu section divider.

```tsx
interface AIOpenInSeparatorProps extends HTMLAttributes<HTMLDivElement> {}
```

### AIOpenInLabel

Section label within the menu.

```tsx
interface AIOpenInLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}
```

## Usage

### Basic
```tsx
<AIOpenIn query={currentMessage}>
  <AIOpenInTrigger />
  <AIOpenInMenu>
    <AIOpenInLabel>Open in</AIOpenInLabel>
    <AIOpenInItem platform="chatgpt" />
    <AIOpenInItem platform="claude" />
    <AIOpenInItem platform="perplexity" />
    <AIOpenInSeparator />
    <AIOpenInItem
      label="Custom endpoint"
      icon={<LuGlobe size={16} />}
      buildUrl={(q) => `https://internal-ai.company.com/?q=${encodeURIComponent(q)}`}
    />
  </AIOpenInMenu>
</AIOpenIn>
```

### In message actions
```tsx
<AIMessageActions onCopy={...} onRegenerate={...}>
  <AIOpenIn query={message.text}>
    <AIOpenInTrigger label="" /> {/* icon-only */}
  </AIOpenIn>
</AIMessageActions>
```

## Platform URL Patterns

```tsx
const PLATFORM_URLS = {
  chatgpt: (q) => `https://chat.openai.com/?q=${encodeURIComponent(q)}`,
  claude: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
  perplexity: (q) => `https://www.perplexity.ai/?q=${encodeURIComponent(q)}`,
  gemini: (q) => `https://gemini.google.com/?q=${encodeURIComponent(q)}`,
};
```

Note: These URLs are best-effort — platforms may change their URL schemes.

## Base UI Dependencies

- `Menu` (dropdown)
- `IconButton` or `Button` (trigger)
- `Separator` (menu divider)
- `Typography` (labels)
- `lucide-react`: `LuExternalLink`, `LuChevronDown`
