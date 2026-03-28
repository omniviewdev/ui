import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default defineConfig(async () => {
  const plugins = [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ];

  if (isCI) {
    const { default: codspeed } = await import('@codspeed/vitest-plugin');
    // `as never` — codspeed returns its own Plugin type which doesn't match Vite 7's
    // stricter PluginOption. The cast is safe; the plugin works at runtime.
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
      execArgv: isDeterministic ? deterministicExecArgv : defaultExecArgv,
    },
  };
}) as ReturnType<typeof defineConfig>;
