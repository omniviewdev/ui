import type { Preview } from '@storybook/react';
import { ThemeProvider } from '@omniviewdev/base-ui';
import '../packages/base-ui/src/theme/styles.css';

// Side-effect import — configures Monaco workers before any editor story mounts.
// Without this, all editors stories fail with worker initialization errors.
// The module has an idempotency guard so multiple imports are safe.
import '../packages/editors/src/setup/setupMonacoWorkers';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        items: ['dark', 'light', 'high-contrast-dark', 'high-contrast-light', 'obsidian', 'carbon', 'void'],
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
          persist={false}
          initialTheme={theme}
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
