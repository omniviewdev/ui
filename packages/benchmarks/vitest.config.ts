import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import codspeed from '@codspeed/vitest-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isCI = !!process.env.CI;
const isDeterministic = !!process.env.DETERMINISTIC;

const defaultExecArgv = [
  '--expose-gc',
  '--hash-seed=1',
  '--random-seed=1',
  '--max-old-space-size=4096',
];

const deterministicExecArgv = [
  '--no-opt',
  '--predictable',
  '--predictable-gc-schedule',
  '--expose-gc',
  '--no-concurrent-sweeping',
  '--hash-seed=1',
  '--random-seed=1',
  '--max-old-space-size=4096',
];

export default defineConfig(async () => {
  const plugins = [
    react({ babel: { plugins: [['babel-plugin-react-compiler', {}]] } }),
  ];

  if (isCI) {
    // CodSpeed 6 selects a Vitest 5 benchmark provider when instrumented.
    // Its bundled Vite Plugin type differs from this workspace's Vite type.
    plugins.push(codspeed() as never);
  }

  return {
    plugins,
    resolve: {
      alias: [
        { find: '@omniviewdev/base-ui', replacement: path.resolve(__dirname, '../base-ui/src/index.ts') },
        { find: '@omniviewdev/editors', replacement: path.resolve(__dirname, '../editors/src/index.ts') },
        // Stub out react-syntax-highlighter and all sub-path imports (e.g.
        // react-syntax-highlighter/dist/esm/styles/prism). Imported transitively
        // via CodeBlock barrel but unused by benchmarks. The real package fails
        // in CodSpeed's forked CJS process because refractor is ESM-only.
        {
          find: /^react-syntax-highlighter(\/.*)?$/,
          replacement: path.resolve(__dirname, 'src/stubs/react-syntax-highlighter.ts'),
        },
      ],
    },
    test: {
      benchmark: {
        include: ['src/**/*.bench.{ts,tsx}'],
      },
      environment: 'jsdom',
      setupFiles: ['./src/setup.ts'],
      pool: 'forks',
      fileParallelism: false,
      // CPU simulation completed the bulk Combobox case in 411 seconds.
      // This bounds runner overhead, not component latency or regression thresholds.
      testTimeout: process.env.CODSPEED_RUNNER_MODE === 'simulation' ? 600_000 : 60_000,
      execArgv: isDeterministic ? deterministicExecArgv : defaultExecArgv,
    },
  };
}) as ReturnType<typeof defineConfig>;
