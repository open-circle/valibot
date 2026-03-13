import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import redosDetector from 'eslint-plugin-redos-detector';
import regexpPlugin from 'eslint-plugin-regexp';
import pluginSecurity from 'eslint-plugin-security';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.js',
      'tsdown.config.ts',
      'vitest.config.ts',
      'mod.ts',
      'playground.ts',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  jsdoc.configs['flat/recommended'],
  pluginSecurity.configs.recommended,
  regexpPlugin.configs['flat/recommended'],
  {
    files: ['src/**/*.ts'],
    extends: [importPlugin.flatConfigs.recommended],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { jsdoc, 'redos-detector': redosDetector },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Enable rules -----------------------------------------------------------

      // TypeScript
      '@typescript-eslint/consistent-type-definitions': 'error', // Enforce declaring types using `interface` keyword for better TS performance.
      '@typescript-eslint/consistent-type-imports': 'warn',

      // Import
      'import/extensions': ['error', 'always'], // Require file extensions

      // JSDoc
      'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
      'jsdoc/sort-tags': [
        'error',
        {
          linesBetween: 1,
          tagSequence: [
            { tags: ['deprecated'] },
            { tags: ['param'] },
            { tags: ['returns'] },
          ],
        },
      ],
      // NOTE: For overloads functions, we only require a JSDoc at the top
      // SEE: https://github.com/gajus/eslint-plugin-jsdoc/issues/666
      'jsdoc/require-jsdoc': [
        'error',
        {
          contexts: [
            'ExportNamedDeclaration[declaration.type="TSDeclareFunction"]:not(ExportNamedDeclaration[declaration.type="TSDeclareFunction"] + ExportNamedDeclaration[declaration.type="TSDeclareFunction"])',
            'ExportNamedDeclaration[declaration.type="FunctionDeclaration"]:not(ExportNamedDeclaration[declaration.type="TSDeclareFunction"] + ExportNamedDeclaration[declaration.type="FunctionDeclaration"])',
          ],
          require: {
            FunctionDeclaration: false,
          },
        },
      ],
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['alpha', 'beta', '__NO_SIDE_EFFECTS__'],
        },
      ],

      // RegExp
      'regexp/no-super-linear-move': 'error', // Prevent DoS regexps
      'regexp/no-control-character': 'error', // Avoid unneeded regexps characters
      'regexp/no-octal': 'error', // Avoid unneeded regexps characters
      'regexp/no-standalone-backslash': 'error', // Avoid unneeded regexps characters
      'regexp/prefer-escape-replacement-dollar-char': 'error', // Avoid unneeded regexps characters
      'regexp/prefer-quantifier': 'error', // Avoid unneeded regexps characters
      'regexp/hexadecimal-escape': ['error', 'always'], // Avoid unneeded regexps characters
      'regexp/sort-alternatives': 'error', // Avoid unneeded regexps characters
      'regexp/require-unicode-regexp': 'error', // /u flag is faster and enables regexp strict mode
      'regexp/prefer-regexp-exec': 'error', // Enforce that RegExp#exec is used instead of String#match if no global flag is provided, as exec is faster

      // Redos detector
      'redos-detector/no-unsafe-regex': ['error', { ignoreError: true }], // Prevent DoS regexps

      // Disable rules ----------------------------------------------------------

      // TypeScript
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',

      // Imports
      'no-duplicate-imports': 'off',

      // JSDoc
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',

      // RegExp
      'regexp/use-ignore-case': 'off', // We sometimes don't use the i flag for a better JSON Schema compatibility

      // Security
      'security/detect-object-injection': 'off', // Too many false positives
      'security/detect-unsafe-regex': 'off', // Too many false positives, see https://github.com/eslint-community/eslint-plugin-security/issues/28 - we use the redos-detector plugin instead
    },
  }
);
