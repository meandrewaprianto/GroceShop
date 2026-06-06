import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Allow `any` in catch clauses, prop types, and loose-typed areas
      '@typescript-eslint/no-explicit-any': 'warn',

      // Context files export both Provider + hook — this is a valid pattern
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // useState inside useEffect is a common pattern for data fetching initialization
      'react-hooks/set-state-in-effect': 'off',

      // Intentional: deps are controlled via refs or intentionally stable
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])
