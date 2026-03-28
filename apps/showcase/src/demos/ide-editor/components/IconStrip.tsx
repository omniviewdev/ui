import { LuFiles, LuSearch, LuGitBranch } from 'react-icons/lu';
import { Tooltip } from '@omniviewdev/base-ui';
import type { SidebarPanel } from '../types';
import styles from './IconStrip.module.css';

export interface IconStripProps {
  activePanel: SidebarPanel;
  onPanelChange: (panel: SidebarPanel) => void;
}

interface PanelDef {
  id: SidebarPanel;
  label: string;
  icon: React.ReactNode;
}

const PANELS: PanelDef[] = [
  { id: 'files', label: 'Files', icon: <LuFiles aria-hidden /> },
  { id: 'search', label: 'Search', icon: <LuSearch aria-hidden /> },
  { id: 'git', label: 'Source Control', icon: <LuGitBranch aria-hidden /> },
];

export function IconStrip({ activePanel, onPanelChange }: IconStripProps) {
  return (
    <nav className={styles.strip} aria-label="Sidebar panels">
      {PANELS.map((panel) => (
        <Tooltip.Root key={panel.id}>
          <Tooltip.Trigger
            render={
              <button
                type="button"
                className={styles.btn}
                data-active={activePanel === panel.id ? 'true' : 'false'}
                aria-label={panel.label}
                aria-pressed={activePanel === panel.id}
                onClick={() => onPanelChange(panel.id)}
              >
                {panel.icon}
              </button>
            }
          />
          <Tooltip.Portal>
            <Tooltip.Positioner side="right" sideOffset={6}>
              <Tooltip.Popup>{panel.label}</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      ))}
    </nav>
  );
}
