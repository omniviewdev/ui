import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import type { StepStatus } from '../../system/types';
import styles from './ChainOfThought.module.css';

export interface ChainOfThoughtStepData {
  id: string;
  label: string;
  content: string;
  status: StepStatus;
}

export interface ChainOfThoughtProps extends HTMLAttributes<HTMLDivElement> {
  /** Ordered reasoning steps */
  steps: ChainOfThoughtStepData[];
}

interface StepProps extends HTMLAttributes<HTMLDivElement> {
  step: ChainOfThoughtStepData;
}

const STATUS_ICONS: Record<StepStatus, ReactNode> = {
  pending: <span className={styles.StepIcon} data-ov-status="pending">○</span>,
  active: <span className={styles.StepIcon} data-ov-status="active">◉</span>,
  complete: <span className={styles.StepIcon} data-ov-status="complete">●</span>,
  error: <span className={styles.StepIcon} data-ov-status="error">✗</span>,
};

function Step({ step, ...rest }: StepProps) {
  return (
    <div className={styles.Step} data-ov-status={step.status} {...rest}>
      <div className={styles.StepIndicator}>
        {STATUS_ICONS[step.status]}
        <div className={styles.StepLine} />
      </div>
      <div className={styles.StepBody}>
        <div className={styles.StepLabel}>{step.label}</div>
        {step.content && step.status !== 'pending' && (
          <div className={styles.StepContent}>{step.content}</div>
        )}
      </div>
    </div>
  );
}

const ChainOfThoughtBase = forwardRef<HTMLDivElement, ChainOfThoughtProps>(
  function ChainOfThought({ steps, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.Root, className)} role="list" {...rest}>
        {steps.map((step) => (
          <Step key={step.id} step={step} role="listitem" />
        ))}
      </div>
    );
  },
);

export const ChainOfThought = Object.assign(ChainOfThoughtBase, { Step });
