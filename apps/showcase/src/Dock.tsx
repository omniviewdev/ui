import { useCallback, type KeyboardEvent } from 'react';
import { IconButton, Tooltip, Separator, Menu, useTheme } from '@omniviewdev/base-ui';
import type { ThemeMode } from '@omniviewdev/base-ui';
import { LuLayoutGrid, LuPalette } from 'react-icons/lu';
import { apps } from './registry';
import styles from './Dock.module.css';

const THEME_OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: 'void', label: 'Void' },
  { id: 'obsidian', label: 'Obsidian' },
  { id: 'carbon', label: 'Carbon' },
  { id: 'dark', label: 'Dark (Classic)' },
  { id: 'light', label: 'Light' },
  { id: 'high-contrast-dark', label: 'High Contrast Dark' },
  { id: 'high-contrast-light', label: 'High Contrast Light' },
];

interface DockProps {
  activeApp: string | null;
  onSelectApp: (id: string | null) => void;
}

export function Dock({ activeApp, onSelectApp }: DockProps) {
  const { theme, setTheme } = useTheme();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Escape') {
        onSelectApp(null);
        return;
      }
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

      e.preventDefault();
      const buttons = Array.from(
        e.currentTarget.querySelectorAll<HTMLButtonElement>('button[aria-label]'),
      );
      const idx = buttons.indexOf(e.target as HTMLButtonElement);
      if (idx === -1) return;
      const next = e.key === 'ArrowDown'
        ? buttons[(idx + 1) % buttons.length]
        : buttons[(idx - 1 + buttons.length) % buttons.length];
      next?.focus();
    },
    [onSelectApp],
  );

  return (
    <nav
      className={styles.dock}
      aria-label="Demo apps"
      onKeyDown={handleKeyDown}
    >
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <IconButton
              variant={activeApp === null ? 'solid' : 'ghost'}
              color={activeApp === null ? 'brand' : 'neutral'}
              size="md"
              aria-label="Home"
              onClick={() => onSelectApp(null)}
            >
              <LuLayoutGrid />
            </IconButton>
          }
        />
        <Tooltip.Portal>
          <Tooltip.Positioner side="right" sideOffset={8}>
            <Tooltip.Popup>Home</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Separator />

      <div className={styles.apps} role="list">
        {apps.map((app) => (
          <div key={app.id} className={styles.iconWrapper} role="listitem">
            {activeApp === app.id && <div className={styles.indicator} />}
            <Tooltip.Root>
              <Tooltip.Trigger
                render={
                  <IconButton
                    variant={activeApp === app.id ? 'solid' : 'ghost'}
                    color={activeApp === app.id ? 'brand' : 'neutral'}
                    size="md"
                    aria-label={app.name}
                    onClick={() => onSelectApp(app.id)}
                  >
                    <app.icon />
                  </IconButton>
                }
              />
              <Tooltip.Portal>
                <Tooltip.Positioner side="right" sideOffset={8}>
                  <Tooltip.Popup>{app.name}</Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        ))}
      </div>

      <div className={styles.bottom}>
        <Separator />
        <Menu.Root>
          <Menu.Trigger
            render={
              <IconButton
                variant="ghost"
                color="neutral"
                size="md"
                aria-label="Switch theme"
              >
                <LuPalette />
              </IconButton>
            }
          />
          <Menu.Portal>
            <Menu.Positioner side="right" sideOffset={8} align="end">
              <Menu.Popup>
                <Menu.RadioGroup
                  value={theme}
                  onValueChange={(value) => setTheme(value as ThemeMode)}
                >
                  {THEME_OPTIONS.map((opt) => (
                    <Menu.RadioItem key={opt.id} value={opt.id}>
                      {opt.label}
                      <Menu.RadioItemIndicator />
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioGroup>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
    </nav>
  );
}
