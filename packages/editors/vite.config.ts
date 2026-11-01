import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { DiagnosticCategory, getDefaultLibFilePath } from 'typescript';
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

const outputDirectory = process.env.OMNIVIEW_BUILD_OUTPUT_DIRECTORY || 'dist';

export default defineConfig({
  // Library workers must resolve beside the package, not against the consuming app's root.
  base: './',
  worker: { format: 'es' },
  cacheDir:
    process.env.OMNIVIEW_VITE_CACHE_DIRECTORY ?? (process.env.VITEST ? testCache : undefined),
  plugins: [
    react({ babel: { plugins: [['babel-plugin-react-compiler', {}]] } }),
    dts({
      tsconfigPath: './tsconfig.build.json',
      outDirs: outputDirectory,
      entryRoot: 'src',
      // Rolled declarations follow package.json's active dist entry.
      bundleTypes: !process.env.OMNIVIEW_BUILD_OUTPUT_DIRECTORY && {
        invokeOptions: {
          // Compiler aliases can contain only forwarding modules, not standard library declarations.
          typescriptCompilerFolder: dirname(dirname(getDefaultLibFilePath({}))),
        },
      },
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
      {
        find: '@omniviewdev/base-ui',
        replacement: fileURLToPath(new URL('../base-ui/src/index.ts', import.meta.url)),
      },
    ],
  },
  test: {
    fsModuleCachePath: path.join(testCache, 'modules'),
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    css: true,
  },
});
