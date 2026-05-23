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
    dts({
      include: ['src'],
      exclude: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.test.tsx', '**/*.test.ts'],
      rollupTypes: true,
    }),
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
