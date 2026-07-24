import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';

export default defineConfig([
  expoConfig,
  {
    ignores: ['dist/**', 'coverage/**', 'android/**', 'ios/**'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]);
