import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    { ignores: [] },
    {
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'error'
        }
    }
];
