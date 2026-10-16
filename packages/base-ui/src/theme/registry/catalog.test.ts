import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BUILT_IN_THEMES, BUILT_IN_THEME_IDS, isBuiltInThemeId } from './catalog';

const REQUIRED_SURFACE_TOKENS = [
  '--ov-color-bg-base',
  '--ov-color-fg-default',
  '--ov-color-editor-bg',
  '--ov-color-editor-fg',
  '--ov-color-editor-cursor',
  '--ov-color-editor-selection-bg',
  '--ov-color-terminal-bg',
  '--ov-color-terminal-fg',
  '--ov-color-terminal-cursor',
  '--ov-color-terminal-selection-bg',
  '--ov-syntax-keyword',
  '--ov-color-ansi-red',
] as const;

const styles = readFileSync(resolve(process.cwd(), 'src/theme/styles.css'), 'utf8');

function parseColor(value: string): [number, number, number] | undefined {
  const hex = /^#([\da-f]{6})$/i.exec(value.trim());
  if (hex) {
    const number = Number.parseInt(hex[1]!, 16);
    return [number >> 16, (number >> 8) & 255, number & 255];
  }
  const rgb = /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\)$/i.exec(value.trim());
  return rgb ? [Number(rgb[1]!), Number(rgb[2]!), Number(rgb[3]!)] : undefined;
}

function luminance([red, green, blue]: [number, number, number]): number {
  const linearize = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue);
}

function contrast(left: string, right: string): number {
  const leftColor = parseColor(left);
  const rightColor = parseColor(right);
  if (!leftColor || !rightColor) throw new Error(`Expected solid colors, received '${left}' and '${right}'`);
  const leftLuminance = luminance(leftColor);
  const rightLuminance = luminance(rightColor);
  return (Math.max(leftLuminance, rightLuminance) + 0.05) / (Math.min(leftLuminance, rightLuminance) + 0.05);
}

let styleElement: HTMLStyleElement;

beforeAll(() => {
  styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.append(styleElement);
});

afterAll(() => {
  styleElement.remove();
  document.documentElement.removeAttribute('data-ov-theme');
});

describe('built-in theme catalog', () => {
  it('exposes the immutable ordered nine-theme catalog', () => {
    expect(BUILT_IN_THEMES.map((theme) => theme.id)).toEqual([
      'void',
      'dark',
      'light',
      'obsidian',
      'carbon',
      'solarized-dark',
      'solarized-light',
      'high-contrast-dark',
      'high-contrast-light',
    ]);
    expect(BUILT_IN_THEMES.find((theme) => theme.id === 'void')?.appearance).toBe('dark');
    expect(BUILT_IN_THEMES.find((theme) => theme.id === 'light')?.appearance).toBe('light');
    expect(BUILT_IN_THEMES.every((theme) => theme.builtIn)).toBe(true);
    expect(Object.isFrozen(BUILT_IN_THEMES)).toBe(true);
    expect(BUILT_IN_THEMES.every((theme) => Object.isFrozen(theme) && Object.isFrozen(theme.owner))).toBe(true);
  });

  it('provides an immutable ID set and type guard', () => {
    expect([...BUILT_IN_THEME_IDS]).toEqual(BUILT_IN_THEMES.map((theme) => theme.id));
    expect(isBuiltInThemeId('solarized-dark')).toBe(true);
    expect(isBuiltInThemeId('third-party')).toBe(false);
    expect(() => (BUILT_IN_THEME_IDS as Set<string>).add('third-party')).toThrow();
  });

  it('provides an explicit static selector and complete surface tokens for every built-in', () => {
    for (const theme of BUILT_IN_THEMES) {
      const selector = theme.id === 'dark'
        ? /:root\s*,\s*\[data-ov-theme=['"]dark['"]\]\s*\{/
        : new RegExp(`\\[data-ov-theme=['"]${theme.id}['"]\\]\\s*\\{`);
      expect(styles, `${theme.id} must have an explicit selector`).toMatch(selector);

      document.documentElement.dataset.ovTheme = theme.id;
      const computedStyle = getComputedStyle(document.documentElement);
      for (const token of REQUIRED_SURFACE_TOKENS) {
        expect(computedStyle.getPropertyValue(token).trim(), `${theme.id} must compute ${token}`).not.toBe('');
      }
    }
  });

  it('keeps standard theme text and focus colors at accessible contrast', () => {
    for (const theme of BUILT_IN_THEMES) {
      document.documentElement.dataset.ovTheme = theme.id;
      const computedStyle = getComputedStyle(document.documentElement);
      const value = (token: string) => computedStyle.getPropertyValue(token).trim();

      expect(contrast(value('--ov-color-fg-default'), value('--ov-color-bg-base')), `${theme.id} base text`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(value('--ov-color-fg-default'), value('--ov-color-bg-surface')), `${theme.id} surface text`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(value('--ov-color-border-focus'), value('--ov-color-bg-base')), `${theme.id} base focus`).toBeGreaterThanOrEqual(3);
      expect(contrast(value('--ov-color-border-default'), value('--ov-color-bg-base')), `${theme.id} base border`).toBeGreaterThanOrEqual(3);
      expect(contrast(value('--ov-color-border-default'), value('--ov-color-bg-surface')), `${theme.id} surface border`).toBeGreaterThanOrEqual(3);
      expect(contrast(value('--ov-color-border-focus'), value('--ov-color-bg-surface')), `${theme.id} surface focus`).toBeGreaterThanOrEqual(3);
      if (theme.id === 'solarized-dark' || theme.id === 'solarized-light') {
        expect(contrast(value('--ov-color-border-muted'), value('--ov-color-bg-surface')), `${theme.id} muted surface border`).toBeGreaterThanOrEqual(3);
        expect(contrast(value('--ov-color-terminal-border'), value('--ov-color-terminal-bg')), `${theme.id} terminal border`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('keeps strong borders more distinct from adjacent surfaces than default borders', () => {
    for (const id of ['dark', 'light', 'obsidian', 'carbon', 'void']) {
      document.documentElement.dataset.ovTheme = id;
      const computedStyle = getComputedStyle(document.documentElement);
      const value = (token: string) => computedStyle.getPropertyValue(token).trim();

      for (const surface of ['--ov-color-bg-base', '--ov-color-bg-surface']) {
        expect(
          contrast(value('--ov-color-border-strong'), value(surface)),
          `${id} strong border against ${surface}`,
        ).toBeGreaterThan(contrast(value('--ov-color-border-default'), value(surface)));
      }
    }
  });

  it('keeps high-contrast primary text pairs at enhanced contrast', () => {
    for (const id of ['high-contrast-dark', 'high-contrast-light']) {
      document.documentElement.dataset.ovTheme = id;
      const computedStyle = getComputedStyle(document.documentElement);
      const foreground = computedStyle.getPropertyValue('--ov-color-fg-default').trim();
      for (const background of ['--ov-color-bg-base', '--ov-color-bg-surface']) {
        expect(contrast(foreground, computedStyle.getPropertyValue(background).trim()), `${id} ${background}`).toBeGreaterThanOrEqual(7);
      }
    }
  });
});
