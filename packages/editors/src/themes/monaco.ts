import { getComputedToken } from './useEditorTheme';

type ThemeMode = 'dark' | 'light' | 'high-contrast-dark' | 'high-contrast-light';

interface MonacoThemeData {
  base: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
  inherit: boolean;
  rules: Array<{ token: string; foreground?: string; fontStyle?: string }>;
  colors: Record<string, string>;
}

/**
 * Convert any CSS color value to hex format that Monaco understands.
 * Monaco only accepts #RGB, #RRGGBB, or #RRGGBBAA — it renders a bright red
 * fallback for rgb(), rgba(), transparent, or any other format.
 */
function toHex(color: string): string {
  const trimmed = color.trim();
  if (!trimmed || trimmed === 'transparent') return '';

  // Already hex — return as-is (with hash)
  if (trimmed.startsWith('#')) return trimmed;

  // Match rgb/rgba in both legacy (comma) and modern (space) syntax
  // rgb(255, 255, 255) | rgb(255 255 255) | rgba(255, 255, 255, 0.5) | rgb(255 255 255 / 0.5)
  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:\s*[/,]\s*([\d.]+))?\s*\)$/,
  );
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    const a = rgbMatch[4] !== undefined ? Number(rgbMatch[4]) : 1;
    const hex = (c: number) => c.toString(16).padStart(2, '0');
    if (a >= 1) return `#${hex(r)}${hex(g)}${hex(b)}`;
    return `#${hex(r)}${hex(g)}${hex(b)}${hex(Math.round(a * 255))}`;
  }

  // Unrecognized format — drop it so Monaco falls back to base theme
  return '';
}

function stripHash(color: string): string {
  return color.startsWith('#') ? color.slice(1) : color;
}

function token(name: string): string {
  return getComputedToken(name) || '';
}

/** Read a CSS token and convert to hex for Monaco. */
function hexToken(name: string): string {
  return toHex(token(name));
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

/**
 * Build a token rule, omitting foreground if the CSS variable is not defined.
 * Monaco throws on empty-string foreground values, so we filter them out
 * and let `inherit: true` fall back to the base theme defaults.
 */
function tokenRule(
  name: string,
  fgVar: string,
  styleVar?: string,
  styleDefault?: string,
): { token: string; foreground?: string; fontStyle?: string } | null {
  const fg = toHex(token(fgVar));
  const stripped = fg ? stripHash(fg) : '';
  if (!stripped) return null;
  const entry: { token: string; foreground: string; fontStyle?: string } = {
    token: name,
    foreground: stripped,
  };
  if (styleVar) {
    entry.fontStyle = token(styleVar) || styleDefault || '';
  }
  return entry;
}

/**
 * Filter a color map to exclude entries with empty-string values.
 * Monaco accepts missing keys but throws on empty strings.
 */
function filterColors(colors: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(colors)) {
    if (value) result[key] = value;
  }
  return result;
}

export function buildMonacoTheme(mode: ThemeMode): MonacoThemeData {
  const rules = [
    tokenRule('comment', '--ov-syntax-comment', '--ov-syntax-style-comment', 'italic'),
    tokenRule('string', '--ov-syntax-string'),
    tokenRule('string.escape', '--ov-syntax-string-escape'),
    tokenRule('number', '--ov-syntax-number'),
    tokenRule('keyword', '--ov-syntax-keyword', '--ov-syntax-style-keyword'),
    tokenRule('keyword.control', '--ov-syntax-keyword-control'),
    tokenRule('keyword.operator', '--ov-syntax-keyword-operator'),
    tokenRule('type', '--ov-syntax-type', '--ov-syntax-style-type'),
    tokenRule('type.identifier', '--ov-syntax-type'),
    tokenRule('class', '--ov-syntax-class'),
    tokenRule('interface', '--ov-syntax-interface'),
    tokenRule('function', '--ov-syntax-function', '--ov-syntax-style-function'),
    tokenRule('function.declaration', '--ov-syntax-function'),
    tokenRule('method', '--ov-syntax-method'),
    tokenRule('variable', '--ov-syntax-variable'),
    tokenRule('parameter', '--ov-syntax-parameter'),
    tokenRule('property', '--ov-syntax-property'),
    tokenRule('namespace', '--ov-syntax-namespace'),
    tokenRule('decorator', '--ov-syntax-decorator'),
    tokenRule('regexp', '--ov-syntax-regexp'),
    tokenRule('operator', '--ov-syntax-operator'),
    tokenRule('delimiter', '--ov-syntax-punctuation'),
    tokenRule('delimiter.bracket', '--ov-syntax-punctuation'),
  ].filter((r): r is NonNullable<typeof r> => r !== null);

  return {
    base: getBaseTheme(mode),
    inherit: true,
    rules,
    colors: filterColors({
      'editor.background': hexToken('--ov-color-editor-bg'),
      'editor.foreground': hexToken('--ov-color-editor-fg'),
      'editorCursor.foreground': hexToken('--ov-color-editor-cursor'),
      'editor.selectionBackground': hexToken('--ov-color-editor-selection-bg'),
      'editor.inactiveSelectionBackground': hexToken('--ov-color-editor-selection-inactive-bg'),
      'editor.lineHighlightBackground': hexToken('--ov-color-editor-line-highlight-bg'),
      'editor.lineHighlightBorder': hexToken('--ov-color-editor-line-highlight-border'),
      'editorLineNumber.foreground': hexToken('--ov-color-editor-line-number'),
      'editorLineNumber.activeForeground': hexToken('--ov-color-editor-line-number-active'),
      'editorWhitespace.foreground': hexToken('--ov-color-editor-whitespace'),
      'editorIndentGuide.background': hexToken('--ov-color-editor-indent-guide'),
      'editorIndentGuide.activeBackground': hexToken('--ov-color-editor-indent-guide-active'),
      'editorRuler.foreground': hexToken('--ov-color-editor-ruler'),
      'editor.findMatchBackground': hexToken('--ov-color-editor-find-match-bg'),
      'editor.findMatchBorder': hexToken('--ov-color-editor-find-match-border'),
      'editor.findMatchHighlightBackground': hexToken('--ov-color-editor-find-range-bg'),
      'editorLink.activeForeground': hexToken('--ov-color-editor-link'),
      'editorBracketMatch.background': hexToken('--ov-color-editor-bracket-match-bg'),
      'editorBracketMatch.border': hexToken('--ov-color-editor-bracket-match-border'),
      'editorBracketHighlight.foreground1': hexToken('--ov-color-editor-bracket-1'),
      'editorBracketHighlight.foreground2': hexToken('--ov-color-editor-bracket-2'),
      'editorBracketHighlight.foreground3': hexToken('--ov-color-editor-bracket-3'),
      'editorBracketHighlight.foreground4': hexToken('--ov-color-editor-bracket-4'),
      'editorBracketHighlight.foreground5': hexToken('--ov-color-editor-bracket-5'),
      'editorBracketHighlight.foreground6': hexToken('--ov-color-editor-bracket-6'),
      'editorGutter.background': hexToken('--ov-color-gutter-bg'),
      'editorGutter.addedBackground': hexToken('--ov-color-gutter-added'),
      'editorGutter.modifiedBackground': hexToken('--ov-color-gutter-modified'),
      'editorGutter.deletedBackground': hexToken('--ov-color-gutter-deleted'),
      'diffEditor.insertedTextBackground': hexToken('--ov-color-diff-insert-bg'),
      'diffEditor.removedTextBackground': hexToken('--ov-color-diff-remove-bg'),
      'minimap.background': hexToken('--ov-color-minimap-bg'),
      'minimap.selectionHighlight': hexToken('--ov-color-minimap-selection'),
      'minimap.errorHighlight': hexToken('--ov-color-minimap-error'),
      'minimap.warningHighlight': hexToken('--ov-color-minimap-warning'),
      'minimap.findMatchHighlight': hexToken('--ov-color-minimap-find-match'),
    }),
  };
}

export const OV_MONACO_THEME = 'ov-theme';
