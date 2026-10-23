import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCelDevelopmentAdapter } from './index';

const request = {
  document: { text: 'true', version: 3 }, cursor: { offset: 4, unit: 'utf8-byte' as const },
  contextKey: 'pod-revision', signal: new AbortController().signal,
};
const envelope = { documentVersion: 3, contextKey: 'pod-revision', status: 'ready', completions: [], diagnostics: [] };
afterEach(() => vi.unstubAllGlobals());

describe('CEL catalog and evaluation HTTP boundary', () => {
  it('sends exact typed binding strings separately from source and propagates cancellation', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(JSON.stringify({ ...envelope,
      results: [{ fixtureId: 'cloud-api', label: 'api-prod', provider: 'cloud', resource: 'Instance', matched: true }],
    })));
    vi.stubGlobal('fetch', fetch);
    const result = await createCelDevelopmentAdapter('cloud').evaluate(request, {
      minimumCpu: { kind: 'int64', value: '9007199254740993' },
      minimumPort: { kind: 'int64', value: '1000' },
      imagePrefix: { kind: 'string', value: 'nginx:' },
      desiredPhase: { kind: 'string', value: 'Running' },
    });
    expect(result.results[0]?.matched).toBe(true);
    const options = fetch.mock.calls[0]?.[1];
    expect(options?.signal).toBe(request.signal);
    expect(JSON.parse(String(options?.body))).toEqual({
      document: request.document, cursor: request.cursor, contextKey: 'pod-revision', fixtureProfile: 'cloud',
      bindings: {
        minimumCpu: { kind: 'int64', value: '9007199254740993' },
        minimumPort: { kind: 'int64', value: '1000' },
        imagePrefix: { kind: 'string', value: 'nginx:' },
        desiredPhase: { kind: 'string', value: 'Running' },
      },
    });
  });

  it.each([
    ['diagnostic range', { ...envelope, results: [], diagnostics: [{ id: 'bad', severity: 'error', message: 'bad', range: null }] }],
    ['status', { ...envelope, results: [], status: 'pretend-success' }],
  ])('rejects malformed evaluation %s instead of trusting JSON', async (_name, payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));
    await expect(createCelDevelopmentAdapter('pod').evaluate(request)).rejects.toThrow('Malformed');
  });

  it('does not turn disconnected service into fixture success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(createCelDevelopmentAdapter('vm').evaluate(request)).rejects.toThrow('Failed to fetch');
  });

  it('rejects non-loopback service addresses', () => {
    expect(() => createCelDevelopmentAdapter('pod', 'http://example.com')).toThrow('loopback');
  });
});

describe('CEL development response decoding', () => {
  it.each([
    ['evaluation', { ...envelope, results: [{ fixtureId: 'pod-web', label: 'web', provider: 'kubernetes', resource: 'Pod', matched: 'false' }] }],
    ['profiles', { engine: 'CEL', limits: [], profiles: [{ id: 'pod', label: 'Pods', description: 'test', numericProfile: 'int64', fixtures: [], examples: [], parameters: [{ name: 'cpu', type: 'number', value: '4', description: 'bad' }], fields: [] }] }],
  ])('rejects malformed %s JSON', async (route, payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));
    const adapter = createCelDevelopmentAdapter('pod');
    const result = route === 'evaluation' ? adapter.evaluate(request) : adapter.profiles();
    await expect(result).rejects.toThrow('Malformed');
  });

  it.each([
    { ...envelope, status: ['ready'] },
    { ...envelope, completions: [{ id: 'x', label: 'x', kind: ['field'], edit: { range: { start: 0, end: 1, unit: 'utf8-byte' }, text: 'x' } }] },
  ])('does not coerce arrays into protocol discriminants', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));
    await expect(createCelDevelopmentAdapter('pod').evaluate(request)).rejects.toThrow('Malformed');
  });

  it('accepts documented profiles and canonical false evaluation results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (input: URL | RequestInfo) => {
      const path = new URL(String(input)).pathname;
      return new Response(JSON.stringify(path === '/profiles' ? {
        engine: 'cel.dev/cel-go v0.32.0', limits: ['fixture-only'],
        profiles: [{ id: 'vm', label: 'VMs', description: 'Typed VM', numericProfile: 'development-only int64',
          fixtures: [{ id: 'vm-idle', label: 'idle', provider: 'hypervisor', resource: 'VirtualMachine' }],
          examples: [{ id: 'running', label: 'Running', expression: 'resource.powerState == "running"', description: 'Actual CEL' }],
          parameters: [{ name: 'minimumCpu', type: 'int64', value: '9007199254740993', description: 'Exact decimal' }],
          fields: [{ path: 'resource.guestIP', type: 'string', description: 'Optional', optional: true }] }],
      } : { ...envelope, results: [{ fixtureId: 'vm-idle', label: 'idle', provider: 'hypervisor', resource: 'VirtualMachine', matched: false }] }));
    }));
    const adapter = createCelDevelopmentAdapter('vm');
    const profiles = await adapter.profiles();
    expect(profiles.profiles[0]?.parameters[0]?.value).toBe('9007199254740993');
    expect(profiles.profiles[0]?.fields[0]?.optional).toBe(true);
    const result = await adapter.evaluate(request);
    expect(result.results[0]?.matched).toBe(false);
    expect(result.results[0]?.error).toBeUndefined();
  });

  it('passes an already-aborted request through fetch without serializing its signal', async () => {
    const controller = new AbortController();
    controller.abort();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, options: RequestInit) => {
      options.signal?.throwIfAborted();
      throw new Error('Request unexpectedly started');
    }));
    await expect(createCelDevelopmentAdapter('pod').evaluate({ ...request, signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });

  it.each(['https://127.0.0.1', 'http://127.0.0.1.example.org', 'http://user:password@127.0.0.1'])('rejects unsafe development URLs: %s', (url) => {
    expect(() => createCelDevelopmentAdapter('pod', url)).toThrow('loopback');
  });
});
