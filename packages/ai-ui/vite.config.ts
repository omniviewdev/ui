import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { DiagnosticCategory, getDefaultLibFilePath } from 'typescript';

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
        /^@omniviewdev\/editors/,
      ],
    },
    sourcemap: true,
  },
  resolve: {
    alias: [
      {
        find: '@omniviewdev/base-ui',
        replacement: fileURLToPath(new URL('../base-ui/src/index.ts', import.meta.url)),
      },
    ],
  },
});
