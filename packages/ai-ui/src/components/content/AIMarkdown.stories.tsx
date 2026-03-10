import { useState, useCallback, useRef, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AIMarkdown } from './AIMarkdown';
import { ChatBubble } from '../chat/ChatBubble';
import { ChatAvatar } from '../chat/ChatAvatar';

const meta: Meta<typeof AIMarkdown> = {
  title: 'AI/Content/AIMarkdown',
  component: AIMarkdown,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 700, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function* simulateStream(
  text: string,
  chunkSize = 3,
  delayMs = 12,
): AsyncGenerator<string> {
  let i = 0;
  while (i < text.length) {
    const size = Math.max(1, chunkSize + Math.floor(Math.random() * 4) - 2);
    yield text.slice(i, i + size);
    i += size;
    await new Promise((r) => setTimeout(r, delayMs + Math.random() * delayMs * 0.5));
  }
}

// ---------------------------------------------------------------------------
// Static stories
// ---------------------------------------------------------------------------

export const Playground: Story = {
  args: {
    content: `## Hello World

This is a **bold** and *italic* paragraph with \`inline code\`.

- Item one
- Item two
- Item three

> This is a blockquote.

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

Check out [this link](https://example.com) for more info.`,
  },
};

export const Headings: Story = {
  args: {
    content: `# Heading 1
## Heading 2
### Heading 3
#### Heading 4`,
  },
};

export const CodeBlocks: Story = {
  args: {
    content: `Here's some Python:

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))
\`\`\`

And some JSON:

\`\`\`json
{
  "name": "example",
  "version": "1.0.0"
}
\`\`\``,
  },
};

export const Lists: Story = {
  args: {
    content: `## Unordered List
- First item
- Second item
- Third item

## Ordered List
1. Step one
2. Step two
3. Step three`,
  },
};

export const StreamingPartial: Story = {
  args: {
    content: `## Analyzing the code

Let me look at the implementation:

\`\`\`typescript
const result = items.filter(item =>`,
    streaming: true,
  },
};

// ---------------------------------------------------------------------------
// Streaming showcase
// ---------------------------------------------------------------------------

const SAMPLE_RESPONSE = `## Kubernetes Pod Scheduling

Kubernetes uses a sophisticated scheduling algorithm to place pods on the most suitable nodes in your cluster. Here's how it works:

### The Scheduling Process

The **kube-scheduler** watches for newly created pods that have no node assigned. For every pod it discovers, it becomes responsible for finding the best node to run that pod.

The scheduler follows a two-step process:

1. **Filtering** — Eliminates nodes that don't meet the pod's requirements
2. **Scoring** — Ranks the remaining nodes to find the best fit
3. **Binding** — Assigns the pod to the highest-scoring node

### Example Configuration

Here's a pod spec with node affinity rules:

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: scheduled-pod
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: topology.kubernetes.io/zone
                operator: In
                values:
                  - us-east-1a
                  - us-east-1b
  containers:
    - name: app
      image: nginx:1.25
      resources:
        requests:
          cpu: "500m"
          memory: "128Mi"
        limits:
          cpu: "1000m"
          memory: "256Mi"
\`\`\`

### Key Considerations

> **Note:** Resource requests affect scheduling decisions. Always set appropriate CPU and memory requests for your pods.

When designing your scheduling strategy, keep these factors in mind:

- **Resource availability** — Ensure nodes have enough CPU and memory
- **Topology spread** — Distribute pods across failure domains
- **Taints and tolerations** — Control which pods can run on specific nodes
- **Pod priority** — Higher-priority pods can preempt lower-priority ones

For more details, see the [Kubernetes scheduling documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/).`;

function StreamingShowcaseComponent() {
  const [stream, setStream] = useState<AsyncIterable<string> | undefined>();
  const [complete, setComplete] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);
  const countRef = useRef(0);

  const startStream = useCallback(() => {
    countRef.current = 0;
    setChunkCount(0);
    setComplete(false);
    setStream(simulateStream(SAMPLE_RESPONSE, 4, 10));
  }, []);

  const handleChunk = useCallback(() => {
    countRef.current += 1;
    setChunkCount(countRef.current);
  }, []);

  const handleComplete = useCallback(() => {
    setComplete(true);
  }, []);

  // Auto-start on mount
  useEffect(() => {
    startStream();
  }, [startStream]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          onClick={startStream}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: '1px solid var(--ov-color-border-default)',
            background: 'var(--ov-color-bg-surface)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Restart Stream
        </button>
        <span style={{ fontSize: 12, color: 'var(--ov-color-fg-muted)' }}>
          {complete
            ? `Complete (${chunkCount} chunks)`
            : `Streaming... (${chunkCount} chunks)`}
        </span>
      </div>

      <ChatBubble
        role="assistant"
        avatar={<ChatAvatar role="assistant" name="Claude" />}
      >
        <AIMarkdown
          stream={stream}
          onChunk={handleChunk}
          onComplete={handleComplete}
        />
      </ChatBubble>
    </div>
  );
}

export const StreamingResponse: StoryObj = {
  render: () => <StreamingShowcaseComponent />,
};

// ---------------------------------------------------------------------------
// Streaming code block focus
// ---------------------------------------------------------------------------

const CODE_RESPONSE = `Here's a function that implements a binary search algorithm:

\`\`\`typescript
function binarySearch<T>(
  arr: T[],
  target: T,
  compare: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0),
): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const cmp = compare(arr[mid]!, target);

    if (cmp === 0) return mid;
    if (cmp < 0) low = mid + 1;
    else high = mid - 1;
  }

  return -1; // Not found
}
\`\`\`

The time complexity is **O(log n)** and space complexity is **O(1)**.

Usage example:

\`\`\`typescript
const numbers = [1, 3, 5, 7, 9, 11, 13];
const index = binarySearch(numbers, 7);
console.log(index); // 3
\`\`\`

The function accepts a custom comparator for sorting non-primitive types.`;

function StreamingCodeComponent() {
  const [stream, setStream] = useState<AsyncIterable<string> | undefined>();

  const startStream = useCallback(() => {
    setStream(simulateStream(CODE_RESPONSE, 3, 8));
  }, []);

  useEffect(() => {
    startStream();
  }, [startStream]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        type="button"
        onClick={startStream}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 16px',
          borderRadius: 6,
          border: '1px solid var(--ov-color-border-default)',
          background: 'var(--ov-color-bg-surface)',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Restart
      </button>
      <AIMarkdown stream={stream} />
    </div>
  );
}

export const StreamingCodeBlocks: StoryObj = {
  render: () => <StreamingCodeComponent />,
};

// ---------------------------------------------------------------------------
// Full conversation with streaming
// ---------------------------------------------------------------------------

function StreamingConversationComponent() {
  const [stream, setStream] = useState<AsyncIterable<string> | undefined>();
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = useCallback(() => {
    setIsStreaming(true);
    setStream(simulateStream(SAMPLE_RESPONSE, 4, 10));
  }, []);

  useEffect(() => {
    startStream();
  }, [startStream]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button
        type="button"
        onClick={startStream}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 16px',
          borderRadius: 6,
          border: '1px solid var(--ov-color-border-default)',
          background: 'var(--ov-color-bg-surface)',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Restart Conversation
      </button>

      <ChatBubble
        role="user"
        avatar={<ChatAvatar role="user" name="Josh" />}
        timestamp={new Date(Date.now() - 30000)}
      >
        How does Kubernetes schedule pods across nodes? I want to understand the
        full process including node affinity and resource management.
      </ChatBubble>

      <ChatBubble
        role="assistant"
        avatar={<ChatAvatar role="assistant" name="Claude" />}
      >
        <AIMarkdown
          stream={stream}
          onComplete={() => setIsStreaming(false)}
        />
      </ChatBubble>

      {isStreaming && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--ov-color-fg-muted)',
          }}
        >
          Claude is responding...
        </div>
      )}
    </div>
  );
}

export const StreamingConversation: StoryObj = {
  render: () => <StreamingConversationComponent />,
};
