import type { QueryEdit } from './types';

function validOffset(offset: number) {
  if (!Number.isSafeInteger(offset) || offset < 0)
    throw new RangeError('Offset must be a nonnegative integer');
}
const byteLength = (codePoint: number) =>
  codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;

export function utf16ToUtf8(text: string, offset: number): number {
  validOffset(offset);
  let units = 0;
  let bytes = 0;
  for (const character of text) {
    if (units === offset) return bytes;
    units += character.length;
    bytes += byteLength(character.codePointAt(0)!);
    if (units > offset) throw new RangeError('Offset splits a UTF-16 surrogate pair');
  }
  if (units === offset) return bytes;
  throw new RangeError('Offset exceeds source length');
}

export function utf8ToUtf16(text: string, offset: number): number {
  validOffset(offset);
  let units = 0;
  let bytes = 0;
  for (const character of text) {
    if (bytes === offset) return units;
    units += character.length;
    bytes += byteLength(character.codePointAt(0)!);
    if (bytes > offset) throw new RangeError('Offset splits a UTF-8 sequence');
  }
  if (bytes === offset) return units;
  throw new RangeError('Offset exceeds source length');
}

export function applyQueryEdit(text: string, edit: QueryEdit): { text: string; selection: number } {
  if (edit.range.unit !== 'utf8-byte' || edit.range.end < edit.range.start)
    throw new RangeError('Expected a half-open UTF-8 byte range');
  const start = utf8ToUtf16(text, edit.range.start);
  const end = utf8ToUtf16(text, edit.range.end);
  return {
    text: text.slice(0, start) + edit.text + text.slice(end),
    selection: start + edit.text.length,
  };
}

/** Textareas expose LF-normalized UTF-16 offsets even when source retains CRLF/CR. */
export function textareaOffsetToSource(text: string, offset: number): number {
  validOffset(offset);
  let source = 0;
  let dom = 0;
  while (dom < offset && source < text.length) {
    source += text[source] === '\r' && text[source + 1] === '\n' ? 2 : 1;
    dom++;
  }
  if (dom !== offset) throw new RangeError('Offset exceeds textarea length');
  return source;
}

export function sourceOffsetToTextarea(text: string, offset: number): number {
  validOffset(offset);
  if (offset > text.length) throw new RangeError('Offset exceeds source length');
  let source = 0;
  let dom = 0;
  while (source < offset) {
    source += text[source] === '\r' && text[source + 1] === '\n' && source + 1 < offset ? 2 : 1;
    dom++;
  }
  return dom;
}

/** Apply the changed DOM interval, preserving untouched source line endings. New
 * line breaks follow the document's existing convention; this is editor mechanics,
 * not query parsing or serialization. */
export function applyTextareaChange(source: string, nextDom: string): string {
  const previousDom = source.replace(/\r\n?/g, '\n');
  if (previousDom === nextDom) return source;
  let start = 0;
  while (
    start < previousDom.length &&
    start < nextDom.length &&
    previousDom[start] === nextDom[start]
  )
    start++;
  let previousEnd = previousDom.length;
  let nextEnd = nextDom.length;
  while (
    previousEnd > start &&
    nextEnd > start &&
    previousDom[previousEnd - 1] === nextDom[nextEnd - 1]
  ) {
    previousEnd--;
    nextEnd--;
  }
  const lineEnding = source.includes('\r\n')
    ? '\r\n'
    : source.includes('\r') && !source.includes('\n')
      ? '\r'
      : '\n';
  return (
    source.slice(0, textareaOffsetToSource(source, start)) +
    nextDom.slice(start, nextEnd).replace(/\n/g, lineEnding) +
    source.slice(textareaOffsetToSource(source, previousEnd))
  );
}
