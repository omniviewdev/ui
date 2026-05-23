import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useThemeRegistry } from './useThemeRegistry';
import { themeRegistry } from './registry';

describe('useThemeRegistry', () => {
  it('returns the module singleton', () => {
    const { result } = renderHook(() => useThemeRegistry());
    expect(result.current).toBe(themeRegistry);
  });
});
