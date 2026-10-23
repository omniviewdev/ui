import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { DiagnosticCategory } from 'typescript';

const outputDirectory = process.env.OMNIVIEW_BUILD_OUTPUT_DIRECTORY || 'dist';

export default defineConfig({
  cacheDir: process.env.OMNIVIEW_VITE_CACHE_DIRECTORY,
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
    dts({
      outDir: outputDirectory,
      entryRoot: 'src',
      // Rolled declarations follow package.json's active dist entry.
      rollupTypes: !process.env.OMNIVIEW_BUILD_OUTPUT_DIRECTORY,
      afterDiagnostic(diagnostics) {
        for (const diagnostic of diagnostics) {
          if (diagnostic.category === DiagnosticCategory.Error) {
            throw new Error('TypeScript declaration generation failed; see compiler diagnostics');
          }
        }
      },
      include: ['src'],
      exclude: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.test.tsx', '**/*.test.ts'],
    }),
  ],
  build: {
    outDir: outputDirectory,
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
