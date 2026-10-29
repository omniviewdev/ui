import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
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
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    css: true,
  },
});
