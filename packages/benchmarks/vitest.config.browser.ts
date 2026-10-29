import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import codspeed from '@codspeed/vitest-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isCI = !!process.env.CI;

export default defineConfig(async () => {
  const plugins = [
    react({ babel: { plugins: [['babel-plugin-react-compiler', {}]] } }),
  ];

  if (isCI) {
    plugins.push(codspeed() as never);
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@omniviewdev/base-ui': path.resolve(__dirname, '../base-ui/src/index.ts'),
        '@omniviewdev/editors': path.resolve(__dirname, '../editors/src/index.ts'),
      },
    },
    test: {
      benchmark: {
        include: ['src/**/*.bench.{ts,tsx}'],
      },
      browser: {
        enabled: true,
        provider: playwright(),
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
