import { useState, useEffect, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CodeEditor, type CodeEditorProps, type EditorDiagnostic, type CursorPosition } from './CodeEditor';
import { editorSchemas, type EditorSchema } from '../../schemas';
import { k8sSchemas, gvrFileMatch, type K8sSchemaEntry } from '../../schemas/kubernetes';

const sampleCode = `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}`;

const meta: Meta<typeof CodeEditor> = {
  title: 'Editors/CodeEditor',
  component: CodeEditor,
  tags: ['autodocs'],
  args: {
    value: sampleCode,
    language: 'typescript',
    height: 400,
  },
  argTypes: {
    language: {
      control: 'select',
      options: ['typescript', 'javascript', 'python', 'json', 'css', 'html', 'yaml', 'go', 'rust'],
    },
    readOnly: { control: 'boolean' },
    lineNumbers: { control: 'boolean' },
    minimap: { control: 'boolean' },
    wordWrap: { control: 'boolean' },
    height: { control: { type: 'number', min: 100, max: 800, step: 50 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
  },
};

export const WithMinimap: Story = {
  args: {
    minimap: true,
    value: Array.from({ length: 100 }, (_, i) => `// Line ${i + 1}: sample code content`).join(
      '\n',
    ),
  },
};

export const WordWrap: Story = {
  args: {
    wordWrap: true,
    value: `// This is a very long line that should wrap when wordWrap is enabled. ${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5)}
// Another long line follows. ${'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '.repeat(3)}
const shortLine = true;`,
  },
};

export const NoLineNumbers: Story = {
  args: {
    lineNumbers: false,
    value: '# Markdown-style preview\n\nNo line numbers shown.\n\n- Item 1\n- Item 2\n- Item 3',
    language: 'markdown',
  },
};

export const JSONContent: Story = {
  args: {
    value: JSON.stringify({
      name: 'omniview',
      version: '1.0.0',
      dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
      devDependencies: { typescript: '^5.9.0', vite: '^5.4.0' },
    }),
    language: 'json',
  },
};

export const LanguageDetection: Story = {
  args: {
    value: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello")\n}',
    filename: 'main.go',
    language: undefined,
  },
};

export const PythonCode: Story = {
  args: {
    value: `import os
from typing import List, Optional

class FileProcessor:
    """Process files in a directory."""

    def __init__(self, root: str) -> None:
        self.root = root
        self._files: List[str] = []

    def scan(self, extensions: Optional[List[str]] = None) -> List[str]:
        for dirpath, _, filenames in os.walk(self.root):
            for f in filenames:
                if extensions is None or any(f.endswith(ext) for ext in extensions):
                    self._files.append(os.path.join(dirpath, f))
        return self._files

if __name__ == "__main__":
    proc = FileProcessor("/tmp")
    print(proc.scan([".py", ".txt"]))`,
    language: 'python',
  },
};

export const YAMLContent: Story = {
  args: {
    value: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-server
  namespace: production
  labels:
    app: web
    tier: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
          resources:
            limits:
              cpu: "500m"
              memory: "128Mi"`,
    language: 'yaml',
  },
};

export const CSSContent: Story = {
  args: {
    value: `:root {
  --ov-color-bg-base: #1e1e1e;
  --ov-color-fg-default: #d4d4d4;
  --ov-radius-sm: 4px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: var(--ov-space-2);
  padding: var(--ov-space-4);
  background: var(--ov-color-bg-base);
  border-radius: var(--ov-radius-sm);
}

.container:hover {
  border-color: var(--ov-color-border-focus);
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}`,
    language: 'css',
  },
};

export const SyntaxHighlightingOff: Story = {
  args: {
    value: sampleCode,
    language: 'typescript',
    syntaxHighlighting: false,
  },
};

/** Demonstrates toggling syntax highlighting at runtime. */
function SyntaxToggleStory(args: CodeEditorProps) {
  const [enabled, setEnabled] = useState(true);
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Syntax Highlighting
      </label>
      <CodeEditor {...args} syntaxHighlighting={enabled} />
    </div>
  );
}

export const SyntaxHighlightingToggle: Story = {
  render: (args) => <SyntaxToggleStory {...args} />,
  args: {
    value: sampleCode,
    language: 'typescript',
    height: 400,
  },
};

/** Demonstrates the onChange callback with a live character count. */
function ControlledStory(args: CodeEditorProps) {
  const [value, setValue] = useState(args.value);
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.7 }}>
        Characters: {value.length} | Lines: {value.split('\n').length}
      </div>
      <CodeEditor {...args} value={value} onChange={setValue} />
    </div>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledStory {...args} />,
  args: {
    value: '// Type here to see live stats\nconst x = 1;\n',
  },
};

export const EmptyEditor: Story = {
  args: {
    value: '',
    language: 'typescript',
  },
};

export const CustomDimensions: Story = {
  args: {
    height: 200,
    width: 500,
    value: 'const small = true;\n',
    language: 'typescript',
  },
};

// ---------------------------------------------------------------------------
// YAML Schema Completion — Real Kubernetes Schemas (demo-only)
// ---------------------------------------------------------------------------

const podSampleYaml = `apiVersion: v1
kind: Pod
metadata:
  name: my-app
  namespace: default
  labels:
    app: my-app
spec:
  containers:
    - name: app
      image: nginx:1.25
      ports:
        - containerPort: 80
      resources:
        limits:
          cpu: "500m"
          memory: "128Mi"
  restartPolicy: Always
`;

const deploymentSampleYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-server
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: "25%"
      maxUnavailable: "25%"
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
`;

const serviceSampleYaml = `apiVersion: v1
kind: Service
metadata:
  name: web-svc
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
`;

/**
 * Sample YAML content keyed by GVR, matching the structured filename convention:
 *   <plugin>/<connectionId>/<group>::<version>::<resource>.yaml
 */
const sampleYamlByGvr: Record<string, string> = {
  'core::v1::Pod': podSampleYaml,
  'apps::v1::Deployment': deploymentSampleYaml,
  'core::v1::Service': serviceSampleYaml,
  'core::v1::ConfigMap': `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: default
data:
  APP_ENV: production
  LOG_LEVEL: info
`,
  'networking.k8s.io::v1::Ingress': `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  namespace: production
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-svc
                port:
                  number: 80
`,
};

/** Simulated plugin/connection context for structured filenames. */
const DEMO_PLUGIN = 'kubernetes';
const DEMO_CONNECTION = 'demo-cluster';

/** Build a structured filename for a GVR, e.g. "kubernetes/demo-cluster/core::v1::Pod.yaml" */
function gvrFilename(gvr: string): string {
  return `${DEMO_PLUGIN}/${DEMO_CONNECTION}/${gvr}.yaml`;
}

/**
 * Demonstrates runtime schema registration with real Kubernetes JSON schemas.
 *
 * This mirrors what happens in production: schemas are loaded per-cluster at
 * runtime. Before loading, the editor has no autocompletion. After loading,
 * full schema-driven completions appear as you type.
 *
 * Click "Load" buttons to dynamically register schemas. Click "Unload All"
 * to remove them. The editor updates in real time.
 */
function RuntimeSchemaStory(args: CodeEditorProps) {
  const [value, setValue] = useState(args.value);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeGvr, setActiveGvr] = useState<string>('core::v1::Pod');
  const [diagnosticsList, setDiagnosticsList] = useState<EditorDiagnostic[]>([]);
  const [cursor, setCursor] = useState<CursorPosition>({ lineNumber: 1, column: 1 });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      editorSchemas.clear();
    };
  }, []);

  const loadSchema = useCallback(async (entry: K8sSchemaEntry) => {
    setLoading((prev) => ({ ...prev, [entry.gvr]: true }));
    try {
      const mod = await entry.load();
      const schema: EditorSchema = {
        uri: `https://omniview.dev/schemas/k8s/${encodeURIComponent(entry.gvr)}`,
        fileMatch: gvrFileMatch(entry.gvr),
        schema: mod.default,
        name: `${entry.kind} (${entry.apiVersion})`,
        description: `Kubernetes ${entry.kind} resource schema`,
      };
      editorSchemas.register(schema);
      setLoaded((prev) => ({ ...prev, [entry.gvr]: true }));
    } finally {
      setLoading((prev) => ({ ...prev, [entry.gvr]: false }));
    }
  }, []);

  const unloadAll = useCallback(() => {
    editorSchemas.clear();
    setLoaded({});
  }, []);

  const loadedCount = Object.values(loaded).filter(Boolean).length;

  function schemaStatusLabel(): string {
    if (loadedCount === 0) return 'none — no completions available';
    const count = `${loadedCount} schema(s)`;
    if (loaded[activeGvr]) return `${count} — active file has schema`;
    return `${count} — active file has NO schema loaded`;
  }

  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
        Runtime Schema Loading
      </div>
      <div style={{ marginBottom: 4, fontSize: 12, opacity: 0.6 }}>
        Simulates per-cluster schema loading. Schemas are fetched lazily and registered at runtime.
        Each schema matches a structured filename:{' '}
        <code style={{ fontSize: 11 }}>&lt;plugin&gt;/&lt;connectionId&gt;/&lt;group&gt;::&lt;version&gt;::&lt;resource&gt;.yaml</code>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {k8sSchemas.map((entry) => (
          <button
            type="button"
            key={entry.gvr}
            onClick={() => {
              void loadSchema(entry);
              setActiveGvr(entry.gvr);
              setValue(sampleYamlByGvr[entry.gvr] ?? '');
            }}
            disabled={!!loaded[entry.gvr] || !!loading[entry.gvr]}
            style={{
              padding: '4px 12px',
              fontSize: 12,
              borderRadius: 4,
              border: '1px solid var(--ov-color-border-default)',
              background: loaded[entry.gvr]
                ? 'var(--ov-color-success-soft, #2d4a2d)'
                : 'var(--ov-color-bg-surface)',
              color: 'var(--ov-color-fg-default)',
              cursor: loaded[entry.gvr] || loading[entry.gvr] ? 'default' : 'pointer',
              opacity: loaded[entry.gvr] ? 0.7 : 1,
            }}
          >
            {loading[entry.gvr]
              ? `Loading ${entry.kind}...`
              : loaded[entry.gvr]
                ? `${entry.kind} (${entry.apiVersion})`
                : `Load ${entry.kind}`}
          </button>
        ))}
        {loadedCount > 0 && (
          <button
            type="button"
            onClick={unloadAll}
            style={{
              padding: '4px 12px',
              fontSize: 12,
              borderRadius: 4,
              border: '1px solid var(--ov-color-border-default)',
              background: 'var(--ov-color-bg-surface)',
              color: 'var(--ov-color-fg-default)',
              cursor: 'pointer',
            }}
          >
            Unload All
          </button>
        )}
      </div>

      <div style={{ marginBottom: 4, display: 'flex', gap: 6 }}>
        {k8sSchemas.map((entry) => (
          <button
            type="button"
            key={entry.gvr}
            onClick={() => {
              setActiveGvr(entry.gvr);
              setValue(sampleYamlByGvr[entry.gvr] ?? '');
            }}
            style={{
              padding: '2px 8px',
              fontSize: 11,
              borderRadius: 3,
              border: '1px solid var(--ov-color-border-default)',
              background:
                activeGvr === entry.gvr
                  ? 'var(--ov-color-bg-elevated, #2a2a2a)'
                  : 'transparent',
              color: 'var(--ov-color-fg-default)',
              cursor: 'pointer',
              opacity: activeGvr === entry.gvr ? 1 : 0.6,
            }}
          >
            {entry.kind}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 2, fontSize: 11, opacity: 0.4, fontFamily: 'monospace' }}>
        file: {gvrFilename(activeGvr)}
      </div>
      <div style={{ marginBottom: 8, fontSize: 11, opacity: 0.4 }}>
        Loaded: {schemaStatusLabel()}
      </div>

      <CodeEditor
        {...args}
        value={value}
        onChange={setValue}
        language="yaml"
        filename={gvrFilename(activeGvr)}
        quickSuggestions
        onDiagnostics={setDiagnosticsList}
        onCursorChange={setCursor}
      />

      {/* Status bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 8px',
        fontSize: 11,
        fontFamily: 'monospace',
        background: 'var(--ov-color-bg-inset, #1a1a1a)',
        borderTop: '1px solid var(--ov-color-border-default, #333)',
        opacity: 0.8,
      }}>
        <span>Ln {cursor.lineNumber}, Col {cursor.column}</span>
        <span>
          {diagnosticsList.length === 0
            ? 'No problems'
            : `${diagnosticsList.filter(d => d.severity === 'error').length} errors, ${diagnosticsList.filter(d => d.severity === 'warning').length} warnings`}
        </span>
      </div>

      {/* Problems panel */}
      {diagnosticsList.length > 0 && (
        <div style={{
          maxHeight: 120,
          overflow: 'auto',
          fontSize: 11,
          fontFamily: 'monospace',
          background: 'var(--ov-color-bg-inset, #1a1a1a)',
          borderTop: '1px solid var(--ov-color-border-default, #333)',
        }}>
          {diagnosticsList.map((d, i) => (
            <div key={i} style={{
              padding: '2px 8px',
              color: d.severity === 'error'
                ? 'var(--ov-color-error, #f44)'
                : d.severity === 'warning'
                  ? 'var(--ov-color-warning, #fa0)'
                  : 'var(--ov-color-fg-muted, #888)',
            }}>
              [{d.severity}] Ln {d.startLineNumber}:{d.startColumn} — {d.message}
              {d.source && <span style={{ opacity: 0.5 }}> ({d.source})</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const RuntimeSchemaRegistration: Story = {
  render: (args) => <RuntimeSchemaStory {...args} />,
  args: {
    value: podSampleYaml,
    language: 'yaml',
    height: 500,
  },
};

/**
 * Demonstrates the onMount callback for advanced Monaco configuration.
 * Plugins can use this to register custom completion providers, set up
 * language workers, or perform any Monaco API call.
 */
function OnMountCallbackStory(args: CodeEditorProps) {
  const [value, setValue] = useState(args.value);
  const [log, setLog] = useState<string[]>([]);

  const handleMount = (_editor: unknown, monaco: unknown) => {
    setLog((prev) => [...prev, 'Editor mounted — Monaco instance available']);

    const m = monaco as {
      languages: {
        registerCompletionItemProvider: (
          language: string,
          provider: Record<string, unknown>,
        ) => unknown;
        CompletionItemKind: Record<string, number>;
      };
    };

    m.languages.registerCompletionItemProvider('yaml', {
      provideCompletionItems: () => ({
        suggestions: [
          {
            label: 'apiVersion: v1',
            kind: m.languages.CompletionItemKind.Snippet,
            insertText: 'apiVersion: v1',
            documentation: 'Core API version',
          },
          {
            label: 'apiVersion: apps/v1',
            kind: m.languages.CompletionItemKind.Snippet,
            insertText: 'apiVersion: apps/v1',
            documentation: 'Apps API version',
          },
        ],
      }),
    });

    setLog((prev) => [...prev, 'Custom YAML completion provider registered']);
  };

  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.7 }}>
        Uses <code>onMount</code> to register a custom completion provider via raw Monaco API.
      </div>
      <CodeEditor {...args} value={value} onChange={setValue} onMount={handleMount} />
      <div
        style={{
          marginTop: 8,
          padding: 8,
          fontSize: 11,
          fontFamily: 'monospace',
          background: 'var(--ov-color-bg-inset)',
          borderRadius: 4,
          opacity: 0.8,
        }}
      >
        {log.map((entry, i) => (
          <div key={i}>{entry}</div>
        ))}
      </div>
    </div>
  );
}

export const OnMountCallback: Story = {
  render: (args) => <OnMountCallbackStory {...args} />,
  args: {
    value: `# Type here and press Ctrl+Space to see custom completions\n`,
    language: 'yaml',
    height: 300,
  },
};
