import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useThemeList } from './useThemeList';
import { themeRegistry } from './registry';

function List() {
  const themes = useThemeList();
  return (
    <ul>
      {themes.map((t) => (
        <li key={t.id} data-testid="theme-item">
          {t.id}
        </li>
      ))}
    </ul>
  );
}

afterEach(() => {
  for (const info of themeRegistry.list()) {
    if (!info.builtIn) themeRegistry.unregister(info.id);
  }
});

describe('useThemeList', () => {
  it('initially returns the 7 built-ins', () => {
    render(<List />);
    expect(screen.getAllByTestId('theme-item')).toHaveLength(7);
  });

  it('re-renders when a theme is registered', () => {
    render(<List />);
    act(() => {
      themeRegistry.register({
        id: 'use-theme-list-fixture',
        name: 'Fixture',
        base: 'dark',
      });
    });
    const items = screen.getAllByTestId('theme-item');
    expect(items).toHaveLength(8);
    expect(items.some((el) => el.textContent === 'use-theme-list-fixture')).toBe(true);
  });

  it('re-renders when a theme is unregistered', () => {
    themeRegistry.register({ id: 'unreg-fixture', name: 'Fixture', base: 'dark' });
    render(<List />);
    expect(screen.getAllByTestId('theme-item')).toHaveLength(8);
    act(() => {
      themeRegistry.unregister('unreg-fixture');
    });
    expect(screen.getAllByTestId('theme-item')).toHaveLength(7);
  });
});
