import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: {
    allowedHosts: process.env.STORYBOOK_ALLOWED_HOSTS?.split(',').filter(Boolean),
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
