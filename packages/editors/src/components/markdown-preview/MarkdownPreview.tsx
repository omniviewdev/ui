import { forwardRef, lazy, Suspense, type HTMLAttributes } from 'react';
import styles from './MarkdownPreview.module.css';

const ReactMarkdown = lazy(() => import('react-markdown'));

export interface MarkdownPreviewProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  allowHtml?: boolean;
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

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

/** Inner component that uses lazy-loaded deps */
function MarkdownContent({ content, allowHtml }: { content: string; allowHtml: boolean }) {
  // Dynamic imports for remark/rehype plugins
  // They're imported alongside react-markdown via the lazy boundary
  return (
    <ReactMarkdown
      skipHtml={!allowHtml}
      components={{
        a: ({ children, ...linkProps }) => (
          <a target="_blank" rel="noopener noreferrer" {...linkProps}>
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
