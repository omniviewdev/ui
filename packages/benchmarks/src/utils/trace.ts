import { isTrace } from './env';

/**
 * CDP trace categories for performance profiling.
 * Used when running benchmarks with TRACE=true in browser mode.
 */
export const TRACE_CATEGORIES = [
  'v8.execute',
  'v8.compile',
  'blink.console',
  'blink.user_timing',
  'benchmark',
  'cc',
  'gpu',
  'viz',
  'disabled-by-default-v8.cpu_profiler',
];

export interface TraceSession {
  stop(): Promise<string | null>;
}

/**
 * Start a CDP trace session. Returns a session object with a stop() method
 * that saves the trace file and returns the path.
 *
 * No-ops in JSDOM or when TRACE is not set.
 * Full CDP implementation requires Playwright browser context — see
 * vitest.config.browser.ts for browser-based benchmark setup.
 */
export async function startTrace(name: string): Promise<TraceSession> {
  if (!isTrace || typeof window === 'undefined') {
    return { stop: async () => null };
  }

  // CDP tracing is available in browser mode via Playwright's CDP session.
  // This will be wired up when browser benchmarks are actively used for profiling.
  // For now, use performance.mark/measure for basic timing.
  const markName = `bench:${name}`;
  performance.mark(`${markName}:start`);

  return {
    stop: async () => {
      performance.mark(`${markName}:end`);
      performance.measure(markName, `${markName}:start`, `${markName}:end`);
      return null;
    },
  };
}
