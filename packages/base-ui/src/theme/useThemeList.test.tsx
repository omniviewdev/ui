import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createThemeRegistry } from './registry';
import { useThemeList } from './useThemeList';

const owner = { kind: 'user', id: 'tests' } as const;

describe('useThemeList', () => {
  it('returns the registry snapshot and reacts to registration and disposal', () => {
    const registry = createThemeRegistry();
    const { result } = renderHook(() => useThemeList(registry));
    expect(result.current).toHaveLength(9);

    let dispose = () => {};
    act(() => {
      dispose = registry.register(
        { schemaVersion: 1, id: 'hook-theme', name: 'Hook Theme', base: 'dark', tokens: {} },
        owner,
      );
    });
    expect(result.current.map(({ id }) => id)).toContain('hook-theme');

    act(dispose);
    expect(result.current).toHaveLength(9);
  });
});
