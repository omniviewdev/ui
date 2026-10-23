import type { QueryCompletion, QueryDiagnostic, QueryHoverResponse, QueryRange, QuerySignatureResponse } from '@omniviewdev/base-ui';

export type PositionEncoding = 'utf-16' | 'utf-8';
export function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function malformed(): never { throw new Error('Malformed CEL LSP response'); }
function integer(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0; }
function optionalString(value: Record<string, unknown>, key: string): string | undefined {
  const field = value[key];
  if (field === undefined) return undefined;
  if (typeof field !== 'string') return malformed();
  return field;
}
function markup(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (!object(value) || (value.kind !== 'plaintext' && value.kind !== 'markdown') || typeof value.value !== 'string') return malformed();
  return value.value;
}
const bytes = (value: string) => new TextEncoder().encode(value).length;

/** Positions count code units only inside a line; CRLF is one line separator. */
export function positionAt(source: string, offset: number, encoding: PositionEncoding): { line: number; character: number } {
  if (!integer(offset)) return malformed();
  let consumed = 0;
  let line = 0;
  let character = 0;
  for (let index = 0; index < source.length;) {
    if (consumed === offset) return { line, character };
    const point = String.fromCodePoint(source.codePointAt(index)!);
    const newline = point === '\r' || point === '\n';
    const width = point === '\r' && source[index + 1] === '\n' ? 2 : point.length;
    consumed += newline ? width : bytes(point);
    if (consumed > offset) return malformed();
    if (newline) { line++; character = 0; }
    else character += encoding === 'utf-8' ? bytes(point) : point.length;
    index += width;
  }
  if (consumed !== offset) return malformed();
  return { line, character };
}
function offsetAt(source: string, value: unknown, encoding: PositionEncoding): number {
  if (!object(value) || !integer(value.line) || !integer(value.character)) return malformed();
  const lines = source.split(/(\r\n|\r|\n)/);
  const content = lines[value.line * 2];
  if (content === undefined) return malformed();
  let prefix = 0;
  for (let index = 0; index < value.line * 2; index++) prefix += bytes(lines[index]!);
  let character = 0;
  let offset = prefix;
  for (const point of content) {
    if (character === value.character) return offset;
    character += encoding === 'utf-8' ? bytes(point) : point.length;
    offset += bytes(point);
    if (character > value.character) return malformed();
  }
  return character === value.character ? offset : malformed();
}
function range(source: string, value: unknown, encoding: PositionEncoding): QueryRange {
  if (!object(value)) return malformed();
  const start = offsetAt(source, value.start, encoding);
  const end = offsetAt(source, value.end, encoding);
  if (end < start) return malformed();
  return { start, end, unit: 'utf8-byte' };
}
export function initialization(value: unknown): PositionEncoding {
  if (!object(value) || !object(value.capabilities)) return malformed();
  const encoding = value.capabilities.positionEncoding ?? 'utf-16';
  return encoding === 'utf-16' || encoding === 'utf-8' ? encoding : malformed();
}
export function completions(value: unknown, source: string, cursor: number, encoding: PositionEncoding): { completions: QueryCompletion[]; incomplete: boolean } {
  if (value === null) return { completions: [], incomplete: false };
  const list = Array.isArray(value) ? value : object(value) && typeof value.isIncomplete === 'boolean' && Array.isArray(value.items) ? value.items : malformed();
  if (list.length > 100) return malformed();
  const items = list.map((item: unknown, index): QueryCompletion => {
    if (!object(item) || typeof item.label !== 'string') return malformed();
    if (item.kind !== undefined && (!integer(item.kind) || item.kind < 1 || item.kind > 25)) return malformed();
    if (item.insertTextFormat !== undefined && item.insertTextFormat !== 1 && item.insertTextFormat !== 2) return malformed();
    const kind: QueryCompletion['kind'] = item.kind === 3 || item.kind === 2 ? 'function' : item.kind === 6 ? 'parameter' : item.kind === 24 ? 'operator' : item.kind === 5 || item.kind === 10 ? 'field' : 'value';
    let edit: QueryCompletion['edit'];
    if (item.textEdit !== undefined) {
      if (!object(item.textEdit) || typeof item.textEdit.newText !== 'string') return malformed();
      edit = { range: range(source, item.textEdit.range ?? item.textEdit.replace, encoding), text: item.textEdit.newText };
    } else edit = { range: { start: cursor, end: cursor, unit: 'utf8-byte' }, text: optionalString(item, 'insertText') ?? item.label };
    let type: string | undefined;
    if (item.labelDetails !== undefined) {
      if (!object(item.labelDetails)) return malformed();
      type = optionalString(item.labelDetails, 'description');
      optionalString(item.labelDetails, 'detail');
    }
    return { id: `lsp-${index}`, label: item.label, kind, edit, type,
      description: markup(item.documentation), detail: optionalString(item, 'detail'),
      filterText: optionalString(item, 'filterText'), sortText: optionalString(item, 'sortText'),
      insertTextFormat: item.insertTextFormat === 2 ? 'snippet' : 'plain' };
  });
  return { completions: items, incomplete: object(value) && value.isIncomplete === true };
}
export function diagnostics(value: unknown, source: string, encoding: PositionEncoding): QueryDiagnostic[] {
  if (!object(value) || value.kind !== 'full' || !Array.isArray(value.items) || value.items.length > 100) return malformed();
  return value.items.map((item: unknown, index) => {
    if (!object(item) || typeof item.message !== 'string' || (item.severity !== undefined && ![1, 2, 3, 4].includes(Number(item.severity))) || (item.severity !== undefined && typeof item.severity !== 'number')) return malformed();
    if (item.code !== undefined && typeof item.code !== 'string' && typeof item.code !== 'number') return malformed();
    const severity: QueryDiagnostic['severity'] = item.severity === 2 ? 'warning' : item.severity === 3 ? 'info' : item.severity === 4 ? 'hint' : 'error';
    return { id: String(item.code ?? `lsp-${index}`), severity, message: item.message, range: range(source, item.range, encoding) };
  });
}
export function hover(value: unknown, source: string, encoding: PositionEncoding): QueryHoverResponse['hover'] {
  if (value === null) return undefined;
  if (!object(value)) return malformed();
  const contents = markup(value.contents);
  if (contents === undefined) return malformed();
  return { range: value.range === undefined ? { start: 0, end: bytes(source), unit: 'utf8-byte' } : range(source, value.range, encoding), contents };
}
export function signature(value: unknown): QuerySignatureResponse['signature'] {
  if (value === null) return undefined;
  if (!object(value) || !Array.isArray(value.signatures)) return malformed();
  if (!value.signatures.length) return undefined;
  const active = value.activeSignature ?? 0;
  if (!integer(active) || active >= value.signatures.length) return malformed();
  const item: unknown = value.signatures[active];
  if (!object(item) || typeof item.label !== 'string' || (item.parameters !== undefined && !Array.isArray(item.parameters))) return malformed();
  const label = item.label;
  const parameters = (item.parameters ?? []).map((parameter: unknown) => {
    if (!object(parameter)) return malformed();
    let text: string;
    if (typeof parameter.label === 'string') text = parameter.label;
    else if (Array.isArray(parameter.label) && parameter.label.length === 2 && integer(parameter.label[0]) && integer(parameter.label[1]) && parameter.label[1] >= parameter.label[0] && parameter.label[1] <= label.length) text = label.slice(parameter.label[0], parameter.label[1]);
    else return malformed();
    const documentation = markup(parameter.documentation);
    return { label: text, ...(documentation === undefined ? {} : { documentation }) };
  });
  const activeParameter = item.activeParameter ?? value.activeParameter ?? 0;
  if (!integer(activeParameter) || (parameters.length > 0 && activeParameter >= parameters.length)) return malformed();
  return { label, parameters, documentation: markup(item.documentation), activeParameter };
}
