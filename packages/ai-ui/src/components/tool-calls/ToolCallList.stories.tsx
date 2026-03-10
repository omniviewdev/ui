import { useState, useEffect, useCallback, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToolCallList, type ToolCallListItem } from './ToolCallList';
import { ToolCall } from './ToolCall';
import { StreamingText } from '../streaming/StreamingText';

const meta: Meta<typeof ToolCallList> = {
  title: 'AI/ToolCalls/ToolCallList',
  component: ToolCallList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    calls: [
      { id: '1', name: 'read_file', status: 'success' as const, duration: 120 },
      { id: '2', name: 'search_code', status: 'success' as const, duration: 340 },
      { id: '3', name: 'write_file', status: 'running' as const },
      { id: '4', name: 'run_tests', status: 'pending' as const },
    ],
  },
};

export const AllComplete: Story = {
  args: {
    calls: [
      { id: '1', name: 'read_file', status: 'success' as const, duration: 100 },
      { id: '2', name: 'analyze', status: 'success' as const, duration: 500 },
      { id: '3', name: 'write_file', status: 'success' as const, duration: 80 },
    ],
  },
};

export const WithError: Story = {
  args: {
    calls: [
      { id: '1', name: 'read_file', status: 'success' as const, duration: 100 },
      { id: '2', name: 'delete_file', status: 'error' as const, duration: 30 },
    ],
  },
};

export const WithResults: Story = {
  args: {
    calls: [
      {
        id: '1',
        name: 'kubectl get pods',
        status: 'success' as const,
        duration: 340,
        expanded: true,
        result: (
          <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
{`NAME                         READY   STATUS    RESTARTS   AGE
api-server-7b9f4c8d6-abc12  1/1     Running   0          2d
api-server-7b9f4c8d6-def34  1/1     Running   0          2d
worker-5d8f9a3b2-ghi56      1/1     Running   0          5h`}
          </pre>
        ),
        resultStatus: 'success' as const,
      },
      {
        id: '2',
        name: 'kubectl logs',
        status: 'error' as const,
        duration: 120,
        expanded: true,
        result: 'Error from server: container "app" in pod "api-server-7b9f4c8d6-abc12" is waiting to start: CrashLoopBackOff',
        resultStatus: 'error' as const,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Helper: simulate a stream that emits lines of text with delays
// ---------------------------------------------------------------------------

function createLineStream(lines: string[], lineDelay = 200): AsyncIterable<string> {
  return {
    [Symbol.asyncIterator]() {
      let index = 0;
      return {
        async next() {
          if (index >= lines.length) return { done: true, value: undefined };
          await new Promise((r) => setTimeout(r, index === 0 ? 0 : lineDelay));
          const line = lines[index]!;
          index++;
          return { done: false, value: index === 1 ? line : '\n' + line };
        },
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Animated — realistic agentic tool call lifecycle with streaming results
// ---------------------------------------------------------------------------

interface ToolStep {
  name: string;
  args: Record<string, unknown>;
  /** Time before result starts streaming (simulates network/exec latency) */
  startDelay: number;
  /** Lines of output that stream in one at a time */
  outputLines: string[];
  /** Delay between each output line */
  lineDelay: number;
  /** Whether this tool call errors */
  error?: boolean;
}

const TOOL_STEPS: ToolStep[] = [
  {
    name: 'kubectl get pods',
    args: { namespace: 'production', selector: 'app=payments-api' },
    startDelay: 400,
    lineDelay: 80,
    outputLines: [
      'NAME                            READY   STATUS             RESTARTS   AGE',
      'payments-api-7b9f4c8d6-abc12   1/1     Running            0          3d',
      'payments-api-7b9f4c8d6-def34   0/1     CrashLoopBackOff   14         3d',
      'payments-api-7b9f4c8d6-ghi56   1/1     Running            0          3d',
    ],
  },
  {
    name: 'kubectl describe pod',
    args: { pod: 'payments-api-7b9f4c8d6-def34', namespace: 'production' },
    startDelay: 300,
    lineDelay: 60,
    outputLines: [
      'Containers:',
      '  payments-api:',
      '    State:       Waiting',
      '      Reason:    CrashLoopBackOff',
      '    Last State:  Terminated',
      '      Reason:    OOMKilled',
      '      Exit Code: 137',
      '    Limits:',
      '      memory: 256Mi',
      '    Requests:',
      '      memory: 128Mi',
    ],
  },
  {
    name: 'kubectl logs',
    args: { pod: 'payments-api-7b9f4c8d6-def34', previous: true, tail: 10 },
    startDelay: 500,
    lineDelay: 120,
    outputLines: [
      '2024-01-15T10:23:41Z INFO  Starting payments-api v3.2.1',
      '2024-01-15T10:23:42Z INFO  Loading payment processors...',
      '2024-01-15T10:23:43Z INFO  Connected to database (pool: 10)',
      '2024-01-15T10:24:15Z WARN  Memory usage at 89% of limit',
      '2024-01-15T10:24:30Z WARN  GC pressure: 94% time in GC',
      '2024-01-15T10:24:38Z ERROR java.lang.OutOfMemoryError: Java heap space',
      '2024-01-15T10:24:38Z FATAL Process terminated',
    ],
  },
  {
    name: 'kubectl apply',
    args: { file: 'memory-limit-patch.yaml' },
    startDelay: 200,
    lineDelay: 150,
    outputLines: [
      'deployment.apps/payments-api configured',
    ],
  },
  {
    name: 'kubectl rollout status',
    args: { deployment: 'payments-api', namespace: 'production' },
    startDelay: 300,
    lineDelay: 600,
    outputLines: [
      'Waiting for deployment "payments-api" rollout to finish: 0 of 3 updated replicas are available...',
      'Waiting for deployment "payments-api" rollout to finish: 1 of 3 updated replicas are available...',
      'Waiting for deployment "payments-api" rollout to finish: 2 of 3 updated replicas are available...',
      'deployment "payments-api" successfully rolled out',
    ],
  },
  {
    name: 'kubectl get pods',
    args: { namespace: 'production', selector: 'app=payments-api', output: 'wide' },
    startDelay: 300,
    lineDelay: 60,
    outputLines: [
      'NAME                            READY   STATUS    RESTARTS   AGE   NODE',
      'payments-api-8c4d5e7f1-jkl89   1/1     Running   0          45s   node-1',
      'payments-api-8c4d5e7f1-mno12   1/1     Running   0          42s   node-2',
      'payments-api-8c4d5e7f1-pqr34   1/1     Running   0          39s   node-3',
    ],
  },
];

type AnimatedCall = ToolCallListItem & { stream?: AsyncIterable<string> };

function AnimatedToolCalls() {
  const [calls, setCalls] = useState<AnimatedCall[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const cancelledRef = useRef(false);

  const startRun = useCallback(() => {
    cancelledRef.current = false;
    setCalls([]);
    setStepIndex(0);
    setPhase('running');
  }, []);

  useEffect(() => {
    if (phase !== 'running' || stepIndex >= TOOL_STEPS.length) {
      if (phase === 'running' && stepIndex >= TOOL_STEPS.length) {
        setPhase('done');
      }
      return;
    }

    const step = TOOL_STEPS[stepIndex]!;
    const callId = String(stepIndex + 1);
    const startTime = Date.now();

    // Add as "running" — no result yet
    setCalls((prev) => [
      ...prev,
      { id: callId, name: step.name, status: 'running', arguments: step.args },
    ]);

    // After startDelay, begin streaming the output
    const streamTimer = setTimeout(() => {
      if (cancelledRef.current) return;

      const stream = createLineStream(step.outputLines, step.lineDelay);

      // Update the call to include the stream — ToolCall children will show it
      setCalls((prev) =>
        prev.map((c) => (c.id === callId ? { ...c, stream } : c)),
      );

      // Calculate total stream duration
      const totalStreamTime = step.outputLines.length * step.lineDelay + 100;

      // After streaming completes, mark as done
      setTimeout(() => {
        if (cancelledRef.current) return;
        const elapsed = Date.now() - startTime;
        setCalls((prev) =>
          prev.map((c) =>
            c.id === callId
              ? {
                  ...c,
                  status: step.error ? ('error' as const) : ('success' as const),
                  duration: elapsed,
                  stream: undefined, // Clear stream, keep static result
                  result: step.outputLines.join('\n'),
                  resultStatus: step.error ? ('error' as const) : ('success' as const),
                }
              : c,
          ),
        );
        setStepIndex((i) => i + 1);
      }, totalStreamTime);
    }, step.startDelay);

    return () => {
      cancelledRef.current = true;
      clearTimeout(streamTimer);
    };
  }, [phase, stepIndex]);

  // Auto-start
  useEffect(() => {
    const t = setTimeout(startRun, 500);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={startRun}
          disabled={phase === 'running'}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--ov-color-border-default)',
            background: 'var(--ov-color-bg-surface)',
            color: 'var(--ov-color-fg-default)',
            cursor: phase === 'running' ? 'not-allowed' : 'pointer',
            fontSize: 13,
          }}
        >
          {phase === 'done' ? 'Replay' : phase === 'running' ? 'Running...' : 'Start'}
        </button>
        <span style={{ fontSize: 12, color: 'var(--ov-color-fg-muted)' }}>
          {phase === 'idle' && 'Simulates a real agentic debugging session with streaming tool output'}
          {phase === 'running' && `Executing step ${Math.min(stepIndex + 1, TOOL_STEPS.length)} of ${TOOL_STEPS.length}...`}
          {phase === 'done' && `All ${TOOL_STEPS.length} tool calls complete — click Replay to run again`}
        </span>
      </div>

      {calls.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {calls.map((call) => (
            <ToolCall
              key={call.id}
              name={call.name}
              arguments={call.arguments}
              status={call.status}
              duration={call.duration}
              defaultExpanded
            >
              {call.stream && <StreamingText stream={call.stream} cursor={false} />}
              {!call.stream && call.result && (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {call.result as string}
                </pre>
              )}
            </ToolCall>
          ))}
        </div>
      )}
    </div>
  );
}

export const Animated: Story = {
  args: { calls: [] },
  render: () => <AnimatedToolCalls />,
};

// ---------------------------------------------------------------------------
// IndividualAnimated — single ToolCall going through the full lifecycle
// ---------------------------------------------------------------------------

function AnimatedSingleToolCall() {
  const [status, setStatus] = useState<'pending' | 'running' | 'success'>('pending');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [stream, setStream] = useState<AsyncIterable<string> | undefined>(undefined);
  const [staticResult, setStaticResult] = useState<string | undefined>(undefined);

  const lines = [
    'Waiting for deployment "payments-api" rollout to finish: 0 of 3 updated replicas are available...',
    'Waiting for deployment "payments-api" rollout to finish: 1 of 3 updated replicas are available...',
    'Waiting for deployment "payments-api" rollout to finish: 2 of 3 updated replicas are available...',
    'deployment "payments-api" successfully rolled out',
  ];

  const run = useCallback(() => {
    setStatus('pending');
    setDuration(undefined);
    setStream(undefined);
    setStaticResult(undefined);

    // pending → running after 400ms
    setTimeout(() => {
      setStatus('running');
      // Start streaming output after another 300ms
      setTimeout(() => {
        setStream(createLineStream(lines, 500));
        // After all lines stream, mark complete
        setTimeout(() => {
          setStatus('success');
          setDuration(2800);
          setStream(undefined);
          setStaticResult(lines.join('\n'));
        }, lines.length * 500 + 200);
      }, 300);
    }, 400);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        type="button"
        onClick={run}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid var(--ov-color-border-default)',
          background: 'var(--ov-color-bg-surface)',
          color: 'var(--ov-color-fg-default)',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Replay
      </button>

      <ToolCall
        name="kubectl rollout status"
        status={status}
        duration={duration}
        arguments={{ deployment: 'payments-api', namespace: 'production' }}
        defaultExpanded
      >
        {stream && <StreamingText stream={stream} cursor={false} />}
        {!stream && staticResult && (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{staticResult}</pre>
        )}
      </ToolCall>
    </div>
  );
}

export const IndividualAnimated: Story = {
  args: { calls: [] },
  render: () => <AnimatedSingleToolCall />,
};
