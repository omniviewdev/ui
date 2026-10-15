import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Card, TextField } from '../../components';
import { themeRegistry } from '../registry';
import { ThemeProvider } from '../ThemeProvider';

const SAMPLE = {
  schemaVersion: 1 as const,
  id: 'solarized-dark-fixture',
  name: 'Solarized Dark Fixture',
  base: 'dark' as const,
  tokens: { 'color.bg.base': '#002b36', 'color.fg.default': '#839496' },
};

function Fixture() {
  return (
    <div>
      <Button>click</Button>
      <Card>
        <div>card body</div>
      </Card>
      <TextField.Control placeholder="type here" />
    </div>
  );
}

const visualOwner = { kind: 'user', id: 'visual-regression' } as const;
if (!themeRegistry.has(SAMPLE.id)) {
  themeRegistry.register(SAMPLE, visualOwner);
}

describe('visual regression — representative components under each theme', () => {
  for (const info of themeRegistry.getSnapshot().themes) {
    it(`matches snapshot under theme '${info.id}'`, () => {
      const { container } = render(
        <ThemeProvider themeId={info.id}><Fixture /></ThemeProvider>,
      );
      // Capture both the outer HTML and the resolved theme attributes so
      // snapshots regress when attribute behavior changes.
      const shape = {
        html: container.innerHTML,
        dataOvTheme: document.documentElement.getAttribute('data-ov-theme'),
        dataOvThemeCustom: document.documentElement.getAttribute('data-ov-theme-custom'),
        colorScheme: document.documentElement.style.colorScheme,
      };
      expect(shape).toMatchSnapshot();
    });
  }
});
