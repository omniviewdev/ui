import { StrictMode, useState, type PropsWithChildren } from 'react';
import { createRoot } from 'react-dom/client';
import { themeRegistry, ThemeProvider, ToastProvider } from '@omniviewdev/base-ui';
import '@omniviewdev/base-ui/styles.css';
import './global.css';
import { App } from './App';
import { SHOWCASE_CUSTOM_THEMES } from './sampleThemes';

const SHOWCASE_THEME_OWNER = { kind: 'user', id: 'showcase' } as const;
for (const theme of SHOWCASE_CUSTOM_THEMES) {
  if (!themeRegistry.has(theme.id)) themeRegistry.register(theme, SHOWCASE_THEME_OWNER);
}

function ThemeHarness({ children }: PropsWithChildren) {
  const [themeId, setThemeId] = useState('dark');
  return (
    <ThemeProvider themeId={themeId} onThemeChange={setThemeId}>
      {children}
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeHarness>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeHarness>
  </StrictMode>,
);
