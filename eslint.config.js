// @ts-check
/**
 * ESLint (flat config). Reglas de JS + JSDoc obligatorio en funciones exportadas.
 * @see docs/07-convenciones.md
 */
import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'docs/api/**', 'node_modules/**', 'coverage/**'] },
  js.configs.recommended,
  jsdoc.configs['flat/recommended'],
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node, __AU_VERSION__: 'readonly' },
    },
    plugins: { jsdoc },
    settings: { jsdoc: { mode: 'typescript' } },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: { FunctionDeclaration: true, ClassDeclaration: true, MethodDefinition: false },
        },
      ],
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/reject-any-type': 'off',
      'jsdoc/tag-lines': 'off',
      'jsdoc/no-defaults': 'off', // documentamos los valores por defecto con [param=valor]
      'jsdoc/ts-no-empty-object-type': 'off',
    },
  },
  {
    files: ['tests/**/*.js', '*.config.js', 'scripts/**/*.{mjs,cjs}', 'eslint.config.js', 'public/js/**/*.js'],
    rules: { 'jsdoc/require-jsdoc': 'off', 'jsdoc/require-param': 'off', 'jsdoc/require-returns': 'off' },
  },
];
