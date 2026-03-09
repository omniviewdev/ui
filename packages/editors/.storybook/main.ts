import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin } from 'vite';

/**
 * Strip the broken `//# sourceMappingURL=marked.umd.js.map` reference from
 * monaco-editor@0.52's bundled `marked.js`. The .map file isn't shipped in
 * the npm package, so Vite logs a noisy warning every time it transforms it.
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
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal(config) {
    config.optimizeDeps ??= {};

    // monaco-editor is huge — skip esbuild pre-bundling, let Vite serve on-the-fly.
    config.optimizeDeps.exclude ??= [];
    config.optimizeDeps.exclude.push('monaco-editor');

    // Pre-bundle the yaml worker entry so esbuild transforms its CJS deps
    // (path-browserify, etc.) into ESM — required for native ESM workers in dev.
    config.optimizeDeps.include ??= [];
    config.optimizeDeps.include.push('monaco-yaml/yaml.worker.js');

    // Strip broken sourcemap reference from monaco's bundled marked.js
    config.plugins ??= [];
    (config.plugins as Plugin[]).push(stripBrokenSourcemaps());

    return config;
  },
};

export default config;
