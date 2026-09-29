import js from '@eslint/js';
import globals from 'globals';
import storybook from 'eslint-plugin-storybook';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  ...storybook.configs['flat/recommended'],
  {
    ignores: ['dist/', 'storybook-static/', 'node_modules/'],
  },
];
