# AIWebPreview — Sandboxed Web Preview

## Overview

An iframe-based preview panel for AI-generated web content — HTML pages, React components, dashboards, Grafana configs. Includes a navigation toolbar with URL bar, refresh, and an optional console output panel. Modeled after MUI Treasury's `ai-web-preview` and v0's preview panel.

For Omniview, use cases include previewing generated Grafana dashboards, generated HTML reports, or rendered markdown documentation.

## Architecture

Sandboxed iframe with `allow-scripts` but no `allow-same-origin` for security. The parent provides content (as HTML string or URL). An optional console panel captures `postMessage` events from the iframe for debug output.

## Components

### AIWebPreview

Root context provider and container.

```tsx
interface AIWebPreviewProps extends HTMLAttributes<HTMLDivElement> {
  /** URL to load in the iframe */
  src?: string;
  /** Raw HTML content to render (uses srcdoc) */
  htmlContent?: string;
  /** Called when URL changes (user navigation within iframe) */
  onUrlChange?: (url: string) => void;
  children?: ReactNode;
}
```

### AIWebPreviewToolbar

Navigation toolbar with back, forward, refresh, and URL display.

```tsx
interface AIWebPreviewToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Show URL input field (default: true) */
  showUrl?: boolean;
  /** Additional toolbar actions */
  actions?: ReactNode;
}
```

### AIWebPreviewFrame

The iframe container with loading state.

```tsx
interface AIWebPreviewFrameProps extends HTMLAttributes<HTMLDivElement> {
  /** Loading placeholder */
  loading?: ReactNode;
}
```

### AIWebPreviewConsole

Collapsible console output panel.

```tsx
interface AIWebPreviewConsoleProps extends HTMLAttributes<HTMLDivElement> {
  /** Console log entries */
  logs?: Array<{
    level: 'log' | 'warn' | 'error' | 'info';
    message: string;
    timestamp?: Date;
  }>;
  /** Start expanded (default: false) */
  defaultOpen?: boolean;
}
```

## Usage

### Basic — render generated HTML
```tsx
<AIWebPreview htmlContent={generatedHtml}>
  <AIWebPreviewToolbar />
  <AIWebPreviewFrame loading={<Skeleton />} />
</AIWebPreview>
```

### With console output
```tsx
<AIWebPreview src="https://preview.example.com/dashboard">
  <AIWebPreviewToolbar showUrl />
  <AIWebPreviewFrame />
  <AIWebPreviewConsole logs={consoleLogs} />
</AIWebPreview>
```

### In an artifact panel
```tsx
<AIArtifact variant="panel" open>
  <AIArtifactHeader>
    <AIArtifactTitle>Generated Dashboard</AIArtifactTitle>
    <AIArtifactClose onClick={onClose} />
  </AIArtifactHeader>
  <AIArtifactContent>
    <AIWebPreview htmlContent={dashboardHtml}>
      <AIWebPreviewToolbar />
      <AIWebPreviewFrame />
    </AIWebPreview>
  </AIArtifactContent>
</AIArtifact>
```

## Security

- iframe sandbox: `sandbox="allow-scripts"` (no `allow-same-origin`)
- Content-Security-Policy via meta tag in srcdoc
- No access to parent window or cookies
- Console messages via `window.postMessage` bridge injected into srcdoc

## Base UI Dependencies

- `Input` (URL bar)
- `IconButton` (navigation buttons)
- `Tooltip` (button tooltips)
- `Skeleton` (loading state)
- `ScrollArea` (console scrolling)
- `lucide-react`: `LuArrowLeft`, `LuArrowRight`, `LuRefreshCw`, `LuTerminal`, `LuChevronDown`
