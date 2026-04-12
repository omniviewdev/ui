import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';
import { themeRegistry } from './registry';

function Reader() {
  const { theme } = useTheme();
  return <div data-testid="theme">{theme}</div>;
}

function reset() {
  // Unregister any non-built-in themes that tests may have registered.
  for (const info of themeRegistry.list()) {
    if (!info.builtIn) themeRegistry.unregister(info.id);
  }
  themeRegistry.apply('dark');
  document.documentElement.removeAttribute('data-ov-theme');
  document.documentElement.removeAttribute('data-ov-theme-custom');
  document.documentElement.style.cssText = '';
  window.localStorage.clear();
}

describe('ThemeProvider + themeRegistry integration', () => {
  beforeEach(() => reset());
  afterEach(() => reset());

  it('applies initialTheme on mount (built-in)', () => {
    render(
      <ThemeProvider initialTheme="light" persist={false}>
        <Reader />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-ov-theme')).toBe('light');
  });

  it('re-renders when the registry applies a theme externally', () => {
    render(
      <ThemeProvider initialTheme="dark" persist={false}>
        <Reader />
      </ThemeProvider>,
    );
    act(() => {
      themeRegistry.apply('light');
    });
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('defers apply for unregistered stored id and auto-applies on registration', () => {
    window.localStorage.setItem('ov-theme-mode', 'solarized-dark');
    render(
      <ThemeProvider initialTheme="dark" persist>
        <Reader />
      </ThemeProvider>,
    );
    // Pending — no custom theme registered yet, provider fell back to initial.
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    act(() => {
      themeRegistry.register({
        id: 'solarized-dark',
        name: 'Solarized Dark',
        base: 'dark',
        colors: { 'color.bg.base': '#002b36' },
      });
    });
    // Registration triggers auto-apply.
    expect(screen.getByTestId('theme').textContent).toBe('solarized-dark');
    expect(document.documentElement.getAttribute('data-ov-theme-custom')).toBe(
      'solarized-dark',
    );
  });

  it('persists the active theme id to localStorage across applies', () => {
    render(
      <ThemeProvider initialTheme="dark" persist>
        <Reader />
      </ThemeProvider>,
    );
    act(() => {
      themeRegistry.apply('light');
    });
    expect(window.localStorage.getItem('ov-theme-mode')).toBe('light');
  });

  it('unsubscribes from registry events on unmount', () => {
    const { unmount } = render(
      <ThemeProvider initialTheme="dark" persist={false}>
        <Reader />
      </ThemeProvider>,
    );
    unmount();
    // After unmount, an external apply should not throw via stale listener.
    expect(() => themeRegistry.apply('light')).not.toThrow();
  });
});
