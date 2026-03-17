import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './CodeBlock';

const SAMPLE_CODE = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: omniview-runtime
spec:
  replicas: 2
  selector:
    matchLabels:
      app: omniview-runtime
  template:
    metadata:
      labels:
        app: omniview-runtime
    spec:
      containers:
        - name: runtime
          image: ghcr.io/omniview/runtime:latest
          ports:
            - containerPort: 8080`;

const LANGUAGE_OPTIONS = [
  'bash',
  'yaml',
  'json',
  'typescript',
  'tsx',
  'javascript',
  'go',
  'python',
  'sql',
  'markdown',
  'diff',
];

const meta = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  args: {
    code: SAMPLE_CODE,
    language: 'yaml',
    lineNumbers: true,
    copyable: true,
    wrap: false,
    maxHeight: 280,
    variant: 'soft',
    color: 'neutral',
    size: 'md',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    lineNumbers: { control: 'boolean' },
    copyable: { control: 'boolean' },
    wrap: { control: 'boolean' },
    language: { control: 'select', options: LANGUAGE_OPTIONS },
    maxHeight: { control: 'number' },
  },
  render: (args) => (
    <div style={{ width: 620 }}>
      <CodeBlock {...args} />
    </div>
  ),
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InlineSnippet: Story = {
  args: {
    code: 'kubectl logs deployment/omniview-runtime -n omniview-system --follow',
    language: 'bash',
    lineNumbers: false,
    copyable: true,
    maxHeight: undefined,
    color: 'brand',
    variant: 'outline',
  },
};

export const Wrapped: Story = {
  args: {
    wrap: true,
    maxHeight: 220,
  },
};
