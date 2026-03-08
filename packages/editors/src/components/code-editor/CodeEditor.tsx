import {
  forwardRef,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useEditorTheme } from '../../themes/useEditorTheme';
import { buildMonacoTheme, OV_MONACO_THEME } from '../../themes/monaco';
import { detectLanguage } from '../../utils/language';
import styles from './CodeEditor.module.css';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  filename?: string;
  readOnly?: boolean;
  lineNumbers?: boolean;
  minimap?: boolean;
  wordWrap?: boolean;
  height?: string | number;
  width?: string | number;
  className?: string;
}

export interface CodeEditorHandle {
  getEditor: () => unknown | null;
  focus: () => void;
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  {
    value,
    onChange,
    language,
    filename,
    readOnly = false,
    lineNumbers = true,
    minimap = false,
    wordWrap = false,
    height = '100%',
    width = '100%',
    className,
  },
  ref,
) {
  const theme = useEditorTheme();
  const editorRef = useRef<unknown>(null);
  const monacoRef = useRef<unknown>(null);
  const [isReady, setIsReady] = useState(false);

  const resolvedLanguage = language ?? (filename ? detectLanguage(filename) : undefined);

  // Format JSON content for display
  const displayValue = (() => {
    if (resolvedLanguage === 'json' && value) {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    }
    return value;
  })();

  const handleEditorDidMount = useCallback(
    (editor: unknown, monaco: unknown) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Register and apply theme
      const m = monaco as {
        editor: {
          defineTheme: (name: string, data: unknown) => void;
          setTheme: (name: string) => void;
        };
      };
      m.editor.defineTheme(OV_MONACO_THEME, buildMonacoTheme(theme));
      m.editor.setTheme(OV_MONACO_THEME);

      setIsReady(true);
    },
    [theme],
  );

  // Update theme when it changes
  useEffect(() => {
    if (!monacoRef.current || !isReady) return;
    const m = monacoRef.current as {
      editor: {
        defineTheme: (name: string, data: unknown) => void;
        setTheme: (name: string) => void;
      };
    };
    m.editor.defineTheme(OV_MONACO_THEME, buildMonacoTheme(theme));
    m.editor.setTheme(OV_MONACO_THEME);
  }, [theme, isReady]);

  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current,
    focus: () => {
      const e = editorRef.current as { focus?: () => void } | null;
      e?.focus?.();
    },
  }));

  const handleChange = useCallback(
    (val: string | undefined) => {
      if (onChange && val !== undefined) {
        onChange(val);
      }
    },
    [onChange],
  );

  return (
    <div className={cn(styles.Root, className)} style={{ height, width }} data-testid="code-editor">
      <Suspense
        fallback={
          <div className={styles.Loading} data-testid="code-editor-loading">
            Loading editor…
          </div>
        }
      >
        <MonacoEditor
          value={displayValue}
          language={resolvedLanguage}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            lineNumbers: lineNumbers ? 'on' : 'off',
            minimap: { enabled: minimap },
            wordWrap: wordWrap ? 'on' : 'off',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: 13,
            fontFamily: 'var(--ov-font-family-mono, monospace)',
            tabSize: 2,
          }}
          height="100%"
          width="100%"
        />
      </Suspense>
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';
