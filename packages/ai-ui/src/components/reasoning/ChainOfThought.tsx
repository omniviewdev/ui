import {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Chip, Collapsible, CollapsibleContent, Tooltip } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import {
  LuChevronDown,
  LuFile,
  LuBox,
  LuScrollText,
  LuSettings,
  LuDatabase,
  LuGlobe,
} from '../../system/icons';
import type { StepStatus } from '../../system/types';
import { BrainIcon } from './BrainIcon';
import styles from './ChainOfThought.module.css';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ChainOfThoughtContextValue {
  isOpen: boolean;
  toggle: () => void;
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(null);

function useChainOfThought() {
  const ctx = useContext(ChainOfThoughtContext);
  if (!ctx) throw new Error('ChainOfThought sub-components must be used within ChainOfThought');
  return ctx;
}

// ---------------------------------------------------------------------------
// Step data type (kept for backwards compat with declarative API)
// ---------------------------------------------------------------------------

export interface ChainOfThoughtStepData {
  id: string;
  label: string;
  content?: string;
  description?: string;
  status: StepStatus;
  /** Icon component override */
  icon?: ComponentType<{ size?: number | string; className?: string }>;
  /** Tags/chips to show under the step */
  tags?: string[];
  /** Arbitrary children rendered after description/tags */
  children?: ReactNode;
}

// ---------------------------------------------------------------------------
// ChainOfThought root
// ---------------------------------------------------------------------------

export interface ChainOfThoughtProps extends HTMLAttributes<HTMLDivElement> {
  /** Declarative steps API (alternative to using children) */
  steps?: ChainOfThoughtStepData[];
  /** Start expanded (default: false) */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Header text (default: "Chain of Thought") */
  header?: string;
  /** Custom header content (overrides header text) */
  headerContent?: ReactNode;
  /** Child elements (for compound component pattern) */
  children?: ReactNode;
}

export const ChainOfThought = forwardRef<HTMLDivElement, ChainOfThoughtProps>(
  function ChainOfThought(
    {
      steps,
      defaultOpen = false,
      open: openProp,
      header,
      headerContent,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const [isOpen, setIsOpen] = useState(openProp ?? defaultOpen);
    useEffect(() => {
      if (openProp !== undefined) setIsOpen(openProp);
    }, [openProp]);

    const toggle = useCallback(() => setIsOpen((v) => !v), []);

    const ctx: ChainOfThoughtContextValue = { isOpen, toggle };

    // If using declarative steps API
    const useDeclarativeAPI = steps != null && !children;

    return (
      <ChainOfThoughtContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cn(styles.Root, className)}
          data-ov-open={isOpen ? 'true' : 'false'}
          role="list"
          {...rest}
        >
          {/* Header */}
          {headerContent ?? (
            <ChainOfThoughtHeader>
              {header ?? 'Chain of Thought'}
            </ChainOfThoughtHeader>
          )}

          {/* Collapsible content */}
          <Collapsible open={isOpen}>
            <CollapsibleContent>
              <div className={styles.CollapseContent}>
              {useDeclarativeAPI
                ? steps.map((step) => (
                    <ChainOfThoughtStep
                      key={step.id}
                      icon={step.icon}
                      label={step.label}
                      description={step.description ?? step.content}
                      status={step.status}
                      tags={step.tags}
                      role="listitem"
                    >
                      {step.children}
                    </ChainOfThoughtStep>
                  ))
                : children}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ChainOfThoughtContext.Provider>
    );
  },
);

// ---------------------------------------------------------------------------
// ChainOfThoughtHeader
// ---------------------------------------------------------------------------

export interface ChainOfThoughtHeaderProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export function ChainOfThoughtHeader({ children, className, ...rest }: ChainOfThoughtHeaderProps) {
  const { isOpen, toggle } = useChainOfThought();
  return (
    <button
      type="button"
      className={cn(styles.Header, className)}
      onClick={toggle}
      aria-expanded={isOpen}
      {...rest}
    >
      <span className={styles.HeaderIcon} aria-hidden="true">
        <BrainIcon size={16} />
      </span>
      <span className={styles.HeaderLabel}>
        {children ?? 'Chain of Thought'}
      </span>
      <span
        className={styles.HeaderChevron}
        data-ov-open={isOpen ? 'true' : 'false'}
        aria-hidden="true"
      >
        <LuChevronDown size={16} />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// ChainOfThoughtStep
// ---------------------------------------------------------------------------

export interface ChainOfThoughtStepProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon component for the step */
  icon?: ComponentType<{ size?: number | string; className?: string }>;
  /** Step label text */
  label: string;
  /** Description text below label */
  description?: string;
  /** Step status */
  status?: StepStatus;
  /** Tags/chips to display */
  tags?: string[];
  /** Arbitrary children (rendered after description and tags) */
  children?: ReactNode;
}

export function ChainOfThoughtStep({
  icon: Icon,
  label,
  description,
  status = 'complete',
  tags,
  children,
  className,
  ...rest
}: ChainOfThoughtStepProps) {
  return (
    <div className={cn(styles.Step, className)} data-ov-status={status} {...rest}>
      <div className={styles.StepIndicator}>
        <span className={styles.StepIcon} data-ov-status={status}>
          {Icon ? <Icon size={16} /> : <DefaultStepDot status={status} />}
        </span>
        <div className={styles.StepLine} />
      </div>
      <div className={styles.StepBody}>
        <div className={styles.StepLabel}>{label}</div>
        {description && status !== 'pending' && (
          <div className={styles.StepDescription}>{description}</div>
        )}
        {tags && tags.length > 0 && status !== 'pending' && (
          <div className={styles.StepTags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.StepTag}>{tag}</span>
            ))}
          </div>
        )}
        {children && status !== 'pending' && children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChainOfThoughtSearchResults & ChainOfThoughtSearchResult (chip containers)
// ---------------------------------------------------------------------------

export function ChainOfThoughtSearchResults({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(styles.StepTags, className)} {...rest}>
      {children}
    </div>
  );
}

export interface ChainOfThoughtSearchResultProps {
  /** Text label for the chip */
  label?: string;
  children?: ReactNode;
  className?: string;
}

export function ChainOfThoughtSearchResult({
  label,
  children,
  className,
}: ChainOfThoughtSearchResultProps) {
  return (
    <Chip size="sm" variant="soft" className={cn(styles.StepTag, className)}>
      {children ?? label}
    </Chip>
  );
}

// ---------------------------------------------------------------------------
// ChainOfThoughtImage
// ---------------------------------------------------------------------------

export interface ChainOfThoughtImageProps extends HTMLAttributes<HTMLDivElement> {
  caption?: string;
}

export function ChainOfThoughtImage({
  caption,
  children,
  className,
  ...rest
}: ChainOfThoughtImageProps) {
  return (
    <div className={cn(styles.StepImage, className)} {...rest}>
      <div className={styles.StepImageContent}>
        {children}
      </div>
      {caption && (
        <span className={styles.StepImageCaption}>{caption}</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChainOfThoughtFiles & ChainOfThoughtFile (file/resource badges)
// ---------------------------------------------------------------------------

const FILE_TYPE_ICONS = {
  file: LuFile,
  resource: LuBox,
  log: LuScrollText,
  config: LuSettings,
  query: LuDatabase,
  url: LuGlobe,
} as const;

export interface ChainOfThoughtFilesProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ChainOfThoughtFiles({
  children,
  className,
  ...rest
}: ChainOfThoughtFilesProps) {
  return (
    <div className={cn(styles.StepTags, className)} {...rest}>
      {children}
    </div>
  );
}

export interface ChainOfThoughtFileProps {
  /** Display name (filename, resource name, etc.) */
  name: string;
  /** Resource type — determines the icon */
  type?: 'file' | 'resource' | 'log' | 'config' | 'query' | 'url';
  /** Full path or identifier (shown in tooltip) */
  path?: string;
  /** Click handler (e.g., navigate to resource) */
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ChainOfThoughtFile = memo(function ChainOfThoughtFile({
  name,
  type = 'file',
  path,
  onClick,
  className,
  style,
}: ChainOfThoughtFileProps) {
  const Icon = FILE_TYPE_ICONS[type];
  const chipStyle = onClick ? { ...style, cursor: 'pointer' } : style;

  const chip = (
    <Chip
      size="sm"
      variant="soft"
      className={cn(styles.StepFile, className)}
      style={chipStyle}
      onClick={onClick}
    >
      <Icon size={14} aria-hidden="true" />
      <span className={styles.StepFileName}>{name}</span>
    </Chip>
  );

  if (path) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger>{chip}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>{path}</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return chip;
});

// ---------------------------------------------------------------------------
// Default step dot (small circle for steps without custom icon)
// ---------------------------------------------------------------------------

function DefaultStepDot({ status }: { status: StepStatus }) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true">
      <circle
        cx={8}
        cy={8}
        r={status === 'active' ? 5 : 3}
        fill="currentColor"
        opacity={status === 'pending' ? 0.4 : 1}
      />
      {status === 'active' && (
        <circle
          cx={8}
          cy={8}
          r={7}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.3}
        />
      )}
    </svg>
  );
}
