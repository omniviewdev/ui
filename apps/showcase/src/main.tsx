import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, ToastProvider, themeRegistry } from '@omniviewdev/base-ui';
import '@omniviewdev/base-ui/styles.css';
import './global.css';
import { App } from './App';
import { SHOWCASE_CUSTOM_THEMES } from './sampleThemes';

// Register showcase-specific custom themes before the provider mounts so they
// appear in the theme picker from first render.
for (const theme of SHOWCASE_CUSTOM_THEMES) {
  if (!themeRegistry.has(theme.id)) themeRegistry.register(theme);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
