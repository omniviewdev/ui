import { useCallback, useMemo, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { LuCheck, LuCopy } from 'react-icons/lu';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import { useTheme } from '../../theme';
import { Chip } from '../chip';
import styles from './CodeBlock.module.css';

export interface CodeBlockProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'color'>, StyledComponentProps {
  code?: string;
  children?: string;
  language?: string;
  lineNumbers?: boolean;
  copyable?: boolean;
  wrap?: boolean;
  maxHeight?: number | string;
  onCopyCode?: (value: string) => void;
  copyLabel?: string;
}

type SyntaxHighlighterStyle = { [key: string]: CSSProperties };

const LINE_NUMBER_STYLE: CSSProperties = {
  color: 'var(--ov-color-fg-subtle)',
  textAlign: 'right',
  paddingInlineEnd: '10px',
  minWidth: '2.4em',
  userSelect: 'none',
};

function getSyntaxStyle(theme: ReturnType<typeof useTheme>['theme']): SyntaxHighlighterStyle {
  if (theme === 'light' || theme === 'high-contrast-light') {
    return oneLight as SyntaxHighlighterStyle;
  }

  return oneDark as SyntaxHighlighterStyle;
}

function toCssMaxHeight(maxHeight: number | string | undefined): CSSProperties['maxHeight'] {
  if (maxHeight === undefined) {
    return undefined;
  }

  return typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
}

export function CodeBlock({
  className,
  code,
  children,
  language,
  lineNumbers = false,
  copyable = false,
  wrap = false,
  maxHeight,
  onCopyCode,
  copyLabel,
  variant,
  color,
  size,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const value = code ?? children ?? '';
  const syntaxStyle = useMemo(() => getSyntaxStyle(theme), [theme]);
  const resolvedLanguage = language?.trim().toLowerCase();
  const maxHeightCss = toCssMaxHeight(maxHeight);

  const handleCopy = useCallback(async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    }

    onCopyCode?.(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 900);
  }, [onCopyCode, value]);

  const hasHeader = Boolean(language);

  return (
    <figure
      className={cn(styles.Root, className)}
      data-ov-wrap={wrap ? 'true' : 'false'}
      data-ov-copyable={copyable ? 'true' : 'false'}
      {...styleDataAttributes({ variant, color, size })}
      {...props}
    >
      {hasHeader ? (
        <figcaption className={styles.Header}>
          {language ? (
            <Chip size="sm" variant="soft" color={color} mono>
              {language}
            </Chip>
          ) : null}
        </figcaption>
      ) : null}
      <div className={styles.Content}>
        <SyntaxHighlighter
          language={resolvedLanguage}
          style={syntaxStyle}
          showLineNumbers={lineNumbers}
          wrapLongLines={wrap}
          className={styles.Pre}
          codeTagProps={{ className: styles.Code }}
          lineNumberStyle={LINE_NUMBER_STYLE}
          customStyle={{
            maxHeight: maxHeightCss,
            margin: 0,
            padding: 'var(--_ov-padding-block) var(--_ov-padding-inline)',
            background: 'transparent',
            overflow: 'auto',
          }}
        >
          {value}
        </SyntaxHighlighter>
        {copyable ? (
          <button
            type="button"
            className={styles.CopyButton}
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : (copyLabel ?? 'Copy code')}
            title={copied ? 'Copied' : (copyLabel ?? 'Copy code')}
          >
            {copied ? <LuCheck aria-hidden /> : <LuCopy aria-hidden />}
          </button>
        ) : null}
      </div>
    </figure>
  );
}

CodeBlock.displayName = 'CodeBlock';
