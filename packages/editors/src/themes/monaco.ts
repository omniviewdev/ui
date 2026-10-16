import { getComputedThemeStyle, getEditorThemeRoot } from './useEditorTheme';
import type { BuiltInThemeId } from '@omniviewdev/base-ui';

interface MonacoThemeData {
  base: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
  inherit: boolean;
  rules: Array<{ token: string; foreground?: string; fontStyle?: string }>;
  colors: Record<string, string>;
}

const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const SERIALIZED_RGB =
  /^rgba?\(\s*([\d.]+)(?:\s*,\s*|\s+)([\d.]+)(?:\s*,\s*|\s+)([\d.]+)(?:\s*(?:,|\/)\s*([\d.]+))?\s*\)$/i;

function byteToHex(value: number): string {
  return Math.max(0, Math.min(255, Math.round(value)))
    .toString(16)
    .padStart(2, '0');
}

function serializedColorToHex(color: string): string {
  const trimmed = color.trim();
  if (HEX_COLOR.test(trimmed)) return trimmed;

  const match = trimmed.match(SERIALIZED_RGB);
  if (!match) return '';
  const alpha = match[4] === undefined ? 1 : Number(match[4]);
  const rgb = `#${byteToHex(Number(match[1]))}${byteToHex(Number(match[2]))}${byteToHex(Number(match[3]))}`;
  return alpha >= 1 ? rgb : `${rgb}${byteToHex(alpha * 255)}`;
}

interface MonacoColorNormalizer {
  normalize(color: string): string;
  dispose(): void;
}

function createMonacoColorNormalizer(root: HTMLElement | null): MonacoColorNormalizer {
  if (!root) {
    return {
      normalize: serializedColorToHex,
      dispose() {},
    };
  }

  const surface = root.ownerDocument.createElement('canvas');
  surface.width = 1;
  surface.height = 1;
  surface.setAttribute('aria-hidden', 'true');
  surface.style.cssText =
    'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;visibility:hidden';
  root.append(surface);
  let context: CanvasRenderingContext2D | null | undefined;

  return {
    normalize(color) {
      const direct = serializedColorToHex(color);
      if (direct) return direct;

      surface.style.color = '';
      surface.style.color = color.trim();
      if (!surface.style.color) return '';

      const computed = getComputedStyle(surface).color;
      const serialized = serializedColorToHex(computed);
      if (serialized) return serialized;
      if (!/^(?:color|lab|lch|oklab|oklch)\(/i.test(computed)) return '';

      try {
        context ??= surface.getContext('2d', { willReadFrequently: true });
        if (!context) return '';
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = '#010203';
        context.fillStyle = computed;
        if (context.fillStyle === '#010203') return '';
        context.fillRect(0, 0, 1, 1);
        const pixel = context.getImageData(0, 0, 1, 1).data;
        const rgb = `#${byteToHex(pixel[0]!)}${byteToHex(pixel[1]!)}${byteToHex(pixel[2]!)}`;
        return pixel[3] === 255 ? rgb : `${rgb}${byteToHex(pixel[3]!)}`;
      } catch {
        return '';
      }
    },

    dispose() {
      surface.remove();
    },
  };
}

function getBaseTheme(mode: BuiltInThemeId): 'vs' | 'vs-dark' | 'hc-black' | 'hc-light' {
  switch (mode) {
    case 'light':
    case 'solarized-light':
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
  styles: CSSStyleDeclaration | null,
  normalizer: MonacoColorNormalizer,
  styleVar?: string,
  styleDefault?: string,
): { token: string; foreground?: string; fontStyle?: string } | null {
  const foreground = normalizer.normalize(styles?.getPropertyValue(fgVar).trim() ?? '');
  if (!foreground) return null;
  const entry: { token: string; foreground: string; fontStyle?: string } = {
    token: name,
    foreground: foreground.slice(1),
  };
  if (styleVar) {
    entry.fontStyle = styles?.getPropertyValue(styleVar).trim() || styleDefault || '';
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

export function buildMonacoTheme(
  mode: BuiltInThemeId,
  element?: HTMLElement | null,
): MonacoThemeData {
  const root = getEditorThemeRoot(element);
  const styles = getComputedThemeStyle(root);
  const normalizer = createMonacoColorNormalizer(root);
  const rule = (name: string, fgVar: string, styleVar?: string, styleDefault?: string) =>
    tokenRule(name, fgVar, styles, normalizer, styleVar, styleDefault);
  const color = (name: string) => normalizer.normalize(styles?.getPropertyValue(name).trim() ?? '');

  try {
    const rules = [
      rule('comment', '--ov-syntax-comment', '--ov-syntax-style-comment', 'italic'),
      rule('string', '--ov-syntax-string'),
      rule('string.escape', '--ov-syntax-string-escape'),
      rule('number', '--ov-syntax-number'),
      rule('keyword', '--ov-syntax-keyword', '--ov-syntax-style-keyword'),
      rule('keyword.control', '--ov-syntax-keyword-control'),
      rule('keyword.operator', '--ov-syntax-keyword-operator'),
      rule('type', '--ov-syntax-type', '--ov-syntax-style-type'),
      rule('type.identifier', '--ov-syntax-type'),
      rule('class', '--ov-syntax-class'),
      rule('interface', '--ov-syntax-interface'),
      rule('function', '--ov-syntax-function', '--ov-syntax-style-function'),
      rule('function.declaration', '--ov-syntax-function'),
      rule('method', '--ov-syntax-method'),
      rule('variable', '--ov-syntax-variable'),
      rule('parameter', '--ov-syntax-parameter'),
      rule('property', '--ov-syntax-property'),
      rule('namespace', '--ov-syntax-namespace'),
      rule('decorator', '--ov-syntax-decorator'),
      rule('regexp', '--ov-syntax-regexp'),
      rule('operator', '--ov-syntax-operator'),
      rule('delimiter', '--ov-syntax-punctuation'),
      rule('delimiter.bracket', '--ov-syntax-punctuation'),
    ].filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    return {
      base: getBaseTheme(mode),
      inherit: true,
      rules,
      colors: filterColors({
        'editor.background': color('--ov-color-editor-bg'),
        'editor.foreground': color('--ov-color-editor-fg'),
        'editorCursor.foreground': color('--ov-color-editor-cursor'),
        'editor.selectionBackground': color('--ov-color-editor-selection-bg'),
        'editor.inactiveSelectionBackground': color('--ov-color-editor-selection-inactive-bg'),
        'editor.lineHighlightBackground': color('--ov-color-editor-line-highlight-bg'),
        'editor.lineHighlightBorder': color('--ov-color-editor-line-highlight-border'),
        'editorLineNumber.foreground': color('--ov-color-editor-line-number'),
        'editorLineNumber.activeForeground': color('--ov-color-editor-line-number-active'),
        'editorWhitespace.foreground': color('--ov-color-editor-whitespace'),
        'editorIndentGuide.background': color('--ov-color-editor-indent-guide'),
        'editorIndentGuide.activeBackground': color('--ov-color-editor-indent-guide-active'),
        'editorRuler.foreground': color('--ov-color-editor-ruler'),
        'editor.findMatchBackground': color('--ov-color-editor-find-match-bg'),
        'editor.findMatchBorder': color('--ov-color-editor-find-match-border'),
        'editor.findMatchHighlightBackground': color('--ov-color-editor-find-range-bg'),
        'editorLink.activeForeground': color('--ov-color-editor-link'),
        'editorBracketMatch.background': color('--ov-color-editor-bracket-match-bg'),
        'editorBracketMatch.border': color('--ov-color-editor-bracket-match-border'),
        'editorBracketHighlight.foreground1': color('--ov-color-editor-bracket-1'),
        'editorBracketHighlight.foreground2': color('--ov-color-editor-bracket-2'),
        'editorBracketHighlight.foreground3': color('--ov-color-editor-bracket-3'),
        'editorBracketHighlight.foreground4': color('--ov-color-editor-bracket-4'),
        'editorBracketHighlight.foreground5': color('--ov-color-editor-bracket-5'),
        'editorBracketHighlight.foreground6': color('--ov-color-editor-bracket-6'),
        'editorGutter.background': color('--ov-color-gutter-bg'),
        'editorGutter.addedBackground': color('--ov-color-gutter-added'),
        'editorGutter.modifiedBackground': color('--ov-color-gutter-modified'),
        'editorGutter.deletedBackground': color('--ov-color-gutter-deleted'),
        'diffEditor.insertedTextBackground': color('--ov-color-diff-insert-bg'),
        'diffEditor.removedTextBackground': color('--ov-color-diff-remove-bg'),
        'minimap.background': color('--ov-color-minimap-bg'),
        'minimap.selectionHighlight': color('--ov-color-minimap-selection'),
        'minimap.errorHighlight': color('--ov-color-minimap-error'),
        'minimap.warningHighlight': color('--ov-color-minimap-warning'),
        'minimap.findMatchHighlight': color('--ov-color-minimap-find-match'),
      }),
    };
  } finally {
    normalizer.dispose();
  }
}

export const OV_MONACO_THEME = 'ov-theme';
