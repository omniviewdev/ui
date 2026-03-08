import { forwardRef, memo, useCallback } from 'react';
import { cn } from '../../system/classnames';
import { useEditorTabsContext } from './context/EditorTabsContext';
import { EditorTabCloseButton } from './EditorTabCloseButton';
import type { TabDescriptor } from './types';
import styles from './EditorTabs.module.css';

export interface EditorTabItemProps {
  tab: TabDescriptor;
  className?: string;
}

export const EditorTabItem = memo(
  forwardRef<HTMLDivElement, EditorTabItemProps>(function EditorTabItem(
    { tab, className },
    ref,
  ) {
    const { activeId, onActiveChange, onCloseTab, onContextMenuTab, tabs } =
      useEditorTabsContext();
    const isActive = activeId === tab.id;
    const closable = tab.closable !== false;
    const showTrailing = !tab.pinned && closable && !!onCloseTab;

    const handleClick = useCallback(() => {
      if (!tab.disabled) {
        onActiveChange(tab.id);
      }
    }, [tab.id, tab.disabled, onActiveChange]);

    const handleContextMenu = useCallback(
      (e: React.MouseEvent) => {
        onContextMenuTab?.(tab.id, e);
      },
      [tab.id, onContextMenuTab],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const allTabs = tabs;
        const currentIndex = allTabs.indexOf(tab.id);
        if (currentIndex === -1) return;

        let targetIndex: number | null = null;

        switch (e.key) {
          case 'ArrowRight':
            targetIndex = (currentIndex + 1) % allTabs.length;
            break;
          case 'ArrowLeft':
            targetIndex = (currentIndex - 1 + allTabs.length) % allTabs.length;
            break;
          case 'Home':
            targetIndex = 0;
            break;
          case 'End':
            targetIndex = allTabs.length - 1;
            break;
          case 'Delete':
            if (closable && onCloseTab) {
              e.preventDefault();
              onCloseTab(tab.id);
            }
            return;
          default:
            return;
        }

        e.preventDefault();
        const targetId = allTabs[targetIndex];
        const targetEl = document.querySelector<HTMLElement>(
          `[data-tab-id="${targetId}"]`,
        );
        targetEl?.focus();
      },
      [tabs, tab.id, closable, onCloseTab],
    );

    return (
      <div
        ref={ref}
        role="tab"
        className={cn(styles.Tab, className)}
        aria-selected={isActive}
        aria-disabled={tab.disabled || undefined}
        tabIndex={isActive ? 0 : -1}
        data-tab-id={tab.id}
        {...(isActive ? { 'data-active': '' } : {})}
        {...(tab.dirty ? { 'data-dirty': '' } : {})}
        {...(tab.pinned ? { 'data-pinned': '' } : {})}
        {...(tab.disabled ? { 'data-disabled': '' } : {})}
        {...(showTrailing ? { 'data-has-trailing': '' } : {})}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
      >
        {tab.icon && <span className={styles.TabIcon}>{tab.icon}</span>}
        {!tab.pinned && <span className={styles.TabTitle}>{tab.title}</span>}
        {/* Trailing slot: dirty dot and close button stack in the same space */}
        {showTrailing && (
          <span className={styles.TabTrailing}>
            {tab.dirty && <span className={styles.DirtyDot} />}
            <EditorTabCloseButton tabId={tab.id} tabTitle={tab.title} dirty={tab.dirty} onClose={onCloseTab} />
          </span>
        )}
      </div>
    );
  }),
);
