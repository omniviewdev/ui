import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const isCI = !!process.env.CI;

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
      browser: {
        enabled: true,
        provider: 'playwright',
        instances: [
          {
            browser: 'chromium',
            launch: {
              args: [
                '--enable-precise-memory-info',
                '--js-flags=--expose-gc',
              ],
            },
          },
        ],
      },
      setupFiles: ['./src/setup.ts'],
      fileParallelism: false,
      testTimeout: 60_000,
    },
  };
}) as ReturnType<typeof defineConfig>;
