import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';
import { themeRegistry } from './registry';

const owner = { kind: 'user', id: 'provider-tests' } as const;

function Reader() {
  const { theme, setTheme } = useTheme();
  return <button data-testid="theme" onClick={() => setTheme('light')}>{theme}</button>;
}

function reset() {
  themeRegistry.unregisterOwner(owner);
  document.documentElement.removeAttribute('data-ov-theme');
  document.documentElement.removeAttribute('data-ov-theme-custom');
  document.documentElement.style.cssText = '';
  window.localStorage.clear();
}

describe('ThemeProvider + themeRegistry integration', () => {
  beforeEach(reset);
  afterEach(reset);

  it('applies initialTheme on mount', () => {
    render(<ThemeProvider initialTheme="light" persist={false}><Reader /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-ov-theme')).toBe('light');
  });

  it('applies and persists selection through context', () => {
    render(<ThemeProvider initialTheme="dark"><Reader /></ThemeProvider>);
    fireEvent.click(screen.getByTestId('theme'));
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(window.localStorage.getItem('ov-theme-mode')).toBe('light');
  });

  it('auto-applies a pending stored theme after registration', () => {
    window.localStorage.setItem('ov-theme-mode', 'provider.custom');
    render(<ThemeProvider initialTheme="dark"><Reader /></ThemeProvider>);
    act(() => {
      themeRegistry.register(
        { schemaVersion: 1, id: 'provider.custom', name: 'Custom', base: 'dark', tokens: { 'color.bg.base': '#002b36' } },
        owner,
      );
    });
    expect(screen.getByTestId('theme').textContent).toBe('provider.custom');
    expect(document.documentElement.getAttribute('data-ov-theme-custom')).toBe('provider.custom');
  });
});
