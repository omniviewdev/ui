import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownPreview } from './MarkdownPreview';

const sampleMarkdown = `# Heading 1

## Heading 2

This is a paragraph with **bold**, *italic*, and \`inline code\`.

### Code Block

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Links

[Visit OpenAI](https://openai.com)

### Lists

- Item one
- Item two
  - Nested item
- Item three

1. First
2. Second
3. Third

### Task List

- [x] Completed task
- [ ] Incomplete task

### Blockquote

> This is a blockquote
> with multiple lines.

### Table

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

---

*End of preview*
`;

const meta: Meta<typeof MarkdownPreview> = {
  title: 'Editors/MarkdownPreview',
  component: MarkdownPreview,
  tags: ['autodocs'],
  args: {
    content: sampleMarkdown,
  },
  argTypes: {
    allowHtml: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 800, height: 600, overflow: 'auto' }}>
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
    content: '# Hello World\n\nThis is a simple markdown preview.',
  },
};

export const WithCode: Story = {
  args: {
    content: '## Code Example\n\n```js\nconst x = 42;\nconsole.log(x);\n```',
  },
};
