import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
    dts({ include: ['src'], rollupTypes: true }),
  ],
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
        /^@omniviewdev\/base-ui/,
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
    alias: [
      { find: '@omniviewdev/base-ui', replacement: fileURLToPath(new URL('../base-ui/src/index.ts', import.meta.url)) },
      // monaco-editor@0.52 only has "module" (no "exports"), which Vite 7
      // can't resolve. Exact-match alias avoids clobbering subpath imports
      // like monaco-editor/esm/vs/language/json/json.worker.js.
      { find: /^monaco-editor$/, replacement: 'monaco-editor/esm/vs/editor/editor.main.js' },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    css: true,
  },
});
