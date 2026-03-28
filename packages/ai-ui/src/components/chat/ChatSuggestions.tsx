import { forwardRef, type HTMLAttributes } from 'react';
import { Chip } from '@omniviewdev/base-ui';
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
          <Chip
            key={suggestion.value}
            as="button"
            clickable
            variant="outline"
            size="md"
            role="listitem"
            onClick={() => onSelect(suggestion.value)}
          >
            {suggestion.label}
          </Chip>
        ))}
      </div>
    );
  },
);
