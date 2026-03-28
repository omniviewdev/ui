import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownPreview } from './MarkdownPreview';

/** Checked-in SVG assets for offline/deterministic stories. */
import placeholderSvg from './assets/placeholder.svg';
import badgeBuildSvg from './assets/badge-build.svg';
import badgeCoverageSvg from './assets/badge-coverage.svg';
import badgeLicenseSvg from './assets/badge-license.svg';
import badgeVersionSvg from './assets/badge-version.svg';
import badgePrsSvg from './assets/badge-prs.svg';

const richMarkdown = `# Omniview Platform Guide

Welcome to the **Omniview** platform. This document exercises every markdown surface supported by the preview component.

## Inline Formatting

Regular text with **bold**, *italic*, ~~strikethrough~~, and **_bold italic_** combined. Here is some \`inline code\` and a [link to the docs](https://docs.omniview.dev).

## Headings

### Third-level heading
#### Fourth-level heading
##### Fifth-level heading
###### Sixth-level heading

## Lists

### Unordered

- Cluster management
- Resource monitoring
  - CPU & memory
  - Disk I/O
    - Read throughput
    - Write throughput
- Alerting & notifications

### Ordered

1. Connect to the cluster
2. Select a namespace
3. Choose a resource type
   1. Pods
   2. Services
   3. Deployments

### Task List

- [x] Set up project structure
- [x] Implement CodeEditor component
- [x] Implement DiffViewer component
- [ ] Add integration tests
- [ ] Performance benchmarks
- [ ] Release v0.1.0

## Code Blocks

A quick shell command:

\`\`\`bash
kubectl get pods -n production --sort-by='.status.startTime'
\`\`\`

TypeScript with syntax highlighting:

\`\`\`typescript
import { createClient } from './api/client';

const client = createClient();

interface PodListResponse {
  items: Array<{
    metadata: { name: string; namespace: string };
    status: { phase: 'Running' | 'Pending' | 'Failed' };
  }>;
}

export async function fetchPods(namespace: string): Promise<PodListResponse> {
  const { data } = await client.get<PodListResponse>(
    \`/api/v1/namespaces/\${namespace}/pods\`,
  );
  return data;
}
\`\`\`

JSON configuration:

\`\`\`json
{
  "cluster": "production",
  "context": "omniview-prod",
  "preferences": {
    "theme": "dark",
    "refreshInterval": 5000,
    "maxLogLines": 1000
  }
}
\`\`\`

YAML manifest:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: omniview-api
  labels:
    app: omniview
spec:
  replicas: 3
  selector:
    matchLabels:
      app: omniview
  template:
    spec:
      containers:
        - name: api
          image: omniview/api:latest
          ports:
            - containerPort: 8080
\`\`\`

A plain code block with no language:

\`\`\`
no syntax highlighting here
just plain preformatted text
\`\`\`

## Tables

| Kind | API Version | Namespaced | Description |
|------|:----------:|:----------:|-------------|
| Pod | v1 | Yes | Smallest deployable unit |
| Service | v1 | Yes | Network endpoint abstraction |
| Deployment | apps/v1 | Yes | Declarative pod management |
| ConfigMap | v1 | Yes | Non-confidential configuration |
| Secret | v1 | Yes | Sensitive data storage |
| Namespace | v1 | No | Cluster partitioning |
| Node | v1 | No | Worker machine in cluster |

## Blockquotes

> **Note:** All API calls go through the centralized client at \`src/api/client.ts\`.

> **Warning:** This API is experimental and may change in future releases.
>
> Proceed with caution when using the \`--force\` flag in production.

> Nested blockquote with code:
>
> \`\`\`bash
> kubectl port-forward svc/my-service 8080:80
> \`\`\`

## Links

- [GitHub Repository](https://github.com/omniviewdev/omniview)
- [Documentation](https://docs.omniview.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)

Inline link: Visit [GitHub](https://github.com) for source code.

## Horizontal Rules

Content above the rule.

---

Content below the rule.

---

## Images

![Placeholder](${placeholderSvg})

## Paragraphs & Emphasis

This is a regular paragraph with enough text to demonstrate line wrapping behavior in the preview component. The markdown renderer should handle long paragraphs gracefully without breaking the layout.

*This entire paragraph is italicized for emphasis. It demonstrates how the preview handles blocks of styled text rather than just inline fragments.*

**This entire paragraph is bold. It is useful for call-outs or important notices that need to stand out from the surrounding content.**

---

*Last updated: 2025-03-09*`;

const meta: Meta<typeof MarkdownPreview> = {
  title: 'Editors/MarkdownPreview',
  component: MarkdownPreview,
  tags: ['autodocs'],
  args: {
    content: richMarkdown,
  },
  argTypes: {
    allowHtml: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 700, maxHeight: 600, overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Simple: Story = {
  args: {
    content:
      '# Hello World\n\nThis is a simple markdown preview.\n\nIt supports **bold**, *italic*, and `inline code`.',
  },
};

export const WithCodeBlocks: Story = {
  args: {
    content: `## Code Examples

### JavaScript
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

### Python
\`\`\`python
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
\`\`\`

### Go
\`\`\`go
func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}
\`\`\``,
  },
};

export const Tables: Story = {
  args: {
    content: `## Kubernetes Resource Types

| Kind | API Version | Namespaced | Description |
|------|------------|------------|-------------|
| Pod | v1 | Yes | Smallest deployable unit |
| Service | v1 | Yes | Network endpoint abstraction |
| Deployment | apps/v1 | Yes | Declarative pod management |
| ConfigMap | v1 | Yes | Non-confidential configuration |
| Secret | v1 | Yes | Sensitive data storage |
| Namespace | v1 | No | Cluster partitioning |
| Node | v1 | No | Worker machine in cluster |
| PersistentVolume | v1 | No | Storage resource |`,
  },
};

export const TaskLists: Story = {
  args: {
    content: `## Sprint Checklist

- [x] Set up project structure
- [x] Implement CodeEditor component
- [x] Implement DiffViewer component
- [x] Implement Terminal component
- [ ] Add integration tests
- [ ] Performance benchmarks
- [ ] Documentation review
- [ ] Release v0.1.0`,
  },
};

export const NestedLists: Story = {
  args: {
    content: `## Project Structure

- \`packages/\`
  - \`base-ui/\` — Core UI primitives
    - \`src/components/\` — Component library
    - \`src/theme/\` — Theme system
  - \`editors/\` — Editor components
    - \`src/components/\`
      - \`code-editor/\` — Monaco-based editor
      - \`terminal/\` — xterm.js terminal
      - \`diff-viewer/\` — Side-by-side diff
    - \`src/themes/\` — Editor theme integration
- \`docs/\` — Documentation
- \`scripts/\` — Build tooling`,
  },
};

export const Blockquotes: Story = {
  args: {
    content: `## Important Notes

> **Warning:** This API is experimental and may change in future releases.

> **Tip:** Use \`kubectl port-forward\` to access services locally:
> \`\`\`bash
> kubectl port-forward svc/my-service 8080:80
> \`\`\``,
  },
};

export const Links: Story = {
  args: {
    content: `## Resources

Links open in new tabs with \`rel="noopener noreferrer"\`:

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)
- [Kubernetes Documentation](https://kubernetes.io/docs)

Inline link: Visit [GitHub](https://github.com) for source code.`,
  },
};

export const EmptyContent: Story = {
  args: {
    content: '',
  },
};

export const LongDocument: Story = {
  args: {
    content: Array.from(
      { length: 20 },
      (_, i) =>
        `## Section ${i + 1}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\n\`\`\`\ncode block ${i + 1}\n\`\`\`\n`,
    ).join('\n'),
  },
};

export const WithHtml: Story = {
  args: {
    content: `## HTML Content

This story has \`allowHtml\` enabled, so raw HTML is parsed and rendered.

### Details / Summary

<details>
<summary>Click to expand — deployment notes</summary>

The v2.0 release requires a database migration. Run the following **before** deploying:

\`\`\`bash
pnpm db:migrate --env production
\`\`\`

After migration, verify with \`pnpm db:status\`.

</details>

<details>
<summary>Architecture decision records</summary>

- **ADR-001** — Use Monaco Editor for code editing
- **ADR-002** — Use xterm.js for terminal emulation
- **ADR-003** — Monorepo with pnpm workspaces

</details>

### Badges & Shields

![Build](${badgeBuildSvg})
![Coverage](${badgeCoverageSvg})
![License](${badgeLicenseSvg})
![Version](${badgeVersionSvg})

### Inline HTML elements

This paragraph has <strong>strong</strong>, <em>emphasis</em>, <del>strikethrough</del>, <code>inline code</code>, and a <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>.

### Definition list (via HTML)

<dl>
  <dt>Kubernetes</dt>
  <dd>An open-source container orchestration platform.</dd>
  <dt>Helm</dt>
  <dd>A package manager for Kubernetes.</dd>
</dl>

### Keyboard shortcuts

Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> to open the command palette.`,
    allowHtml: true,
  },
};

export const GitHubReadme: Story = {
  args: {
    content: `<p align="center">
  <strong>Omniview</strong> — A unified platform for Kubernetes management
</p>

<p align="center">
  <img src="${badgeBuildSvg}" alt="Build" />
  <img src="${badgeCoverageSvg}" alt="Coverage" />
  <img src="${badgeLicenseSvg}" alt="License" />
  <img src="${badgePrsSvg}" alt="PRs Welcome" />
</p>

---

## Features

- Multi-cluster management with a unified dashboard
- Real-time resource monitoring and alerting
- Integrated code editor with **YAML** schema validation
- Built-in terminal for \`kubectl\` access

## Quick Start

\`\`\`bash
# Install
pnpm add @omniviewdev/app

# Run
pnpm dev
\`\`\`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \`theme\` | \`string\` | \`"dark"\` | UI theme |
| \`refreshInterval\` | \`number\` | \`5000\` | Poll interval in ms |
| \`maxLogLines\` | \`number\` | \`1000\` | Terminal log buffer |

## Contributing

- [x] Read the contributing guide
- [ ] Fork the repository
- [ ] Create a feature branch
- [ ] Submit a pull request

<details>
<summary>Development setup</summary>

\`\`\`bash
git clone https://github.com/omniviewdev/omniview.git
cd omniview
pnpm install
pnpm dev
\`\`\`

</details>

## License

MIT — see LICENSE for details.`,
    allowHtml: true,
  },
};
