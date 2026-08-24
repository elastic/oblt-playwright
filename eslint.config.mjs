import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'playwright/.auth/',
      '.features-gen/',
    ],
  },

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    // Config files are outside the TypeScript project, so type-aware rules
    // have no type information to work with here.
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts', 'src/setup/**/*.spec.ts'],
  },
);
