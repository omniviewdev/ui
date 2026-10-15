import type { BuiltInThemeId, ThemeSummary } from '@omniviewdev/base-ui';

export interface EditorTheme {
  id: string;
  base: BuiltInThemeId;
  registration: Readonly<ThemeSummary>;
}
