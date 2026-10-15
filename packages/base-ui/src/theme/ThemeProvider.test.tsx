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
  act(() => {
    themeRegistry.unregisterOwner(owner);
  });
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

  it('falls back to the active custom theme base when its registration is removed', () => {
    const dispose = themeRegistry.register(
      {
        schemaVersion: 1,
        id: 'provider.removed',
        name: 'Removed',
        base: 'light',
        tokens: { 'color.bg.base': '#fdf6e3' },
      },
      owner,
    );
    render(<ThemeProvider initialTheme="provider.removed"><Reader /></ThemeProvider>);
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('#fdf6e3');

    act(dispose);

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-ov-theme')).toBe('light');
    expect(document.documentElement.hasAttribute('data-ov-theme-custom')).toBe(false);
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('');
    expect(window.localStorage.getItem('ov-theme-mode')).toBe('light');
  });

  it('clears custom inline properties and attributes before a built-in provider remounts', () => {
    themeRegistry.register(
      {
        schemaVersion: 1,
        id: 'provider.lifecycle',
        name: 'Lifecycle',
        base: 'dark',
        tokens: { 'color.bg.base': '#002b36', 'color.fg.default': '#839496' },
      },
      owner,
    );
    const mounted = render(
      <ThemeProvider initialTheme="provider.lifecycle" persist={false}><Reader /></ThemeProvider>,
    );
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('#002b36');

    mounted.unmount();

    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--ov-color-fg-default')).toBe('');
    expect(document.documentElement.hasAttribute('data-ov-theme-custom')).toBe(false);
    render(<ThemeProvider initialTheme="dark" persist={false}><Reader /></ThemeProvider>);
    expect(document.documentElement.getAttribute('data-ov-theme')).toBe('dark');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('');
  });

  it('does not clear a later provider DOM state when overlapping providers share a theme', () => {
    themeRegistry.register(
      {
        schemaVersion: 1,
        id: 'provider.shared',
        name: 'Shared',
        base: 'dark',
        tokens: { 'color.bg.base': '#002b36' },
      },
      owner,
    );
    const earlier = render(
      <ThemeProvider initialTheme="provider.shared" persist={false}><Reader /></ThemeProvider>,
    );
    const later = render(
      <ThemeProvider initialTheme="provider.shared" persist={false}><Reader /></ThemeProvider>,
    );

    earlier.unmount();

    expect(document.documentElement.getAttribute('data-ov-theme-custom')).toBe('provider.shared');
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('#002b36');

    later.unmount();
    expect(document.documentElement.hasAttribute('data-ov-theme-custom')).toBe(false);
    expect(document.documentElement.style.getPropertyValue('--ov-color-bg-base')).toBe('');
  });
});
