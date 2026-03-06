import { useId } from 'react';
import { useTheme } from './useTheme';
import styles from './ThemeSwitcher.module.css';

export interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, density, motion, setTheme, setDensity, setMotion } = useTheme();
  const themeId = useId();
  const densityId = useId();
  const motionId = useId();

  return (
    <div className={[styles.Root, className].filter(Boolean).join(' ')}>
      <label className={styles.Field} htmlFor={themeId}>
        Theme
        <select
          id={themeId}
          value={theme}
          onChange={(event) => setTheme(event.target.value as typeof theme)}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="high-contrast-dark">High Contrast Dark</option>
          <option value="high-contrast-light">High Contrast Light</option>
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
}
