import { defineConfig } from 'vite';
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
      include: ['src'],
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
      external: ['react', 'react-dom', /^@base-ui\/react/],
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
