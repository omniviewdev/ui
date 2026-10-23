import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCelDevelopmentAdapter } from './index';

const makeRequest = (text = 'cp', version = 1, uri = 'file:///one.cel', contextKey = 'pod') => ({
  document: { text, version, uri }, cursor: { offset: new TextEncoder().encode(text).length, unit: 'utf8-byte' as const },
  contextKey, signal: new AbortController().signal,
});
type Message = { id?: number; method: string; params?: unknown };
function server(result: (message: Message) => unknown = () => null, encoding?: string) {
  const messages: Message[] = [];
  const headers: (string | null)[] = [];
  vi.stubGlobal('fetch', vi.fn(async (_url: unknown, init?: RequestInit) => {
    const message = JSON.parse(String(init?.body)) as Message;
    messages.push(message);
    headers.push(new Headers(init?.headers).get('X-CEL-LSP-Session'));
    if (message.id === undefined) return new Response(null, { status: 204 });
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: message.id,
      result: message.method === 'initialize' ? { capabilities: { ...(encoding ? { positionEncoding: encoding } : {}) } } : result(message),
    }), { headers: message.method === 'initialize' ? { 'X-CEL-LSP-Session': `session-${messages.length}` } : {} });
  }));
  return { messages, headers };
}
afterEach(() => vi.unstubAllGlobals());

describe('browser LSP lifecycle', () => {
  it('initializes lazily, synchronizes full documents, and closes sessions on reusable disposal', async () => {
    const wire = server(message => message.method === 'textDocument/completion' ? { isIncomplete: false, items: [] } : null);
    const adapter = createCelDevelopmentAdapter('pod');
    expect(wire.messages).toHaveLength(0);
    await adapter.languageService(makeRequest());
    await adapter.languageService(makeRequest('cpu', 2));
    expect(wire.messages.map(message => message.method)).toEqual(['initialize', 'initialized', 'textDocument/didOpen', 'textDocument/completion', 'textDocument/didChange', 'textDocument/completion']);
    expect(wire.headers.slice(1).every(value => value === 'session-1')).toBe(true);
    expect(wire.messages[0]?.params).toMatchObject({ initializationOptions: { profileId: 'pod' }, capabilities: { general: { positionEncodings: ['utf-16', 'utf-8'] } } });
    expect(wire.messages[4]?.params).toEqual({ textDocument: { uri: 'file:///one.cel', version: 2 }, contentChanges: [{ text: 'cpu' }] });
    await adapter.dispose();
    expect(wire.messages.slice(-3).map(message => message.method)).toEqual(['textDocument/didClose', 'shutdown', 'exit']);
    await adapter.dispose();
    await adapter.languageService(makeRequest());
    expect(wire.messages.filter(message => message.method === 'initialize')).toHaveLength(2);
    await adapter.dispose();
  });

  it('isolates models, rejects regressed versions, and reopens changed context', async () => {
    const wire = server(() => ({ isIncomplete: false, items: [] }));
    const adapter = createCelDevelopmentAdapter('pod');
    await adapter.languageService(makeRequest('cp', 2));
    await adapter.languageService(makeRequest('resource.', 1, 'file:///two.cel'));
    await expect(adapter.languageService(makeRequest('old', 1))).rejects.toThrow('version');
    await adapter.languageService(makeRequest('cp', 2, 'file:///one.cel', 'new-context'));
    expect(wire.messages.filter(message => message.method === 'textDocument/didOpen')).toHaveLength(3);
    await adapter.closeDocument('file:///two.cel');
    expect(wire.messages.filter(message => message.method === 'textDocument/didClose')).toHaveLength(2);
    await adapter.dispose();
  });

  it('maps standard completion, hover, signature and diagnostic ranges without losing Unicode or CRLF', async () => {
    const wire = server(message => {
      const range = { start: { line: 1, character: 0 }, end: { line: 1, character: 2 } };
      if (message.method === 'textDocument/completion') return { isIncomplete: true, items: [{ label: 'cpu', kind: 5, detail: 'int', sortText: '001', filterText: 'cpu', documentation: { kind: 'markdown', value: 'CPU cores' }, textEdit: { range, newText: 'cpu' } }] };
      if (message.method === 'textDocument/hover') return { range, contents: { kind: 'markdown', value: '**cpu**' } };
      if (message.method === 'textDocument/signatureHelp') return { activeSignature: 0, activeParameter: 0, signatures: [{ label: 'f(value: int)', documentation: 'Function', parameters: [{ label: [2, 12] }] }] };
      return { kind: 'full', items: [{ range, severity: 1, message: 'Expected boolean' }] };
    });
    const adapter = createCelDevelopmentAdapter('pod');
    const request = makeRequest('😀\r\ncp');
    const completion = await adapter.languageService(request);
    expect(completion.completions[0]).toMatchObject({ label: 'cpu', kind: 'field', description: 'CPU cores', sortText: '001', edit: { range: { start: 6, end: 8, unit: 'utf8-byte' }, text: 'cpu' } });
    expect(completion.incomplete).toBe(true);
    expect((await adapter.hover(request)).hover).toEqual({ contents: '**cpu**', range: { start: 6, end: 8, unit: 'utf8-byte' } });
    expect((await adapter.signature(request)).signature?.parameters).toEqual([{ label: 'value: int' }]);
    expect((await adapter.check(request)).diagnostics[0]).toMatchObject({ severity: 'error', range: { start: 6, end: 8, unit: 'utf8-byte' } });
    expect(wire.messages.find(message => message.method === 'textDocument/completion')?.params).toMatchObject({ position: { line: 1, character: 2 } });
    await adapter.dispose();
  });

  it.each([['utf-16', 2], ['utf-8', 4]])('uses negotiated %s positions', async (encoding, character) => {
    const wire = server(() => ({ isIncomplete: false, items: [] }), encoding);
    const adapter = createCelDevelopmentAdapter('pod');
    await adapter.languageService(makeRequest('😀'));
    expect(wire.messages.find(message => message.method === 'textDocument/completion')?.params).toMatchObject({ position: { line: 0, character } });
    await adapter.dispose();
  });

  it.each([
    { isIncomplete: false, items: [{ label: 'cpu', kind: 5, textEdit: { range: { start: { line: 0, character: 2 }, end: { line: 0, character: 0 } }, newText: 'cpu' } }] },
    { isIncomplete: 'false', items: [] },
    { isIncomplete: false, items: [{ label: ['cpu'] }] },
  ])('rejects malformed feature JSON', async payload => {
    server(() => payload);
    const adapter = createCelDevelopmentAdapter('pod');
    await expect(adapter.languageService(makeRequest())).rejects.toThrow('Malformed');
    await adapter.dispose();
  });

  it('sends cancellation by request ID and rejects a late uncancelled transport response', async () => {
    const wire = server(() => ({ isIncomplete: false, items: [] }));
    const fetch = globalThis.fetch;
    let resolve: (() => void) | undefined;
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const message = JSON.parse(String(init?.body)) as Message;
      if (message.method === 'textDocument/completion') await new Promise<void>(done => { resolve = done; });
      return fetch(input, init);
    }));
    const adapter = createCelDevelopmentAdapter('pod');
    const controller = new AbortController();
    const pending = adapter.languageService({ ...makeRequest(), signal: controller.signal });
    await vi.waitFor(() => expect(resolve).toBeDefined());
    controller.abort();
    resolve?.();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    await vi.waitFor(() => expect(wire.messages.some(message => message.method === '$/cancelRequest')).toBe(true));
    const cancellation = wire.messages.find(message => message.method === '$/cancelRequest');
    const completion = wire.messages.find(message => message.method === 'textDocument/completion');
    expect(cancellation?.params).toEqual({ id: completion?.id });
    await adapter.dispose();
  });
  it('rejects responses after a newer version or a close/reopen of the same model', async () => {
    server(message => message.method === 'textDocument/completion' ? { isIncomplete: false, items: [] } : { kind: 'full', items: [] });
    const fetch = globalThis.fetch;
    const releases: (() => void)[] = [];
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const message = JSON.parse(String(init?.body)) as Message;
      if (message.method === 'textDocument/completion') await new Promise<void>(done => { releases.push(done); });
      return fetch(input, init);
    }));
    const adapter = createCelDevelopmentAdapter('pod');
    const first = adapter.languageService(makeRequest());
    await vi.waitFor(() => expect(releases).toHaveLength(1));
    await adapter.check(makeRequest('cpu', 2));
    releases[0]?.();
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    const second = adapter.languageService(makeRequest('cpu', 2));
    await vi.waitFor(() => expect(releases).toHaveLength(2));
    await adapter.closeDocument('file:///one.cel');
    await adapter.check(makeRequest('cpu', 2));
    releases[1]?.();
    await expect(second).rejects.toMatchObject({ name: 'AbortError' });
    await adapter.dispose();
  });

  it('shares initialization across simultaneous models without aliasing their documents', async () => {
    const wire = server(() => ({ isIncomplete: false, items: [] }));
    const adapter = createCelDevelopmentAdapter('pod');
    await Promise.all([
      adapter.languageService(makeRequest('cp', 1, 'file:///a.cel')),
      adapter.languageService(makeRequest('resource.', 1, 'file:///b.cel')),
    ]);
    expect(wire.messages.filter(message => message.method === 'initialize')).toHaveLength(1);
    expect(wire.messages.filter(message => message.method === 'textDocument/didOpen').map(message => message.params))
      .toEqual([
        { textDocument: { uri: 'file:///a.cel', languageId: 'cel', text: 'cp', version: 1 } },
        { textDocument: { uri: 'file:///b.cel', languageId: 'cel', text: 'resource.', version: 1 } },
      ]);
    await adapter.dispose();
  });

  it.each(['wrong-id', 'missing-session', 'unsupported-encoding', 'rpc-error'])('rejects %s at the JSON-RPC boundary', async failure => {
    vi.stubGlobal('fetch', vi.fn(async (_input: unknown, init?: RequestInit) => {
      const message = JSON.parse(String(init?.body)) as Message;
      if (message.id === undefined) return new Response(null, { status: 204 });
      return new Response(JSON.stringify({
        jsonrpc: '2.0', id: failure === 'wrong-id' ? -1 : message.id,
        ...(failure === 'rpc-error' ? { error: { code: -32602, message: 'Invalid context' } }
          : { result: message.method === 'initialize' ? { capabilities: { positionEncoding: failure === 'unsupported-encoding' ? 'utf-32' : 'utf-16' } } : null }),
      }), { headers: failure === 'missing-session' ? {} : { 'X-CEL-LSP-Session': 'issued-session' } });
    }));
    const adapter = createCelDevelopmentAdapter('pod');
    await expect(adapter.languageService(makeRequest())).rejects.toThrow(failure === 'rpc-error' ? 'Invalid context' : 'Malformed');
    await adapter.dispose();
  });
  it('repeated disposal awaits the same shutdown rather than resolving before session release', async () => {
    const wire = server(() => ({ isIncomplete: false, items: [] }));
    const fetch = globalThis.fetch;
    let release: (() => void) | undefined;
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const message = JSON.parse(String(init?.body)) as Message;
      if (message.method === 'shutdown') await new Promise<void>(done => { release = done; });
      return fetch(input, init);
    }));
    const adapter = createCelDevelopmentAdapter('pod');
    await adapter.languageService(makeRequest());
    const first = adapter.dispose();
    await vi.waitFor(() => expect(release).toBeDefined());
    let finished = false;
    const second = adapter.dispose().then(() => { finished = true; });
    await Promise.resolve();
    expect(finished).toBe(false);
    release?.();
    await Promise.all([first, second]);
    expect(wire.messages.filter(message => message.method === 'exit')).toHaveLength(1);
  });
});
