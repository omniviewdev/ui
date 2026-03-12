import { useCallback, type KeyboardEvent } from 'react';
import { IconButton, Tooltip, ThemeSwitcher, Separator } from '@omniview/base-ui';
import { LuLayoutGrid } from 'react-icons/lu';
import { apps } from './registry';
import styles from './Dock.module.css';

interface DockProps {
  activeApp: string | null;
  onSelectApp: (id: string | null) => void;
}

export function Dock({ activeApp, onSelectApp }: DockProps) {
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
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
