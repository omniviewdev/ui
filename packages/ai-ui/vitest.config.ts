import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';

// The Omniview dev workspace supervisor owns node_modules and refuses changes
// it did not write. Keep Vitest's result and module caches outside it.
const testCache = path.join(
  tmpdir(),
  'omniview-vitest',
  createHash('sha256')
    .update(import.meta.dirname)
    .digest('hex')
    .slice(0, 16),
);

export default defineConfig({
  cacheDir: testCache,
  plugins: [
    react({
      babel: (id) => ({
        // Match the shipped compiler transform without compiling test fixtures.
        plugins: id.includes('.test.') ? [] : [['babel-plugin-react-compiler', { target: '19' }]],
      }),
    }),
  ],
  resolve: {
    alias: {
      '@omniviewdev/base-ui': path.resolve(import.meta.dirname, '../base-ui/src/index.ts'),
    },
  },
  test: {
    fsModuleCachePath: path.join(testCache, 'modules'),
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    css: true,
  },
});
