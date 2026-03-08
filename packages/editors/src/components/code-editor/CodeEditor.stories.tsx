import type { Meta, StoryObj } from '@storybook/react';
import { CodeEditor } from './CodeEditor';

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
    value: Array.from({ length: 100 }, (_, i) => `// Line ${i + 1}`).join('\n'),
  },
};

export const JSONContent: Story = {
  args: {
    value: JSON.stringify({
      name: 'omniview',
      version: '1.0.0',
      dependencies: { react: '^19.0.0' },
    }),
    language: 'json',
  },
};

export const LanguageDetection: Story = {
  args: {
    value: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello")\n}',
    filename: 'main.go',
  },
};
