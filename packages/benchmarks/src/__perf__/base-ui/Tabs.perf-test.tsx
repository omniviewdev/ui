import { test } from 'vitest';
import { measureRenders } from 'reassure';
import { fireEvent, screen } from '@testing-library/react';
import { Tabs } from '@omniviewdev/base-ui';
import { ThemeWrapper } from '../utils/theme-wrapper';

test('Tabs: mount with 5 tabs', async () => {
  await measureRenders(
    <Tabs defaultValue="0">
      <Tabs.List>
        {Array.from({ length: 5 }, (_, i) => (
          <Tabs.Tab key={i} value={String(i)}>
            Tab {i}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {Array.from({ length: 5 }, (_, i) => (
        <Tabs.Panel key={i} value={String(i)}>
          Content for tab {i}
        </Tabs.Panel>
      ))}
    </Tabs>,
    { wrapper: ThemeWrapper },
  );
});

/**
 * Switching tabs should ideally only re-render the old and new panels,
 * not the entire tree. High render counts here signal over-rendering.
 */
test('Tabs: switch active tab', async () => {
  await measureRenders(
    <Tabs defaultValue="0">
      <Tabs.List>
        {Array.from({ length: 5 }, (_, i) => (
          <Tabs.Tab key={i} value={String(i)}>
            Tab {i}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {Array.from({ length: 5 }, (_, i) => (
        <Tabs.Panel key={i} value={String(i)}>
          Content for tab {i}
        </Tabs.Panel>
      ))}
    </Tabs>,
    {
      wrapper: ThemeWrapper,
      scenario: async () => {
        fireEvent.click(screen.getByText('Tab 3'));
      },
    },
  );
});
