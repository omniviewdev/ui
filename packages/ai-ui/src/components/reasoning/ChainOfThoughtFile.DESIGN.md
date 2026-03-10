# ChainOfThoughtFile — File Badge for Investigation Steps

## Overview

A file/resource badge displayed within a `ChainOfThoughtStep` to show what files, resources, or data sources the agent examined during that step. MUI Treasury's `ai-task` has this as `TaskItemFile`.

In Omniview's context, these would show Kubernetes resources (`pods/api-gateway-7d8f9`), log files (`/var/log/containers/...`), config files (`values.yaml`), or database queries that were inspected.

## Architecture

A small sub-component of `ChainOfThoughtStep`. Renders as a compact clickable badge with an icon indicating the resource type and a truncated label. Can be used alongside `ChainOfThoughtSearchResult` (tags) or independently.

This is added to the existing `ChainOfThought` component family, not a new component directory.

## Components

### ChainOfThoughtFile

A compact badge showing a file or resource that was examined.

```tsx
interface ChainOfThoughtFileProps extends HTMLAttributes<HTMLSpanElement> {
  /** Display name (filename, resource name, etc.) */
  name: string;
  /** Resource type — determines the icon */
  type?: 'file' | 'resource' | 'log' | 'config' | 'query' | 'url';
  /** Full path or identifier (shown in tooltip) */
  path?: string;
  /** Click handler (e.g., navigate to resource) */
  onClick?: () => void;
}
```

### ChainOfThoughtFiles

Container for multiple file badges (flex wrap layout, same as `ChainOfThoughtSearchResults`).

```tsx
interface ChainOfThoughtFilesProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
```

## Usage

### In a chain of thought step
```tsx
<ChainOfThoughtStep
  label="Analyzing pod logs"
  description="Found OOMKilled events in 3 containers"
  status="complete"
>
  <ChainOfThoughtFiles>
    <ChainOfThoughtFile
      name="api-gateway-7d8f9"
      type="resource"
      path="default/pods/api-gateway-7d8f9b6c4-x2k9m"
      onClick={() => navigateToResource('pod', 'api-gateway-7d8f9b6c4-x2k9m')}
    />
    <ChainOfThoughtFile
      name="worker-5c4d3"
      type="resource"
      path="default/pods/worker-5c4d3e2f1-q8w7r"
    />
    <ChainOfThoughtFile
      name="container.log"
      type="log"
      path="/var/log/containers/api-gateway_default_app-7d8f9.log"
    />
  </ChainOfThoughtFiles>
</ChainOfThoughtStep>
```

### Mixed with search result tags
```tsx
<ChainOfThoughtStep label="Checking metrics" status="complete">
  <ChainOfThoughtFiles>
    <ChainOfThoughtFile name="prometheus" type="query" />
    <ChainOfThoughtFile name="grafana-dashboard.json" type="config" />
  </ChainOfThoughtFiles>
  <ChainOfThoughtSearchResults>
    <ChainOfThoughtSearchResult label="CPU: 78% avg" />
    <ChainOfThoughtSearchResult label="P99: 4.2s" />
  </ChainOfThoughtSearchResults>
</ChainOfThoughtStep>
```

## Visual Design

- Compact pill/badge shape (similar to `ChainOfThoughtSearchResult` / `StepTag`)
- Small icon on the left indicating type:
  - `file`: file icon
  - `resource`: cube/box icon (K8s resource)
  - `log`: terminal/scroll icon
  - `config`: settings/gear icon
  - `query`: database icon
  - `url`: globe/link icon
- Truncated name with tooltip showing full path
- Subtle hover state; `cursor: pointer` when `onClick` is provided
- Slightly different background from search result tags to distinguish "examined sources" from "findings"

## Type Icons

```tsx
const FILE_TYPE_ICONS = {
  file: LuFile,
  resource: LuBox,
  log: LuScrollText,
  config: LuSettings,
  query: LuDatabase,
  url: LuGlobe,
};
```

## Base UI Dependencies

- `Tooltip` (full path on hover)
- `lucide-react` icons for type indicators
- Extends existing `ChainOfThought.module.css` with new `.StepFile` class
