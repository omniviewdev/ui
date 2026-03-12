import type { ReactElement } from 'react';
import { ThemeProvider } from '@omniview/base-ui';

/**
 * Wrapper for Reassure tests — provides the ThemeProvider context
 * required by all @omniview components.
 */
export function ThemeWrapper({ children }: { children: ReactElement }) {
  return <ThemeProvider persist={false}>{children}</ThemeProvider>;
}
