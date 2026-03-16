import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Competitive benchmarks: cross-library comparisons (vs MUI, raw HTML).
// Separate config so `pnpm bench` (regression) never pulls in MUI.

export default defineConfig(async () => {
  const plugins = [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ];

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
        include: ['src/competitive/**/*.competitive.{ts,tsx}'],
      },
      environment: 'jsdom',
      setupFiles: ['./src/setup.ts'],
      pool: 'forks',
      fileParallelism: false,
      forks: {
        execArgv: [
          '--expose-gc',
          '--hash-seed=1',
          '--random-seed=1',
          '--max-old-space-size=4096',
        ],
      },
    },
  };
});
