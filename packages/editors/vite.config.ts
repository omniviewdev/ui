import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { DiagnosticCategory } from 'typescript';

const outputDirectory = process.env.OMNIVIEW_BUILD_OUTPUT_DIRECTORY || 'dist';

export default defineConfig({
  cacheDir: process.env.OMNIVIEW_VITE_CACHE_DIRECTORY,
  plugins: [
    react({ babel: { plugins: [['babel-plugin-react-compiler', {}]] } }),
    dts({
      tsconfigPath: './tsconfig.build.json',
      outDirs: outputDirectory,
      entryRoot: 'src',
      // Rolled declarations follow package.json's active dist entry.
      bundleTypes: !process.env.OMNIVIEW_BUILD_OUTPUT_DIRECTORY,
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
        /^react(?:\/|$)/,
        /^react-dom(?:\/|$)/,
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
    // Monaco 0.52 publishes its ESM entry through module, not main.
    mainFields: ['module', 'main'],
    alias: [
      { find: '@omniviewdev/base-ui', replacement: fileURLToPath(new URL('../base-ui/src/index.ts', import.meta.url)) },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    css: true,
  },
});
