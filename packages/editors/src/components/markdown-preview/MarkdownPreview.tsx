import { Children, forwardRef, isValidElement, lazy, Suspense, useMemo, type HTMLAttributes } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import {
  Accordion,
  Blockquote,
  Checkbox,
  Code,
  CodeBlock,
  Link,
  Separator,
  Table,
} from '@omniview/base-ui';
import styles from './MarkdownPreview.module.css';

const ReactMarkdown = lazy(() => import('react-markdown'));

export interface MarkdownPreviewProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  allowHtml?: boolean;
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Recursively extract plain text from a hast node tree. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hastText(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (Array.isArray(node.children)) return node.children.map(hastText).join('');
  return '';
}

/** Stable component overrides for react-markdown */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MdProps = Record<string, any>;

const markdownComponents: Record<string, React.ComponentType<MdProps>> = {
  // Code blocks & inline code
  pre: ({ children }: MdProps) => <>{children}</>,
  code: ({ className, children }: MdProps) => {
    const match = /language-(\w+)/.exec(className ?? '');
    if (match) {
      return (
        <CodeBlock language={match[1]} copyable>
          {String(children).replace(/\n$/, '')}
        </CodeBlock>
      );
    }
    return <Code>{children}</Code>;
  },

  // Tables
  table: ({ children }: MdProps) => (
    <Table.Root striped hoverable size="sm">
      {children}
    </Table.Root>
  ),
  thead: ({ children }: MdProps) => <Table.Head>{children}</Table.Head>,
  tbody: ({ children }: MdProps) => <Table.Body>{children}</Table.Body>,
  tr: ({ children }: MdProps) => <Table.Row>{children}</Table.Row>,
  th: ({ children, style }: MdProps) => (
    <Table.HeaderCell style={style}>{children}</Table.HeaderCell>
  ),
  td: ({ children, style }: MdProps) => (
    <Table.Cell style={style}>{children}</Table.Cell>
  ),

  // Links
  a: ({ children, href }: MdProps) => (
    <Link href={href} target="_blank" rel="noopener noreferrer" underline="hover">
      {children}
    </Link>
  ),

  // Blockquotes
  blockquote: ({ children }: MdProps) => <Blockquote variant="plain">{children}</Blockquote>,

  // Horizontal rules
  hr: () => <Separator decorative />,

  // Details/summary → Accordion — extract title from the hast node's summary child
  details: ({ children, node }: MdProps) => {
    // Extract summary text from the hast AST (before React renders it)
    let summaryText = 'Details';
    if (node?.children) {
      const summaryNode = node.children.find(
        (c: MdProps) => c.tagName === 'summary',
      );
      if (summaryNode) {
        const text = hastText(summaryNode).trim();
        if (text) summaryText = text;
      }
    }

    // Filter out the rendered summary element from React children
    const body: React.ReactNode[] = [];
    Children.forEach(children, (child) => {
      // Skip the hidden summary marker
      if (isValidElement(child) && (child.props as MdProps)?.['data-md-summary']) {
        return;
      }
      body.push(child);
    });

    const itemId = `md-details-${summaryText.replace(/\s+/g, '-').toLowerCase().slice(0, 32)}`;

    return (
      <Accordion animation="fast">
        <Accordion.Item id={itemId} title={summaryText}>
          {body}
        </Accordion.Item>
      </Accordion>
    );
  },
  // Mark summary so details can filter it out; text is extracted from hast node
  summary: ({ children }: MdProps) => (
    <span hidden data-md-summary>{children}</span>
  ),

  // Task list checkboxes — use compound parts for inline rendering
  input: ({ type, checked, disabled }: MdProps) => {
    if (type === 'checkbox') {
      return (
        <Checkbox.Root checked={checked} disabled={disabled} size="sm" className="ov-md-checkbox">
          <Checkbox.Control>
            <Checkbox.Indicator keepMounted />
          </Checkbox.Control>
        </Checkbox.Root>
      );
    }
    return <input type={type} />;
  },
};

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  function MarkdownPreview({ content, allowHtml = false, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-testid="markdown-preview"
        {...props}
      >
        <Suspense
          fallback={
            <div className={styles.Loading} data-testid="markdown-loading">
              Loading…
            </div>
          }
        >
          <MarkdownContent content={content} allowHtml={allowHtml} />
        </Suspense>
      </div>
    );
  },
);

MarkdownPreview.displayName = 'MarkdownPreview';

/** Sanitize schema that extends the default to allow class on any element (needed for alerts). */
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
  },
};

/** Inner component that uses lazy-loaded deps */
function MarkdownContent({ content, allowHtml }: { content: string; allowHtml: boolean }) {
  const rehypePlugins = useMemo(
    () => (allowHtml ? [rehypeRaw, [rehypeSanitize, sanitizeSchema]] : []),
    [allowHtml],
  );

  return (
    <ReactMarkdown
      skipHtml={!allowHtml}
      remarkPlugins={[remarkGfm]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rehypePlugins={rehypePlugins as any}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  );
}
