import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [react(), dts({ include: ['src'] })],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        /^@omniview\/base-ui/,
        /^monaco-editor/,
        /^@xterm/,
        /^react-markdown/,
        /^remark-/,
        /^rehype-/,
      ],
    },
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@omniview/base-ui': fileURLToPath(new URL('../base-ui/src/index.ts', import.meta.url)),
      // monaco-editor@0.52 only has "module" (no "main"/"exports"), which
      // Vite 5's resolver can't find. Point directly to the ESM entry.
      'monaco-editor': 'monaco-editor/esm/vs/editor/editor.main.js',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    css: true,
  },
});
