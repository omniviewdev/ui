import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import type * as Monaco from 'monaco-editor';
import type { QueryLanguageRequest, QueryLanguageResponse } from '@omniviewdev/base-ui';
import { attachCelBridge, type CelBridgeState } from './bridge';

function harness(text = 'cp', identity = 'one') {
  let state: CelBridgeState = { document: { text, version: 1 }, contextKey: 'pod' };
  let modelVersion = 1;
  let changed = () => {};
  let cursorChanged = () => {};
  let composing = () => {};
  let composed = () => {};
  let keyDown: (event: { keyCode: number }) => void = () => {};
  let position = { lineNumber: 1, column: text.length + 1 };
  let completion: Monaco.languages.CompletionItemProvider | undefined;
  let hover: Monaco.languages.HoverProvider | undefined;
  let signature: Monaco.languages.SignatureHelpProvider | undefined;
  const registrations: { dispose: Mock }[] = [];
  const disposable = () => {
    const value = { dispose: vi.fn() };
    registrations.push(value);
    return value;
  };
  const model = {
    id: identity,
    uri: { scheme: `cel-query-${identity}`, path: '/query.cel', toString: () => `cel-query-${identity}:///query.cel` },
    getVersionId: () => modelVersion,
    isDisposed: () => false,
    getValue: () => state.document.text,
    getValueInRange: (range: Monaco.IRange) => state.document.text.slice(range.startColumn - 1, range.endColumn - 1),
  } as unknown as Monaco.editor.ITextModel;
  const actions: Monaco.editor.IActionDescriptor[] = [];
  const trigger = vi.fn();
  const hideHover = vi.fn();
  const editor = {
    getModel: () => model,
    getContribution: () => ({ hideContentHover: hideHover }),
    getPosition: () => position,
    hasTextFocus: () => true,
    trigger,
    updateOptions: vi.fn(),
    onDidChangeModelContent: (listener: () => void) => { changed = listener; return disposable(); },
    onDidChangeCursorPosition: (listener: () => void) => { cursorChanged = listener; return disposable(); },
    onDidCompositionStart: (listener: () => void) => { composing = listener; return disposable(); },
    onDidCompositionEnd: (listener: () => void) => { composed = listener; return disposable(); },
    onKeyDown: (listener: (event: Monaco.IKeyboardEvent) => void) => {
      keyDown = event => listener(event as Monaco.IKeyboardEvent);
      return disposable();
    },
    addAction: (action: Monaco.editor.IActionDescriptor) => { actions.push(action); return disposable(); },
  } as unknown as Monaco.editor.IStandaloneCodeEditor;
  const markers = vi.fn();
  const monaco = {
    editor: { setModelLanguage: vi.fn(), setModelMarkers: markers },
    languages: {
      register: vi.fn(), setLanguageConfiguration: vi.fn(), setMonarchTokensProvider: vi.fn(),
      registerCompletionItemProvider: (_selector: unknown, provider: Monaco.languages.CompletionItemProvider) => {
        completion = provider; return disposable();
      },
      registerHoverProvider: (_selector: unknown, provider: Monaco.languages.HoverProvider) => { hover = provider; return disposable(); },
      registerSignatureHelpProvider: (_selector: unknown, provider: Monaco.languages.SignatureHelpProvider) => {
        signature = provider; return disposable();
      },
      CompletionItemKind: { Field: 1, Operator: 2, Value: 3, Variable: 4, Function: 5 },
      CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
    },
    MarkerSeverity: { Error: 8, Warning: 4, Info: 2, Hint: 1 },
    KeyCode: { Space: 10, Enter: 3, Escape: 9 }, KeyMod: { CtrlCmd: 2048, WinCtrl: 256 },
  } as unknown as typeof Monaco;
  const status = vi.fn();
  const bridge = attachCelBridge(editor, monaco, () => state, status);
  const token = { isCancellationRequested: false, onCancellationRequested: () => ({ dispose() {} }) };
  return {
    model, editor, bridge, status, markers, registrations, trigger, actions,
    hideHover,
    escape: () => keyDown({ keyCode: 9 }),
    setState(next: Partial<CelBridgeState>) { state = { ...state, ...next }; },
    edit(next: string) {
      state = { ...state, document: { text: next, version: state.document.version + 1 } };
      modelVersion++;
      position = { lineNumber: 1, column: next.length + 1 };
      changed();
    },
    cursorChanged, composing, composed,
    async complete(candidate = model, explicit = true, triggerKind = 0) {
      if (explicit) void actions.find(action => action.label === 'CEL: Show contextual suggestions')?.run(editor);
      return await completion?.provideCompletionItems(candidate, position as Monaco.Position,
        { triggerKind }, token);
    },
    async showHover() { return await hover?.provideHover(model, position as Monaco.Position, token); },
    async showSignature() {
      return await signature?.provideSignatureHelp(model, position as Monaco.Position, token,
        { triggerKind: 1, isRetrigger: false });
    },
  };
}

const result = (request: QueryLanguageRequest): QueryLanguageResponse => ({
  documentVersion: request.document.version, contextKey: request.contextKey, status: 'ready',
  completions: [{ id: 'cpu', label: 'cpu', kind: 'field', type: 'int', description: 'CPU cores.',
    sortText: '001', filterText: 'cpu', edit: { range: { start: 0, end: 2, unit: 'utf8-byte' }, text: 'cpu' } }],
  diagnostics: [],
});

afterEach(() => vi.useRealTimers());

describe('model-scoped CEL Monaco bridge', () => {
  it('passes real model identity and releases the old owner on context change and unmount', async () => {
    const host = harness('cp', 'identity');
    const closeOld = vi.fn();
    const closeNew = vi.fn();
    let uri: string | undefined;
    host.setState({ request: async request => { uri = request.document.uri; return result(request); },
      onDocumentClose: closeOld });
    host.bridge.refresh();
    await host.complete();
    expect(uri).toBe('cel-query-identity:///query.cel');
    host.setState({ contextKey: 'cloud', onDocumentClose: closeNew });
    host.bridge.refresh();
    expect(closeOld).toHaveBeenCalledWith('cel-query-identity:///query.cel');
    host.bridge.dispose();
    host.bridge.dispose();
    expect(closeNew).toHaveBeenCalledExactlyOnceWith('cel-query-identity:///query.cel');
  });
  it('returns native typed documentation, relevance, filter text and exact edits', async () => {
    const host = harness();
    host.setState({ request: async request => result(request) });
    const list = await host.complete();
    expect(list?.suggestions).toHaveLength(1);
    expect(list?.suggestions[0]).toMatchObject({ filterText: 'cpu', sortText: '001', insertText: 'cpu',
      label: { label: 'cpu', detail: ': int' }, documentation: { value: 'CPU cores.', isTrusted: false },
      range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 3 } });
    host.bridge.dispose();
  });

  it('does not fill empty matches or disabled receiver candidates with unrelated words', async () => {
    const host = harness('cccc');
    host.setState({ request: async request => ({ ...result(request), completions: [
      { ...result(request).completions[0]!, edit: { range: { start: 0, end: 4, unit: 'utf8-byte' }, text: 'cpu' } },
    ] }) });
    expect((await host.complete())?.suggestions).toEqual([]);
    host.bridge.dispose();
  });

  it('bridges exact Unicode ranges and snippet tab stops without altering host text', async () => {
    const host = harness('"😀é".st');
    host.setState({ request: async request => ({ ...result(request), completions: [{
      id: 'startsWith', label: 'startsWith', kind: 'function', insertTextFormat: 'snippet',
      edit: { range: { start: 9, end: 11, unit: 'utf8-byte' }, text: 'startsWith(${1:prefix})$0' },
    }] }) });
    const suggestion = (await host.complete())?.suggestions[0];
    expect(suggestion).toMatchObject({ insertText: 'startsWith(${1:prefix})$0', insertTextRules: 4,
      range: { startLineNumber: 1, startColumn: 7, endLineNumber: 1, endColumn: 9 } });
    host.bridge.dispose();
  });

  it('rejects malformed UTF-8 edits instead of replacing an adjacent character', async () => {
    const host = harness('😀cp');
    host.setState({ request: async request => ({ ...result(request), completions: [{
      ...result(request).completions[0]!, edit: { range: { start: 2, end: 6, unit: 'utf8-byte' }, text: 'cpu' },
    }] }) });
    expect((await host.complete())?.suggestions).toEqual([]);
    expect(host.status).toHaveBeenCalledWith('The language service returned an invalid UTF-8 completion range.');
    host.bridge.dispose();
  });

  it('debounces changes at 250ms, checks without a popup, and explicitly requests immediately', async () => {
    vi.useFakeTimers();
    const host = harness();
    const requests: QueryLanguageRequest[] = [];
    host.setState({ request: async request => result(request), check: async request => { requests.push(request); return result(request); } });
    host.edit('c');
    vi.advanceTimersByTime(200);
    host.edit('cp');
    vi.advanceTimersByTime(249);
    expect(requests).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(requests).toHaveLength(1);
    expect(host.trigger).toHaveBeenCalledWith('cel', 'editor.action.triggerSuggest', {});
    host.edit('cpu');
    const action = host.actions.find(item => item.label === 'CEL: Show contextual suggestions');
    await action?.run(host.editor);
    expect(requests).toHaveLength(2);
    vi.advanceTimersByTime(500);
    expect(requests).toHaveLength(2);
    host.bridge.dispose();
  });

  it('rejects native retriggers until its one automatic debounce authorizes a request', async () => {
    vi.useFakeTimers();
    const host = harness();
    const request = vi.fn(async (input: QueryLanguageRequest) => ({ ...result(input), incomplete: true }));
    host.setState({ request });
    await host.complete();
    expect(request).toHaveBeenCalledTimes(1);
    host.edit('c');
    expect((await host.complete(host.model, false))?.suggestions).toEqual([]);
    expect((await host.complete(host.model, false, 2))?.suggestions).toEqual([]);
    vi.advanceTimersByTime(249);
    expect(request).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    await host.complete(host.model, false);
    expect(request).toHaveBeenCalledTimes(2);
    await host.complete(host.model, false);
    expect(request).toHaveBeenCalledTimes(2);
    host.bridge.dispose();
  });

  it('does not restart the debounce when a controlled render acknowledges the same edit', async () => {
    vi.useFakeTimers();
    const host = harness();
    const check = vi.fn(async (input: QueryLanguageRequest) => result(input));
    host.setState({ check });
    host.bridge.refresh();
    host.edit('c');
    vi.advanceTimersByTime(200);
    host.bridge.refresh();
    vi.advanceTimersByTime(50);
    expect(check).toHaveBeenCalledTimes(1);
    host.bridge.dispose();
  });

  it('rejects a response with the wrong source version or context envelope', async () => {
    const host = harness();
    host.setState({ request: async request => ({ ...result(request), documentVersion: 999 }) });
    expect((await host.complete())?.suggestions).toEqual([]);
    host.setState({ request: async request => ({ ...result(request), contextKey: 'elsewhere' }) });
    expect((await host.complete())?.suggestions).toEqual([]);
    host.bridge.dispose();
  });

  it('cancels an in-flight request on a source edit before another request starts', async () => {
    const host = harness();
    let input: QueryLanguageRequest | undefined;
    let resolve: ((value: QueryLanguageResponse) => void) | undefined;
    host.setState({ request: request => {
      input = request;
      return new Promise(done => { resolve = done; });
    } });
    const pending = host.complete();
    host.edit('cccc');
    expect(input?.signal.aborted).toBe(true);
    resolve?.(result(input!));
    expect((await pending)?.suggestions).toEqual([]);
    host.bridge.dispose();
  });

  it('cancels obsolete documents, contexts, cursors and disposed work even if host ignores abort', async () => {
    const host = harness();
    const requests: QueryLanguageRequest[] = [];
    let resolve: ((value: QueryLanguageResponse) => void) | undefined;
    host.setState({ request: request => { requests.push(request); return new Promise(done => { resolve = done; }); } });
    const pending = host.complete();
    host.setState({ contextKey: 'vm' });
    host.bridge.refresh();
    expect(requests[0]!.signal.aborted).toBe(true);
    resolve?.(result(requests[0]!));
    expect((await pending)?.suggestions).toEqual([]);
    const second = host.complete();
    host.cursorChanged();
    expect(requests[1]!.signal.aborted).toBe(true);
    resolve?.(result(requests[1]!));
    expect((await second)?.suggestions).toEqual([]);
    const third = host.complete();
    host.bridge.dispose();
    expect(requests[2]!.signal.aborted).toBe(true);
    resolve?.(result(requests[2]!));
    expect((await third)?.suggestions).toEqual([]);
    expect(host.registrations.every(item => item.dispose.mock.calls.length === 1)).toBe(true);
  });

  it('never dispatches a model to another editor and preserves the other editor on disposal', async () => {
    const first = harness('cp', 'first');
    const second = harness('cp', 'second');
    first.setState({ request: async request => result(request) });
    second.setState({ request: async request => result(request) });
    expect((await first.complete(second.model))?.suggestions).toEqual([]);
    first.bridge.dispose();
    expect((await second.complete())?.suggestions).toHaveLength(1);
    second.bridge.dispose();
  });

  it('bridges untrusted hover, signatures, diagnostics and denied availability', async () => {
    const host = harness();
    host.setState({
      request: async request => ({ ...result(request), diagnostics: [{ id: 'bad', severity: 'error',
        message: 'Expected boolean.', range: { start: 0, end: 2, unit: 'utf8-byte' } }] }),
      hover: async request => ({ documentVersion: request.document.version, contextKey: request.contextKey,
        status: 'ready', hover: { range: { start: 0, end: 2, unit: 'utf8-byte' }, contents: '**CPU**' } }),
      signature: async request => ({ documentVersion: request.document.version, contextKey: request.contextKey,
        status: 'ready', signature: { label: 'startsWith(prefix: string): bool', parameters: [{ label: 'prefix: string' }], activeParameter: 0 } }),
    });
    await host.complete();
    expect(host.markers).toHaveBeenLastCalledWith(host.model, expect.any(String), [expect.objectContaining({ message: 'Expected boolean.', severity: 8 })]);
    expect((await host.showHover())?.contents).toEqual([{ value: '**CPU**', isTrusted: false }]);
    expect((await host.showSignature())?.value).toMatchObject({ activeParameter: 0,
      signatures: [{ label: 'startsWith(prefix: string): bool', parameters: [{ label: 'prefix: string' }] }] });
    host.setState({ availability: { status: 'denied', message: 'Scope denied.' } });
    host.bridge.refresh();
    expect((await host.complete())?.suggestions).toEqual([]);
    host.bridge.dispose();
  });

  it('renders parser and checker error diagnostics instead of treating them as transport failures', async () => {
    const host = harness();
    host.setState({
      request: async request => result(request),
      check: async request => ({ ...result(request), status: 'error', message: 'CEL checking failed',
        diagnostics: [{ id: 'undeclared', severity: 'error', message: 'Undeclared reference cp.',
          range: { start: 0, end: 2, unit: 'utf8-byte' } }] }),
    });
    await host.complete();
    expect(host.markers).toHaveBeenLastCalledWith(host.model, expect.any(String),
      [expect.objectContaining({ message: 'Undeclared reference cp.', severity: 8 })]);
    host.bridge.dispose();
  });

  it('retains native Ctrl+Space documentation toggling when a suggestion is focused', () => {
    const host = harness();
    expect(host.actions.find(action => action.label === 'CEL: Show contextual suggestions'))
      .toMatchObject({ precondition: '!suggestWidgetVisible || !suggestWidgetHasFocusedSuggestion' });
    expect(host.editor.updateOptions).toHaveBeenCalledWith(expect.objectContaining({
      acceptSuggestionOnEnter: 'on', tabCompletion: 'off', quickSuggestions: false,
      suggestOnTriggerCharacters: false, fixedOverflowWidgets: true,
    }));
    host.bridge.dispose();
  });

  it('keeps checking scheduled when Escape dismisses automatic completion', async () => {
    vi.useFakeTimers();
    const host = harness();
    const check = vi.fn(async (input: QueryLanguageRequest) => ({ ...result(input),
      status: 'error' as const, diagnostics: [{ id: 'bad', severity: 'error' as const,
        message: 'Invalid expression.', range: { start: 0, end: 1, unit: 'utf8-byte' as const } }] }));
    host.setState({ check, request: async input => result(input) });
    host.edit('invalid');
    vi.advanceTimersByTime(100);
    host.escape();
    vi.advanceTimersByTime(149);
    expect(check).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(check).toHaveBeenCalledTimes(1);
    expect(host.trigger).not.toHaveBeenCalledWith('cel', 'editor.action.triggerSuggest', {});
    expect(host.markers).toHaveBeenLastCalledWith(host.model, expect.any(String),
      [expect.objectContaining({ message: 'Invalid expression.' })]);
    host.bridge.dispose();
  });

  it('dismisses fulfilled semantic popups when context or access changes', () => {
    const host = harness();
    host.hideHover.mockClear();
    host.trigger.mockClear();
    host.setState({ contextKey: 'other' });
    host.bridge.refresh();
    expect(host.hideHover).toHaveBeenCalledTimes(1);
    expect(host.trigger).toHaveBeenCalledWith('cel', 'closeParameterHints', {});
    host.hideHover.mockClear();
    host.trigger.mockClear();
    host.setState({ availability: { status: 'denied' } });
    host.bridge.refresh();
    expect(host.hideHover).toHaveBeenCalledTimes(1);
    expect(host.trigger).toHaveBeenCalledWith('cel', 'closeParameterHints', {});
    host.bridge.dispose();
  });

  it('preserves source-escaped matching independently of decoded labels', async () => {
    const source = String.raw`resource.metadata.labels["quote\"`;
    const host = harness(source);
    host.setState({ request: async input => ({ ...result(input), completions: [{
      id: 'quoted-key', label: 'quote"key', kind: 'value',
      filterText: String.raw`quote\"key`,
      edit: { range: { start: source.indexOf('"') + 1, end: source.length, unit: 'utf8-byte' },
        text: String.raw`quote\"key` },
    }] }) });
    expect((await host.complete())?.suggestions).toEqual([
      expect.objectContaining({ label: { label: 'quote"key', detail: undefined },
        filterText: String.raw`quote\"key`, insertText: String.raw`quote\"key` }),
    ]);
    host.bridge.dispose();
  });

  it('defers requests through IME composition and submits only the explicit run action', async () => {
    vi.useFakeTimers();
    const host = harness();
    const submit = vi.fn();
    const check = vi.fn(async (request: QueryLanguageRequest) => result(request));
    host.setState({ check, onSubmit: submit });
    host.composing();
    host.edit('cp');
    vi.advanceTimersByTime(300);
    expect(check).not.toHaveBeenCalled();
    host.composed();
    vi.advanceTimersByTime(250);
    expect(check).toHaveBeenCalledTimes(1);
    await host.actions.find(item => item.label === 'CEL: Run query')?.run(host.editor);
    expect(submit).toHaveBeenCalledTimes(1);
    host.bridge.dispose();
  });
});
