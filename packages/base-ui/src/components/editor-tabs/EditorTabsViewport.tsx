import { forwardRef, useMemo, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import { useEditorTabsContext } from './context/EditorTabsContext';
import styles from './EditorTabs.module.css';

export interface EditorTabsViewportProps {
  children: ReactNode;
  className?: string;
}

export const EditorTabsViewport = forwardRef<HTMLDivElement, EditorTabsViewportProps>(
  function EditorTabsViewport({ children, className }, ref) {
    const { viewportRef, isAttachDropTarget, attachInsertIndex } = useEditorTabsContext();

    const indicatorLeft = useMemo(() => {
      if (!isAttachDropTarget || attachInsertIndex == null || !viewportRef.current) return null;

      const tabEls = viewportRef.current.querySelectorAll<HTMLElement>('[data-tab-id]');
      if (tabEls.length === 0) return 0;

      const sorted = Array.from(tabEls).sort(
        (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left,
      );

      const viewportLeft = viewportRef.current.getBoundingClientRect().left;

      if (attachInsertIndex >= sorted.length) {
        // After last tab
        const lastRect = sorted[sorted.length - 1]!.getBoundingClientRect();
        return lastRect.right - viewportLeft + viewportRef.current.scrollLeft;
      }

      const targetRect = sorted[attachInsertIndex]!.getBoundingClientRect();
      return targetRect.left - viewportLeft + viewportRef.current.scrollLeft;
    }, [isAttachDropTarget, attachInsertIndex, viewportRef]);

    return (
      <div
        ref={(node) => {
          (viewportRef as { current: HTMLDivElement | null }).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
        }}
        className={cn(styles.Viewport, className)}
        role="presentation"
        {...(isAttachDropTarget ? { 'data-attach-drop-target': '' } : undefined)}
        onWheel={(e) => {
          const el = viewportRef.current;
          if (!el) return;
          if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
          const maxScroll = el.scrollWidth - el.clientWidth;
          if (maxScroll <= 0) return;
          if (e.deltaY > 0 && el.scrollLeft >= maxScroll) return;
          if (e.deltaY < 0 && el.scrollLeft <= 0) return;
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }}
      >
        {children}
        {isAttachDropTarget && indicatorLeft != null && (
          <div
            className={styles.AttachDropIndicator}
            style={{ left: indicatorLeft }}
          />
        )}
      </div>
    );
  },
);
