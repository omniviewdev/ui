import { forwardRef, useMemo, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './AIMarkdown.module.css';

export interface AIMarkdownProps extends HTMLAttributes<HTMLDivElement> {
  /** Markdown content (may be incomplete if streaming) */
  content: string;
  /** Whether content is still streaming in */
  streaming?: boolean;
}

/**
 * Minimal streaming-safe markdown renderer.
 * Handles partial/incomplete markdown without errors by operating on
 * complete lines only and gracefully handling unclosed blocks.
 */
function renderMarkdown(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeLines: string[] = [];
  let inList = false;

  for (const line of lines) {
    // Code block fences
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        const escaped = codeLines.map(escapeHtml).join('\n');
        result.push(
          `<pre class="${styles.CodeBlock}" data-language="${escapeHtml(codeBlockLang)}"><code>${escaped}</code></pre>`,
        );
        codeLines = [];
        inCodeBlock = false;
        codeBlockLang = '';
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (inList) { result.push('</ul>'); inList = false; }
      const level = headingMatch[1]!.length;
      result.push(`<h${level} class="${styles.Heading}">${inlineMarkdown(headingMatch[2]!)}</h${level}>`);
      continue;
    }

    // Unordered list items
    if (/^[-*+]\s+/.test(line)) {
      if (!inList) { result.push('<ul class="' + styles.List + '">'); inList = true; }
      result.push(`<li>${inlineMarkdown(line.replace(/^[-*+]\s+/, ''))}</li>`);
      continue;
    }

    // Ordered list items
    if (/^\d+\.\s+/.test(line)) {
      if (!inList) { result.push('<ol class="' + styles.List + '">'); inList = true; }
      result.push(`<li>${inlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }

    if (inList) { result.push('</ul>'); inList = false; }

    // Blockquote
    if (line.startsWith('> ')) {
      result.push(`<blockquote class="${styles.Blockquote}">${inlineMarkdown(line.slice(2))}</blockquote>`);
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      result.push(`<hr class="${styles.Hr}" />`);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Paragraph
    result.push(`<p class="${styles.Paragraph}">${inlineMarkdown(line)}</p>`);
  }

  // Close unclosed blocks gracefully (streaming)
  if (inCodeBlock && codeLines.length > 0) {
    const escaped = codeLines.map(escapeHtml).join('\n');
    result.push(
      `<pre class="${styles.CodeBlock}" data-language="${escapeHtml(codeBlockLang)}"><code>${escaped}</code></pre>`,
    );
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('');
}

function inlineMarkdown(text: string): string {
  let result = escapeHtml(text);
  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code
  result = result.replace(/`([^`]+)`/g, `<code class="${styles.InlineCode}">$1</code>`);
  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    `<a class="${styles.Link}" href="$2" rel="noopener noreferrer">$1</a>`,
  );
  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const AIMarkdown = forwardRef<HTMLDivElement, AIMarkdownProps>(
  function AIMarkdown({ content, streaming = false, className, ...rest }, ref) {
    const html = useMemo(() => renderMarkdown(content), [content]);

    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-streaming={streaming ? 'true' : 'false'}
        dangerouslySetInnerHTML={{ __html: html }}
        {...rest}
      />
    );
  },
);
