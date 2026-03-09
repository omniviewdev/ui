import {
  Children,
  Fragment,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { LuCheck } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import styles from './Stepper.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StepperOrientation = 'horizontal' | 'vertical';

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  /** 0-indexed current step. */
  activeStep: number;
  /** Layout direction. @default 'horizontal' */
  orientation?: StepperOrientation;
}

export interface StepProps extends HTMLAttributes<HTMLDivElement> {
  /** Primary text shown next to the step indicator. */
  label: string;
  /** Secondary text below the label. */
  description?: string;
  /** Custom icon to replace the step number. */
  icon?: ReactNode;
  /** Show the step in an error state. */
  error?: boolean;
  /** Override the auto-completion detection. */
  completed?: boolean;
  /** Mark the step as disabled (muted, non-interactive). */
  disabled?: boolean;
}

/** Internal props injected by StepperRoot via Children.map. */
export interface InjectedStepProps {
  /** @internal */ _index?: number;
  /** @internal */ _isFirst?: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface StepperContextValue {
  activeStep: number;
  orientation: StepperOrientation;
}

const StepperContext = createContext<StepperContextValue>({
  activeStep: 0,
  orientation: 'horizontal',
});

// ---------------------------------------------------------------------------
// StepperRoot
// ---------------------------------------------------------------------------

const StepperRoot = forwardRef<HTMLDivElement, StepperProps>(function StepperRoot(
  { className, activeStep, orientation = 'horizontal', children, ...props },
  ref,
) {
  // Recursively inject _index and _isFirst into StepperStep children,
  // even when nested inside Fragments or wrapper elements.
  const counterRef = { current: 0 };

  function processChildren(nodes: ReactNode): ReactNode {
    return Children.map(nodes, (child) => {
      if (!isValidElement(child)) return child;

      if (child.type === StepperStep) {
        const idx = counterRef.current++;
        return cloneElement(child as React.ReactElement<StepProps & InjectedStepProps>, {
          _index: idx,
          _isFirst: idx === 0,
        });
      }

      // Traverse into Fragments and wrapper elements
      if (child.type === Fragment || (child.props as { children?: ReactNode }).children) {
        const processed = processChildren((child.props as { children?: ReactNode }).children);
        return cloneElement(child, undefined, processed);
      }

      return child;
    });
  }

  const steps = processChildren(children);

  return (
    <StepperContext.Provider value={{ activeStep, orientation }}>
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-orientation={orientation}
        {...props}
      >
        {steps}
      </div>
    </StepperContext.Provider>
  );
});

StepperRoot.displayName = 'Stepper';

// ---------------------------------------------------------------------------
// StepperStep
// ---------------------------------------------------------------------------

const StepperStep = forwardRef<HTMLDivElement, StepProps & InjectedStepProps>(function StepperStep(
  {
    className,
    label,
    description,
    icon,
    error = false,
    completed: completedProp,
    disabled = false,
    _index = 0,
    _isFirst = false,
    ...props
  },
  ref,
) {
  const { activeStep, orientation } = useContext(StepperContext);

  // Determine status
  const isActive = _index === activeStep;
  const isAutoCompleted = _index < activeStep;
  const isCompleted = completedProp ?? isAutoCompleted;

  let status: 'completed' | 'active' | 'pending' | 'error';
  if (error) {
    status = 'error';
  } else if (isActive) {
    status = 'active';
  } else if (isCompleted) {
    status = 'completed';
  } else {
    status = 'pending';
  }

  return (
    <div
      ref={ref}
      className={cn(styles.Step, className)}
      data-ov-orientation={orientation}
      data-ov-status={status}
      data-ov-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      aria-current={status === 'active' ? 'step' : undefined}
      {...props}
    >
      {/* Connector line (not before first step) */}
      {!_isFirst && (
        <div
          className={styles.Connector}
          data-ov-role="connector"
          data-ov-status={isCompleted && !error ? 'completed' : 'pending'}
        />
      )}

      {/* Circle indicator */}
      <div className={styles.Circle} data-ov-status={status}>
        {status === 'completed' && !icon ? (
          <LuCheck className={styles.CheckIcon} aria-hidden="true" />
        ) : icon ? (
          <span className={styles.IconSlot}>{icon}</span>
        ) : (
          <span className={styles.Number}>{_index + 1}</span>
        )}
      </div>

      {/* Label & description */}
      <div className={styles.Content}>
        <span className={styles.Label} data-ov-status={status}>
          {label}
        </span>
        {description && <span className={styles.Description}>{description}</span>}
      </div>
    </div>
  );
});

StepperStep.displayName = 'Stepper.Step';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type StepperCompound = typeof StepperRoot & {
  Step: typeof StepperStep;
};

export const Stepper = Object.assign(StepperRoot, {
  Step: StepperStep,
}) as StepperCompound;
