module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  plugins: ['security'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'coverage/'],
};