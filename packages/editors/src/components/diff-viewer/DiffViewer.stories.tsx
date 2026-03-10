import type { Meta, StoryObj } from '@storybook/react';
import { DiffViewer } from './DiffViewer';

const original = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}`;

const modified = `function greet(name: string) {
  console.log(\`Hello, \${name}\`);
  return name.length > 0;
}`;

const meta: Meta<typeof DiffViewer> = {
  title: 'Editors/DiffViewer',
  component: DiffViewer,
  tags: ['autodocs'],
  args: {
    original,
    modified,
    language: 'typescript',
    height: 400,
  },
  argTypes: {
    mode: { control: 'radio', options: ['side-by-side', 'inline'] },
    readOnly: { control: 'boolean' },
    language: {
      control: 'select',
      options: ['typescript', 'javascript', 'python', 'json', 'yaml', 'css', 'go'],
    },
    height: { control: { type: 'number', min: 200, max: 800, step: 50 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InlineMode: Story = {
  args: { mode: 'inline' },
};

export const SideBySide: Story = {
  args: { mode: 'side-by-side' },
};

export const Editable: Story = {
  args: {
    readOnly: false,
  },
};

export const LargeDiff: Story = {
  args: {
    original: Array.from({ length: 50 }, (_, i) => `// Original line ${i + 1}`).join('\n'),
    modified: Array.from({ length: 50 }, (_, i) =>
      i % 5 === 0 ? `// Modified line ${i + 1}` : `// Original line ${i + 1}`,
    ).join('\n'),
  },
};

export const NoDifferences: Story = {
  args: {
    original: 'const x = 1;\nconst y = 2;\n',
    modified: 'const x = 1;\nconst y = 2;\n',
    language: 'typescript',
  },
};

export const CompletelyDifferent: Story = {
  args: {
    original: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
    modified: `from typing import Optional

def greet(name: Optional[str] = None) -> str:
    if name:
        return f"Hello, {name}!"
    return "Hello, World!"

if __name__ == "__main__":
    print(greet())`,
    language: undefined,
  },
};

export const JSONDiff: Story = {
  args: {
    original: JSON.stringify(
      {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: 'app-config', namespace: 'default' },
        data: { DATABASE_URL: 'postgres://localhost:5432/mydb', LOG_LEVEL: 'info' },
      },
      null,
      2,
    ),
    modified: JSON.stringify(
      {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: 'app-config', namespace: 'production' },
        data: {
          DATABASE_URL: 'postgres://prod-host:5432/mydb',
          LOG_LEVEL: 'warn',
          CACHE_TTL: '3600',
        },
      },
      null,
      2,
    ),
    language: 'json',
  },
};

export const YAMLDiff: Story = {
  args: {
    original: `replicas: 1
image: nginx:1.24
resources:
  limits:
    cpu: "250m"
    memory: "64Mi"
env:
  - name: NODE_ENV
    value: development`,
    modified: `replicas: 3
image: nginx:1.25
resources:
  limits:
    cpu: "500m"
    memory: "128Mi"
  requests:
    cpu: "100m"
    memory: "32Mi"
env:
  - name: NODE_ENV
    value: production
  - name: LOG_LEVEL
    value: warn`,
    language: 'yaml',
  },
};

export const EmptyOriginal: Story = {
  args: {
    original: '',
    modified: 'const newFile = true;\nexport default newFile;\n',
    language: 'typescript',
  },
};

export const CompactHeight: Story = {
  args: {
    height: 200,
  },
};
