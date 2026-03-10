import type { Meta, StoryObj } from '@storybook/react';
import { AICodeBlock } from './AICodeBlock';

const meta = {
  title: 'AI/Content/AICodeBlock',
  component: AICodeBlock,
  tags: ['autodocs'],
  args: {
    code: `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
    language: 'typescript',
    showLineNumbers: false,
  },
  argTypes: {
    language: { control: 'text' },
    filename: { control: 'text' },
    showLineNumbers: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AICodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithFilename: Story = {
  args: {
    filename: 'src/utils/fibonacci.ts',
    showLineNumbers: true,
  },
};

export const Python: Story = {
  args: {
    code: `import json
from pathlib import Path

def load_config(path: str) -> dict:
    """Load configuration from a JSON file."""
    config_path = Path(path)
    if not config_path.exists():
        raise FileNotFoundError(f"Config not found: {path}")
    return json.loads(config_path.read_text())`,
    language: 'python',
    filename: 'config.py',
  },
};

export const JSON: Story = {
  args: {
    code: `{
  "name": "@omniview/ai-ui",
  "version": "0.1.0",
  "dependencies": {
    "@tanstack/react-virtual": "^3.13.21"
  }
}`,
    language: 'json',
    filename: 'package.json',
  },
};

export const WithLineNumbers: Story = {
  args: {
    showLineNumbers: true,
  },
};
