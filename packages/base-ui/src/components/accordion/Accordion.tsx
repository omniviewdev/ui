import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import styles from './Accordion.module.css';

// ─── Context ────────────────────────────────────────────────────────────────

interface AccordionContextValue {
  expandedIds: Set<string>;
  toggle: (id: string) => void;
  registerDefault: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

// ─── Public types ───────────────────────────────────────────────────────────

export type AccordionAnimation = 'default' | 'fast' | 'none';

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** Only one item open at a time. */
  exclusive?: boolean;
  /** IDs of initially expanded items. */
  defaultExpanded?: string[];
  /** Animation speed for expand/collapse. */
  animation?: AccordionAnimation;
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Unique identifier for this item. */
  id: string;
  /** Header text. */
  title: string;
  /** Optional leading icon in the header. */
  icon?: ReactNode;
  /** Displayed as a small badge/count on the header. */
  count?: number;
  /** Trailing content slot on the header row. */
  endDecorator?: ReactNode;
  /** Whether this individual item starts expanded. */
  defaultExpanded?: boolean;
  /** Prevents toggling. */
  disabled?: boolean;
}

// ─── AccordionItem ──────────────────────────────────────────────────────────

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  {
    id,
    title,
    icon,
    count,
    endDecorator,
    defaultExpanded = false,
    disabled = false,
    className,
    children,
    ...props
  },
  ref,
) {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error('Accordion.Item must be used within an Accordion');
  }

  const { expandedIds, toggle, registerDefault } = ctx;
  const expanded = expandedIds.has(id);

  // Register per-item default on mount (runs once).
  const registered = useRef(false);
  useEffect(() => {
    if (defaultExpanded && !registered.current) {
      registered.current = true;
      registerDefault(id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const uid = useId();
  const panelId = `ov-accordion-panel-${uid}`;
  const headerId = `ov-accordion-header-${uid}`;

  return (
    <div
      ref={ref}
      className={cn(styles.Item, className)}
      data-ov-component="accordion-item"
      data-ov-expanded={expanded ? 'true' : 'false'}
      data-ov-disabled={disabled ? 'true' : undefined}
      {...props}
    >
      {/* Header trigger */}
      <button
        type="button"
        id={headerId}
        className={styles.Header}
        aria-expanded={expanded}
        aria-controls={panelId}
        disabled={disabled}
        onClick={() => toggle(id)}
      >
        {icon ? (
          <span className={styles.Icon} data-ov-slot="icon">
            {icon}
          </span>
        ) : null}
        <span className={styles.Title}>{title}</span>
        {count !== undefined ? (
          <span className={styles.Count} data-ov-slot="count">
            {count}
          </span>
        ) : null}
        {endDecorator ? (
          <span className={styles.EndDecorator} data-ov-slot="end-decorator">
            {endDecorator}
          </span>
        ) : null}
        <LuChevronRight aria-hidden className={styles.Chevron} size={16} />
      </button>

      {/* Collapsible content */}
      <div id={panelId} role="region" aria-labelledby={headerId} className={styles.ContentWrapper}>
        <div className={styles.Content}>
          <div className={styles.ContentInner}>{children}</div>
        </div>
      </div>
    </div>
  );
});

// ─── AccordionRoot ──────────────────────────────────────────────────────────

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(function AccordionRoot(
  { exclusive = false, defaultExpanded, animation = 'default', className, children, ...props },
  ref,
) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(defaultExpanded ?? []));

  const toggle = useCallback(
    (id: string) => {
      setExpandedIds((prev) => {
        if (exclusive) {
          return prev.has(id) ? new Set<string>() : new Set([id]);
        }
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [exclusive],
  );

  const registerDefault = useCallback(
    (id: string) => {
      setExpandedIds((prev) => {
        if (prev.has(id)) return prev;
        if (exclusive && prev.size > 0) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    },
    [exclusive],
  );

  return (
    <AccordionContext.Provider value={{ expandedIds, toggle, registerDefault }}>
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-component="accordion"
        data-ov-animation={animation}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

// ─── Compound export ────────────────────────────────────────────────────────

AccordionRoot.displayName = 'Accordion';
AccordionItem.displayName = 'Accordion.Item';

type AccordionCompound = typeof AccordionRoot & {
  Item: typeof AccordionItem;
};

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
}) as AccordionCompound;
