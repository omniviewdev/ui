import type { BenchRunOptions } from 'vitest';

export type BenchRenderOptions = BenchRunOptions;

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
