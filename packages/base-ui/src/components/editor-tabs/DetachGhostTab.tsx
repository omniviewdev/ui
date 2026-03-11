import { memo } from 'react';
import { cn } from '../../system/classnames';
import type { TabDescriptor } from './types';
import styles from './EditorTabs.module.css';

export interface DetachGhostTabProps {
  tab: TabDescriptor;
  style?: React.CSSProperties;
}

export const DetachGhostTab = memo(function DetachGhostTab({ tab, style }: DetachGhostTabProps) {
  return (
    <div
      className={cn(styles.Tab, styles.DetachGhost)}
      style={style}
      data-active=""
      aria-hidden="true"
    >
      {tab.icon && <span className={styles.TabIcon}>{tab.icon}</span>}
      {!tab.pinned && <span className={styles.TabTitle}>{tab.title}</span>}
    </div>
  );
});
