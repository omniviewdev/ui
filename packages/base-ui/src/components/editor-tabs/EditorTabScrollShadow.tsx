import { forwardRef } from 'react';
import { cn } from '../../system/classnames';
import { useEditorTabsContext } from './context/EditorTabsContext';
import styles from './EditorTabs.module.css';

export interface EditorTabScrollShadowProps {
  side: 'left' | 'right';
  className?: string;
}

export const EditorTabScrollShadow = forwardRef<HTMLDivElement, EditorTabScrollShadowProps>(
  function EditorTabScrollShadow({ side, className }, ref) {
    const { scrollState } = useEditorTabsContext();
    const visible = side === 'left' ? scrollState.canScrollLeft : scrollState.canScrollRight;

    return (
      <div
        ref={ref}
        className={cn(styles.ScrollShadow, className)}
        data-side={side}
        {...(visible ? { 'data-visible': '' } : {})}
      />
    );
  },
);
