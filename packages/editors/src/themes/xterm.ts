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

function token(name: string, fallback = ''): string {
  return getComputedToken(name) || fallback;
}

export function buildXtermTheme(): XtermThemeData {
  return {
    background: token('--ov-color-terminal-bg', '#0d0e10'),
    foreground: token('--ov-color-terminal-fg', '#e2e7ee'),
    cursor: token('--ov-color-terminal-cursor', '#89a7ee'),
    selectionBackground: token('--ov-color-terminal-selection-bg', 'rgba(90,127,226,0.18)'),
    selectionForeground: token('--ov-color-terminal-selection-fg') || undefined,
    black: token('--ov-color-ansi-black', '#3b4252'),
    red: token('--ov-color-ansi-red', '#bf616a'),
    green: token('--ov-color-ansi-green', '#a3be8c'),
    yellow: token('--ov-color-ansi-yellow', '#ebcb8b'),
    blue: token('--ov-color-ansi-blue', '#81a1c1'),
    magenta: token('--ov-color-ansi-magenta', '#b48ead'),
    cyan: token('--ov-color-ansi-cyan', '#88c0d0'),
    white: token('--ov-color-ansi-white', '#e5e9f0'),
    brightBlack: token('--ov-color-ansi-bright-black', '#4c566a'),
    brightRed: token('--ov-color-ansi-bright-red', '#d08770'),
    brightGreen: token('--ov-color-ansi-bright-green', '#a3be8c'),
    brightYellow: token('--ov-color-ansi-bright-yellow', '#ebcb8b'),
    brightBlue: token('--ov-color-ansi-bright-blue', '#81a1c1'),
    brightMagenta: token('--ov-color-ansi-bright-magenta', '#b48ead'),
    brightCyan: token('--ov-color-ansi-bright-cyan', '#8fbcbb'),
    brightWhite: token('--ov-color-ansi-bright-white', '#eceff4'),
  };
}
