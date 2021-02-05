module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    '@typescript-eslint/no-unused-vars': [2, { args: 'none' }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'linebreak-style': 'off',
    'prefer-destructuring': 'off',
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'no-continue': 'off',
    'no-lonely-if': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'max-classes-per-file': 'off',
    'max-len': 'off',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    semi: ['error', 'always'],
    'no-extra-semi': ['off'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: [
          '*/tsconfig.json',
          'tsconfig.json',
        ],
      },
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
};
