import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { AppShell } from '@omniviewdev/base-ui';

describe('AppShell', () => {
  benchRender(
    'mount with Header/Sidebar/Content',
    () => (
      <AppShell>
        <AppShell.Header>Header</AppShell.Header>
        <AppShell.Sidebar>Sidebar</AppShell.Sidebar>
        <AppShell.Content>Content</AppShell.Content>
      </AppShell>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'sidebar visibility toggle',
    {
      initialProps: { sidebarCollapsed: false },
      updatedProps: { sidebarCollapsed: true },
    },
    (props) => (
      <AppShell {...props}>
        <AppShell.Header>Header</AppShell.Header>
        <AppShell.Sidebar>Sidebar</AppShell.Sidebar>
        <AppShell.Content>Content</AppShell.Content>
      </AppShell>
    ),
    TIER_2_OPTIONS,
  );
});
