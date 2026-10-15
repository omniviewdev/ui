import { StrictMode, useState, type PropsWithChildren } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, ToastProvider } from '@omniviewdev/base-ui';
import '@omniviewdev/base-ui/styles.css';
import './global.css';
import { App } from './App';

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
