import { forwardRef, useEffect, useRef, useState, type CSSProperties } from 'react';
import * as monaco from 'monaco-editor';
import { useEditorTheme } from '../../themes/useEditorTheme';
import { buildMonacoTheme, OV_MONACO_THEME } from '../../themes/monaco';
import styles from './DiffViewer.module.css';

export type DiffMode = 'side-by-side' | 'inline';

export interface DiffViewerProps {
  original: string;
  modified: string;
  language?: string;
  mode?: DiffMode;
  readOnly?: boolean;
  height?: string | number;
  /**
   * Show decorative border and border-radius around the viewer.
   * Set to `false` when embedding in an IDE layout or panel.
   * @default true
   */
  bordered?: boolean;
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
    bordered = true,
    className,
  },
  ref,
) {
  const theme = useEditorTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    monaco.editor.defineTheme(OV_MONACO_THEME, buildMonacoTheme(theme));
    monaco.editor.setTheme(OV_MONACO_THEME);

    const editor = monaco.editor.createDiffEditor(containerRef.current, {
      readOnly,
      renderSideBySide: mode === 'side-by-side',
      renderValidationDecorations: 'off',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      fontSize: 13,
      fontFamily: 'var(--ov-font-family-mono, monospace)',
    });

    const originalModel = monaco.editor.createModel(original, language);
    const modifiedModel = monaco.editor.createModel(modified, language);
    editor.setModel({ original: originalModel, modified: modifiedModel });

    editorRef.current = editor;
    setIsReady(true);

    return () => {
      editor.getModel()?.original?.dispose();
      editor.getModel()?.modified?.dispose();
      editor.dispose();
      editorRef.current = null;
      setIsReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update original content
  useEffect(() => {
    if (!editorRef.current || !isReady) return;
    const origModel = editorRef.current.getModel()?.original;
    if (origModel && original !== origModel.getValue()) {
      origModel.setValue(original);
    }
  }, [original, isReady]);

  // Update modified content
  useEffect(() => {
    if (!editorRef.current || !isReady) return;
    const modifiedEditor = editorRef.current.getModifiedEditor();
    if (modified !== modifiedEditor.getValue()) {
      editorRef.current.getModel()?.modified?.setValue(modified);
    }
  }, [modified, isReady]);

  // Update language
  useEffect(() => {
    if (!editorRef.current || !isReady) return;
    const lang = language ?? 'plaintext';
    const models = editorRef.current.getModel();
    if (models?.original) monaco.editor.setModelLanguage(models.original, lang);
    if (models?.modified) monaco.editor.setModelLanguage(models.modified, lang);
  }, [language, isReady]);

  // Update options
  useEffect(() => {
    if (!editorRef.current || !isReady) return;
    editorRef.current.updateOptions({
      readOnly,
      renderSideBySide: mode === 'side-by-side',
    });
  }, [readOnly, mode, isReady]);

  // Update theme
  useEffect(() => {
    if (!isReady) return;
    monaco.editor.defineTheme(OV_MONACO_THEME, buildMonacoTheme(theme));
    monaco.editor.setTheme(OV_MONACO_THEME);
  }, [theme, isReady]);

  const toDim = (v: string | number) => (typeof v === 'number' ? `${v}px` : v);

  return (
    <div
      ref={ref}
      className={cn(styles.Root, className)}
      style={
        {
          '--_diff-height': toDim(height ?? '100%'),
        } as CSSProperties
      }
      data-testid="diff-viewer"
      {...(!bordered ? { 'data-borderless': '' } : {})}
    >
      <div ref={containerRef} className={styles.Inner} />
    </div>
  );
});

DiffViewer.displayName = 'DiffViewer';
