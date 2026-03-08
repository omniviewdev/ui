import { forwardRef, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useEditorTheme } from '../../themes/useEditorTheme';
import { buildMonacoTheme, OV_MONACO_THEME } from '../../themes/monaco';
import styles from './DiffViewer.module.css';

const MonacoDiffEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.DiffEditor })),
);

export type DiffMode = 'side-by-side' | 'inline';

export interface DiffViewerProps {
  original: string;
  modified: string;
  language?: string;
  mode?: DiffMode;
  readOnly?: boolean;
  height?: string | number;
  className?: string;
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const DiffViewer = forwardRef<HTMLDivElement, DiffViewerProps>(function DiffViewer(
  {
    original,
    modified,
    language,
    mode = 'side-by-side',
    readOnly = true,
    height = '100%',
    className,
  },
  ref,
) {
  const theme = useEditorTheme();
  const monacoRef = useRef<unknown>(null);
  const [isReady, setIsReady] = useState(false);

  const handleEditorDidMount = useCallback(
    (_editor: unknown, monaco: unknown) => {
      monacoRef.current = monaco;
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

  return (
    <div
      ref={ref}
      className={cn(styles.Root, className)}
      style={{ height }}
      data-testid="diff-viewer"
    >
      <Suspense
        fallback={
          <div className={styles.Loading} data-testid="diff-viewer-loading">
            Loading diff…
          </div>
        }
      >
        <MonacoDiffEditor
          original={original}
          modified={modified}
          language={language}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            renderSideBySide: mode === 'side-by-side',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: 13,
            fontFamily: 'var(--ov-font-family-mono, monospace)',
          }}
          height="100%"
        />
      </Suspense>
    </div>
  );
});

DiffViewer.displayName = 'DiffViewer';
