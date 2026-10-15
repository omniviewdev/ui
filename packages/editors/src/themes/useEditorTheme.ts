import { useTheme } from '@omniviewdev/base-ui';
import type { EditorTheme } from './types';

export function getComputedToken(token: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

export function useEditorTheme(): EditorTheme {
  const { activeTheme } = useTheme();
  return { id: activeTheme.id, base: activeTheme.base };
}
