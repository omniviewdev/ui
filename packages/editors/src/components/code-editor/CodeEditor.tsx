import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as monaco from 'monaco-editor';
import { useEditorTheme } from '../../themes/useEditorTheme';
import { buildMonacoTheme, OV_MONACO_THEME } from '../../themes/monaco';
import { detectLanguage } from '../../utils/language';
import { editorSchemas } from '../../schemas';
import styles from './CodeEditor.module.css';

// ---------------------------------------------------------------------------
// Debug logging (set to false for production)
// ---------------------------------------------------------------------------

const DEBUG = false;
function log(...args: unknown[]) {
  if (DEBUG) console.log('[CodeEditor]', ...args);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Severity levels matching Monaco's MarkerSeverity enum. */
export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint';

/** A parsed diagnostic from the editor's validation markers. */
export interface EditorDiagnostic {
  /** Human-readable error message. */
  message: string;
  /** Severity level. */
  severity: DiagnosticSeverity;
  /** 1-based line number. */
  startLineNumber: number;
  /** 1-based column number. */
  startColumn: number;
  /** 1-based end line number. */
  endLineNumber: number;
  /** 1-based end column number. */
  endColumn: number;
  /** The owner/source of the marker (e.g. "yaml", "typescript"). */
  source?: string;
  /** Optional error code. */
  code?: string;
}

/** Cursor position info passed to `onCursorChange`. */
export interface CursorPosition {
  /** 1-based line number. */
  lineNumber: number;
  /** 1-based column number. */
  column: number;
}

export interface CodeEditorProps {
  /** The editor content. Controlled — updates push new text into the editor. */
  value: string;
  /** Fires when the user edits content. Omit for a read-only display. */
  onChange?: (value: string) => void;

  // -- File identity ----------------------------------------------------------

  /** Explicit Monaco language id (e.g. `"yaml"`, `"typescript"`). */
  language?: string;
  /**
   * Virtual filename / path used to derive the language (when `language` is
   * omitted) and, more importantly, to set the Monaco model URI so that
   * `monaco-yaml` / JSON schema `fileMatch` patterns can match.
   *
   * For structured resources use the convention:
   * `<plugin>/<connectionId>/<group>::<version>::<resource>.yaml`
   *
   * @example "kubernetes/demo-cluster/core::v1::Pod.yaml"
   */
  filename?: string;

  // -- Editor behaviour -------------------------------------------------------

  readOnly?: boolean;
  lineNumbers?: boolean;
  minimap?: boolean;
  wordWrap?: boolean;
  tabSize?: number;
  /** Show TypeScript / JavaScript diagnostics (squiggly error markers). @default false */
  diagnostics?: boolean;
  /** Trigger completions automatically as the user types. @default false */
  quickSuggestions?: boolean;
  /**
   * Enable syntax highlighting. When false the editor still renders text but
   * without any token colouring — useful for plain log output.
   * @default true
   */
  syntaxHighlighting?: boolean;

  // -- Lifecycle callbacks ----------------------------------------------------

  /**
   * Called once after the Monaco editor mounts, exposing the raw editor and
   * `monaco` namespace for advanced configuration (custom keybindings,
   * language registration, LSP server attachment, etc.).
   */
  onMount?: (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco,
  ) => void;

  /**
   * Called whenever the editor's validation markers change. Provides a parsed
   * array of diagnostics that can be displayed in a problems panel, status bar,
   * or custom UI.
   *
   * Fires for all marker owners (YAML, TypeScript, JSON, etc.).
   */
  onDiagnostics?: (diagnostics: EditorDiagnostic[]) => void;

  /**
   * Called when the cursor position changes. Useful for breadcrumb navigation,
   * status bar line/column display, or position tracking.
   */
  onCursorChange?: (position: CursorPosition) => void;

  // -- Layout -----------------------------------------------------------------

  height?: string | number;
  width?: string | number;
  className?: string;
}

/**
 * Snapshot of editor internal state for debug panels / troubleshooting.
 * Obtained via `handle.getDebugState()`.
 */
export interface EditorDebugState {
  // -- Model ------------------------------------------------------------------
  /** The model URI string (drives schema matching). */
  modelUri: string | null;
  /** The resolved language id (e.g. "yaml", "typescript"). */
  modelLanguage: string | null;
  /** Total number of lines. */
  modelLineCount: number;
  /** Total character count. */
  modelContentLength: number;
  /** Monaco's internal version id — incremented on every edit including undo. */
  modelVersionId: number;
  /** End-of-line sequence (`\n` or `\r\n`). */
  modelEOL: string | null;

  // -- Cursor / Selection -----------------------------------------------------
  cursorPosition: CursorPosition | null;
  /** All active selections (multi-cursor). */
  selections: Array<{
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  }>;

  // -- Diagnostics ------------------------------------------------------------
  /** Total marker count across all owners. */
  diagnosticsTotal: number;
  /** Breakdown by severity. */
  diagnosticsBySeverity: Record<DiagnosticSeverity, number>;
  /** Breakdown by owner/source (e.g. { yaml: 2, typescript: 1 }). */
  diagnosticsBySource: Record<string, number>;

  // -- Schema -----------------------------------------------------------------
  /** Total registered schemas in the EditorSchemaRegistry. */
  registeredSchemaCount: number;
  /** Schemas whose fileMatch patterns match the current model URI. */
  matchingSchemas: Array<{ uri: string; name?: string; fileMatch: string[] }>;

  // -- Editor -----------------------------------------------------------------
  /** Whether the editor is read-only. */
  isReadOnly: boolean;
  /** Whether the editor or its widgets have focus. */
  isFocused: boolean;

  // -- Monaco environment -----------------------------------------------------
  /** Total number of Monaco models in memory. */
  totalModelCount: number;
  /** Number of registered languages. */
  registeredLanguageCount: number;
  /** Whether the YAML handle is set (worker initialized). */
  yamlHandleSet: boolean;
}

export interface CodeEditorHandle {
  /** The underlying Monaco standalone code editor, or null before mount. */
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null;
  /** The `monaco-editor` module namespace. */
  getMonaco: () => typeof monaco;
  /** Focus the editor. */
  focus: () => void;
  /** Get the current diagnostics (validation markers) for the editor model. */
  getDiagnostics: () => EditorDiagnostic[];
  /**
   * Snapshot the full editor debug state — model info, cursor, diagnostics,
   * schemas, environment. Designed for debug panels and troubleshooting.
   */
  getDebugState: () => EditorDebugState;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function getOrCreateModel(
  value: string,
  language: string | undefined,
  path: string | undefined,
): monaco.editor.ITextModel {
  if (path) {
    const uri = monaco.Uri.parse(path);
    log('getOrCreateModel — parsed URI:', uri.toString(), '| language:', language);
    const existing = monaco.editor.getModel(uri);
    if (existing) {
      log('  reusing existing model');
      return existing;
    }
    log('  creating new model with URI');
    return monaco.editor.createModel(value, language, uri);
  }
  log('getOrCreateModel — no path, creating anonymous model | language:', language);
  return monaco.editor.createModel(value, language);
}

function severityToString(severity: monaco.MarkerSeverity): DiagnosticSeverity {
  switch (severity) {
    case monaco.MarkerSeverity.Error: return 'error';
    case monaco.MarkerSeverity.Warning: return 'warning';
    case monaco.MarkerSeverity.Info: return 'info';
    default: return 'hint';
  }
}

function markersTodiagnostics(model: monaco.editor.ITextModel): EditorDiagnostic[] {
  return monaco.editor.getModelMarkers({ resource: model.uri }).map((m) => ({
    message: m.message,
    severity: severityToString(m.severity),
    startLineNumber: m.startLineNumber,
    startColumn: m.startColumn,
    endLineNumber: m.endLineNumber,
    endColumn: m.endColumn,
    source: m.source ?? undefined,
    code: typeof m.code === 'string' ? m.code : m.code?.value,
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor(
    {
      value,
      onChange,
      onMount: onMountProp,
      onDiagnostics,
      onCursorChange,
      language,
      filename,
      readOnly = false,
      lineNumbers = true,
      minimap = false,
      wordWrap = false,
      tabSize = 2,
      diagnostics = false,
      quickSuggestions = false,
      syntaxHighlighting = true,
      height = '100%',
      width = '100%',
      className,
    },
    ref,
  ) {
    const theme = useEditorTheme();
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isReady, setIsReady] = useState(false);
    const preventTriggerChangeEvent = useRef(false);
    const subscriptionRef = useRef<monaco.IDisposable | null>(null);
    const markerSubscriptionRef = useRef<monaco.IDisposable | null>(null);
    const cursorSubscriptionRef = useRef<monaco.IDisposable | null>(null);

    const resolvedLanguage = language ?? (filename ? detectLanguage(filename) : undefined);

    log('render — filename:', filename, '| resolvedLanguage:', resolvedLanguage);

    // Pretty-print JSON when the language is JSON
    const displayValue = useMemo(() => {
      if (resolvedLanguage === 'json' && value) {
        try {
          return JSON.stringify(JSON.parse(value), null, 2);
        } catch {
          return value;
        }
      }
      return value;
    }, [resolvedLanguage, value]);

    // -----------------------------------------------------------------------
    // Mount / Unmount
    // -----------------------------------------------------------------------

    useEffect(() => {
      if (!containerRef.current) return;

      log('=== MOUNT ===');

      // Theme
      monaco.editor.defineTheme(OV_MONACO_THEME, buildMonacoTheme(theme));
      monaco.editor.setTheme(OV_MONACO_THEME);

      // TypeScript / JavaScript diagnostics & compiler options
      const diagOpts = diagnostics
        ? {}
        : {
            noSemanticValidation: true,
            noSyntaxValidation: true,
            noSuggestionDiagnostics: true,
          };
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(diagOpts);
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(diagOpts);
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: 2, // JsxEmit.React
        jsxFactory: 'React.createElement',
        allowNonTsExtensions: true,
        allowJs: true,
        target: 99, // ESNext
      });

      // Model — the URI drives schema fileMatch
      const model = getOrCreateModel(
        displayValue,
        syntaxHighlighting ? resolvedLanguage : 'plaintext',
        filename,
      );
      log('  model created — uri:', model.uri.toString());

      const editor = monaco.editor.create(containerRef.current, {
        model,
        readOnly,
        lineNumbers: lineNumbers ? 'on' : 'off',
        minimap: { enabled: minimap },
        wordWrap: wordWrap ? 'on' : 'off',
        quickSuggestions: quickSuggestions
          ? { other: true, strings: true, comments: false }
          : false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        fontSize: 13,
        fontFamily: 'var(--ov-font-family-mono, monospace)',
        tabSize,
      });

      editorRef.current = editor;

      // Apply registered schemas so completions/validation are live
      editorSchemas.applyYamlSchemas();
      editorSchemas.applyJsonSchemas(monaco);

      onMountProp?.(editor, monaco);
      setIsReady(true);
      log('=== MOUNT COMPLETE ===');

      return () => {
        log('=== UNMOUNT ===');
        subscriptionRef.current?.dispose();
        subscriptionRef.current = null;
        markerSubscriptionRef.current?.dispose();
        markerSubscriptionRef.current = null;
        cursorSubscriptionRef.current?.dispose();
        cursorSubscriptionRef.current = null;
        // Detach model before disposing to avoid WordHighlighter "Canceled" errors
        const m = editor.getModel();
        editor.setModel(null);
        m?.dispose();
        editor.dispose();
        editorRef.current = null;
        setIsReady(false);
      };
      // Intentional mount-once effect — props like value, language, readOnly,
      // theme, filename, and callbacks are synced via dedicated effects below.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -----------------------------------------------------------------------
    // Prop → editor syncing
    // -----------------------------------------------------------------------

    // Value
    useEffect(() => {
      const editor = editorRef.current;
      if (!editor || !isReady || displayValue === undefined) return;
      if (editor.getOption(monaco.editor.EditorOption.readOnly)) {
        editor.setValue(displayValue);
      } else if (displayValue !== editor.getValue()) {
        const model = editor.getModel();
        if (!model) return;
        preventTriggerChangeEvent.current = true;
        editor.executeEdits('', [
          {
            range: model.getFullModelRange(),
            text: displayValue,
            forceMoveMarkers: true,
          },
        ]);
        editor.pushUndoStop();
        preventTriggerChangeEvent.current = false;
      }
    }, [displayValue, isReady]);

    // Options
    useEffect(() => {
      if (!editorRef.current || !isReady) return;
      editorRef.current.updateOptions({
        readOnly,
        lineNumbers: lineNumbers ? 'on' : 'off',
        minimap: { enabled: minimap },
        wordWrap: wordWrap ? 'on' : 'off',
        quickSuggestions: quickSuggestions
          ? { other: true, strings: true, comments: false }
          : false,
        tabSize,
      });
    }, [readOnly, lineNumbers, minimap, wordWrap, quickSuggestions, tabSize, isReady]);

    // Language (including syntax highlighting toggle)
    useEffect(() => {
      if (!editorRef.current || !isReady) return;
      const model = editorRef.current.getModel();
      if (model) {
        const lang = syntaxHighlighting ? (resolvedLanguage ?? 'plaintext') : 'plaintext';
        log('setModelLanguage →', lang);
        monaco.editor.setModelLanguage(model, lang);
      }
    }, [resolvedLanguage, syntaxHighlighting, isReady]);

    // Filename → model URI swap (for schema fileMatch)
    const prevFilenameRef = useRef(filename);
    useEffect(() => {
      const editor = editorRef.current;
      if (!editor || !isReady) return;
      if (prevFilenameRef.current === filename) return;
      log('filename changed:', prevFilenameRef.current, '→', filename);
      prevFilenameRef.current = filename;

      const currentModel = editor.getModel();
      const currentValue = currentModel?.getValue?.() ?? displayValue;
      // Detach model before disposing to avoid WordHighlighter "Canceled" errors
      editor.setModel(null);
      currentModel?.dispose();
      const newModel = getOrCreateModel(currentValue, resolvedLanguage, filename);
      editor.setModel(newModel);
      log('  new model set — uri:', newModel.uri.toString());
    }, [filename, isReady, resolvedLanguage, displayValue]);

    // Theme
    useEffect(() => {
      if (!isReady) return;
      monaco.editor.defineTheme(OV_MONACO_THEME, buildMonacoTheme(theme));
      monaco.editor.setTheme(OV_MONACO_THEME);
    }, [theme, isReady]);

    // onChange subscription
    useEffect(() => {
      if (!editorRef.current || !isReady) return;
      subscriptionRef.current?.dispose();
      if (onChange) {
        subscriptionRef.current = editorRef.current.onDidChangeModelContent(() => {
          if (!preventTriggerChangeEvent.current) {
            onChange(editorRef.current!.getValue());
          }
        });
      }
    }, [onChange, isReady]);

    // onDiagnostics subscription — listen to marker changes on the model
    useEffect(() => {
      if (!isReady) return;
      markerSubscriptionRef.current?.dispose();
      if (onDiagnostics) {
        markerSubscriptionRef.current = monaco.editor.onDidChangeMarkers((uris) => {
          const model = editorRef.current?.getModel();
          if (!model) return;
          const modelUri = model.uri.toString();
          if (uris.some((u) => u.toString() === modelUri)) {
            onDiagnostics(markersTodiagnostics(model));
          }
        });
      }
    }, [onDiagnostics, isReady]);

    // onCursorChange subscription
    useEffect(() => {
      if (!editorRef.current || !isReady) return;
      cursorSubscriptionRef.current?.dispose();
      if (onCursorChange) {
        cursorSubscriptionRef.current = editorRef.current.onDidChangeCursorPosition((e) => {
          onCursorChange({
            lineNumber: e.position.lineNumber,
            column: e.position.column,
          });
        });
      }
    }, [onCursorChange, isReady]);

    // Live schema updates — re-apply whenever the registry changes
    useEffect(() => {
      if (!isReady) return;
      return editorSchemas.onChange(() => {
        editorSchemas.applyYamlSchemas();
        editorSchemas.applyJsonSchemas(monaco);
      });
    }, [isReady]);

    // -----------------------------------------------------------------------
    // Imperative handle
    // -----------------------------------------------------------------------

    useImperativeHandle(ref, () => ({
      getEditor: () => editorRef.current,
      getMonaco: () => monaco,
      focus: () => editorRef.current?.focus(),
      getDiagnostics: () => {
        const model = editorRef.current?.getModel();
        return model ? markersTodiagnostics(model) : [];
      },
      getDebugState: (): EditorDebugState => {
        const editor = editorRef.current;
        const model = editor?.getModel() ?? null;
        const markers = model
          ? monaco.editor.getModelMarkers({ resource: model.uri })
          : [];
        const modelUri = model?.uri.toString() ?? null;

        // Diagnostics breakdown
        const diagnosticsBySeverity: Record<DiagnosticSeverity, number> = {
          error: 0, warning: 0, info: 0, hint: 0,
        };
        const diagnosticsBySource: Record<string, number> = {};
        for (const m of markers) {
          const sev = severityToString(m.severity);
          diagnosticsBySeverity[sev]++;
          const src = m.source ?? 'unknown';
          diagnosticsBySource[src] = (diagnosticsBySource[src] ?? 0) + 1;
        }

        // Schema matching
        const matchingSchemas = modelUri
          ? editorSchemas.getSchemasForUri(modelUri).map((s) => ({
              uri: s.uri,
              name: s.name,
              fileMatch: s.fileMatch,
            }))
          : [];

        const pos = editor?.getPosition() ?? null;
        const sels = editor?.getSelections() ?? [];

        return {
          modelUri,
          modelLanguage: model?.getLanguageId() ?? null,
          modelLineCount: model?.getLineCount() ?? 0,
          modelContentLength: model?.getValueLength() ?? 0,
          modelVersionId: model?.getVersionId() ?? 0,
          modelEOL: model?.getEOL() ?? null,
          cursorPosition: pos ? { lineNumber: pos.lineNumber, column: pos.column } : null,
          selections: sels.map((s) => ({
            startLineNumber: s.startLineNumber,
            startColumn: s.startColumn,
            endLineNumber: s.endLineNumber,
            endColumn: s.endColumn,
          })),
          diagnosticsTotal: markers.length,
          diagnosticsBySeverity,
          diagnosticsBySource,
          registeredSchemaCount: editorSchemas.schemas.length,
          matchingSchemas,
          isReadOnly: editor?.getOption(monaco.editor.EditorOption.readOnly) ?? false,
          isFocused: editor?.hasWidgetFocus() ?? false,
          totalModelCount: monaco.editor.getModels().length,
          registeredLanguageCount: monaco.languages.getLanguages().length,
          yamlHandleSet: editorSchemas.isYamlReady,
        };
      },
    }));

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <div
        className={cn(styles.Root, className)}
        style={{ height, width }}
        data-testid="code-editor"
      >
        <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      </div>
    );
  },
);

CodeEditor.displayName = 'CodeEditor';
