import js from '@eslint/js';
import globals from 'globals';
import react from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import { noInlineStyles } from './scripts/eslint/css-audit-rules.mjs';
import { noUnescapedEntities } from './scripts/eslint/jsx-text-rule.mjs';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/storybook-static/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@eslint-react': react,
      'omniview-react': { rules: { 'no-unescaped-entities': noUnescapedEntities } },
      'react-hooks': reactHooks,
    },
    settings: {
      'react-x': {
        version: 'detect',
      },
    },
    rules: {
      // Explicit equivalents of the former react/recommended checks only.
      // TypeScript checks duplicate/undefined JSX props, removed string refs,
      // isMounted, and class render return types; its parser tracks JSX bindings.
      '@eslint-react/no-missing-component-display-name': 'error',
      '@eslint-react/no-missing-key': 'error',
      '@eslint-react/jsx-no-comment-textnodes': 'error',
      '@eslint-react/dom-no-unsafe-target-blank': 'error',
      '@eslint-react/jsx-no-children-prop': 'error',
      '@eslint-react/jsx-no-children-prop-with-children': 'error',
      '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': 'error',
      '@eslint-react/no-component-will-mount': 'error',
      '@eslint-react/no-component-will-receive-props': 'error',
      '@eslint-react/no-component-will-update': 'error',
      '@eslint-react/no-direct-mutation-state': 'error',
      '@eslint-react/dom-no-find-dom-node': 'error',
      '@eslint-react/dom-no-render-return-value': 'error',
      '@eslint-react/dom-no-render': 'error',
      '@eslint-react/dom-no-hydrate': 'error',
      '@eslint-react/dom-no-unknown-property': 'error',
      'omniview-react/no-unescaped-entities': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Apply compiler diagnostics to compiled sources, not uncompiled fixtures.
    files: ['packages/*/src/**/*.{js,jsx,ts,tsx}', 'apps/*/src/**/*.{js,jsx,ts,tsx}'],
    ignores: ['**/*.stories.*', '**/*.test.*', '**/*.spec.*', '**/__tests__/**'],
    rules: { ...reactHooks.configs.flat['recommended-latest'].rules },
  },
  {
    files: ['packages/*/src/**/*.{tsx,jsx}'],
    ignores: ['**/*.stories.*', '**/*.test.*'],
    plugins: {
      'omniview-audit': {
        rules: {
          'no-inline-styles': noInlineStyles,
        },
      },
    },
    rules: {
      'omniview-audit/no-inline-styles': 'error',
    },
  },
  prettierConfig,
];
