import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { useState, type ReactElement, type ReactNode } from 'react';
import { ThemeProvider } from '@omniviewdev/base-ui';

interface WrapperProps {
  children: ReactNode;
}

function Wrapper({ children }: WrapperProps) {
  const [themeId, setThemeId] = useState('dark');
  return <ThemeProvider themeId={themeId} onThemeChange={setThemeId}>{children}</ThemeProvider>;
}

export function renderAI(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: Wrapper, ...options });
}
