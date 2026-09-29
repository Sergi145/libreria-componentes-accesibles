/** @type {import('@storybook/html-vite').StorybookConfig} */
const config = {
  stories: ['../src/components/**/*.stories.js'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  docs: {
    autodocs: true,
  },
};

export default config;
