import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../../base-ui/src/theme/ThemeProvider';
import '../../base-ui/src/theme/styles.css';
// Side-effect import — configures Monaco workers + local build before any editor mounts
import '../src/setup/setupMonacoWorkers';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        items: ['dark', 'light', 'high-contrast-dark', 'high-contrast-light'],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? 'dark';

      return (
        <ThemeProvider persist={false} initialTheme={theme}>
          <div
            style={{
              width: '100%',
              minHeight: 160,
              background: 'var(--ov-color-bg-base)',
              color: 'var(--ov-color-fg-default)',
              padding: 16,
              boxSizing: 'border-box',
            }}
          >
            <Story />
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
