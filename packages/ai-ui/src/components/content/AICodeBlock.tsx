import { forwardRef, useCallback, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import styles from './AICodeBlock.module.css';

export interface AICodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Code content */
  code: string;
  /** Programming language */
  language?: string;
  /** Optional filename header */
  filename?: string;
  /** Show line numbers (default: false) */
  showLineNumbers?: boolean;
  /** Action buttons (copy, apply, insert) */
  actions?: ReactNode;
}

export const AICodeBlock = forwardRef<HTMLDivElement, AICodeBlockProps>(
  function AICodeBlock(
    { code, language, filename, showLineNumbers = false, actions, className, ...rest },
    ref,
  ) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard API may not be available
      }
    }, [code]);

    const lines = code.split('\n');

    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-language={language}
        {...rest}
      >
        {(filename || actions || language) && (
          <div className={styles.Header}>
            <span className={styles.FileInfo}>
              {filename && <span className={styles.Filename}>{filename}</span>}
              {language && !filename && <span className={styles.Language}>{language}</span>}
            </span>
            <div className={styles.HeaderActions}>
              <button
                type="button"
                className={styles.CopyButton}
                onClick={handleCopy}
                aria-label="Copy code"
              >
                {copied ? '✓' : '⎘'}
              </button>
              {actions}
            </div>
          </div>
        )}
        <pre className={styles.Pre}>
          {showLineNumbers ? (
            <code className={styles.Code}>
              {lines.map((line, i) => (
                <span key={i} className={styles.Line}>
                  <span className={styles.LineNumber}>{i + 1}</span>
                  <span className={styles.LineContent}>{line}</span>
                  {i < lines.length - 1 ? '\n' : ''}
                </span>
              ))}
            </code>
          ) : (
            <code className={styles.Code}>{code}</code>
          )}
        </pre>
      </div>
    );
  },
);
