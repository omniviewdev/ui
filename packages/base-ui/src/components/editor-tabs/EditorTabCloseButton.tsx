import { forwardRef } from 'react';
import { cn } from '../../system/classnames';
import styles from './EditorTabs.module.css';

export interface EditorTabCloseButtonProps {
  tabId: string;
  dirty?: boolean;
  onClose: (id: string) => void;
  className?: string;
}

export const EditorTabCloseButton = forwardRef<HTMLButtonElement, EditorTabCloseButtonProps>(
  function EditorTabCloseButton({ tabId, dirty, onClose, className }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.CloseButton, className)}
        aria-label="Close tab"
        {...(dirty ? { 'data-has-dirty': '' } : {})}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClose(tabId);
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M3 3L9 9M9 3L3 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    );
  },
);
