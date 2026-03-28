import { forwardRef, type HTMLAttributes } from 'react';
import { Chip } from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';
import { LuCornerDownRight } from '../../system/icons';
import styles from './AIFollowUp.module.css';

export interface AIFollowUpProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'onSelect'> {
  /** Suggested follow-up questions */
  suggestions: string[];
  /** Called when a suggestion is selected */
  onSelect?: (suggestion: string) => void;
}

export const AIFollowUp = forwardRef<HTMLDivElement, AIFollowUpProps>(
  function AIFollowUp({ suggestions, onSelect, className, ...rest }, ref) {
    if (suggestions.length === 0) return null;

    return (
      <div ref={ref} className={cn(styles.Root, className)} {...rest}>
        {suggestions.map((suggestion) => (
          <Chip
            key={suggestion}
            as="button"
            clickable
            variant="outline"
            size="sm"
            startDecorator={<LuCornerDownRight size={12} />}
            onClick={() => onSelect?.(suggestion)}
          >
            {suggestion}
          </Chip>
        ))}
      </div>
    );
  },
);
