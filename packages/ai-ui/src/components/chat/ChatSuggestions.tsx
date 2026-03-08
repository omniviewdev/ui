import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './ChatSuggestions.module.css';

export interface ChatSuggestion {
  label: string;
  value: string;
}

export interface ChatSuggestionsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** List of suggested prompts */
  suggestions: ChatSuggestion[];
  /** Called when a suggestion is selected */
  onSelect: (value: string) => void;
}

export const ChatSuggestions = forwardRef<HTMLDivElement, ChatSuggestionsProps>(
  function ChatSuggestions({ suggestions, onSelect, className, ...rest }, ref) {
    if (suggestions.length === 0) return null;

    return (
      <div ref={ref} className={cn(styles.Root, className)} role="list" {...rest}>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.value}
            type="button"
            className={styles.Item}
            role="listitem"
            onClick={() => onSelect(suggestion.value)}
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    );
  },
);
