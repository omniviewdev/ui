import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import type { ComponentColor, ComponentSize } from '../../system/types';
import { LuChevronRight } from 'react-icons/lu';
import styles from './Timeline.module.css';

// ---------------------------------------------------------------------------
// Context — propagates size to all sub-components
// ---------------------------------------------------------------------------

const TimelineContext = createContext<{ size: ComponentSize }>({ size: 'md' });

function useTimeline() {
  return useContext(TimelineContext);
}

// ---------------------------------------------------------------------------
// Timeline (root)
// ---------------------------------------------------------------------------

export interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  size?: ComponentSize;
  children: ReactNode;
}

const TimelineRoot = forwardRef<HTMLDivElement, TimelineProps>(function Timeline(
  { size = 'md', className, ...props },
  ref,
) {
  const contextValue = useMemo(() => ({ size }), [size]);
  return (
    <TimelineContext.Provider value={contextValue}>
      <div ref={ref} className={cn(styles.Root, className)} data-ov-size={size} {...props} />
    </TimelineContext.Provider>
  );
});

TimelineRoot.displayName = 'Timeline';

// ---------------------------------------------------------------------------
// Timeline.Item
// ---------------------------------------------------------------------------

export interface TimelineItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  timestamp?: ReactNode;
  icon?: ReactNode;
  color?: ComponentColor;
  /** Collapsible content revealed when item is expanded */
  details?: ReactNode;
  /** Default expanded state (uncontrolled) */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Called when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
}

const TimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  function TimelineItem(
    {
      timestamp,
      icon,
      color = 'neutral',
      details,
      defaultExpanded = false,
      expanded: expandedProp,
      onExpandedChange,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const { size } = useTimeline();
    const hasIcon = icon != null;
    const hasDetails = details != null;

    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const isControlled = expandedProp !== undefined;
    const expanded = isControlled ? expandedProp : internalExpanded;

    const toggleExpanded = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation();
        const next = !expanded;
        if (!isControlled) setInternalExpanded(next);
        onExpandedChange?.(next);
      },
      [expanded, isControlled, onExpandedChange],
    );

    return (
      <div
        ref={ref}
        className={cn(styles.Item, className)}
        data-ov-color={color}
        data-ov-size={size}
        data-ov-expandable={hasDetails || undefined}
        data-ov-expanded={hasDetails ? expanded : undefined}
        {...props}
      >
        {timestamp != null && <div className={styles.Timestamp}>{timestamp}</div>}
        <div className={styles.Indicator}>
          <span className={styles.Dot} data-ov-has-icon={hasIcon}>
            {hasIcon ? icon : null}
          </span>
          <span className={styles.Connector} aria-hidden="true" />
        </div>
        <div className={styles.Content}>
          {hasDetails ? (
            <>
              <button
                type="button"
                className={styles.ExpandTrigger}
                onClick={toggleExpanded}
                aria-expanded={expanded}
              >
                <LuChevronRight className={styles.Chevron} aria-hidden="true" />
                <span>{children}</span>
              </button>
              <div className={styles.Details} aria-hidden={!expanded}>
                <div className={styles.DetailsInner}>{details}</div>
              </div>
            </>
          ) : (
            children
          )}
        </div>
      </div>
    );
  },
);

TimelineItem.displayName = 'Timeline.Item';

// ---------------------------------------------------------------------------
// Timeline.Group
// ---------------------------------------------------------------------------

export interface TimelineGroupProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  children: ReactNode;
}

const TimelineGroup = forwardRef<HTMLDivElement, TimelineGroupProps>(
  function TimelineGroup({ label, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={cn(styles.Group, className)} {...props}>
        <div className={styles.GroupLabel}>{label}</div>
        {children}
      </div>
    );
  },
);

TimelineGroup.displayName = 'Timeline.Group';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type TimelineCompound = typeof TimelineRoot & {
  Item: typeof TimelineItem;
  Group: typeof TimelineGroup;
};

export const Timeline = Object.assign(TimelineRoot, {
  Item: TimelineItem,
  Group: TimelineGroup,
}) as TimelineCompound;
