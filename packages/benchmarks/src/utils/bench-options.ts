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

/** Tier 1: deep benchmarks (mount + rerender + mountMany). */
export const TIER_1_OPTIONS: BenchRenderOptions = {
  iterations: 30,
  warmupIterations: 3,
};

/** Tier 2: light benchmarks (mount + rerender only). */
export const TIER_2_OPTIONS: BenchRenderOptions = {
  iterations: 20,
  warmupIterations: 2,
};
