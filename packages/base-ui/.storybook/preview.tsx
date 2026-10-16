import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { themeRegistry } from '../src/theme/registry';
import '../src/theme/styles.css';
import { EXAMPLE_OCEAN } from './sampleCustomThemes';

const STORYBOOK_THEME_OWNER = { kind: 'user', id: 'base-ui-storybook' } as const;
themeRegistry.unregisterOwner(STORYBOOK_THEME_OWNER);
themeRegistry.register(EXAMPLE_OCEAN, STORYBOOK_THEME_OWNER);

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        items: themeRegistry.getSnapshot().themes.map((t) => ({ value: t.id, title: t.name })),
      },
    },
    density: {
      name: 'Density',
      defaultValue: 'comfortable',
      toolbar: {
        icon: 'sidebaralt',
        items: ['comfortable', 'compact'],
      },
    },
    motion: {
      name: 'Motion',
      defaultValue: 'normal',
      toolbar: {
        icon: 'transfer',
        items: ['normal', 'reduced'],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme;
      const density = context.globals.density;
      const motion = context.globals.motion;

      return (
        <ThemeProvider
          themeId={theme}
          onThemeChange={(themeId) => context.updateGlobals({ theme: themeId })}
          initialDensity={density}
          initialMotion={motion}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              minHeight: '160px',
              background: 'var(--ov-color-bg-base)',
              color: 'var(--ov-color-fg-default)',
              padding: 'var(--ov-space-stack-md)',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}
          >
            <div
              style={{
                width: '100%',
                minWidth: 0,
                minHeight: '100%',
                padding: 'var(--ov-panel-padding)',
                borderRadius: 'var(--ov-radius-surface)',
                border: '1px solid var(--ov-color-border-muted)',
                background: 'var(--ov-color-bg-inset)',
                boxSizing: 'border-box',
              }}
            >
              <Story />
            </div>
          </div>
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
};

export default preview;
