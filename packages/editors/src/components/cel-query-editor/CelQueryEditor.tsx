import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type * as Monaco from 'monaco-editor';
import type {
  QueryEditorRenderProps, QueryHoverService, QuerySignatureService, QueryLanguageService,
} from '@omniviewdev/base-ui';
import { attachCelBridge, type CelEditorBridge } from './bridge';
import { CEL_LANGUAGE_ID } from './language';
import styles from './CelQueryEditor.module.css';

// Uses CodeEditor's existing Monaco instance/theme/worker ownership, loaded only in code mode.
const LazyCodeEditor = lazy(() => import('../code-editor/CodeEditor').then(module => ({ default: module.CodeEditor })));
let nextEditorId = 0;

export interface CelQueryEditorProps extends QueryEditorRenderProps {
  /** A check channel also runs while unfocused, independently of completion popup visibility. */
  check?: QueryLanguageService;
  hover?: QueryHoverService;
  signature?: QuerySignatureService;
  /** Releases adapter document ownership when this model unmounts or changes context. */
  onDocumentClose?: (uri: string) => void;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  onMount?: (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => void;
}

/** Controlled, contextual CEL surface. This component never parses or evaluates CEL. */
export function CelQueryEditor(props: CelQueryEditorProps) {
  const {
    document, contextKey, request, check, hover, signature, disabled, availability,
    debounceMs = 250, maxSuggestions = 100, label = 'CEL query', placeholder = 'Enter a CEL expression…',
    minHeight = 52, maxHeight = 180, className,
  } = props;
  const latest = useRef(props);
  useLayoutEffect(() => {
    latest.current = props;
  }, [props]);
  const [filename] = useState(() => `cel-query-${++nextEditorId}:///query.cel`);
  const [contentHeight, setContentHeight] = useState(minHeight);
  const height = Math.max(minHeight, Math.min(maxHeight, contentHeight));
  const [message, setMessage] = useState<string>();
  const [instance, setInstance] = useState<{
    editor: Monaco.editor.IStandaloneCodeEditor;
    monaco: typeof Monaco;
  } | null>(null);
  const bridgeRef = useRef<CelEditorBridge | null>(null);
  const blocked = disabled || Boolean(availability && availability.status !== 'ready');

  // FastRefresh can replay this effect while CodeEditor retains its editor/model.
  // Own installation and cleanup together rather than relying on onMount to repeat.
  useEffect(() => {
    const model = instance?.editor.getModel();
    if (!instance || !model || model.isDisposed()) return;
    const { editor, monaco } = instance;
    const bridge = attachCelBridge(editor, monaco, () => latest.current, setMessage);
    bridgeRef.current = bridge;
    const updateHeight = () => setContentHeight(editor.getContentHeight());
    const sizeSubscription = editor.onDidContentSizeChange(updateHeight);
    return () => {
      sizeSubscription.dispose();
      bridge.dispose();
      if (bridgeRef.current === bridge) bridgeRef.current = null;
    };
  }, [instance]);

  useEffect(() => {
    bridgeRef.current?.refresh();
  }, [document.text, document.version, contextKey, request, check, hover, signature,
    disabled, availability?.status, availability?.message, maxSuggestions, debounceMs, instance]);

  useEffect(() => {
    const editor = instance?.editor;
    if (!editor?.getModel()) return;
    editor.updateOptions({ ariaLabel: label });
  }, [label, instance]);

  function mount(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
    setContentHeight(editor.getContentHeight());
    setInstance({ editor, monaco });
    props.onMount?.(editor, monaco);
  }

  return (
    <div className={`${styles.Root} ${className ?? ''}`} data-testid="cel-query-editor"
      data-context-key={contextKey} data-availability={availability?.status ?? 'ready'}>
      <div className={styles.Label}>{label}</div>
      <div className={styles.Surface}
        style={{ '--_cel-editor-min-height': `${minHeight}px` } as CSSProperties}>
        <Suspense fallback={<div role="status" className={styles.Loading}>Loading CEL editor…</div>}>
          <LazyCodeEditor
            value={document.text}
            onChange={text => {
              const current = latest.current;
              // Keep an immediate snapshot for manual requests before the controlled render commits.
              latest.current = { ...current, document: { text, version: current.document.version + 1 } };
              current.onChange(text);
            }}
            filename={filename}
            language={CEL_LANGUAGE_ID}
            readOnly={blocked}
            lineNumbers={false}
            minimap={false}
            wordWrap
            quickSuggestions={false}
            diagnostics
            bordered={false}
            height={height}
            onMount={mount}
          />
        </Suspense>
        {!document.text && !blocked ? <div className={styles.Placeholder} aria-hidden="true">{placeholder}</div> : null}
      </div>
      {message || availability?.message ? (
        <div role={availability?.status === 'denied' || availability?.status === 'error' ? 'alert' : 'status'}
          className={styles.Message}>{message ?? availability?.message}</div>
      ) : null}
      <div className={styles.Hint}>Ctrl+Space suggestions · ⌘/Ctrl+Enter run · Enter accepts a suggestion</div>
    </div>
  );
}
