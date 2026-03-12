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
      alias: {
        '@omniview/base-ui': path.resolve(__dirname, '../base-ui/src/index.ts'),
        '@omniview/editors': path.resolve(__dirname, '../editors/src/index.ts'),
      },
    },
    test: {
      benchmark: {
        include: ['src/**/*.bench.{ts,tsx}'],
      },
      environment: 'jsdom',
      setupFiles: ['./src/setup.ts'],
      pool: 'forks',
      fileParallelism: false,
      forks: {
        execArgv: isDeterministic ? deterministicExecArgv : defaultExecArgv,
      },
      deps: {
        // react-syntax-highlighter (via CodeBlock) imports refractor which is ESM-only.
        // Without inlining, the forked CJS process in CI fails with require() of ESM.
        optimizer: {
          web: {
            include: ['react-syntax-highlighter', 'refractor'],
          },
        },
      },
    },
  };
}) as ReturnType<typeof defineConfig>;
