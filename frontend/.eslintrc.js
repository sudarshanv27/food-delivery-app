// frontend/.eslintrc.js
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: [
        'react',
        'react-hooks',
        'jsx-a11y',
        'import',
    ],
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            node: {
                paths: ['src'],
                extensions: ['.js', '.jsx', '.json'],
            },
        },
    },
    rules: {
        // Line endings - DISABLED (allow both CRLF and LF)
        'linebreak-style': 'off',

        // React rules
        'react/prop-types': 'off',
        'react/display-name': 'off',
        'react/no-unescaped-entities': 'off',
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
        'react/jsx-props-no-spreading': 'off',
        'react/jsx-key': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // Import rules
        'import/no-unresolved': 'warn',
        'import/order': [
            'warn',
            {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'always',
                alphabetize: { order: 'asc', caseInsensitive: true },
            },
        ],
        'import/no-anonymous-default-export': 'off',

        // JavaScript rules
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
        'no-debugger': 'warn',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-shadow': 'off',
        'no-underscore-dangle': 'off',
        'consistent-return': 'off',
        'class-methods-use-this': 'off',

        // Code style
        'quotes': ['warn', 'single', { avoidEscape: true }],
        'semi': ['error', 'always'],
        'indent': ['warn', 2, { SwitchCase: 1 }],
        'comma-dangle': ['warn', 'always-multiline'],
        'arrow-parens': ['warn', 'always'],
        'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
        'prefer-const': 'warn',
        'object-shorthand': 'warn',
        'no-useless-rename': 'warn',

        // Accessibility rules - AutoFocus is WARNING, not ERROR
        'jsx-a11y/anchor-is-valid': 'warn',
        'jsx-a11y/click-events-have-key-events': 'warn',
        'jsx-a11y/no-static-element-interactions': 'warn',
        'jsx-a11y/label-has-associated-control': 'warn',
        'jsx-a11y/media-has-caption': 'off',
        'jsx-a11y/no-autofocus': 'warn',  // This makes it a warning instead of error

        // Prettier integration (optional - remove if not using prettier)
        // 'prettier/prettier': 'warn',
    },
    globals: {
        React: 'readonly',
        process: 'readonly',
        __DEV__: 'readonly',
        __PROD__: 'readonly',
    },
    ignorePatterns: ['build/', 'node_modules/', 'public/', 'coverage/'],
};