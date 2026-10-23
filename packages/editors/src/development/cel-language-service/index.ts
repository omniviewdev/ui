import type { QueryLanguageRequest, QueryLanguageResponse } from '@omniviewdev/base-ui';
import { createLspClient } from './lsp';

export type CelFixtureProfile = 'pod' | 'cloud' | 'vm';
export interface CelExample { id: string; label: string; expression: string; description: string }
export interface CelFixtureSummary { id: string; label: string; provider: string; resource: string }
export interface CelParameter { name: string; type: 'int64' | 'string' | 'bool'; value: string; description: string }
export interface CelSchemaField { path: string; type: string; description: string; optional: boolean }
export interface CelProfile {
  id: CelFixtureProfile; label: string; description: string;
  numericProfile: string; fixtures: CelFixtureSummary[]; examples: CelExample[];
  parameters: CelParameter[]; fields: CelSchemaField[];
}
export interface CelProfilesResponse { profiles: CelProfile[]; engine: string; limits: string[] }
export interface CelEvaluationResult {
  fixtureId: string; label: string; provider: string; resource: string;
  matched?: boolean; error?: string;
}
export interface CelEvaluationResponse extends QueryLanguageResponse { results: CelEvaluationResult[] }
export type CelBindings = Readonly<Record<string, { kind: 'int64' | 'string' | 'bool'; value: string }>>;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function strings(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((key) => typeof value[key] === 'string');
}
function optionalStrings(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((key) => value[key] === undefined || typeof value[key] === 'string');
}
function range(value: unknown): boolean {
  return record(value) && Number.isSafeInteger(value.start) && Number.isSafeInteger(value.end)
    && typeof value.start === 'number' && typeof value.end === 'number'
    && value.start >= 0 && value.end >= value.start && value.unit === 'utf8-byte';
}
function envelope(value: unknown): value is Record<string, unknown> {
  return record(value) && Number.isSafeInteger(value.documentVersion)
    && typeof value.documentVersion === 'number' && value.documentVersion >= 0
    && typeof value.contextKey === 'string'
    && typeof value.status === 'string' && ['ready', 'empty', 'error', 'denied', 'unavailable'].includes(value.status)
    && optionalStrings(value, ['message']);
}
function language(value: unknown): value is QueryLanguageResponse {
  return envelope(value) && Array.isArray(value.completions) && value.completions.length <= 100
    && value.completions.every((item: unknown) => record(item)
      && strings(item, ['id', 'label', 'kind'])
      && typeof item.kind === 'string' && ['field', 'operator', 'value', 'parameter', 'function'].includes(item.kind)
      && optionalStrings(item, ['type', 'description', 'condition', 'detail', 'disabledReason', 'filterText', 'sortText'])
      && (item.insertTextFormat === undefined || item.insertTextFormat === 'plain' || item.insertTextFormat === 'snippet')
      && record(item.edit) && range(item.edit.range) && typeof item.edit.text === 'string')
    && Array.isArray(value.diagnostics) && value.diagnostics.every((item: unknown) => record(item)
      && strings(item, ['id', 'message']) && typeof item.severity === 'string' && ['error', 'warning', 'info', 'hint'].includes(item.severity)
      && range(item.range) && (item.fix === undefined || (record(item.fix) && range(item.fix.range) && typeof item.fix.text === 'string')))
    && (value.incomplete === undefined || typeof value.incomplete === 'boolean');
}
function evaluation(value: unknown): value is CelEvaluationResponse {
  return language(value) && record(value) && Array.isArray(value.results)
    && value.results.every((row: unknown) => record(row)
      && strings(row, ['fixtureId', 'label', 'provider', 'resource'])
      && ((typeof row.matched === 'boolean' && row.error === undefined)
        || (row.matched === undefined && typeof row.error === 'string' && row.error.length > 0)));
}
function profilesResponse(value: unknown): value is CelProfilesResponse {
  return record(value) && typeof value.engine === 'string' && Array.isArray(value.limits)
    && value.limits.every((limit: unknown) => typeof limit === 'string')
    && Array.isArray(value.profiles) && value.profiles.every((profile: unknown) => record(profile)
      && typeof profile.id === 'string' && ['pod', 'cloud', 'vm'].includes(profile.id)
      && strings(profile, ['label', 'description', 'numericProfile'])
      && Array.isArray(profile.fixtures) && profile.fixtures.every((fixture: unknown) =>
        record(fixture) && strings(fixture, ['id', 'label', 'provider', 'resource']))
      && Array.isArray(profile.examples) && profile.examples.every((example: unknown) =>
        record(example) && strings(example, ['id', 'label', 'expression', 'description']))
      && Array.isArray(profile.parameters) && profile.parameters.every((parameter: unknown) =>
        record(parameter) && strings(parameter, ['name', 'value', 'description'])
        && typeof parameter.type === 'string' && ['int64', 'string', 'bool'].includes(parameter.type))
      && Array.isArray(profile.fields) && profile.fields.every((field: unknown) =>
        record(field) && strings(field, ['path', 'type', 'description']) && typeof field.optional === 'boolean'));
}
async function decode<T>(response: Response, guard: (value: unknown) => value is T): Promise<T> {
  const value: unknown = await response.json();
  if (!guard(value)) throw new Error('Malformed CEL development service response');
  return value;
}

/** Development-only loopback adapter. No client CEL, retry, debounce, inventory or fallback. */
export function createCelDevelopmentAdapter(
  fixtureProfile: CelFixtureProfile,
  baseURL = 'http://127.0.0.1:6130',
) {
  const url = new URL(baseURL);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.protocol !== 'http:' || url.username || url.password) {
    throw new Error('CEL development service must use loopback HTTP');
  }
  async function post<T>(
    route: string, request: QueryLanguageRequest, guard: (value: unknown) => value is T, bindings?: CelBindings,
  ): Promise<T> {
    const response = await fetch(new URL(route, url), {
      method: 'POST', signal: request.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: { text: request.document.text, version: request.document.version },
        cursor: request.cursor, contextKey: request.contextKey, fixtureProfile, ...(bindings ? { bindings } : {}) }),
    });
    if (!response.ok) throw new Error(`CEL development service ${response.status}: ${await response.text()}`);
    return decode(response, guard);
  }
  return {
    ...createLspClient(url, fixtureProfile),
    evaluate: (request: QueryLanguageRequest, bindings?: CelBindings) => post('/evaluate', request, evaluation, bindings),
    async profiles(signal?: AbortSignal): Promise<CelProfilesResponse> {
      const response = await fetch(new URL('/profiles', url), { signal });
      if (!response.ok) throw new Error(`CEL development service ${response.status}`);
      return decode(response, profilesResponse);
    },
  };
}
