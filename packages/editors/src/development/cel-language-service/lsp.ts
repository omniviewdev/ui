import type { QueryLanguageRequest, QueryLanguageResponse, QueryHoverResponse, QuerySignatureResponse } from '@omniviewdev/base-ui';
import * as decode from './decoder';

interface DocumentState { text: string; version: number }
interface Session {
  key: string;
  token?: string;
  encoding: decode.PositionEncoding;
  documents: Map<string, DocumentState>;
  controller: AbortController;
  ready: Promise<void>;
  queue: Promise<void>;
  retired: boolean;
  cleanup?: Promise<void>;
}
export function createLspClient(url: URL, profileId: string) {
  const sessions = new Map<string, Session>();
  const owners = new Map<string, Session>();
  const contexts = new Map<string, string>();
  const retirements = new Set<Promise<void>>();
  const defaultUri = `file:///cel/development-${crypto.randomUUID()}.cel`;
  let nextId = 0;

  async function exchange(session: Session, method: string, params: unknown, notification = false, signal?: AbortSignal, cleanup = false): Promise<unknown> {
    const id = notification ? undefined : ++nextId;
    const timeout = AbortSignal.timeout(cleanup ? 2000 : 15000);
    const combined = AbortSignal.any([timeout, ...(cleanup || method === 'initialize' ? [] : [session.controller.signal]), ...(signal ? [signal] : [])]);
    combined.throwIfAborted();
    const cancel = () => {
      if (id !== undefined && session.token && !session.retired) void exchange(session, '$/cancelRequest', { id }, true).catch(() => {});
    };
    signal?.addEventListener('abort', cancel, { once: true });
    try {
      const response = await fetch(new URL('/lsp', url), {
        method: 'POST', signal: combined,
        headers: { 'Content-Type': 'application/json', ...(session.token ? { 'X-CEL-LSP-Session': session.token } : {}) },
        body: JSON.stringify({ jsonrpc: '2.0', ...(id === undefined ? {} : { id }), method, ...(params === undefined ? {} : { params }) }),
      });
      if (!response.ok) throw new Error(`CEL LSP service ${response.status}: ${await response.text()}`);
      if (notification) {
        if (response.status !== 204) return decode.malformed();
        combined.throwIfAborted();
        return undefined;
      }
      const value: unknown = await response.json();
      if (!decode.object(value) || value.jsonrpc !== '2.0' || value.id !== id || ('result' in value) === ('error' in value)) return decode.malformed();
      if (value.error !== undefined) {
        if (!decode.object(value.error) || typeof value.error.code !== 'number' || !Number.isSafeInteger(value.error.code) || typeof value.error.message !== 'string') return decode.malformed();
        throw new Error(`CEL LSP ${value.error.code}: ${value.error.message}`);
      }
      if (method === 'initialize') {
        const token = response.headers.get('X-CEL-LSP-Session');
        if (!token || token.length > 256) return decode.malformed();
        // Retain the issued token even if disposal raced the response, so exit can release it.
        session.token = token;
      }
      combined.throwIfAborted();
      return value.result;
    } finally { signal?.removeEventListener('abort', cancel); }
  }

  function retire(session: Session): Promise<void> {
    if (session.cleanup) return session.cleanup;
    session.retired = true;
    if (sessions.get(session.key) === session) sessions.delete(session.key);
    session.controller.abort();
    for (const [uri, owner] of owners) if (owner === session) {
      owners.delete(uri);
      if (contexts.get(uri) === session.key) contexts.delete(uri);
    }
    session.cleanup = (async () => {
      await session.ready.catch(() => {});
      if (!session.token) return;
      try {
        await Promise.all(Array.from(session.documents.keys(), uri =>
          exchange(session, 'textDocument/didClose', { textDocument: { uri } }, true, undefined, true)));
        await exchange(session, 'shutdown', undefined, false, undefined, true);
      } finally {
        session.documents.clear();
        await exchange(session, 'exit', undefined, true, undefined, true);
      }
    })();
    const cleanup = session.cleanup;
    retirements.add(cleanup);
    void cleanup.then(() => retirements.delete(cleanup), () => retirements.delete(cleanup));
    return cleanup;
  }

  function getSession(key: string): Session {
    const existing = sessions.get(key);
    if (existing) return existing;
    if (sessions.size >= 16) throw new Error('CEL LSP context limit reached');
    const session: Session = { key, encoding: 'utf-16', documents: new Map(), controller: new AbortController(), ready: Promise.resolve(), queue: Promise.resolve(), retired: false };
    sessions.set(key, session);
    session.ready = (async () => {
      const result = await exchange(session, 'initialize', {
        processId: null, rootUri: null,
        capabilities: { general: { positionEncodings: ['utf-16', 'utf-8'] }, textDocument: { synchronization: { didSave: false }, completion: { completionItem: { snippetSupport: true, documentationFormat: ['plaintext', 'markdown'], labelDetailsSupport: true } }, hover: { contentFormat: ['plaintext', 'markdown'] }, signatureHelp: { signatureInformation: { parameterInformation: { labelOffsetSupport: true } } }, diagnostic: {} } },
        initializationOptions: { profileId },
      });
      session.encoding = decode.initialization(result);
      await exchange(session, 'initialized', {}, true);
    })();
    // A failed initialization must not leave a broken connection cached or a token orphaned.
    void session.ready.catch(() => { void retire(session).catch(() => {}); });
    return session;
  }

  async function closeDocument(uri = defaultUri): Promise<void> {
    const session = owners.get(uri);
    if (!session) return;
    owners.delete(uri);
    contexts.delete(uri);
    const close = session.queue.then(async () => {
      if (session.retired || !session.documents.has(uri)) return;
      await exchange(session, 'textDocument/didClose', { textDocument: { uri } }, true);
      session.documents.delete(uri);
    });
    session.queue = close.catch(() => {});
    await close;
    if (!session.documents.size && !Array.from(owners.values()).includes(session)) await retire(session);
  }

  async function perform(request: QueryLanguageRequest, method: string): Promise<{ value: unknown; encoding: decode.PositionEncoding }> {
    request.signal.throwIfAborted();
    const uri = request.document.uri ?? defaultUri;
    const snapshot = { text: request.document.text, version: request.document.version };
    if (!Number.isSafeInteger(snapshot.version) || snapshot.version < 0 || new TextEncoder().encode(snapshot.text).length > 8192)
      throw new Error('Invalid CEL LSP document version or size');
    if (owners.size >= 16 && !owners.has(uri)) throw new Error('CEL LSP document limit reached');
    const previous = owners.get(uri);
    const closing = previous && previous.key !== request.contextKey ? closeDocument(uri) : undefined;
    contexts.set(uri, request.contextKey);
    if (closing) await closing;
    request.signal.throwIfAborted();
    if (contexts.get(uri) !== request.contextKey) throw new DOMException('CEL context superseded', 'AbortError');
    const session = getSession(request.contextKey);
    owners.set(uri, session);
    let synchronized: DocumentState | undefined;
    const synchronization = session.queue.then(async () => {
      await session.ready;
      request.signal.throwIfAborted();
      if (session.retired || owners.get(uri) !== session) throw new DOMException('CEL document ownership changed', 'AbortError');
      const document = session.documents.get(uri);
      if (document && (snapshot.version < document.version || (snapshot.version === document.version && snapshot.text !== document.text))) throw new Error('CEL LSP document version must increase when text changes');
      if (!document) {
        await exchange(session, 'textDocument/didOpen', { textDocument: { uri, languageId: 'cel', ...snapshot } }, true);
        session.documents.set(uri, snapshot);
      } else if (snapshot.version !== document.version) {
        await exchange(session, 'textDocument/didChange', { textDocument: { uri, version: snapshot.version }, contentChanges: [{ text: snapshot.text }] }, true);
        session.documents.set(uri, snapshot);
      }
      synchronized = session.documents.get(uri);
    });
    session.queue = synchronization.catch(() => {});
    await synchronization;
    const position = decode.positionAt(snapshot.text, request.cursor.offset, session.encoding);
    const value = await exchange(session, method, { textDocument: { uri }, ...(method === 'textDocument/diagnostic' ? {} : { position }) }, false, request.signal);
    request.signal.throwIfAborted();
    const current = session.documents.get(uri);
    if (session.retired || owners.get(uri) !== session || current !== synchronized)
      throw new DOMException('CEL LSP response superseded', 'AbortError');
    return { value, encoding: session.encoding };
  }

  return {
    async languageService(request: QueryLanguageRequest): Promise<QueryLanguageResponse> {
      const { value, encoding } = await perform(request, 'textDocument/completion');
      const result = decode.completions(value, request.document.text, request.cursor.offset, encoding);
      return { documentVersion: request.document.version, contextKey: request.contextKey, status: 'ready', ...result, diagnostics: [] };
    },
    async check(request: QueryLanguageRequest): Promise<QueryLanguageResponse> {
      const { value, encoding } = await perform(request, 'textDocument/diagnostic');
      return { documentVersion: request.document.version, contextKey: request.contextKey, status: 'ready', completions: [], diagnostics: decode.diagnostics(value, request.document.text, encoding) };
    },
    async hover(request: QueryLanguageRequest): Promise<QueryHoverResponse> {
      const { value, encoding } = await perform(request, 'textDocument/hover');
      return { documentVersion: request.document.version, contextKey: request.contextKey, status: 'ready', hover: decode.hover(value, request.document.text, encoding) };
    },
    async signature(request: QueryLanguageRequest): Promise<QuerySignatureResponse> {
      const { value } = await perform(request, 'textDocument/signatureHelp');
      return { documentVersion: request.document.version, contextKey: request.contextKey, status: 'ready', signature: decode.signature(value) };
    },
    closeDocument,
    async dispose(): Promise<void> {
      const pending = Array.from(sessions.values(), retire);
      owners.clear();
      contexts.clear();
      await Promise.all([...pending, ...retirements]);
    },
  };
}
