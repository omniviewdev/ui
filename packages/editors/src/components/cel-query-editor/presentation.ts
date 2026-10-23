import { utf16ToUtf8, utf8ToUtf16 } from '@omniviewdev/base-ui';

export interface SourcePosition { lineNumber: number; column: number }

/** Source positions retain the host's line endings and UTF-8 byte contract. */
export function sourcePosition(text: string, byteOffset: number): SourcePosition {
  const offset = utf8ToUtf16(text, byteOffset);
  let lineNumber = 1;
  let lineStart = 0;
  for (let i = 0; i < offset; i++) {
    if (text[i] === '\r' || text[i] === '\n') {
      if (text[i] === '\r' && text[i + 1] === '\n') i++;
      if (i >= offset) throw new RangeError('Offset splits a line ending');
      lineNumber++;
      lineStart = i + 1;
    }
  }
  return { lineNumber, column: offset - lineStart + 1 };
}

export function sourceOffset(text: string, position: SourcePosition): number {
  if (!Number.isSafeInteger(position.lineNumber) || position.lineNumber < 1 ||
      !Number.isSafeInteger(position.column) || position.column < 1)
    throw new RangeError('Expected a one-based source position');
  let line = 1;
  let start = 0;
  while (line < position.lineNumber) {
    let end = start;
    while (end < text.length && text[end] !== '\r' && text[end] !== '\n') end++;
    if (end === text.length) throw new RangeError('Position exceeds source lines');
    start = end + (text[end] === '\r' && text[end + 1] === '\n' ? 2 : 1);
    line++;
  }
  const offset = start + position.column - 1;
  let end = start;
  while (end < text.length && text[end] !== '\r' && text[end] !== '\n') end++;
  if (offset > end) throw new RangeError('Position exceeds source line');
  return utf16ToUtf8(text, offset);
}

/** Subsequence matching is bounded to the host's semantic candidates, never inventory. */
export function completionMatches(prefix: string, candidate: string): boolean {
  let index = 0;
  const needle = prefix.toLocaleLowerCase();
  for (const character of candidate.toLocaleLowerCase()) {
    if (character === needle[index]) index++;
    if (index === needle.length) return true;
  }
  return needle.length === 0;
}

export function latestRequestGate() {
  let active: AbortController | undefined;
  return {
    begin() {
      active?.abort();
      active = new AbortController();
      return active;
    },
    current(operation: AbortController) {
      return active === operation && !operation.signal.aborted;
    },
    cancel() {
      active?.abort();
      active = undefined;
    },
  };
}

export function automaticCompletion(callback: () => void, delay = 250) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => { clearTimeout(timer); timer = undefined; };
  return {
    schedule(delayMs = delay) { cancel(); timer = setTimeout(() => { timer = undefined; callback(); }, delayMs); },
    immediate() { cancel(); callback(); },
    cancel,
  };
}
