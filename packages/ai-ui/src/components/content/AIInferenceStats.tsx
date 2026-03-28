import { forwardRef, type HTMLAttributes } from 'react';
import { StatRow } from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';
import { LuZap, LuGauge, LuClock } from '../../system/icons';

export interface AIInferenceStatsProps extends HTMLAttributes<HTMLDivElement> {
  /** Tokens per second throughput */
  throughput?: number;
  /** Total tokens generated */
  tokenCount?: number;
  /** Latency in seconds */
  latency?: number;
  /** Stop reason (e.g. "EOS Token Found", "max_tokens") */
  stopReason?: string;
  /** Optional input token breakdown */
  inputTokens?: number;
  /** Optional output token breakdown */
  outputTokens?: number;
}

export const AIInferenceStats = forwardRef<HTMLDivElement, AIInferenceStatsProps>(
  function AIInferenceStats(
    { throughput, tokenCount, latency, stopReason, inputTokens, outputTokens, className, ...rest },
    ref,
  ) {
    const hasAny =
      throughput != null ||
      tokenCount != null ||
      latency != null ||
      stopReason != null ||
      (inputTokens != null && outputTokens != null);

    if (!hasAny) return null;

    return (
      <StatRow ref={ref} size="sm" className={cn(className)} {...rest}>
        {throughput != null && (
          <StatRow.Item icon={<LuZap />}>
            {throughput.toFixed(2)} tok/sec
          </StatRow.Item>
        )}
        {tokenCount != null && (
          <StatRow.Item icon={<LuGauge />}>
            {tokenCount.toLocaleString()} tokens
          </StatRow.Item>
        )}
        {inputTokens != null && outputTokens != null && (
          <StatRow.Item>
            {inputTokens.toLocaleString()} in / {outputTokens.toLocaleString()} out
          </StatRow.Item>
        )}
        {latency != null && (
          <StatRow.Item icon={<LuClock />}>
            {latency.toFixed(2)}s
          </StatRow.Item>
        )}
        {stopReason != null && (
          <StatRow.Item>
            Stop: {stopReason}
          </StatRow.Item>
        )}
      </StatRow>
    );
  },
);
