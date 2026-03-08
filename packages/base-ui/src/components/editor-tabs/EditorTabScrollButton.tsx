import { forwardRef } from 'react';
import { cn } from '../../system/classnames';
import { useEditorTabsContext } from './context/EditorTabsContext';
import styles from './EditorTabs.module.css';

export interface EditorTabScrollButtonProps {
  direction: 'left' | 'right';
  className?: string;
}

export const EditorTabScrollButton = forwardRef<HTMLButtonElement, EditorTabScrollButtonProps>(
  function EditorTabScrollButton({ direction, className }, ref) {
    const { scrollState, scrollTo } = useEditorTabsContext();
    const visible = direction === 'left' ? scrollState.canScrollLeft : scrollState.canScrollRight;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.ScrollButton, className)}
        aria-label={`Scroll tabs ${direction}`}
        disabled={!visible}
        aria-disabled={!visible || undefined}
        {...(visible ? { 'data-visible': '' } : {})}
        onClick={() => scrollTo(direction)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          {direction === 'left' ? (
            <path
              d="M8 2L4 6L8 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M4 2L8 6L4 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </button>
    );
  },
);
