import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Card, TextField } from '../../components';
import { themeRegistry } from '../registry';

const SAMPLE = {
  id: 'solarized-dark-fixture',
  name: 'Solarized Dark Fixture',
  base: 'dark' as const,
  colors: { 'color.bg.base': '#002b36', 'color.fg.default': '#839496' },
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

// Register the fixture theme at module scope so it appears in themeRegistry.list()
// before the for-loop below executes (describe-time).
if (!themeRegistry.has(SAMPLE.id)) {
  themeRegistry.register(SAMPLE);
}

describe('visual regression — representative components under each theme', () => {
  for (const info of themeRegistry.list()) {
    it(`matches snapshot under theme '${info.id}'`, () => {
      themeRegistry.apply(info.id);
      const { container } = render(<Fixture />);
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
