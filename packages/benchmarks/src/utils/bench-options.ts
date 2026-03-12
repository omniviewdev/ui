import type { BenchOptions } from 'vitest';

export interface BenchRenderOptions extends BenchOptions {
  /** Number of warmup iterations before measurement. Default: 5 */
  warmupIterations?: number;
}

const DEFAULT_OPTIONS: BenchRenderOptions = {
  iterations: 100,
  warmupIterations: 5,
};

export function resolveOptions(options?: BenchRenderOptions): BenchRenderOptions {
  return { ...DEFAULT_OPTIONS, ...options };
}
