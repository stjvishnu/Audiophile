import js from '@eslint/js';
import html from 'eslint-plugin-html';

export default [
  js.configs.recommended, // Add this line first
  {
    files: ['**/*.js', '**/*.ejs'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    plugins: {
      html,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
    },
    settings: {
      'html/html-extensions': ['.html', '.ejs'],
    },
  },
];
