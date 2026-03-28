import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type HTMLAttributes,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const REMARK_PLUGINS = [remarkGfm] as const;
import {
  Blockquote,
  Checkbox,
  Code,
  CodeBlock,
  Link,
  Separator,
  Table,
} from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';
import styles from './AIMarkdown.module.css';

export interface AIMarkdownProps extends HTMLAttributes<HTMLDivElement> {
  /** Async iterable that yields markdown chunks (e.g., from an LLM API) */
  stream?: AsyncIterable<string>;
  /** Static markdown content */
  content?: string;
  /** Whether content is still actively streaming (only needed when using content prop directly) */
  streaming?: boolean;
  /** Show blinking cursor while streaming (default: true) */
  cursor?: boolean;
  /** Callback when streaming completes */
  onComplete?: () => void;
  /** Callback with accumulated markdown on each chunk */
  onChunk?: (accumulated: string) => void;
}

// ---------------------------------------------------------------------------
// react-markdown component overrides (mirrors MarkdownPreview from editors)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MdProps = Record<string, any>;

const markdownComponents: Record<string, ComponentType<MdProps>> = {
  // Code blocks & inline code
  pre: ({ children }: MdProps) => <>{children}</>,
  code: ({ className, children }: MdProps) => {
    const match = /language-([^\s]+)/.exec(className ?? '');
    const text = String(children).replace(/\n$/, '');
    // Fenced blocks: has language class OR contains newlines (multiline = block)
    if (match || text.includes('\n')) {
      return (
        <div className={styles.CodeBlockWrapper}>
          <CodeBlock language={match?.[1]} copyable>
            {text}
          </CodeBlock>
        </div>
      );
    }
    return <Code className={styles.InlineCode}>{children}</Code>;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  a: ({ children, href, node, ...rest }: MdProps) => (
    <Link {...rest} href={href} target="_blank" rel="noopener noreferrer" underline="hover">
      {children}
    </Link>
  ),

  // Blockquotes
  blockquote: ({ children }: MdProps) => <Blockquote variant="plain">{children}</Blockquote>,

  // Horizontal rules
  hr: () => <Separator />,

  // Task list checkboxes
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
    return null;
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AIMarkdown = forwardRef<HTMLDivElement, AIMarkdownProps>(
  function AIMarkdown(
    { stream, content, streaming: streamingProp, cursor = true, onComplete, onChunk, className, ...rest },
    ref,
  ) {
    const [streamedContent, setStreamedContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;
    const onChunkRef = useRef(onChunk);
    onChunkRef.current = onChunk;

    // Consume async iterable stream
    useEffect(() => {
      if (!stream) return;

      let cancelled = false;
      let accumulated = '';
      let rafId: number | null = null;
      let pendingFlush = false;

      setIsStreaming(true);
      setStreamedContent('');

      const flush = () => {
        if (!cancelled) {
          setStreamedContent(accumulated);
          pendingFlush = false;
        }
      };

      (async () => {
        try {
          for await (const chunk of stream) {
            if (cancelled) break;
            accumulated += chunk;
            onChunkRef.current?.(accumulated);

            // Batch React state updates to animation frames
            if (!pendingFlush) {
              pendingFlush = true;
              rafId = requestAnimationFrame(flush);
            }
          }
        } catch {
          // Stream errored — render whatever we accumulated
        } finally {
          if (!cancelled) {
            if (rafId != null) cancelAnimationFrame(rafId);
            setStreamedContent(accumulated);
            setIsStreaming(false);
            onCompleteRef.current?.();
          }
        }
      })();

      return () => {
        cancelled = true;
        if (rafId != null) cancelAnimationFrame(rafId);
      };
    }, [stream]);

    const markdown = stream ? streamedContent : (content ?? '');
    const isActive = stream ? isStreaming : (streamingProp ?? false);

    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-streaming={isActive ? 'true' : 'false'}
        data-ov-cursor={cursor ? 'true' : 'false'}
        {...rest}
      >
        <ReactMarkdown
          remarkPlugins={REMARK_PLUGINS}
          skipHtml
          components={markdownComponents}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    );
  },
);
