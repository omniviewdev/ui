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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InlineMode: Story = {
  args: { mode: 'inline' },
};

export const LargeDiff: Story = {
  args: {
    original: Array.from({ length: 50 }, (_, i) => `// Original line ${i + 1}`).join('\n'),
    modified: Array.from({ length: 50 }, (_, i) =>
      i % 5 === 0 ? `// Modified line ${i + 1}` : `// Original line ${i + 1}`,
    ).join('\n'),
  },
};
