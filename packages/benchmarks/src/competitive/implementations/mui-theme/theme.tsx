import type { ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { getDesignTokens, typography, shape, customShadows } from './primitives';
import { createInputsCustomizations } from './customizations/inputs';
import { createNavigationCustomizations } from './customizations/navigation';
import { createFeedbackCustomizations } from './customizations/feedback';
import { createDataDisplayCustomizations } from './customizations/dataDisplay';

// Import type declarations for custom variants (soft, link, xs, xl)
import './mui.d.ts';

const muiTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
    cssVarPrefix: 'ov-mui',
  },
  colorSchemes: {
    dark: { palette: getDesignTokens('dark').palette },
  },
  typography,
  shape,
  shadows: customShadows('dark'),
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: '100%' },
        body: { height: '100%' },
      },
    },
    ...createInputsCustomizations(),
    ...createNavigationCustomizations(),
    ...createFeedbackCustomizations(),
    ...createDataDisplayCustomizations(),
  },
});

export function MuiThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
