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

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** Only one item open at a time. */
  exclusive?: boolean;
  /** IDs of initially expanded items. */
  defaultExpanded?: string[];
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

// ─── Chevron SVG ────────────────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <svg
      className={styles.Chevron}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

  // Deterministic panel id for aria-controls.
  const panelId = `ov-accordion-panel-${useId()}`;

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
        className={styles.Header}
        role="button"
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
        <ChevronIcon />
      </button>

      {/* Collapsible content */}
      <div id={panelId} role="region" className={styles.ContentWrapper}>
        <div className={styles.Content}>{children}</div>
      </div>
    </div>
  );
});

// ─── AccordionRoot ──────────────────────────────────────────────────────────

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(function AccordionRoot(
  { exclusive = false, defaultExpanded, className, children, ...props },
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

  const registerDefault = useCallback((id: string) => {
    setExpandedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  return (
    <AccordionContext.Provider value={{ expandedIds, toggle, registerDefault }}>
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-component="accordion"
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
