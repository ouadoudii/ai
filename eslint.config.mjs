import eslint from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'visual-artifacts/**',
      'public/generated-food/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Baseline legacy exceptions. The new gate still enables the remaining
      // ESLint and TypeScript-ESLint recommended bug-detection rules.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-control-regex': 'off',
      'no-useless-escape': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...reactHooks.configs['recommended-latest'],
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...reactRefresh.configs.vite,
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}', 'e2e/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
);
