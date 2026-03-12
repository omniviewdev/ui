import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Vitest config for Reassure performance tests.
 *
 * These are regular test() calls (not bench()) that use Reassure's measureRenders
 * to track render counts and durations per interaction scenario. The output goes
 * to .reassure/current.perf (or baseline.perf) for cross-branch comparison.
 *
 * V8 flags match Reassure's recommendations: disable JIT for stable measurements.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default defineConfig(async () => {
  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', {}]],
        },
      }),
    ],
    resolve: {
      alias: [
        { find: '@omniview/base-ui', replacement: path.resolve(__dirname, '../base-ui/src/index.ts') },
        { find: '@omniview/editors', replacement: path.resolve(__dirname, '../editors/src/index.ts') },
        {
          find: /^react-syntax-highlighter(\/.*)?$/,
          replacement: path.resolve(__dirname, 'src/stubs/react-syntax-highlighter.ts'),
        },
      ],
    },
    test: {
      include: ['src/**/*.perf-test.{ts,tsx}'],
      environment: 'jsdom',
      // Reassure's writeTestStats uses expect.getState().currentTestName
      globals: true,
      setupFiles: ['./src/setup.ts', './src/setup-perf.ts'],
      pool: 'forks',
      fileParallelism: false,
      // Reassure recommends --no-turbofan --no-sparkplug for stable measurements.
      // --expose-gc lets Reassure force GC between runs to reduce noise.
      forks: {
        execArgv: [
          '--expose-gc',
          '--no-turbofan',
          '--no-sparkplug',
          '--hash-seed=1',
          '--random-seed=1',
          '--max-old-space-size=4096',
        ],
      },
      // Reassure tests are slow (20 runs + warmup per test). Generous timeout.
      testTimeout: 60_000,
    },
  };
}) as ReturnType<typeof defineConfig>;
