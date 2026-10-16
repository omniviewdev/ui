import { useTheme } from '@omniviewdev/base-ui';
import type { EditorTheme } from './types';

export function getEditorThemeRoot(element?: HTMLElement | null): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return element?.closest<HTMLElement>('[data-ov-theme]') ?? element ?? document.documentElement;
}

export function getComputedThemeStyle(element?: HTMLElement | null): CSSStyleDeclaration | null {
  const root = getEditorThemeRoot(element);
  return root ? getComputedStyle(root) : null;
}

export function getComputedToken(token: string, element?: HTMLElement | null): string {
  return getComputedThemeStyle(element)?.getPropertyValue(token).trim() ?? '';
}

export function useEditorTheme(): EditorTheme {
  const { activeTheme } = useTheme();
  return { id: activeTheme.id, base: activeTheme.base, registration: activeTheme };
}
