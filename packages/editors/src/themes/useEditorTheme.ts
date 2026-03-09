import { useEffect, useState } from 'react';
import type { ThemeMode } from './types';

function getCurrentTheme(): ThemeMode {
  if (typeof document === 'undefined') return 'dark';
  const attr = document.documentElement.getAttribute('data-ov-theme');
  if (attr === 'light' || attr === 'high-contrast-dark' || attr === 'high-contrast-light')
    return attr;
  return 'dark';
}

export function getComputedToken(token: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

export function useEditorTheme(): ThemeMode {
  const [theme, setTheme] = useState<ThemeMode>(getCurrentTheme);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(getCurrentTheme());
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-ov-theme'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
