import { forwardRef, type HTMLAttributes } from 'react';
import { StatRow } from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';

export interface AITokenUsageProps extends HTMLAttributes<HTMLDivElement> {
  /** Input/prompt token count */
  inputTokens: number;
  /** Output/completion token count */
  outputTokens: number;
  /** Optional total (defaults to input + output) */
  total?: number;
}

export const AITokenUsage = forwardRef<HTMLDivElement, AITokenUsageProps>(
  function AITokenUsage({ inputTokens, outputTokens, total, className, ...rest }, ref) {
    const computedTotal = total ?? inputTokens + outputTokens;

    return (
      <StatRow ref={ref} size="sm" className={cn(className)} {...rest}>
        <StatRow.Item>{inputTokens.toLocaleString()} input</StatRow.Item>
        <StatRow.Item>{outputTokens.toLocaleString()} output</StatRow.Item>
        <StatRow.Item>{computedTotal.toLocaleString()} tokens</StatRow.Item>
      </StatRow>
    );
  },
);
