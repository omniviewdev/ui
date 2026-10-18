import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

import { declarationOutputOptions, outputDirectory } from '../build-output';

export default defineConfig({
  cacheDir: process.env.OMNIVIEW_VITE_CACHE_DIRECTORY,
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
    dts({ ...declarationOutputOptions, include: ['src'] }),
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
