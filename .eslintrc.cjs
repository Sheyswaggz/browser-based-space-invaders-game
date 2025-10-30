module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:security/recommended',
  ],
  plugins: [
    'security',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    // Console usage - warn in development, should be removed in production
    'no-console': 'warn',
    
    // Variable declarations
    'no-unused-vars': ['error', {
      vars: 'all',
      args: 'after-used',
      ignoreRestSiblings: true,
      argsIgnorePattern: '^_',
    }],
    'prefer-const': ['error', {
      destructuring: 'all',
      ignoreReadBeforeAssign: false,
    }],
    'no-var': 'error',
    
    // Best practices for game development
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-return-assign': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'prefer-promise-reject-errors': 'error',
    'require-await': 'warn',
    
    // Code quality
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs', { allowSingleLine: false }],
    'no-multi-spaces': 'error',
    'no-trailing-spaces': 'error',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'comma-dangle': ['error', 'always-multiline'],
    
    // ES6+ features
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'always'],
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-constructor': 'error',
    'object-shorthand': ['error', 'always'],
    'prefer-arrow-callback': 'error',
    'prefer-destructuring': ['error', {
      array: false,
      object: true,
    }, {
      enforceForRenamedProperties: false,
    }],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],
    
    // Performance considerations for game loop
    'no-await-in-loop': 'warn',
    'no-constant-condition': ['error', { checkLoops: false }],
    
    // Security enhancements
    'no-script-url': 'error',
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    '*.min.js',
    'build/',
  ],
  overrides: [
    {
      files: ['*.cjs'],
      parserOptions: {
        sourceType: 'script',
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['**/*.test.js', '**/*.spec.js', '**/__tests__/**/*.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
        'security/detect-non-literal-fs-filename': 'off',
        'security/detect-object-injection': 'off',
      },
    },
    {
      files: ['scripts/**/*.js', 'scripts/**/*.cjs'],
      rules: {
        'no-console': 'off',
        'security/detect-non-literal-fs-filename': 'off',
      },
    },
  ],
};