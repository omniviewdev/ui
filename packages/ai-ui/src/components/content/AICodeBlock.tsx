import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { CodeBlock } from '@omniviewdev/base-ui';
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
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-language={language}
        {...rest}
      >
        {(filename || actions) && (
          <div className={styles.Header}>
            {filename && <span className={styles.Filename}>{filename}</span>}
            {actions && <div className={styles.HeaderActions}>{actions}</div>}
          </div>
        )}
        <CodeBlock
          code={code}
          language={language}
          lineNumbers={showLineNumbers}
          copyable
        />
      </div>
    );
  },
);
