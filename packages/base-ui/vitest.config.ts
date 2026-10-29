import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';

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
        // Exercise shipped library memoization, not test-fixture memoization.
        plugins: id.includes('.test.') ? [] : [['babel-plugin-react-compiler', {}]],
      }),
    }),
  ],
  test: {
    fsModuleCachePath: path.join(testCache, 'modules'),
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    css: true,
  },
});
