import type * as Monaco from 'monaco-editor';
import type {
  QueryAvailability, QueryCompletion, QueryDocument, QueryLanguageRequest,
  QueryLanguageResponse, QueryLanguageService, QueryHoverService, QuerySignatureService,
  QueryRange, QueryServiceStatus,
} from '@omniviewdev/base-ui';
import { CEL_LANGUAGE_ID, registerCelLanguage } from './language';
import { automaticCompletion, completionMatches, latestRequestGate, sourceOffset, sourcePosition } from './presentation';

export interface CelBridgeState {
  document: QueryDocument;
  contextKey: string;
  request?: QueryLanguageService;
  check?: QueryLanguageService;
  hover?: QueryHoverService;
  signature?: QuerySignatureService;
  onDocumentClose?: (uri: string) => void;
  availability?: QueryAvailability;
  disabled?: boolean;
  onSubmit?: () => void;
  maxSuggestions?: number;
  debounceMs?: number;
}
export interface CelEditorBridge {
  refresh: () => void;
  dispose: () => void;
}
interface ResponseEnvelope {
  documentVersion: number;
  contextKey: string;
  status: QueryServiceStatus;
  message?: string;
}

/** Monaco 0.52 has no hide-hover command; its editor-scoped controller owns dismissal. */
interface Monaco052ContentHoverController extends Monaco.editor.IEditorContribution {
  _hideWidgets: () => void;
}

export function attachCelBridge(
  editor: Monaco.editor.IStandaloneCodeEditor,
  monaco: typeof Monaco,
  getState: () => CelBridgeState,
  onStatus: (message: string | undefined) => void,
  debounceMs = 250,
): CelEditorBridge {
  const model = editor.getModel();
  if (!model) throw new Error('CEL editor requires its own model');
  registerCelLanguage(monaco);
  monaco.editor.setModelLanguage(model, CEL_LANGUAGE_ID);
  const completionGate = latestRequestGate();
  const checkGate = latestRequestGate();
  const hoverGate = latestRequestGate();
  const signatureGate = latestRequestGate();
  let disposed = false;
  let composing = false;
  let generation = 0;
  let completionPermit: number | undefined;
  let completionDismissed = false;
  let localEdit = false;
  let previous: CelBridgeState | undefined;
  const markerOwner = `cel:${model.uri.toString()}`;
  const selector = { language: CEL_LANGUAGE_ID, scheme: model.uri.scheme, pattern: model.uri.path };
  const blocked = () => {
    const state = getState();
    return disposed || model.isDisposed() || composing || state.disabled ||
      Boolean(state.availability && state.availability.status !== 'ready');
  };

  function dismissSemanticWidgets() {
    editor.trigger('cel', 'closeParameterHints', {});
    editor.getContribution<Monaco052ContentHoverController>('editor.contrib.contentHover')?._hideWidgets();
  }

  function range(source: string, value: QueryRange): Monaco.IRange {
    if (value.unit !== 'utf8-byte' || value.end < value.start)
      throw new RangeError('Expected a half-open UTF-8 range');
    const start = sourcePosition(source, value.start);
    const end = sourcePosition(source, value.end);
    return { startLineNumber: start.lineNumber, startColumn: start.column,
      endLineNumber: end.lineNumber, endColumn: end.column };
  }

  async function execute<T extends ResponseEnvelope>(
    service: ((request: QueryLanguageRequest) => Promise<T>) | undefined,
    position: Monaco.IPosition,
    gate: typeof completionGate,
    token?: Monaco.CancellationToken,
  ): Promise<T | undefined> {
    if (!service || blocked() || token?.isCancellationRequested) return;
    const state = getState();
    const document = { ...state.document, uri: model!.uri.toString() };
    const modelVersion = model!.getVersionId();
    const requestGeneration = generation;
    const operation = gate.begin();
    const subscription = token?.onCancellationRequested(() => operation.abort());
    try {
      const response = await service({ document, contextKey: state.contextKey,
        cursor: { offset: sourceOffset(document.text, position), unit: 'utf8-byte' },
        signal: operation.signal });
      const current = getState();
      if (blocked() || !gate.current(operation) || requestGeneration !== generation ||
          model!.isDisposed() || model!.getVersionId() !== modelVersion ||
          current.contextKey !== state.contextKey || current.document.version !== document.version ||
          current.document.text !== document.text || response.documentVersion !== document.version ||
          response.contextKey !== state.contextKey) return;
      if (response.status !== 'ready' && response.status !== 'empty')
        onStatus(response.message ?? `CEL language service ${response.status}.`);
      return response;
    } catch (error) {
      if (!operation.signal.aborted && gate.current(operation) && !disposed)
        onStatus(error instanceof Error ? error.message : 'CEL language service request failed.');
      return;
    } finally {
      subscription?.dispose();
    }
  }

  function markers(result: QueryLanguageResponse) {
    if (result.status === 'denied' || result.status === 'unavailable') {
      monaco.editor.setModelMarkers(model!, markerOwner, []);
      return;
    }
    const severities = { error: monaco.MarkerSeverity.Error, warning: monaco.MarkerSeverity.Warning,
      info: monaco.MarkerSeverity.Info, hint: monaco.MarkerSeverity.Hint };
    const values: Monaco.editor.IMarkerData[] = [];
    for (const diagnostic of result.diagnostics) {
      try {
        values.push({ ...range(getState().document.text, diagnostic.range),
          severity: severities[diagnostic.severity], message: diagnostic.message,
          source: 'CEL', code: diagnostic.id });
      } catch {
        onStatus('The language service returned an invalid UTF-8 diagnostic range.');
      }
    }
    monaco.editor.setModelMarkers(model!, markerOwner, values);
  }

  function completion(item: QueryCompletion, index: number, position: Monaco.IPosition): Monaco.languages.CompletionItem | undefined {
    if (item.disabledReason) return;
    const source = getState().document.text;
    const editRange = range(source, item.edit.range);
    // Monaco completion edits must be single-line and contain the request cursor.
    if (editRange.startLineNumber !== position.lineNumber || editRange.endLineNumber !== position.lineNumber ||
        editRange.startColumn > position.column || editRange.endColumn < position.column)
      throw new RangeError('Completion range must contain the cursor on one line');
    const prefix = model!.getValueInRange({ ...editRange, endColumn: position.column });
    if (!completionMatches(prefix, item.filterText ?? item.label)) return;
    const kinds = { field: monaco.languages.CompletionItemKind.Field,
      operator: monaco.languages.CompletionItemKind.Operator, value: monaco.languages.CompletionItemKind.Value,
      parameter: monaco.languages.CompletionItemKind.Variable, function: monaco.languages.CompletionItemKind.Function };
    return {
      label: { label: item.label, detail: item.type ? `: ${item.type}` : undefined },
      kind: kinds[item.kind], detail: item.detail ?? item.type,
      documentation: item.description || item.condition
        ? { value: [item.description, item.condition].filter(Boolean).join('\n\n'), isTrusted: false }
        : undefined,
      filterText: item.filterText ?? item.label,
      sortText: item.sortText ?? String(index).padStart(6, '0'),
      insertText: item.edit.text,
      insertTextRules: item.insertTextFormat === 'snippet'
        ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
      range: editRange,
    };
  }

  const scheduler = automaticCompletion(() => {
    if (blocked()) return;
    const state = getState();
    const position = editor.getPosition();
    if (!position) return;
    if (state.check) void execute(state.check, position, checkGate).then(result => {
      if (result) { onStatus(result.message); markers(result); }
    });
    if (state.request && !completionDismissed && editor.hasTextFocus()) {
      completionPermit = model.getVersionId();
      editor.trigger('cel', 'editor.action.triggerSuggest', {});
    }
  }, debounceMs);

  const subscriptions: Monaco.IDisposable[] = [
    monaco.languages.registerCompletionItemProvider(selector, {
      async provideCompletionItems(candidate, position, context, token) {
        if (candidate !== model || blocked()) return { suggestions: [] };
        // Monaco also reissues Invoke requests while an existing list is refiltered.
        // Only our scheduler or explicit keybinding may authorize transport work.
        if (context.triggerKind !== 0 || completionPermit !== model.getVersionId())
          return { suggestions: [] };
        completionPermit = undefined;
        const state = getState();
        const result = await execute(state.request, position, completionGate, token);
        if (!result) return { suggestions: [] };
        if (!state.check) markers(result);
        if (result.status !== 'ready') return { suggestions: [] };
        onStatus(result.message);
        const suggestions: Monaco.languages.CompletionItem[] = [];
        for (const [index, item] of result.completions.slice(0, state.maxSuggestions ?? 100).entries()) {
          try {
            const suggestion = completion(item, index, position);
            if (suggestion) suggestions.push(suggestion);
          } catch {
            onStatus('The language service returned an invalid UTF-8 completion range.');
          }
        }
        return { suggestions, incomplete: result.incomplete ?? false };
      },
    }),
    monaco.languages.registerHoverProvider(selector, {
      async provideHover(candidate, position, token) {
        if (candidate !== model) return;
        const result = await execute(getState().hover, position, hoverGate, token);
        if (result?.status !== 'ready' || !result.hover) return;
        try {
          return { range: range(getState().document.text, result.hover.range),
            contents: [{ value: result.hover.contents, isTrusted: false }] };
        } catch { onStatus('The language service returned an invalid UTF-8 hover range.'); return; }
      },
    }),
    monaco.languages.registerSignatureHelpProvider(selector, {
      signatureHelpTriggerCharacters: ['(', ','],
      signatureHelpRetriggerCharacters: [','],
      async provideSignatureHelp(candidate, position, token) {
        if (candidate !== model) return;
        const result = await execute(getState().signature, position, signatureGate, token);
        if (result?.status !== 'ready' || !result.signature) return;
        const signature = result.signature;
        return {
          value: { activeSignature: 0,
            activeParameter: Math.max(0, Math.min(signature.activeParameter, signature.parameters.length - 1)),
            signatures: [{ label: signature.label,
              documentation: signature.documentation ? { value: signature.documentation, isTrusted: false } : undefined,
              parameters: signature.parameters.map(parameter => ({ label: parameter.label,
                documentation: parameter.documentation ? { value: parameter.documentation, isTrusted: false } : undefined })) }] },
          dispose() {},
        };
      },
    }),
    editor.onDidChangeModelContent(() => {
      localEdit = true;
      completionDismissed = false;
      completionPermit = undefined;
      completionGate.cancel(); checkGate.cancel(); hoverGate.cancel(); signatureGate.cancel();
      editor.trigger('cel', 'hideSuggestWidget', {});
      monaco.editor.setModelMarkers(model, markerOwner, []);
      if (!composing) scheduler.schedule(getState().debounceMs ?? debounceMs);
    }),
    editor.onDidChangeCursorPosition(() => {
      completionPermit = undefined;
      completionGate.cancel(); signatureGate.cancel();
    }),
    editor.onDidCompositionStart(() => {
      composing = true;
      completionPermit = undefined;
      scheduler.cancel();
      completionGate.cancel(); checkGate.cancel(); hoverGate.cancel(); signatureGate.cancel();
      editor.trigger('cel', 'hideSuggestWidget', {});
      dismissSemanticWidgets();
    }),
    editor.onDidCompositionEnd(() => {
      composing = false;
      scheduler.schedule(getState().debounceMs ?? debounceMs);
    }),
    editor.onKeyDown(event => {
      if (event.keyCode === monaco.KeyCode.Escape) {
        completionPermit = undefined;
        completionDismissed = true;
        completionGate.cancel();
      }
    }),
    editor.addAction({ id: `cel.complete.${model.id}`, label: 'CEL: Show contextual suggestions',
      precondition: '!suggestWidgetVisible || !suggestWidgetHasFocusedSuggestion',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, monaco.KeyMod.WinCtrl | monaco.KeyCode.Space],
      run: () => {
        if (blocked()) return;
        completionDismissed = false;
        scheduler.immediate();
      } }),
    editor.addAction({ id: `cel.run.${model.id}`, label: 'CEL: Run query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => { if (!blocked()) getState().onSubmit?.(); } }),
  ];

  function refresh() {
    if (disposed || model!.isDisposed()) return;
    const state = getState();
    const sameContext = previous && previous.contextKey === state.contextKey &&
      previous.request === state.request && previous.check === state.check &&
      previous.hover === state.hover && previous.signature === state.signature &&
      previous.disabled === state.disabled && previous.maxSuggestions === state.maxSuggestions &&
      previous.debounceMs === state.debounceMs &&
      previous.availability?.status === state.availability?.status &&
      previous.availability?.message === state.availability?.message;
    if (previous && (previous.contextKey !== state.contextKey || previous.request !== state.request ||
      previous.check !== state.check || previous.hover !== state.hover || previous.signature !== state.signature))
      previous.onDocumentClose?.(model!.uri.toString());
    const acknowledgedEdit = localEdit && model!.getValue() === state.document.text;
    const sameDocument = previous?.document.text === state.document.text &&
      previous.document.version === state.document.version;
    previous = { ...state, document: { ...state.document },
      availability: state.availability ? { ...state.availability } : undefined };
    localEdit = false;
    // A normal controlled acknowledgement must not add a second scheduling delay,
    // or cancel an explicit request started before React committed the same edit.
    if (sameContext && (acknowledgedEdit || sameDocument)) return;
    completionPermit = undefined;
    completionDismissed = false;
    generation++;
    completionGate.cancel(); checkGate.cancel(); hoverGate.cancel(); signatureGate.cancel();
    scheduler.cancel();
    editor.trigger('cel', 'hideSuggestWidget', {});
    dismissSemanticWidgets();
    monaco.editor.setModelMarkers(model!, markerOwner, []);
    editor.updateOptions({ quickSuggestions: false, suggestOnTriggerCharacters: false,
      wordBasedSuggestions: 'off', parameterHints: { enabled: true },
      suggest: { showWords: false, showStatusBar: true, preview: false, selectionMode: 'always' },
      acceptSuggestionOnEnter: 'on', tabCompletion: 'off',
      renderValidationDecorations: 'on', fixedOverflowWidgets: true,
      padding: { top: 8, bottom: 8 } });
    onStatus(getState().availability?.message);
    if (!blocked()) scheduler.schedule(state.debounceMs ?? debounceMs);
  }
  refresh();
  return {
    refresh,
    dispose() {
      if (disposed) return;
      disposed = true;
      completionPermit = undefined;
      scheduler.cancel();
      completionGate.cancel(); checkGate.cancel(); hoverGate.cancel(); signatureGate.cancel();
      previous?.onDocumentClose?.(model!.uri.toString());
      for (const subscription of subscriptions) subscription.dispose();
      if (!model.isDisposed()) dismissSemanticWidgets();
      if (!model.isDisposed()) monaco.editor.setModelMarkers(model, markerOwner, []);
    },
  };
}
