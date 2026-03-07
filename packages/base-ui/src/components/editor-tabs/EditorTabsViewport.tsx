import { forwardRef, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import { useEditorTabsContext } from './context/EditorTabsContext';
import styles from './EditorTabs.module.css';

export interface EditorTabsViewportProps {
  children: ReactNode;
  className?: string;
}

export const EditorTabsViewport = forwardRef<HTMLDivElement, EditorTabsViewportProps>(
  function EditorTabsViewport({ children, className }, ref) {
    const { viewportRef } = useEditorTabsContext();

    return (
      <div
        ref={(node) => {
          (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn(styles.Viewport, className)}
        role="presentation"
        onWheel={(e) => {
          const el = viewportRef.current;
          if (!el) return;
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
          }
        }}
      >
        {children}
      </div>
    );
  },
);
