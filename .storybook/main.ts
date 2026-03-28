import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Strip the broken `//# sourceMappingURL=marked.umd.js.map` reference from
 * monaco-editor's bundled `marked.js`. The .map file isn't shipped in
 * the npm package, so Vite logs a noisy warning every time it transforms it.
 *
 * Copied from packages/editors/.storybook/main.ts.
 */
function stripBrokenSourcemaps(): Plugin {
  return {
    name: 'strip-broken-sourcemaps',
    transform(code, id) {
      if (id.includes('marked') && code.includes('sourceMappingURL=marked.umd.js.map')) {
        return {
          code: code.replace('//# sourceMappingURL=marked.umd.js.map', ''),
          map: null,
        };
      }
    },
  };
}

const config: StorybookConfig = {
  stories: [
    '../packages/base-ui/src/**/*.stories.@(ts|tsx)',
    '../packages/ai-ui/src/**/*.stories.@(ts|tsx)',
    '../packages/editors/src/**/*.stories.@(ts|tsx)',
  ],

  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  docs: {
    autodocs: 'tag',
  },

  viteFinal: async (config) => {
    // --- Alias: resolve @omniviewdev/base-ui to source (from ai-ui config) ---
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@omniviewdev/base-ui': path.resolve(__dirname, '../packages/base-ui/src/index.ts'),
    };

    // --- Monaco optimizations (from editors config) ---
    config.optimizeDeps ??= {};

    // monaco-editor is huge — skip esbuild pre-bundling
    config.optimizeDeps.exclude ??= [];
    config.optimizeDeps.exclude.push('monaco-editor');

    // Pre-bundle the yaml worker so esbuild transforms CJS deps into ESM
    config.optimizeDeps.include ??= [];
    config.optimizeDeps.include.push('monaco-yaml/yaml.worker.js');

    // Strip broken sourcemap reference from monaco's bundled marked.js
    config.plugins ??= [];
    (config.plugins as Plugin[]).push(stripBrokenSourcemaps());

    // Ensure the React plugin is present — @storybook/react-vite should add it,
    // but in pnpm workspaces the hoisted root config can lose it.
    const hasReactPlugin = (config.plugins as Plugin[]).some(
      (p) => p && typeof p === 'object' && 'name' in p && (p as Plugin).name === 'vite:react-babel',
    );
    if (!hasReactPlugin) {
      (config.plugins as Plugin[]).unshift(
        ...(react({
          babel: { plugins: [['babel-plugin-react-compiler', {}]] },
        }) as unknown as Plugin[]),
      );
    }

    // --- Base path for PR previews ---
    // When STORYBOOK_BASE is set (e.g. /pr-42/), configure Vite's base path
    // so asset URLs resolve correctly under the prefix.
    if (process.env.STORYBOOK_BASE) {
      config.base = process.env.STORYBOOK_BASE;
    }

    return config;
  },
};

export default config;
