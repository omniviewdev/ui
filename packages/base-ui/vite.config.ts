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
      include: ['src'],
      outDirs: process.env.OMNIVIEW_BUILD_OUTPUT_DIRECTORY
        ? outputDirectory
        : `${outputDirectory}/.types`,
      entryRoot: 'src',
      bundleTypes: false,
      insertTypesEntry: Boolean(process.env.OMNIVIEW_BUILD_OUTPUT_DIRECTORY),
      afterDiagnostic(diagnostics) {
        for (const diagnostic of diagnostics) {
          if (diagnostic.category === DiagnosticCategory.Error) {
            throw new Error('TypeScript declaration generation failed; see compiler diagnostics');
          }
        }
      },
    }),
  ],
  build: {
    outDir: outputDirectory,
    lib: {
      entry: { index: 'src/index.ts', metrics: 'src/metrics/index.ts' },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [/^react(?:\/|$)/, /^react-dom(?:\/|$)/, /^@base-ui\/react/],
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    css: true,
  },
});
