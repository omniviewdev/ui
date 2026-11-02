import { useCallback, useMemo, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { LuCheck, LuCopy } from 'react-icons/lu';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
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

const CODE_TAG_PROPS = { className: styles.Code };

// Keep CSS variables unresolved so theme changes reach mounted tokens without a React render.
const SYNTAX_STYLE: SyntaxHighlighterStyle = {
  'code[class*="language-"]': {
    color: 'var(--ov-color-fg-default)',
    fontFamily: 'var(--ov-font-mono)',
    fontSize: 'var(--_ov-font-size)',
    lineHeight: 'var(--_ov-line-height)',
  },
  'pre[class*="language-"]': {
    color: 'var(--ov-color-fg-default)',
    fontFamily: 'var(--ov-font-mono)',
    background: 'transparent',
  },
  comment: {
    color: 'var(--ov-syntax-comment)',
    fontStyle: 'var(--ov-syntax-style-comment, normal)' as CSSProperties['fontStyle'],
  },
  prolog: { color: 'var(--ov-syntax-comment)' },
  doctype: { color: 'var(--ov-syntax-comment)' },
  cdata: { color: 'var(--ov-syntax-comment)' },
  punctuation: { color: 'var(--ov-syntax-punctuation)' },
  property: { color: 'var(--ov-syntax-property)' },
  'property-access': { color: 'var(--ov-syntax-property)' },
  tag: { color: 'var(--ov-syntax-keyword)' },
  boolean: { color: 'var(--ov-syntax-keyword)' },
  number: { color: 'var(--ov-syntax-number)' },
  constant: { color: 'var(--ov-syntax-variable)' },
  symbol: { color: 'var(--ov-syntax-variable)' },
  deleted: { color: 'var(--ov-color-danger)' },
  selector: { color: 'var(--ov-syntax-class)' },
  'attr-name': { color: 'var(--ov-syntax-property)' },
  string: { color: 'var(--ov-syntax-string)' },
  char: { color: 'var(--ov-syntax-string)' },
  'attr-value': { color: 'var(--ov-syntax-string)' },
  'template-string': { color: 'var(--ov-syntax-string)' },
  'template-punctuation': { color: 'var(--ov-syntax-punctuation)' },
  escape: { color: 'var(--ov-syntax-string-escape)' },
  inserted: { color: 'var(--ov-color-success)' },
  operator: { color: 'var(--ov-syntax-operator)' },
  entity: { color: 'var(--ov-syntax-string-escape)' },
  url: { color: 'var(--ov-syntax-string)' },
  atrule: { color: 'var(--ov-syntax-keyword)' },
  keyword: {
    color: 'var(--ov-syntax-keyword)',
    fontStyle: 'var(--ov-syntax-style-keyword, normal)' as CSSProperties['fontStyle'],
  },
  function: {
    color: 'var(--ov-syntax-function)',
    fontStyle: 'var(--ov-syntax-style-function, normal)' as CSSProperties['fontStyle'],
  },
  'function-variable': { color: 'var(--ov-syntax-function)' },
  method: { color: 'var(--ov-syntax-method)' },
  'class-name': {
    color: 'var(--ov-syntax-class)',
    fontStyle: 'var(--ov-syntax-style-type, normal)' as CSSProperties['fontStyle'],
  },
  builtin: { color: 'var(--ov-syntax-type)' },
  namespace: { color: 'var(--ov-syntax-namespace)' },
  regex: { color: 'var(--ov-syntax-regexp)' },
  important: { color: 'var(--ov-syntax-keyword)', fontWeight: 'bold' },
  variable: { color: 'var(--ov-syntax-variable)' },
  parameter: { color: 'var(--ov-syntax-parameter)' },
  decorator: { color: 'var(--ov-syntax-decorator)' },
  'annotation punctuation': { color: 'var(--ov-syntax-decorator)' },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
};

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
  const value = code ?? children ?? '';
  const resolvedLanguage = language?.trim().toLowerCase();
  const maxHeightCss = toCssMaxHeight(maxHeight);
  const customStyle = useMemo<CSSProperties>(
    () => ({
      maxHeight: maxHeightCss,
      margin: 0,
      padding: 'var(--_ov-padding-block) var(--_ov-padding-inline)',
      background: 'transparent',
      overflow: 'auto',
    }),
    [maxHeightCss],
  );

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
          style={SYNTAX_STYLE}
          showLineNumbers={lineNumbers}
          wrapLongLines={wrap}
          className={styles.Pre}
          codeTagProps={CODE_TAG_PROPS}
          lineNumberStyle={LINE_NUMBER_STYLE}
          customStyle={customStyle}
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
