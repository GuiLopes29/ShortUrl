/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-require-imports */
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: {
        extends: [],
        plugins: [],
        rules: {},
    },
});

module.exports = [
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
            prettier: require('eslint-plugin-prettier'),
        },
        rules: {
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto',
                },
            ],
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    ...compat.extends(
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ),
];
