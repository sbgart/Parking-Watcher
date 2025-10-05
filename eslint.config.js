import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Возможные ошибки
      'no-console': 'off', // Разрешаем console.log для логирования
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-undef': 'error',
      
      // Лучшие практики
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'warn',
      
      // Стиль кода
      'indent': ['error', 2],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'arrow-spacing': 'error',
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'data/**',
      'logs/**',
      'dist/**',
      'build/**',
    ],
  },
];

