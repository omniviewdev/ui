import { memo, useId } from 'react';
import { cn } from '../system/classnames';
import { useTheme } from './useTheme';
import { useThemeList } from './useThemeList';
import styles from './ThemeSwitcher.module.css';

export interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher = memo(function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { requestedThemeId, density, motion, setTheme, setDensity, setMotion } = useTheme();
  const themes = useThemeList();
  const themeId = useId();
  const densityId = useId();
  const motionId = useId();

  return (
    <div className={cn(styles.Root, className)}>
      <label className={styles.Field} htmlFor={themeId}>
        Theme
        <select
          id={themeId}
          value={requestedThemeId}
          onChange={(event) => setTheme(event.target.value)}
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>{theme.name}</option>
          ))}
        </select>
      </label>

      <label className={styles.Field} htmlFor={densityId}>
        Density
        <select
          id={densityId}
          value={density}
          onChange={(event) => setDensity(event.target.value as typeof density)}
        >
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </select>
      </label>

      <label className={styles.Field} htmlFor={motionId}>
        Motion
        <select
          id={motionId}
          value={motion}
          onChange={(event) => setMotion(event.target.value as typeof motion)}
        >
          <option value="normal">Normal</option>
          <option value="reduced">Reduced</option>
        </select>
      </label>
    </div>
  );
});
