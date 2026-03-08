import { getComputedToken } from './useEditorTheme';

type ThemeMode = 'dark' | 'light' | 'high-contrast-dark' | 'high-contrast-light';

interface MonacoThemeData {
  base: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
  inherit: boolean;
  rules: Array<{ token: string; foreground?: string; fontStyle?: string }>;
  colors: Record<string, string>;
}

function stripHash(color: string): string {
  return color.startsWith('#') ? color.slice(1) : color;
}

function token(name: string): string {
  return getComputedToken(name) || '';
}

function getBaseTheme(mode: ThemeMode): 'vs' | 'vs-dark' | 'hc-black' | 'hc-light' {
  switch (mode) {
    case 'light':
      return 'vs';
    case 'high-contrast-dark':
      return 'hc-black';
    case 'high-contrast-light':
      return 'hc-light';
    default:
      return 'vs-dark';
  }
}

export function buildMonacoTheme(mode: ThemeMode): MonacoThemeData {
  return {
    base: getBaseTheme(mode),
    inherit: true,
    rules: [
      {
        token: 'comment',
        foreground: stripHash(token('--ov-syntax-comment')),
        fontStyle: token('--ov-syntax-style-comment') || 'italic',
      },
      { token: 'string', foreground: stripHash(token('--ov-syntax-string')) },
      { token: 'string.escape', foreground: stripHash(token('--ov-syntax-string-escape')) },
      { token: 'number', foreground: stripHash(token('--ov-syntax-number')) },
      {
        token: 'keyword',
        foreground: stripHash(token('--ov-syntax-keyword')),
        fontStyle: token('--ov-syntax-style-keyword') || '',
      },
      { token: 'keyword.control', foreground: stripHash(token('--ov-syntax-keyword-control')) },
      { token: 'keyword.operator', foreground: stripHash(token('--ov-syntax-keyword-operator')) },
      {
        token: 'type',
        foreground: stripHash(token('--ov-syntax-type')),
        fontStyle: token('--ov-syntax-style-type') || '',
      },
      { token: 'type.identifier', foreground: stripHash(token('--ov-syntax-type')) },
      { token: 'class', foreground: stripHash(token('--ov-syntax-class')) },
      { token: 'interface', foreground: stripHash(token('--ov-syntax-interface')) },
      {
        token: 'function',
        foreground: stripHash(token('--ov-syntax-function')),
        fontStyle: token('--ov-syntax-style-function') || '',
      },
      { token: 'function.declaration', foreground: stripHash(token('--ov-syntax-function')) },
      { token: 'method', foreground: stripHash(token('--ov-syntax-method')) },
      { token: 'variable', foreground: stripHash(token('--ov-syntax-variable')) },
      { token: 'parameter', foreground: stripHash(token('--ov-syntax-parameter')) },
      { token: 'property', foreground: stripHash(token('--ov-syntax-property')) },
      { token: 'namespace', foreground: stripHash(token('--ov-syntax-namespace')) },
      { token: 'decorator', foreground: stripHash(token('--ov-syntax-decorator')) },
      { token: 'regexp', foreground: stripHash(token('--ov-syntax-regexp')) },
      { token: 'operator', foreground: stripHash(token('--ov-syntax-operator')) },
      { token: 'delimiter', foreground: stripHash(token('--ov-syntax-punctuation')) },
      { token: 'delimiter.bracket', foreground: stripHash(token('--ov-syntax-punctuation')) },
    ],
    colors: {
      'editor.background': token('--ov-color-editor-bg'),
      'editor.foreground': token('--ov-color-editor-fg'),
      'editorCursor.foreground': token('--ov-color-editor-cursor'),
      'editor.selectionBackground': token('--ov-color-editor-selection-bg'),
      'editor.inactiveSelectionBackground': token('--ov-color-editor-selection-inactive-bg'),
      'editor.lineHighlightBackground': token('--ov-color-editor-line-highlight-bg'),
      'editor.lineHighlightBorder': token('--ov-color-editor-line-highlight-border'),
      'editorLineNumber.foreground': token('--ov-color-editor-line-number'),
      'editorLineNumber.activeForeground': token('--ov-color-editor-line-number-active'),
      'editorWhitespace.foreground': token('--ov-color-editor-whitespace'),
      'editorIndentGuide.background': token('--ov-color-editor-indent-guide'),
      'editorIndentGuide.activeBackground': token('--ov-color-editor-indent-guide-active'),
      'editorRuler.foreground': token('--ov-color-editor-ruler'),
      'editor.findMatchBackground': token('--ov-color-editor-find-match-bg'),
      'editor.findMatchBorder': token('--ov-color-editor-find-match-border'),
      'editor.findMatchHighlightBackground': token('--ov-color-editor-find-range-bg'),
      'editorLink.activeForeground': token('--ov-color-editor-link'),
      'editorBracketMatch.background': token('--ov-color-editor-bracket-match-bg'),
      'editorBracketMatch.border': token('--ov-color-editor-bracket-match-border'),
      'editorBracketHighlight.foreground1': token('--ov-color-editor-bracket-1'),
      'editorBracketHighlight.foreground2': token('--ov-color-editor-bracket-2'),
      'editorBracketHighlight.foreground3': token('--ov-color-editor-bracket-3'),
      'editorBracketHighlight.foreground4': token('--ov-color-editor-bracket-4'),
      'editorBracketHighlight.foreground5': token('--ov-color-editor-bracket-5'),
      'editorBracketHighlight.foreground6': token('--ov-color-editor-bracket-6'),
      'editorGutter.background': token('--ov-color-gutter-bg'),
      'editorGutter.addedBackground': token('--ov-color-gutter-added'),
      'editorGutter.modifiedBackground': token('--ov-color-gutter-modified'),
      'editorGutter.deletedBackground': token('--ov-color-gutter-deleted'),
      'diffEditor.insertedTextBackground': token('--ov-color-diff-insert-bg'),
      'diffEditor.removedTextBackground': token('--ov-color-diff-remove-bg'),
      'minimap.background': token('--ov-color-minimap-bg'),
      'minimap.selectionHighlight': token('--ov-color-minimap-selection'),
      'minimap.errorHighlight': token('--ov-color-minimap-error'),
      'minimap.warningHighlight': token('--ov-color-minimap-warning'),
      'minimap.findMatchHighlight': token('--ov-color-minimap-find-match'),
    },
  };
}

export const OV_MONACO_THEME = 'ov-theme';
