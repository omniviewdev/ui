import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: (id) => ({
        // Exercise shipped library memoization, not test-fixture memoization.
        plugins: id.includes('.test.') ? [] : [['babel-plugin-react-compiler', {}]],
      }),
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    css: true,
  },
});
