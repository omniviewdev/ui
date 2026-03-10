import { useState, useCallback, useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import {
  ChatBubble,
  ChatInput,
  ChatAvatar,
  ChatSuggestions,
  ChatMessageList,
  AIMessageActions,
  AIErrorMessage,
  AIFollowUp,
  AIContextIndicator,
  AIConversationHeader,
  AIModelSelector,
  AIAttachment,
  AIRetryButton,
} from '../components/chat';
import type { ChatMessageListHandle } from '../components/chat';
import { TypingIndicator, AIStopButton } from '../components/streaming';
import {
  ThinkingBlock,
  ChainOfThought,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from '../components/reasoning';
import { ToolCall, ToolCallList } from '../components/tool-calls';
import { AgentControls, AgentTaskList } from '../components/agent';
import { PermissionRequest } from '../components/permissions';
import {
  AICodeBlock,
  AIMarkdown,
  AIInlineCitation,
  AISources,
  AITokenUsage,
  AICostIndicator,
} from '../components/content';

const meta: Meta = {
  title: 'Compositions',
};

export default meta;

// ---------------------------------------------------------------------------
// 1. FullChatInterface
// ---------------------------------------------------------------------------

async function* simulateStream(text: string, chunkSize = 4, delayMs = 8): AsyncGenerator<string> {
  let i = 0;
  while (i < text.length) {
    const size = Math.max(1, chunkSize + Math.floor(Math.random() * 4) - 2);
    yield text.slice(i, i + size);
    i += size;
    await new Promise((r) => setTimeout(r, delayMs + Math.random() * delayMs * 0.5));
  }
}

type MsgState = 'complete' | 'thinking' | 'streaming';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  stream?: AsyncIterable<string>;
  state: MsgState;
  timestamp: Date;
}

interface CannedResponse {
  content: string;
  followUps: string[];
}

const CANNED_RESPONSES: Record<string, CannedResponse> = {
  deployments: {
    content: `## Kubernetes Deployments

A **Deployment** provides declarative updates for Pods and ReplicaSets. You describe a desired state, and the Deployment controller changes the actual state to match.

### How It Works

1. **Define** your desired pod template and replica count
2. **Apply** the manifest — the controller creates a ReplicaSet
3. **Update** the image or config — a new ReplicaSet rolls out gradually
4. **Rollback** if something goes wrong with \`kubectl rollout undo\`

### Example

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
        - name: api
          image: myregistry/api-server:v2.4.1
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
\`\`\`

> **Tip:** Setting \`maxUnavailable: 0\` ensures zero downtime during rollouts. Combined with \`maxSurge: 1\`, Kubernetes creates one new pod before terminating an old one.

### Key Commands

- \`kubectl rollout status deployment/api-server\` — watch progress
- \`kubectl rollout history deployment/api-server\` — view revisions
- \`kubectl rollout undo deployment/api-server\` — revert to previous`,
    followUps: [
      'How do rolling updates work in detail?',
      'What is the difference between Deployment and StatefulSet?',
      'How do I set up health checks for my deployment?',
    ],
  },

  services: {
    content: `## Kubernetes Services

A **Service** provides a stable network endpoint for a set of Pods. Since pods are ephemeral and get new IPs when restarted, Services give you a consistent way to reach them.

### Service Types

- **ClusterIP** — Internal-only access within the cluster (default)
- **NodePort** — Exposes the service on each node's IP at a static port
- **LoadBalancer** — Provisions an external load balancer (cloud providers)
- **ExternalName** — Maps to a DNS name outside the cluster

### Example

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  type: ClusterIP
  selector:
    app: api-server
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
\`\`\`

The \`selector\` field matches pods with the label \`app: api-server\`. Traffic to \`api-service:80\` is routed to port \`8080\` on those pods.

> **Note:** Services use \`iptables\` or \`ipvs\` rules under the hood. The \`kube-proxy\` component on each node manages these rules.

### DNS Resolution

Every service gets a DNS entry: \`<service>.<namespace>.svc.cluster.local\`. For example:

\`\`\`bash
curl http://api-service.production.svc.cluster.local
\`\`\`

You can also use the short form \`api-service\` from within the same namespace.`,
    followUps: [
      'How do I expose a service externally?',
      'What is an Ingress and how does it relate to Services?',
      'How does kube-proxy route traffic?',
    ],
  },

  scaling: {
    content: `## Horizontal Pod Autoscaling

Kubernetes can automatically scale your workloads based on observed metrics like CPU utilization, memory usage, or custom metrics.

### Manual Scaling

The quickest way to scale is with \`kubectl\`:

\`\`\`bash
kubectl scale deployment/api-server --replicas=5 -n production
\`\`\`

### Automatic Scaling with HPA

For production workloads, use a **HorizontalPodAutoscaler**:

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
\`\`\`

### How It Works

1. **Metrics Server** collects resource usage from kubelets every 15 seconds
2. **HPA controller** checks metrics against targets every 15 seconds
3. If usage exceeds the target, it **scales up** (adds pods)
4. If usage drops below, it **scales down** after a cooldown period

> **Best Practice:** Always set resource \`requests\` on your containers. The HPA calculates utilization as a percentage of the requested resources.

### Monitoring Scale Events

\`\`\`bash
kubectl describe hpa api-server-hpa
kubectl get events --field-selector reason=SuccessfulRescale
\`\`\``,
    followUps: [
      'How do I scale based on custom metrics?',
      'What is Vertical Pod Autoscaling?',
      'How do I prevent flapping during scale-down?',
    ],
  },

  default: {
    content: `That's a great question! Let me give you a comprehensive overview.

## Key Concepts

Kubernetes orchestrates containerized workloads across a cluster of machines. The core building blocks are:

- **Pods** — The smallest deployable unit, containing one or more containers
- **Deployments** — Manage pod replicas and rolling updates
- **Services** — Provide stable networking for pods
- **ConfigMaps & Secrets** — Externalize configuration and sensitive data

### Getting Started

You can inspect your cluster with these commands:

\`\`\`bash
# View cluster info
kubectl cluster-info

# List all pods across namespaces
kubectl get pods -A

# Describe a specific resource
kubectl describe deployment/api-server -n production
\`\`\`

> The \`kubectl\` CLI is your primary interface to the Kubernetes API. Most operations follow the pattern: \`kubectl <verb> <resource> [name] [flags]\`.

### Architecture

The **control plane** (API server, scheduler, controller manager, etcd) manages cluster state. **Worker nodes** run your application pods via the kubelet and container runtime.

Would you like me to dive deeper into any of these topics?`,
    followUps: [
      'Explain how Deployments work',
      'What are Kubernetes Services?',
      'How do I scale pods horizontally?',
    ],
  },
};

function matchResponse(input: string): CannedResponse {
  const lower = input.toLowerCase();
  if (lower.includes('deployment') || lower.includes('rollout') || lower.includes('rolling update')) {
    return CANNED_RESPONSES.deployments!;
  }
  if (lower.includes('service') || lower.includes('networking') || lower.includes('expose')) {
    return CANNED_RESPONSES.services!;
  }
  if (lower.includes('scal') || lower.includes('replica') || lower.includes('autoscal') || lower.includes('hpa')) {
    return CANNED_RESPONSES.scaling!;
  }
  return CANNED_RESPONSES.default!;
}

function FullChatInterfaceComponent() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I\'m your Kubernetes assistant. Ask me about pods, deployments, services, scaling, or anything else about your cluster.',
      state: 'complete',
      timestamp: new Date(Date.now() - 60000),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'positive' | 'negative'>>({});

  const listRef = useRef<ChatMessageListHandle>(null);
  const accumulatedRef = useRef<Map<string, string>>(new Map());
  const followUpsRef = useRef<Map<string, string[]>>(new Map());

  const suggestions = [
    { label: 'Explain Deployments', value: 'How do Kubernetes Deployments work?' },
    { label: 'Describe Services', value: 'What are Kubernetes Services?' },
    { label: 'Scaling Pods', value: 'How do I scale pods horizontally?' },
  ];

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToBottom();
  }, []);

  const handleStreamComplete = useCallback((id: string) => {
    const finalContent = accumulatedRef.current.get(id);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, content: finalContent ?? m.content, stream: undefined, state: 'complete' as const }
          : m,
      ),
    );
    accumulatedRef.current.delete(id);
    setActiveStreamId(null);
    setFollowUps(followUpsRef.current.get(id) ?? []);
    followUpsRef.current.delete(id);
  }, []);

  const handleStop = useCallback(() => {
    if (!activeStreamId) return;
    const partial = accumulatedRef.current.get(activeStreamId) ?? '';
    setMessages((prev) =>
      prev.map((m) =>
        m.id === activeStreamId
          ? { ...m, content: partial, stream: undefined, state: 'complete' as const }
          : m,
      ),
    );
    accumulatedRef.current.delete(activeStreamId);
    setActiveStreamId(null);
    setFollowUps(followUpsRef.current.get(activeStreamId) ?? []);
    followUpsRef.current.delete(activeStreamId);
  }, [activeStreamId]);

  const handleSubmit = useCallback(
    (value: string) => {
      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `asst-${Date.now()}`;
      const response = matchResponse(value);

      // Store follow-ups for this response
      followUpsRef.current.set(assistantMsgId, response.followUps);

      // Add user message immediately
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: 'user', content: value, state: 'complete', timestamp: new Date() },
      ]);
      setInputValue('');
      setFollowUps([]);

      // Brief delay, then add assistant message in "thinking" state
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: assistantMsgId, role: 'assistant', content: response.content, state: 'thinking', timestamp: new Date() },
        ]);
        setActiveStreamId(assistantMsgId);
        scrollToBottom();

        // After a thinking pause, switch to streaming
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, stream: simulateStream(response.content, 5, 8), state: 'streaming' as const }
                : m,
            ),
          );
        }, 700);
      }, 150);
    },
    [scrollToBottom],
  );

  const handleFollowUp = useCallback(
    (suggestion: string) => {
      setFollowUps([]);
      setInputValue('');
      handleSubmit(suggestion);
    },
    [handleSubmit],
  );

  const renderMessage = useCallback(
    (index: number) => {
      const msg = messages[index]!;
      return (
        <ChatBubble
          role={msg.role}
          avatar={
            <ChatAvatar
              role={msg.role}
              name={msg.role === 'user' ? 'You' : 'Claude'}
            />
          }
          timestamp={msg.state === 'complete' ? msg.timestamp : undefined}
          actions={
            msg.role === 'assistant' && msg.state === 'complete' && msg.id !== 'welcome' ? (
              <AIMessageActions
                onCopy={() => navigator.clipboard?.writeText(msg.content)}
                onRegenerate={() => {}}
                feedback={feedbackMap[msg.id] ?? null}
                onFeedback={(fb) =>
                  setFeedbackMap((prev) => ({ ...prev, [msg.id]: fb }))
                }
              />
            ) : undefined
          }
        >
          {msg.role === 'user' && msg.content}
          {msg.role === 'assistant' && msg.state === 'thinking' && <TypingIndicator />}
          {msg.role === 'assistant' && msg.state === 'streaming' && msg.stream && (
            <AIMarkdown
              stream={msg.stream}
              onChunk={(accumulated) => {
                accumulatedRef.current.set(msg.id, accumulated);
                scrollToBottom();
              }}
              onComplete={() => handleStreamComplete(msg.id)}
            />
          )}
          {msg.role === 'assistant' && msg.state === 'complete' && (
            <AIMarkdown content={msg.content} />
          )}
        </ChatBubble>
      );
    },
    [messages, feedbackMap, scrollToBottom, handleStreamComplete],
  );

  const isGenerating = activeStreamId != null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 700,
        maxWidth: 740,
        border: '1px solid var(--ov-color-border-default, #e2e8f0)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--ov-color-bg-default)',
      }}
    >
      <AIConversationHeader
        title="Kubernetes Assistant"
        model="Claude 4 Sonnet"
        onNewChat={() => {
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content:
                'Hello! I\'m your Kubernetes assistant. Ask me about pods, deployments, services, scaling, or anything else about your cluster.',
              state: 'complete',
              timestamp: new Date(),
            },
          ]);
          setActiveStreamId(null);
          setFollowUps([]);
          setFeedbackMap({});
        }}
        onSettings={() => {}}
      />

      {/* Virtualized messages area */}
      <ChatMessageList
        ref={listRef}
        count={messages.length}
        estimateSize={120}
        renderItem={renderMessage}
        autoScroll
        style={{ flex: 1, minHeight: 0, padding: '8px 16px' }}
      />

      {/* Bottom controls */}
      <div
        style={{
          padding: '8px 16px 12px',
          borderTop: '1px solid var(--ov-color-border-default, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {isGenerating && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <AIStopButton onStop={handleStop} />
          </div>
        )}

        {!isGenerating && followUps.length > 0 && (
          <AIFollowUp suggestions={followUps} onSelect={handleFollowUp} />
        )}

        {!isGenerating && followUps.length === 0 && messages.length <= 1 && (
          <ChatSuggestions
            suggestions={suggestions}
            onSelect={(value) => handleSubmit(value)}
          />
        )}

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          placeholder="Ask about Kubernetes..."
          disabled={isGenerating}
        />
      </div>
    </div>
  );
}

export const FullChatInterface: StoryObj = {
  render: () => <FullChatInterfaceComponent />,
};

// ---------------------------------------------------------------------------
// 2. AIResponseBlock
// ---------------------------------------------------------------------------

function AIResponseBlockComponent() {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

  const markdownContent = `## Understanding Kubernetes Services

Services provide a stable networking endpoint for a set of Pods. There are several types:

- **ClusterIP** - Internal cluster access only
- **NodePort** - Exposes on each node's IP at a static port
- **LoadBalancer** - Provisions an external load balancer

Here's how to create a simple Service:

> Services use label selectors to route traffic to the appropriate pods.

For more details, check the [official docs](https://kubernetes.io/docs).`;

  const codeSnippet = `apiVersion: v1
kind: Service
metadata:
  name: my-service
  namespace: production
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376
  type: ClusterIP`;

  const sources = [
    { id: '1', label: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs', detail: 'Official reference' },
    { id: '2', label: 'Service Networking', url: 'https://kubernetes.io/docs/concepts/services-networking', detail: 'Concepts guide' },
    { id: '3', label: 'Best Practices', url: 'https://kubernetes.io/docs/best-practices', detail: 'Production patterns' },
  ];

  const followUps = [
    'How do I expose a Service externally?',
    'What is the difference between ClusterIP and NodePort?',
    'How do Ingress controllers relate to Services?',
  ];

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ChatBubble
        role="assistant"
        avatar={<ChatAvatar role="assistant" name="Claude" />}
        timestamp={new Date()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AIMarkdown content={markdownContent} />

          <AICodeBlock
            code={codeSnippet}
            language="yaml"
            filename="service.yaml"
            showLineNumbers
          />

          <AISources sources={sources} onNavigate={() => {}} />

          <AIFollowUp suggestions={followUps} onSelect={() => {}} />

          <AIMessageActions
            onCopy={() => {}}
            onRegenerate={() => {}}
            feedback={feedback}
            onFeedback={setFeedback}
          />

          <AITokenUsage inputTokens={1250} outputTokens={840} />
        </div>
      </ChatBubble>
    </div>
  );
}

export const AIResponseBlock: StoryObj = {
  render: () => <AIResponseBlockComponent />,
};

// ---------------------------------------------------------------------------
// 3. AgentSession
// ---------------------------------------------------------------------------

function AgentSessionComponent() {
  const [agentStatus, setAgentStatus] = useState<'idle' | 'running' | 'paused' | 'complete' | 'error'>('running');

  const tasks = [
    { id: '1', label: 'Analyze cluster health', status: 'complete' as const, detail: 'All nodes healthy' },
    { id: '2', label: 'Check pod resource usage', status: 'complete' as const, detail: 'Found 3 pods over limit' },
    { id: '3', label: 'Review network policies', status: 'running' as const, detail: 'Scanning 12 policies...' },
    { id: '4', label: 'Audit RBAC permissions', status: 'idle' as const },
    { id: '5', label: 'Generate report', status: 'idle' as const },
  ];

  const toolCalls = [
    {
      id: 'tc1',
      name: 'kubectl_get_pods',
      arguments: { namespace: 'production', labelSelector: 'app=api' },
      status: 'success' as const,
      duration: 340,
      result: <span>Found 5 pods, 4 running, 1 pending</span>,
      resultStatus: 'success' as const,
    },
    {
      id: 'tc2',
      name: 'kubectl_describe_node',
      arguments: { name: 'worker-3' },
      status: 'success' as const,
      duration: 120,
      result: <span>Node worker-3: Ready, 72% CPU, 68% memory</span>,
      resultStatus: 'success' as const,
    },
    {
      id: 'tc3',
      name: 'kubectl_get_networkpolicies',
      arguments: { namespace: 'production' },
      status: 'running' as const,
    },
  ];

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AgentControls
        status={agentStatus}
        onStart={() => setAgentStatus('running')}
        onStop={() => setAgentStatus('idle')}
        onPause={() => setAgentStatus('paused')}
        onResume={() => setAgentStatus('running')}
      />

      <AgentTaskList tasks={tasks} />

      <ToolCallList calls={toolCalls} />

      <PermissionRequest
        tool="kubectl_delete_pod"
        description="Delete pod api-server-7b9f4 in namespace production to trigger a restart"
        scope="namespace:production"
        onAllow={() => {}}
        onDeny={() => {}}
        onAllowAlways={() => {}}
      />
    </div>
  );
}

export const AgentSession: StoryObj = {
  render: () => <AgentSessionComponent />,
};

// ---------------------------------------------------------------------------
// 4. StreamingConversation
// ---------------------------------------------------------------------------

const STREAMING_RESPONSE = `Based on the cluster analysis, I recommend the following changes:

### Scaling Recommendation

Increase the replica count for the **api-server** deployment from 3 to 5. This will improve availability and distribute the load more evenly across your worker nodes.

\`\`\`bash
kubectl scale deployment/api-server --replicas=5 -n production
\`\`\`

### Why This Helps

- **Better load distribution** — Traffic is spread across more pods
- **Higher fault tolerance** — Can survive 2 pod failures instead of 1
- **Reduced latency** — Less queuing under peak load

> **Note:** Ensure your nodes have sufficient CPU and memory headroom before scaling up.

You should also consider setting a **Horizontal Pod Autoscaler** for long-term management:

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
\`\`\`

This will automatically scale between 3 and 10 replicas based on CPU utilization.`;

function StreamingConversationComponent() {
  const [stream, setStream] = useState<AsyncIterable<string> | undefined>();

  const startStream = useCallback(() => {
    setStream(simulateStream(STREAMING_RESPONSE, 4, 10));
  }, []);

  useEffect(() => {
    startStream();
  }, [startStream]);

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
        Restart Stream
      </button>

      {/* Completed message with thinking */}
      <ChatBubble
        role="assistant"
        avatar={<ChatAvatar role="assistant" name="Claude" />}
        timestamp={new Date(Date.now() - 30000)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ThinkingBlock
            content="The user is asking about pod scheduling. I need to consider node affinity, taints and tolerations, and resource requests. Let me structure my response to cover the key concepts clearly."
            duration={3200}
          />
          <AIMarkdown content="Here is how Kubernetes schedules pods across your cluster nodes..." />
        </div>
      </ChatBubble>

      {/* Completed message with tool call */}
      <ChatBubble
        role="assistant"
        avatar={<ChatAvatar role="assistant" name="Claude" />}
        timestamp={new Date(Date.now() - 15000)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ToolCall
            name="kubectl_get_pods"
            status="success"
            arguments={{ namespace: 'kube-system' }}
            duration={280}
          />
          <AIMarkdown content="I found 12 system pods running in the kube-system namespace. All are healthy." />
        </div>
      </ChatBubble>

      {/* Currently streaming message with full markdown */}
      <ChatBubble
        role="assistant"
        avatar={<ChatAvatar role="assistant" name="Claude" />}
      >
        <AIMarkdown
          stream={stream}
          onComplete={() => {}}
        />
      </ChatBubble>

      {/* The blinking cursor inside AIMarkdown indicates active streaming.
          No separate typing indicator needed once content is flowing. */}
    </div>
  );
}

export const StreamingConversation: StoryObj = {
  render: () => <StreamingConversationComponent />,
};

// ---------------------------------------------------------------------------
// 5. ErrorAndRetry
// ---------------------------------------------------------------------------

function ErrorAndRetryComponent() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    setTimeout(() => setRetrying(false), 2000);
  }, []);

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ChatBubble
        role="user"
        avatar={<ChatAvatar role="user" name="Josh" />}
        timestamp={new Date(Date.now() - 10000)}
      >
        Can you analyze the production cluster logs for the last 24 hours?
      </ChatBubble>

      <AIErrorMessage
        title="Generation failed"
        message="The request timed out while processing cluster logs. The log volume may be too large for a single query. Try narrowing the time range or filtering by namespace."
        onRetry={handleRetry}
      />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <AIRetryButton
          onRetry={handleRetry}
          retrying={retrying}
          label="Retry with smaller scope"
        />
      </div>
    </div>
  );
}

export const ErrorAndRetry: StoryObj = {
  render: () => <ErrorAndRetryComponent />,
};

// ---------------------------------------------------------------------------
// 6. RichMessage
// ---------------------------------------------------------------------------

function RichMessageComponent() {
  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ChatBubble
        role="assistant"
        avatar={<ChatAvatar role="assistant" name="Claude" />}
        timestamp={new Date()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <AIAttachment
              name="deployment.yaml"
              type="file"
              size={2048}
            />
            <AIAttachment
              name="architecture-diagram.png"
              type="image"
              size={524288}
              previewUrl="https://placehold.co/120x80/e2e8f0/64748b?text=Diagram"
            />
          </div>

          <p>
            I&apos;ve analyzed the deployment configuration
            <AIInlineCitation index={1} source="deployment.yaml" />
            {' '}and the architecture diagram
            <AIInlineCitation index={2} source="architecture-diagram.png" />
            . The current setup uses a rolling update strategy with a max surge of 25%.
            According to the Kubernetes best practices guide
            <AIInlineCitation index={3} source="K8s Best Practices" />
            , this is a reasonable default for production workloads.
          </p>

          <AICostIndicator cost={0.0034} />
        </div>
      </ChatBubble>
    </div>
  );
}

export const RichMessage: StoryObj = {
  render: () => <RichMessageComponent />,
};

// ---------------------------------------------------------------------------
// 7. ContextAwareChat
// ---------------------------------------------------------------------------

function ContextAwareChatComponent() {
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet');

  const contextItems = [
    { type: 'file' as const, label: 'deployment.yaml' },
    { type: 'file' as const, label: 'service.yaml' },
    { type: 'database' as const, label: 'metrics-db' },
    { type: 'tool' as const, label: 'kubectl' },
    { type: 'tool' as const, label: 'helm' },
  ];

  const models = [
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Best balance of speed and quality' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most capable for complex tasks' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fastest response times' },
  ];

  const followUps = [
    'Analyze resource limits in deployment.yaml',
    'Query recent CPU metrics from metrics-db',
    'Run helm diff against staging',
  ];

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <AIContextIndicator items={contextItems} maxVisible={3} />
        <AIModelSelector
          models={models}
          value={selectedModel}
          onChange={setSelectedModel}
        />
      </div>

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={() => setInputValue('')}
        placeholder="Ask about your resources..."
      />

      <AIFollowUp suggestions={followUps} onSelect={(s) => setInputValue(s)} />
    </div>
  );
}

export const ContextAwareChat: StoryObj = {
  render: () => <ContextAwareChatComponent />,
};


// ---------------------------------------------------------------------------
// 9. LongDebugSession — ~40 message K8s incident debugging with virtualization
// ---------------------------------------------------------------------------

interface DebugMsg extends ChatMsg {
  toolCall?: { name: string; args: Record<string, unknown>; result?: string; status: 'success' | 'error' };
  thinking?: string;
}

const DEBUG_SESSION_MESSAGES: DebugMsg[] = [
  // --- Phase 1: Discovery (1-8) ---
  { id: 'd1', role: 'user', content: 'We\'re getting 500 errors on the payments API in production. Can you check what\'s going on?', state: 'complete', timestamp: new Date(Date.now() - 3600000) },
  { id: 'd2', role: 'assistant', content: 'I\'ll investigate the payments API issues right away. Let me start by checking the pod status in the production namespace.', state: 'complete', timestamp: new Date(Date.now() - 3595000), thinking: 'The user is reporting 500 errors on payments API. I should check pod health first, then look at logs, resource usage, and recent deployments.' },
  { id: 'd3', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3590000), toolCall: { name: 'kubectl get pods', args: { namespace: 'production', selector: 'app=payments-api' }, status: 'success', result: `NAME                            READY   STATUS             RESTARTS      AGE
payments-api-7b9f4c8d6-abc12   1/1     Running            0             2d
payments-api-7b9f4c8d6-def34   0/1     CrashLoopBackOff   14 (2m ago)   2d
payments-api-7b9f4c8d6-ghi56   1/1     Running            0             2d
payments-api-7b9f4c8d6-jkl78   0/1     OOMKilled          8 (5m ago)    2d` } },
  { id: 'd4', role: 'assistant', content: `Found the problem — **2 out of 4 pods are unhealthy**:

- \`payments-api-...-def34\` is in **CrashLoopBackOff** with 14 restarts
- \`payments-api-...-jkl78\` was **OOMKilled** with 8 restarts

This means only 2 pods are serving traffic, which explains the 500 errors under load. Let me check the resource limits and recent logs.`, state: 'complete', timestamp: new Date(Date.now() - 3585000) },
  { id: 'd5', role: 'user', content: 'That looks bad. What are the current resource limits?', state: 'complete', timestamp: new Date(Date.now() - 3580000) },
  { id: 'd6', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3575000), toolCall: { name: 'kubectl describe deployment', args: { name: 'payments-api', namespace: 'production' }, status: 'success', result: `Containers:
  payments-api:
    Image:      registry.internal/payments-api:v3.2.1
    Port:       8080/TCP
    Resources:
      Limits:
        cpu:     500m
        memory:  256Mi
      Requests:
        cpu:     250m
        memory:  128Mi
    Liveness:    http-get http://:8080/healthz delay=10s timeout=5s period=15s
    Readiness:   http-get http://:8080/ready delay=5s timeout=3s period=10s` } },
  { id: 'd7', role: 'assistant', content: `The resource limits look quite tight:

| Resource | Request | Limit |
|----------|---------|-------|
| CPU | 250m | 500m |
| Memory | 128Mi | **256Mi** |

A **256Mi memory limit** for a payments API handling production traffic is very low. The OOMKilled status confirms pods are exceeding this limit. Let me check the actual memory usage and logs.`, state: 'complete', timestamp: new Date(Date.now() - 3570000) },
  { id: 'd8', role: 'user', content: 'Yes, please check the logs from the crashing pod.', state: 'complete', timestamp: new Date(Date.now() - 3565000) },

  // --- Phase 2: Investigation (9-18) ---
  { id: 'd9', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3560000), toolCall: { name: 'kubectl logs', args: { pod: 'payments-api-7b9f4c8d6-def34', namespace: 'production', previous: true, tail: 50 }, status: 'success', result: `2024-01-15T10:23:41Z INFO  Starting payments-api v3.2.1
2024-01-15T10:23:42Z INFO  Connected to PostgreSQL (pool_size=20)
2024-01-15T10:23:42Z INFO  Connected to Redis cache
2024-01-15T10:23:43Z INFO  Listening on :8080
2024-01-15T10:24:15Z WARN  Memory usage: 198Mi / 256Mi (77%)
2024-01-15T10:24:45Z WARN  Memory usage: 221Mi / 256Mi (86%)
2024-01-15T10:25:02Z ERROR Connection pool exhausted, 47 pending requests
2024-01-15T10:25:15Z WARN  Memory usage: 244Mi / 256Mi (95%)
2024-01-15T10:25:18Z ERROR java.lang.OutOfMemoryError: GC overhead limit exceeded
2024-01-15T10:25:18Z ERROR   at com.payments.cache.TransactionCache.processBatch(TransactionCache.java:142)
2024-01-15T10:25:18Z ERROR   at com.payments.worker.BatchProcessor.run(BatchProcessor.java:89)
2024-01-15T10:25:18Z FATAL Shutting down due to unrecoverable error` } },
  { id: 'd10', role: 'assistant', content: `The logs reveal the root cause — a **memory leak in the transaction cache**:

1. Memory climbs from 77% to 95% within 90 seconds
2. \`TransactionCache.processBatch()\` is the offending code path
3. The connection pool gets exhausted (47 pending requests) as GC pressure increases
4. Eventually hits \`OutOfMemoryError: GC overhead limit exceeded\`

This looks like the \`BatchProcessor\` is holding references to processed transactions instead of releasing them. The 256Mi limit just makes it crash faster.

### Immediate Actions Needed

1. **Increase memory limits** to stop the bleeding (512Mi or 1Gi)
2. **Investigate the memory leak** in \`TransactionCache.processBatch()\`
3. **Scale up** to handle the backlog while we fix`, state: 'complete', timestamp: new Date(Date.now() - 3550000) },
  { id: 'd11', role: 'user', content: 'Let\'s increase the memory first to stabilize, then we can investigate the leak.', state: 'complete', timestamp: new Date(Date.now() - 3545000) },
  { id: 'd12', role: 'assistant', content: 'Good call. I\'ll patch the deployment to increase memory limits to 512Mi (request) and 1Gi (limit). This gives enough headroom while we investigate the leak.', state: 'complete', timestamp: new Date(Date.now() - 3540000), thinking: 'The user wants to stabilize first. I should increase the memory limit significantly — 1Gi gives 4x the current limit. I should also increase the request to 512Mi so the scheduler places pods on nodes with enough memory.' },
  { id: 'd13', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3535000), toolCall: { name: 'kubectl apply', args: { file: 'inline-patch' }, status: 'success', result: `deployment.apps/payments-api patched
---
Applied patch:
spec:
  template:
    spec:
      containers:
      - name: payments-api
        resources:
          requests:
            cpu: "250m"
            memory: "512Mi"
          limits:
            cpu: "1"
            memory: "1Gi"` } },
  { id: 'd14', role: 'assistant', content: `Deployment patched. Kubernetes is now performing a rolling update with the new resource limits:

\`\`\`yaml
resources:
  requests:
    cpu: "250m"
    memory: "512Mi"   # was 128Mi
  limits:
    cpu: "1"          # was 500m
    memory: "1Gi"     # was 256Mi
\`\`\`

The rolling update will create new pods with the higher limits before terminating the old ones. Let me also set up an HPA to auto-scale based on memory pressure.`, state: 'complete', timestamp: new Date(Date.now() - 3530000) },
  { id: 'd15', role: 'user', content: 'Good idea. What should the HPA targets be?', state: 'complete', timestamp: new Date(Date.now() - 3525000) },
  { id: 'd16', role: 'assistant', content: `For a payments API with a known memory leak, I recommend:

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: payments-api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: payments-api
  minReplicas: 4
  maxReplicas: 12
  metrics:
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 75
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 2
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
\`\`\`

Key decisions:
- **min 4 replicas** — maintains HA even if 2 pods restart
- **memory target 70%** — scales up before OOM risk
- **scale-down stabilization 5min** — prevents flapping during traffic spikes
- **max 12** — cost guardrail`, state: 'complete', timestamp: new Date(Date.now() - 3520000) },
  { id: 'd17', role: 'user', content: 'Apply that HPA config please.', state: 'complete', timestamp: new Date(Date.now() - 3515000) },
  { id: 'd18', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3510000), toolCall: { name: 'kubectl apply', args: { resource: 'HorizontalPodAutoscaler' }, status: 'success', result: 'horizontalpodautoscaler.autoscaling/payments-api-hpa created' } },

  // --- Phase 3: Fix & Network (19-28) ---
  { id: 'd19', role: 'assistant', content: 'HPA created. Now let me check the network policies — we should make sure the new pods can reach the database and cache.', state: 'complete', timestamp: new Date(Date.now() - 3505000) },
  { id: 'd20', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3500000), toolCall: { name: 'kubectl get networkpolicies', args: { namespace: 'production' }, status: 'success', result: `NAME                    POD-SELECTOR         AGE
allow-payments-egress   app=payments-api     45d
allow-payments-ingress  app=payments-api     45d
default-deny-all        <none>               120d
allow-monitoring        app=prometheus       90d` } },
  { id: 'd21', role: 'assistant', content: `Network policies look good — the \`allow-payments-egress\` and \`allow-payments-ingress\` policies are already in place and use label selectors, so new pods will automatically match.

Let me check the rollout status.`, state: 'complete', timestamp: new Date(Date.now() - 3495000) },
  { id: 'd22', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3490000), toolCall: { name: 'kubectl rollout status', args: { deployment: 'payments-api', namespace: 'production' }, status: 'success', result: `Waiting for deployment "payments-api" rollout to finish: 2 of 4 updated replicas are available...
Waiting for deployment "payments-api" rollout to finish: 3 of 4 updated replicas are available...
deployment "payments-api" successfully rolled out` } },
  { id: 'd23', role: 'assistant', content: 'Rollout complete — all 4 pods are running with the new resource limits. Let me verify the pods are healthy.', state: 'complete', timestamp: new Date(Date.now() - 3485000) },
  { id: 'd24', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3480000), toolCall: { name: 'kubectl get pods', args: { namespace: 'production', selector: 'app=payments-api' }, status: 'success', result: `NAME                            READY   STATUS    RESTARTS   AGE
payments-api-5c8d9f7a2-mn01    1/1     Running   0          3m
payments-api-5c8d9f7a2-op23    1/1     Running   0          2m
payments-api-5c8d9f7a2-qr45    1/1     Running   0          2m
payments-api-5c8d9f7a2-st67    1/1     Running   0          1m` } },
  { id: 'd25', role: 'assistant', content: 'All 4 new pods are **Running** with 0 restarts. The new pod names confirm the rolling update replaced all old pods.', state: 'complete', timestamp: new Date(Date.now() - 3475000) },
  { id: 'd26', role: 'user', content: 'Great! Are the 500 errors gone now?', state: 'complete', timestamp: new Date(Date.now() - 3470000) },
  { id: 'd27', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3465000), toolCall: { name: 'kubectl logs', args: { deployment: 'payments-api', namespace: 'production', since: '5m', grep: 'ERROR' }, status: 'success', result: `(no matching log entries)` } },
  { id: 'd28', role: 'assistant', content: `No errors in the last 5 minutes — the 500s have stopped. The pods are now running with 4x the memory, so the leak will take much longer to cause issues.

However, **this is a temporary fix**. The memory leak in \`TransactionCache.processBatch()\` still needs to be addressed. Without a fix, pods will eventually hit 1Gi and get OOMKilled again — just less frequently.`, state: 'complete', timestamp: new Date(Date.now() - 3460000) },

  // --- Phase 4: Verification (29-38) ---
  { id: 'd29', role: 'user', content: 'Can you run a health check across the whole production namespace?', state: 'complete', timestamp: new Date(Date.now() - 3455000) },
  { id: 'd30', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3450000), toolCall: { name: 'kubectl get pods', args: { namespace: 'production', output: 'wide' }, status: 'success', result: `NAME                            READY   STATUS    RESTARTS   AGE    NODE
payments-api-5c8d9f7a2-mn01    1/1     Running   0          8m     worker-1
payments-api-5c8d9f7a2-op23    1/1     Running   0          7m     worker-2
payments-api-5c8d9f7a2-qr45    1/1     Running   0          7m     worker-3
payments-api-5c8d9f7a2-st67    1/1     Running   0          6m     worker-1
auth-service-6a7b8c9d0-uv12    1/1     Running   0          5d     worker-2
auth-service-6a7b8c9d0-wx34    1/1     Running   0          5d     worker-3
notification-svc-3e4f5a-yz56   1/1     Running   0          3d     worker-1
notification-svc-3e4f5a-ab78   1/1     Running   0          3d     worker-2
postgres-0                      1/1     Running   0          14d    worker-3
postgres-1                      1/1     Running   0          14d    worker-1
redis-master-0                  1/1     Running   0          30d    worker-2
redis-replica-0                 1/1     Running   0          30d    worker-3
redis-replica-1                 1/1     Running   0          30d    worker-1` } },
  { id: 'd31', role: 'assistant', content: `All **13 pods** across the production namespace are **Running** and **Ready**:

| Service | Pods | Status |
|---------|------|--------|
| payments-api | 4 | All healthy (new pods) |
| auth-service | 2 | Healthy (5d uptime) |
| notification-svc | 2 | Healthy (3d uptime) |
| postgres | 2 | Healthy (14d uptime) |
| redis | 3 | Healthy (30d uptime) |

Pods are well-distributed across all 3 worker nodes. No single node is overloaded.`, state: 'complete', timestamp: new Date(Date.now() - 3445000) },
  { id: 'd32', role: 'user', content: 'What does the current memory usage look like on the payments pods?', state: 'complete', timestamp: new Date(Date.now() - 3440000) },
  { id: 'd33', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3435000), toolCall: { name: 'kubectl top pods', args: { namespace: 'production', selector: 'app=payments-api' }, status: 'success', result: `NAME                            CPU(cores)   MEMORY(bytes)
payments-api-5c8d9f7a2-mn01    124m         287Mi
payments-api-5c8d9f7a2-op23    98m          245Mi
payments-api-5c8d9f7a2-qr45    115m         268Mi
payments-api-5c8d9f7a2-st67    87m          231Mi` } },
  { id: 'd34', role: 'assistant', content: `Current memory usage across payment pods:

- **mn01**: 287Mi / 1Gi (28%)
- **op23**: 245Mi / 1Gi (24%)
- **qr45**: 268Mi / 1Gi (26%)
- **st67**: 231Mi / 1Gi (23%)

Average: ~258Mi — this is already **above the old 256Mi limit**, confirming those pods would have been OOMKilled immediately. With the new 1Gi limit, they have plenty of headroom.

> **Watch for**: Memory climbing steadily over hours. If you see pods approaching 700Mi+, the leak is progressing and you should prioritize the code fix.`, state: 'complete', timestamp: new Date(Date.now() - 3430000) },
  { id: 'd35', role: 'user', content: 'Can you check the HPA status?', state: 'complete', timestamp: new Date(Date.now() - 3425000) },
  { id: 'd36', role: 'assistant', content: '', state: 'complete', timestamp: new Date(Date.now() - 3420000), toolCall: { name: 'kubectl describe hpa', args: { name: 'payments-api-hpa', namespace: 'production' }, status: 'success', result: `Name:                          payments-api-hpa
Namespace:                     production
Reference:                     Deployment/payments-api
Metrics:                       ( current / target )
  resource memory on pods:     25% / 70%
  resource cpu on pods:        21% / 75%
Min replicas:                  4
Max replicas:                  12
Deployment pods:               4 current / 4 desired
Conditions:
  AbleToScale:   True
  ScalingActive: False (current replicas within target range)` } },
  { id: 'd37', role: 'assistant', content: `HPA is active and healthy:

- **Memory**: 25% / 70% target — well within range
- **CPU**: 21% / 75% target — plenty of headroom
- **Replicas**: 4 current / 4 desired — no scaling needed right now
- **ScalingActive**: False — means the current replica count satisfies all metric targets

The HPA will kick in if memory rises above 70% average (~717Mi per pod) or CPU above 75%.`, state: 'complete', timestamp: new Date(Date.now() - 3415000) },
  { id: 'd38', role: 'user', content: 'Perfect. Can you write up an incident report summary of what happened and what we did?', state: 'complete', timestamp: new Date(Date.now() - 3410000) },

  // --- Phase 5: Final streaming message (39-40) ---
  { id: 'd39', role: 'assistant', content: 'Let me compile the incident report.', state: 'complete', timestamp: new Date(Date.now() - 3405000), thinking: 'The user wants a comprehensive incident report. I should cover: timeline, root cause, impact, remediation steps taken, and follow-up actions needed. I\'ll format it as a proper incident report with sections.' },
  { id: 'd40', role: 'assistant', content: `## Incident Report: Payments API 500 Errors

### Summary
Production payments API experienced intermittent 500 errors due to pods crashing from memory exhaustion (OOMKilled) and entering CrashLoopBackOff state.

### Timeline
| Time | Event |
|------|-------|
| T+0 | 500 errors reported on payments API |
| T+5m | Investigation: 2/4 pods unhealthy (CrashLoopBackOff + OOMKilled) |
| T+10m | Root cause identified: memory leak in \`TransactionCache.processBatch()\` |
| T+15m | Memory limits increased from 256Mi → 1Gi |
| T+18m | Rolling update completed, all 4 pods healthy |
| T+20m | HPA configured (min 4, max 12, memory target 70%) |
| T+25m | Verified: 0 errors, all pods healthy, HPA active |

### Root Cause
The \`TransactionCache.processBatch()\` method in payments-api v3.2.1 retains references to processed transaction objects, causing a **memory leak**. With the original 256Mi limit, pods would OOM within ~90 seconds of sustained traffic. The leak manifests as:

1. Gradual memory increase from baseline ~200Mi
2. GC overhead exceeds limits at ~244Mi
3. \`OutOfMemoryError: GC overhead limit exceeded\`
4. Pod killed by kubelet (OOMKilled), Kubernetes restarts it
5. After repeated restarts → CrashLoopBackOff with exponential backoff

### Impact
- **Duration**: ~20 minutes of degraded service
- **Severity**: High — 50% of pods unavailable
- **User impact**: Intermittent 500 errors on payment processing endpoints
- **Data loss**: None confirmed — transactions are idempotent

### Remediation Applied
1. **Increased resource limits**: memory 256Mi → 1Gi, CPU 500m → 1 core
2. **Increased resource requests**: memory 128Mi → 512Mi
3. **Deployed HPA**: auto-scales 4–12 replicas based on memory (70%) and CPU (75%)
4. **Verified**: all pods healthy, no errors, HPA active

### Follow-up Actions
- [ ] **P1**: Fix memory leak in \`TransactionCache.processBatch()\` (Engineering)
- [ ] **P2**: Add memory usage alerting at 60% of limit (SRE)
- [ ] **P2**: Review resource limits for all production deployments (SRE)
- [ ] **P3**: Add heap dump on OOM for faster debugging (Engineering)
- [ ] **P3**: Post-mortem meeting scheduled for next sprint (Team)`, state: 'streaming', timestamp: new Date(Date.now() - 3400000) },
];

const INCIDENT_REPORT_CONTENT = DEBUG_SESSION_MESSAGES[DEBUG_SESSION_MESSAGES.length - 1]!.content;

function LongDebugSessionComponent() {
  const listRef = useRef<ChatMessageListHandle>(null);
  const [messages] = useState<DebugMsg[]>(() => {
    // All messages complete except the last one which will stream
    return DEBUG_SESSION_MESSAGES.map((msg, i) =>
      i === DEBUG_SESSION_MESSAGES.length - 1
        ? { ...msg, state: 'streaming' as const, content: '' }
        : msg,
    );
  });
  const [streamingContent, setStreamingContent] = useState('');
  const [streamComplete, setStreamComplete] = useState(false);

  // Start streaming the final message on mount
  const streamRef = useRef(false);
  useEffect(() => {
    if (streamRef.current) return;
    streamRef.current = true;

    let cancelled = false;
    (async () => {
      // Small delay before streaming starts
      await new Promise((r) => setTimeout(r, 500));
      const gen = simulateStream(INCIDENT_REPORT_CONTENT, 6, 6);
      let accumulated = '';
      for await (const chunk of gen) {
        if (cancelled) break;
        accumulated += chunk;
        setStreamingContent(accumulated);
        listRef.current?.scrollToBottom();
      }
      if (!cancelled) {
        setStreamComplete(true);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const renderMessage = useCallback(
    (index: number) => {
      const msg = messages[index]!;
      const isLastMessage = index === messages.length - 1;

      return (
        <ChatBubble
          role={msg.role}
          avatar={
            <ChatAvatar
              role={msg.role}
              name={msg.role === 'user' ? 'DevOps Engineer' : 'Claude'}
            />
          }
          timestamp={msg.state === 'complete' || streamComplete ? msg.timestamp : undefined}
        >
          {/* Thinking block */}
          {msg.thinking && (
            <ThinkingBlock content={msg.thinking} duration={1800} />
          )}

          {/* Tool call with result */}
          {msg.toolCall && (
            <ToolCall
              name={msg.toolCall.name}
              status={msg.toolCall.status === 'success' ? 'success' : 'error'}
              arguments={msg.toolCall.args}
              duration={Math.floor(Math.random() * 400) + 100}
              defaultExpanded
            >
              {msg.toolCall.result && (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {msg.toolCall.result}
                </pre>
              )}
            </ToolCall>
          )}

          {/* User message: plain text */}
          {msg.role === 'user' && msg.content}

          {/* Assistant message with markdown content */}
          {msg.role === 'assistant' && !msg.toolCall && isLastMessage && !streamComplete && (
            <AIMarkdown content={streamingContent || ' '} />
          )}
          {msg.role === 'assistant' && !msg.toolCall && isLastMessage && streamComplete && (
            <AIMarkdown content={INCIDENT_REPORT_CONTENT} />
          )}
          {msg.role === 'assistant' && !msg.toolCall && !isLastMessage && msg.content && (
            <AIMarkdown content={msg.content} />
          )}
        </ChatBubble>
      );
    },
    [messages, streamingContent, streamComplete],
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 800,
        maxWidth: 780,
        border: '1px solid var(--ov-color-border-default, #e2e8f0)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--ov-color-bg-default)',
      }}
    >
      <AIConversationHeader
        title="Production Incident Debug"
        model="Claude 4 Opus"
        onNewChat={() => {}}
        onSettings={() => {}}
      />

      <ChatMessageList
        ref={listRef}
        count={messages.length}
        estimateSize={150}
        renderItem={renderMessage}
        autoScroll
        style={{ flex: 1, minHeight: 0, padding: '8px 16px' }}
      />

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--ov-color-border-default, #e2e8f0)',
          display: 'flex',
          justifyContent: 'center',
          fontSize: 13,
          color: 'var(--ov-color-text-muted, #64748b)',
        }}
      >
        {streamComplete
          ? '40 messages — scroll to explore virtualized list'
          : 'Streaming incident report...'}
      </div>
    </div>
  );
}

export const LongDebugSession: StoryObj = {
  render: () => <LongDebugSessionComponent />,
};

// ---------------------------------------------------------------------------
// 10. ReasoningShowcase — Fully streamed AI response simulation
//
// Models how a real thinking model works:
//   1. Thinking tokens stream in incrementally (ThinkingBlock.stream)
//   2. Chain-of-thought steps are discovered one at a time (not known upfront)
//   3. Each step starts active, then completes with results
//   4. Final response streams in token by token
// ---------------------------------------------------------------------------

type ReasoningPhase = 'idle' | 'thinking' | 'reasoning' | 'responding' | 'complete';

const THINKING_CONTENT = `The user reports intermittent latency spikes on API gateway. I need to consider multiple potential causes:

1. Resource contention — check if pods are hitting CPU/memory limits
2. Network issues — DNS resolution, service mesh overhead, network policies
3. Upstream dependencies — database connection pool exhaustion, slow external APIs
4. Configuration — HPA flapping, readiness probe timeouts, connection limits
5. Infrastructure — node-level issues, disk I/O, kernel parameters

Let me structure my investigation to check the most common causes first, then work through the less obvious ones. I should look at pod metrics, check envoy/istio sidecar logs, and examine the gateway's request latency distribution.`;

/** A step as it evolves through discovery — starts with just a label,
 *  then gains description and tags as the model finishes investigating. */
interface DiscoveredStep {
  label: string;
  status: 'active' | 'complete';
  /** Only set once the step completes */
  description?: string;
  /** Only set once the step completes */
  tags?: string[];
}

/** Static config for the simulation — what each step looks like when complete */
interface StepConfig {
  label: string;
  description: string;
  tags?: string[];
  /** ms the step stays "active" (simulates investigation time) */
  activeDuration: number;
}

const REASONING_STEPS: StepConfig[] = [
  {
    label: 'Checking API gateway pod metrics',
    description: 'Retrieved CPU, memory, and network metrics for the last 6 hours',
    tags: ['CPU: 78% avg', 'Memory: 2.1Gi/4Gi', 'P99 latency: 4.2s'],
    activeDuration: 1200,
  },
  {
    label: 'Analyzing envoy sidecar logs',
    description: 'Found upstream connection timeouts correlating with latency spikes',
    tags: ['upstream_cx_connect_timeout', 'upstream_rq_retry', '503 responses'],
    activeDuration: 1500,
  },
  {
    label: 'Checking database connection pool',
    description: 'Connection pool exhausted during peak traffic — max_connections=25, active=25',
    tags: ['PostgreSQL', 'pgbouncer', 'connection_wait_time: 3.8s'],
    activeDuration: 1300,
  },
  {
    label: 'Reviewing HPA configuration',
    description: 'HPA scale-up delay of 5 minutes too slow for traffic bursts',
    activeDuration: 800,
  },
  {
    label: 'Correlating with deployment events',
    description: 'Latency spikes started after v2.14.0 release — introduced new database query in hot path',
    activeDuration: 1000,
  },
  {
    label: 'Formulating recommendations',
    description: 'Preparing remediation plan based on root cause analysis',
    activeDuration: 600,
  },
];

const FINAL_RESPONSE = `## Root Cause Analysis

The intermittent latency spikes are caused by **database connection pool exhaustion** during peak traffic periods, exacerbated by a new query introduced in v2.14.0.

### Contributing Factors

1. **Connection pool too small** — \`max_connections=25\` is insufficient for current load
2. **New hot-path query** — v2.14.0 added an unoptimized JOIN in the auth middleware
3. **HPA too slow** — 5-minute stabilization window misses short traffic bursts

### Recommended Fix

\`\`\`yaml
# 1. Increase connection pool
apiVersion: v1
kind: ConfigMap
metadata:
  name: pgbouncer-config
data:
  default_pool_size: "50"
  max_client_conn: "200"
\`\`\`

\`\`\`sql
-- 2. Add missing index for the new query
CREATE INDEX CONCURRENTLY idx_users_org_active
  ON users (organization_id, is_active)
  WHERE is_active = true;
\`\`\`

| Metric | Before | After (expected) |
|--------|--------|-------------------|
| P99 Latency | 4.2s | < 200ms |
| Connection Pool | 25 (saturated) | 50 (headroom) |
| HPA Response | 5 min | 60 sec |

- [ ] Increase pgbouncer pool size to 50
- [ ] Add database index for the new auth query
- [ ] Reduce HPA stabilization window to 60 seconds
- [ ] Add connection pool metrics to monitoring dashboard`;

function ReasoningShowcaseComponent() {
  const [phase, setPhase] = useState<ReasoningPhase>('idle');
  // Thinking — uses stream prop (tokens arrive incrementally, just like a real model)
  const [thinkingStream, setThinkingStream] = useState<AsyncIterable<string> | undefined>(undefined);
  // Steps — only discovered steps exist; they appear one at a time
  const [steps, setSteps] = useState<DiscoveredStep[]>([]);
  // Response — streams in token by token
  const [responseStream, setResponseStream] = useState<AsyncIterable<string> | undefined>(undefined);
  const [showAssistant, setShowAssistant] = useState(false);
  const cancelRef = useRef(false);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setPhase('idle');
    setThinkingStream(undefined);
    setSteps([]);
    setResponseStream(undefined);
    setShowAssistant(false);
    setTimeout(() => { cancelRef.current = false; }, 50);
  }, []);

  const runSequence = useCallback(async () => {
    cancelRef.current = false;
    const cancelled = () => cancelRef.current;

    // Phase 1: Thinking — stream tokens in (slow, deliberate pace like real thinking)
    setPhase('thinking');
    setShowAssistant(true);
    setSteps([]);
    setResponseStream(undefined);

    // Create a thinking stream that we also await completion of
    let resolveThinking: () => void;
    const thinkingDone = new Promise<void>((r) => { resolveThinking = r; });

    const thinkingGen = simulateStream(THINKING_CONTENT, 3, 12);
    async function* thinkingWithSignal(): AsyncGenerator<string> {
      for await (const chunk of thinkingGen) {
        if (cancelled()) return;
        yield chunk;
      }
      resolveThinking!();
    }
    setThinkingStream(thinkingWithSignal());

    // Wait for thinking to finish
    await thinkingDone;
    if (cancelled()) return;

    // Brief pause — model transitions from thinking to acting
    await new Promise((r) => setTimeout(r, 500));
    if (cancelled()) return;

    // Phase 2: Chain of thought — steps are discovered one at a time
    // The model doesn't know all steps upfront; each step is discovered
    // after the previous one completes.
    setPhase('reasoning');

    for (let i = 0; i < REASONING_STEPS.length; i++) {
      if (cancelled()) return;
      const config = REASONING_STEPS[i]!;

      // Step discovered — appears as "active" with just a label (no results yet)
      setSteps((prev) => [...prev, { label: config.label, status: 'active' }]);

      // Simulate investigation time
      await new Promise((r) => setTimeout(r, config.activeDuration));
      if (cancelled()) return;

      // Step completes — results (description, tags) are now available
      setSteps((prev) =>
        prev.map((s, j) =>
          j === i
            ? { ...s, status: 'complete' as const, description: config.description, tags: config.tags }
            : s,
        ),
      );
    }

    // Brief pause before response
    await new Promise((r) => setTimeout(r, 400));
    if (cancelled()) return;

    // Phase 3: Stream the final response
    setPhase('responding');
    const responseGen = simulateStream(FINAL_RESPONSE, 5, 10);

    async function* responseWithSignal(): AsyncGenerator<string> {
      for await (const chunk of responseGen) {
        if (cancelled()) return;
        yield chunk;
      }
      if (!cancelled()) {
        setPhase('complete');
      }
    }

    setResponseStream(responseWithSignal());
  }, []);

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* User message — always visible */}
      <ChatBubble
        role="user"
        avatar={<ChatAvatar role="user" name="Josh" />}
        timestamp={new Date(Date.now() - 120000)}
      >
        Our Kubernetes cluster has been experiencing intermittent latency spikes on the API gateway.
        Can you investigate the root cause and suggest a fix?
      </ChatBubble>

      {/* Assistant response — appears once sequence starts */}
      {showAssistant && (
        <ChatBubble
          role="assistant"
          avatar={<ChatAvatar role="assistant" name="Claude" />}
          timestamp={phase === 'complete' ? new Date(Date.now() - 90000) : undefined}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* ThinkingBlock — uses stream prop, tokens arrive incrementally.
                Auto-opens while streaming, auto-closes when done. Duration is
                measured automatically by the component. */}
            {thinkingStream && (
              <ThinkingBlock
                stream={thinkingStream}
                autoClose
                autoCloseDelay={800}
              />
            )}

            {/* ChainOfThought — steps appear incrementally as discovered.
                Only steps that exist in state are rendered (no pending placeholders). */}
            {steps.length > 0 && (
              <ChainOfThought defaultOpen header="Investigating latency spikes">
                {steps.map((step) => (
                  <ChainOfThoughtStep
                    key={step.label}
                    label={step.label}
                    description={step.description}
                    status={step.status}
                  >
                    {step.tags && (
                      <ChainOfThoughtSearchResults>
                        {step.tags.map((tag) => (
                          <ChainOfThoughtSearchResult key={tag} label={tag} />
                        ))}
                      </ChainOfThoughtSearchResults>
                    )}
                  </ChainOfThoughtStep>
                ))}
              </ChainOfThought>
            )}

            {/* Final response — streams in token by token */}
            {responseStream && (
              <AIMarkdown stream={responseStream} />
            )}
          </div>
        </ChatBubble>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={phase === 'idle' || phase === 'complete' ? runSequence : reset}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid var(--ov-color-border-default)',
            background: 'var(--ov-color-bg-surface)',
            color: 'var(--ov-color-fg-default)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {phase === 'idle' ? 'Start AI Response' : phase === 'complete' ? 'Replay' : 'Reset'}
        </button>
        <span style={{ fontSize: 12, color: 'var(--ov-color-fg-muted, #64748b)' }}>
          {phase === 'idle' && 'Click to simulate a full AI response flow'}
          {phase === 'thinking' && 'Thinking...'}
          {phase === 'reasoning' && `Investigating (${steps.filter((s) => s.status === 'complete').length}/${steps.length} steps)`}
          {phase === 'responding' && 'Streaming response...'}
          {phase === 'complete' && 'Complete'}
        </span>
      </div>
    </div>
  );
}

export const ReasoningShowcase: StoryObj = {
  render: () => <ReasoningShowcaseComponent />,
};
