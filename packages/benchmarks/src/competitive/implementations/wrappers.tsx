import { createElement, type ReactElement } from 'react';
import { ThemeProvider } from '@omniviewdev/base-ui';
import { MuiThemeWrapper } from './mui-theme/theme';

/**
 * Wrap element in @omniviewdev/base-ui ThemeProvider.
 */
export function wrapOv(element: ReactElement): ReactElement {
  return createElement(ThemeProvider, { persist: false }, element);
}

/**
 * Wrap element in MUI ThemeProvider + CssBaseline (production theme).
 */
export function wrapMui(element: ReactElement): ReactElement {
  return createElement(MuiThemeWrapper, null, element);
}

/**
 * No wrapper — raw HTML baseline.
 */
export function wrapRaw(element: ReactElement): ReactElement {
  return element;
}
