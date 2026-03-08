import { getComputedToken } from './useEditorTheme';

export interface XtermThemeData {
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent?: string;
  selectionBackground: string;
  selectionForeground?: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

function token(name: string): string {
  return getComputedToken(name) || '';
}

export function buildXtermTheme(): XtermThemeData {
  return {
    background: token('--ov-color-terminal-bg'),
    foreground: token('--ov-color-terminal-fg'),
    cursor: token('--ov-color-terminal-cursor'),
    selectionBackground: token('--ov-color-terminal-selection-bg'),
    selectionForeground: token('--ov-color-terminal-selection-fg') || undefined,
    black: token('--ov-color-ansi-black'),
    red: token('--ov-color-ansi-red'),
    green: token('--ov-color-ansi-green'),
    yellow: token('--ov-color-ansi-yellow'),
    blue: token('--ov-color-ansi-blue'),
    magenta: token('--ov-color-ansi-magenta'),
    cyan: token('--ov-color-ansi-cyan'),
    white: token('--ov-color-ansi-white'),
    brightBlack: token('--ov-color-ansi-bright-black'),
    brightRed: token('--ov-color-ansi-bright-red'),
    brightGreen: token('--ov-color-ansi-bright-green'),
    brightYellow: token('--ov-color-ansi-bright-yellow'),
    brightBlue: token('--ov-color-ansi-bright-blue'),
    brightMagenta: token('--ov-color-ansi-bright-magenta'),
    brightCyan: token('--ov-color-ansi-bright-cyan'),
    brightWhite: token('--ov-color-ansi-bright-white'),
  };
}
