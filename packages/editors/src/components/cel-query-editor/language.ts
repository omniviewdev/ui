import type * as Monaco from 'monaco-editor';

export const CEL_LANGUAGE_ID = 'cel';
const initialized = new WeakSet<object>();

/** Lexical presentation only. The host remains authoritative for CEL semantics. */
export function registerCelLanguage(monaco: typeof Monaco) {
  if (initialized.has(monaco)) return;
  initialized.add(monaco);
  monaco.languages.register({ id: CEL_LANGUAGE_ID, extensions: ['.cel'], aliases: ['CEL'] });
  monaco.languages.setLanguageConfiguration(CEL_LANGUAGE_ID, {
    comments: { lineComment: '//' },
    brackets: [['{', '}'], ['[', ']'], ['(', ')']],
    autoClosingPairs: [
      { open: '{', close: '}' }, { open: '[', close: ']' }, { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string', 'comment'] },
      { open: "'", close: "'", notIn: ['string', 'comment'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' }, { open: '[', close: ']' }, { open: '(', close: ')' },
      { open: '"', close: '"' }, { open: "'", close: "'" },
    ],
    wordPattern: /[a-zA-Z_][a-zA-Z_0-9]*/g,
  });
  monaco.languages.setMonarchTokensProvider(CEL_LANGUAGE_ID, {
    keywords: ['true', 'false', 'null', 'in'],
    tokenizer: {
      root: [
        [/\/\/.*$/, 'comment'],
        [/[rR]?[bB]?'''/, 'string', '@tripleSingle'],
        [/[rR]?[bB]?"""/, 'string', '@tripleDouble'],
        [/[rR]?[bB]?'/, 'string', '@single'],
        [/[rR]?[bB]?"/, 'string', '@double'],
        [/0[xX][0-9a-fA-F]+[uU]?/, 'number.hex'],
        [/(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?[uU]?/, 'number'],
        [/[a-zA-Z_][a-zA-Z_0-9]*(?=\s*\()/, 'type.identifier'],
        [/[a-zA-Z_][a-zA-Z_0-9]*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
        [/[{}()[\]]/, '@brackets'],
        [/[!<>=&|+*/%?:-]+/, 'operator'],
        [/[.,]/, 'delimiter'],
        [/\s+/, 'white'],
      ],
      single: [[/\\./, 'string.escape'], [/'/, 'string', '@pop'], [/[^'\\]+/, 'string']],
      double: [[/\\./, 'string.escape'], [/"/, 'string', '@pop'], [/[^"\\]+/, 'string']],
      tripleSingle: [[/'''/, 'string', '@pop'], [/\\./, 'string.escape'], [/[^'\\]+|'/, 'string']],
      tripleDouble: [[/"""/, 'string', '@pop'], [/\\./, 'string.escape'], [/[^"\\]+|"/, 'string']],
    },
  });
}
