import { afterEach, describe, expect, it } from 'vitest';
import { createThemeRegistry } from './registry';
import { createThemeRootApplier } from './applyTheme';

const owner = { kind: 'user', id: 'applier-tests' } as const;

function customTheme() {
  const registry = createThemeRegistry();
  registry.register(
    {
      schemaVersion: 1,
      id: 'acme.slate',
      name: 'Slate',
      base: 'dark',
      tokens: { 'color.bg.base': '#101114', 'color.fg.default': '#eeeeee' },
    },
    owner,
  );
  return { custom: registry.get('acme.slate')!, builtIn: registry.get('void')! };
}

describe('createThemeRootApplier', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-ov-theme');
    document.documentElement.removeAttribute('data-ov-theme-custom');
    document.documentElement.style.cssText = '';
  });

  it('switches custom and built-in themes without clearing host styles', () => {
    const root = document.documentElement;
    root.style.setProperty('--host-owned', 'keep');
    const applier = createThemeRootApplier(root);
    const { custom, builtIn } = customTheme();

    applier.apply(custom);
    expect(root.dataset.ovTheme).toBe('dark');
    expect(root.dataset.ovThemeCustom).toBe('acme.slate');
    expect(root.style.getPropertyValue('--ov-color-bg-base')).toBe('#101114');

    applier.apply(builtIn);
    expect(root.dataset.ovTheme).toBe('void');
    expect(root.dataset.ovThemeCustom).toBeUndefined();
    expect(root.style.getPropertyValue('--ov-color-bg-base')).toBe('');
    expect(root.style.getPropertyValue('--host-owned')).toBe('keep');
    applier.cleanup();
  });

  it('restores the newest surviving owner when overlapping appliers clean up', () => {
    const root = document.documentElement;
    const { custom, builtIn } = customTheme();
    const earlier = createThemeRootApplier(root);
    const later = createThemeRootApplier(root);

    root.style.setProperty('--host-owned', 'keep');
    earlier.apply(custom);
    later.apply(builtIn);
    later.cleanup();

    expect(root.dataset.ovTheme).toBe('dark');
    expect(root.dataset.ovThemeCustom).toBe('acme.slate');
    expect(root.style.colorScheme).toBe('dark');
    expect(root.style.getPropertyValue('--ov-color-bg-base')).toBe('#101114');
    expect(root.style.getPropertyValue('--host-owned')).toBe('keep');

    earlier.cleanup();
    expect(root.dataset.ovTheme).toBeUndefined();
    expect(root.dataset.ovThemeCustom).toBeUndefined();
    expect(root.style.colorScheme).toBe('');
    expect(root.style.getPropertyValue('--ov-color-bg-base')).toBe('');
    expect(root.style.getPropertyValue('--host-owned')).toBe('keep');
  });

  it('moves a re-applied owner to the top of the shared-root stack', () => {
    const root = document.documentElement;
    const { custom, builtIn } = customTheme();
    const earlier = createThemeRootApplier(root);
    const later = createThemeRootApplier(root);

    earlier.apply(custom);
    later.apply(builtIn);
    earlier.apply(custom);
    later.cleanup();

    expect(root.dataset.ovThemeCustom).toBe('acme.slate');
    expect(root.style.getPropertyValue('--ov-color-bg-base')).toBe('#101114');
    earlier.cleanup();
  });

  it('removes all root theme state when the last built-in owner cleans up', () => {
    const root = document.documentElement;
    const { builtIn } = customTheme();
    const applier = createThemeRootApplier(root);

    applier.apply(builtIn);
    applier.cleanup();

    expect(root.dataset.ovTheme).toBeUndefined();
    expect(root.dataset.ovThemeCustom).toBeUndefined();
    expect(root.style.colorScheme).toBe('');
  });

  it('clears every property from the previous owner during handoff', () => {
    const root = document.documentElement;
    const { custom, builtIn } = customTheme();
    const earlier = createThemeRootApplier(root);
    const later = createThemeRootApplier(root);

    earlier.apply(custom);
    later.apply(builtIn);

    expect(root.style.getPropertyValue('--ov-color-bg-base')).toBe('');
    expect(root.style.getPropertyValue('--ov-color-fg-default')).toBe('');
    later.cleanup();
    earlier.cleanup();
  });
});
