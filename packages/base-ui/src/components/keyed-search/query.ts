export interface KeyedSearchValue {
  value: string;
  label?: string;
  description?: string;
}

/** Stable, synchronous field data. Memoize this array in consumers. */
export interface KeyedSearchField {
  name: string;
  label?: string;
  description?: string;
  values?: readonly (string | KeyedSearchValue)[];
}

export interface KeyedSearchToken {
  /** UTF-16, half-open offsets, matching native input selection offsets. */
  start: number;
  end: number;
  raw: string;
  key?: string;
  /** Absolute offset of the first unquoted colon after a valid field name. */
  colon?: number;
  value: string;
  unclosedQuote: boolean;
}

export interface KeyedSearchDiagnostic {
  code: 'unknown-key' | 'unclosed-quote';
  start: number;
  end: number;
  message: string;
}

export interface ParsedKeyedSearch {
  source: string;
  tokens: readonly KeyedSearchToken[];
  /** Unknown fields remain here; consumers must not silently ignore diagnostics. */
  filters: readonly KeyedSearchToken[];
  text: readonly KeyedSearchToken[];
  diagnostics: readonly KeyedSearchDiagnostic[];
}

function decode(raw: string): string {
  let quote = '';
  let value = '';
  for (let index = 0; index < raw.length; index++) {
    const char = raw[index]!;
    if (quote && char === '\\' && (raw[index + 1] === quote || raw[index + 1] === '\\')) {
      value += raw[++index];
    } else if (quote === char) {
      quote = '';
    } else if (!quote && (char === '"' || char === "'")) {
      quote = char;
    } else {
      value += char;
    }
  }
  return value;
}

/** Lossless token spans, including unfinished quotes and unknown field names. */
export function tokenizeKeyedSearch(source: string): KeyedSearchToken[] {
  const tokens: KeyedSearchToken[] = [];
  let cursor = 0;
  while (cursor < source.length) {
    if (/\s/.test(source[cursor]!)) {
      cursor++;
      continue;
    }
    const start = cursor;
    let quote = '';
    let colon: number | undefined;
    while (cursor < source.length) {
      const char = source[cursor]!;
      if (!quote && /\s/.test(char)) break;
      if (quote && char === '\\' && (source[cursor + 1] === quote || source[cursor + 1] === '\\')) {
        cursor += 2;
        continue;
      }
      if (quote === char) quote = '';
      else if (!quote && (char === '"' || char === "'")) quote = char;
      else if (
        !quote &&
        char === ':' &&
        colon === undefined &&
        /^[a-z_][\w.-]*$/i.test(source.slice(start, cursor))
      ) {
        colon = cursor;
      }
      cursor++;
    }
    const raw = source.slice(start, cursor);
    tokens.push({
      start,
      end: cursor,
      raw,
      key: colon === undefined ? undefined : source.slice(start, colon).toLowerCase(),
      colon,
      value: decode(source.slice(colon === undefined ? start : colon + 1, cursor)),
      unclosedQuote: Boolean(quote),
    });
  }
  return tokens;
}

interface Candidate {
  value: string;
  label: string;
  description?: string;
  document: string;
}
interface IndexedField {
  name: string;
  label: string;
  description?: string;
  document: string;
  values: readonly Candidate[];
}
export interface KeyedSearchIndex {
  fields: readonly IndexedField[];
  byName: ReadonlyMap<string, IndexedField>;
}

/** Precomputes case-folded candidate documents once per schema identity. */
export function createKeyedSearchIndex(fields: readonly KeyedSearchField[]): KeyedSearchIndex {
  const indexed = fields.map((field): IndexedField => ({
    name: field.name,
    label: field.label ?? field.name,
    description: field.description,
    document: `${field.name}\n${field.label ?? ''}`.toLowerCase(),
    values: (field.values ?? []).map((item): Candidate => {
      const value = typeof item === 'string' ? { value: item } : item;
      return {
        ...value,
        label: value.label ?? value.value,
        document: `${value.value}\n${value.label ?? ''}`.toLowerCase(),
      };
    }),
  }));
  return {
    fields: indexed,
    byName: new Map(indexed.map((field) => [field.name.toLowerCase(), field])),
  };
}

export function parseKeyedSearch(
  source: string,
  schema: readonly KeyedSearchField[] | KeyedSearchIndex = [],
): ParsedKeyedSearch {
  const index = Array.isArray(schema)
    ? createKeyedSearchIndex(schema)
    : (schema as KeyedSearchIndex);
  const tokens = tokenizeKeyedSearch(source);
  const filters: KeyedSearchToken[] = [];
  const text: KeyedSearchToken[] = [];
  const diagnostics: KeyedSearchDiagnostic[] = [];
  for (const token of tokens) {
    (token.key === undefined ? text : filters).push(token);
    if (token.key !== undefined && !index.byName.has(token.key)) {
      diagnostics.push({
        code: 'unknown-key',
        start: token.start,
        end: token.colon!,
        message: `Unknown field “${source.slice(token.start, token.colon)}”.`,
      });
    }
    if (token.unclosedQuote) {
      diagnostics.push({
        code: 'unclosed-quote',
        start: token.start,
        end: token.end,
        message: 'Unclosed quote. Add a matching closing quote.',
      });
    }
  }
  return { source, tokens, filters, text, diagnostics };
}

export interface KeyedSearchActiveToken {
  start: number;
  end: number;
  prefix: string;
  token?: KeyedSearchToken;
}

export function getKeyedSearchActiveToken(
  parsed: ParsedKeyedSearch,
  caret: number,
): KeyedSearchActiveToken {
  const position = Math.max(0, Math.min(parsed.source.length, caret));
  const token = parsed.tokens.find((item) => position >= item.start && position <= item.end);
  return token
    ? {
        start: token.start,
        end: token.end,
        prefix: parsed.source.slice(token.start, position),
        token,
      }
    : { start: position, end: position, prefix: '' };
}

export interface KeyedSearchCompletion {
  kind: 'field' | 'value';
  label: string;
  description?: string;
  text: string;
  start: number;
  end: number;
}

export function quoteKeyedSearchValue(value: string): string {
  return !value || /[\s"'\\]/.test(value)
    ? `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    : value;
}

/** Bounded synchronous matching. No per-option scans or lowercasing at render time. */
export function getKeyedSearchCompletions(
  parsed: ParsedKeyedSearch,
  caret: number,
  index: KeyedSearchIndex,
  limit = 20,
): KeyedSearchCompletion[] {
  const active = getKeyedSearchActiveToken(parsed, caret);
  const max = Number.isFinite(limit) ? Math.max(0, Math.min(100, Math.floor(limit))) : 20;
  if (!max) return [];
  const colon = active.token?.colon;
  const inValue = colon !== undefined && caret > colon;
  const field = inValue ? index.byName.get(active.token!.key!) : undefined;
  if (inValue && !field) return [];
  const prefix = inValue
    ? decode(active.prefix.slice(colon! - active.start + 1)).toLowerCase()
    : decode(active.prefix).toLowerCase();
  const result: KeyedSearchCompletion[] = [];
  if (inValue && field) {
    for (const item of field.values) {
      if (!item.document.includes(prefix)) continue;
      result.push({
        kind: 'value',
        label: item.label,
        description: item.description,
        text: `${field.name}:${quoteKeyedSearchValue(item.value)}`,
        start: active.start,
        end: active.end,
      });
      if (result.length === max) break;
    }
  } else {
    for (const item of index.fields) {
      if (!item.document.includes(prefix)) continue;
      const suffix = colon === undefined ? '' : parsed.source.slice(colon + 1, active.end);
      result.push({
        kind: 'field',
        label: `${item.name}:`,
        description: item.description ?? item.label,
        text: `${item.name}:${suffix}`,
        start: active.start,
        end: active.end,
      });
      if (result.length === max) break;
    }
  }
  return result;
}

/** Replaces exactly one half-open token span, preserving every surrounding character. */
export function applyKeyedSearchCompletion(
  source: string,
  completion: KeyedSearchCompletion,
): { query: string; caret: number } {
  const { start, end, text } = completion;
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    end > source.length
  ) {
    throw new RangeError('Invalid keyed search completion span.');
  }
  return { query: source.slice(0, start) + text + source.slice(end), caret: start + text.length };
}
