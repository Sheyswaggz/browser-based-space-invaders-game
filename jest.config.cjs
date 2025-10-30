/**
 * Jest Configuration for Space Invaders Game
 * 
 * Production-grade Jest configuration for browser-based JavaScript testing
 * with jsdom environment. Enforces 90% code coverage threshold and provides
 * comprehensive test matching patterns.
 * 
 * @module jest.config
 * @requires jest-environment-jsdom
 */

module.exports = {
  /**
   * Test environment configuration
   * Using jsdom to simulate browser DOM APIs for canvas and game testing
   */
  testEnvironment: 'jsdom',

  /**
   * Coverage output directory
   * All coverage reports will be generated in this directory
   */
  coverageDirectory: 'coverage',

  /**
   * Coverage collection patterns
   * Includes all source files while excluding test files
   */
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/**/index.js', // Entry points often just import/export
  ],

  /**
   * Coverage thresholds enforcement
   * Enforces 90% coverage across all metrics as per project requirements
   * Build will fail if any threshold is not met
   */
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  /**
   * Test file matching patterns
   * Supports both __tests__ directory convention and co-located test files
   */
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],

  /**
   * Setup files to run after test environment is initialized
   * Uncomment when jest.setup.cjs is created for custom matchers and global setup
   */
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],

  /**
   * Module file extensions to consider
   * Prioritizes .js files for ES modules
   */
  moduleFileExtensions: ['js', 'json'],

  /**
   * Module name mapping for non-JS imports
   * Maps CSS and asset imports to mocks for testing
   */
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',
  },

  /**
   * Transform configuration
   * Empty object since we're using native ES modules with Node.js --experimental-vm-modules
   * No babel-jest needed as we're targeting modern browsers and Node 18+
   */
  transform: {},

  /**
   * Paths to ignore during testing
   * Excludes build artifacts and dependencies
   */
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/.github/',
  ],

  /**
   * Paths to ignore during coverage collection
   * Prevents coverage calculation for non-source files
   */
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/.github/',
    '/scripts/',
  ],

  /**
   * Coverage reporters configuration
   * Generates multiple report formats for different use cases
   */
  coverageReporters: [
    'text',           // Console output for CI/CD
    'text-summary',   // Brief summary for quick checks
    'html',           // Detailed HTML report for local development
    'lcov',           // Standard format for coverage tools
    'json',           // Machine-readable format for integrations
  ],

  /**
   * Test timeout configuration
   * 5 seconds default timeout for game logic tests
   * Can be overridden per-test for longer operations
   */
  testTimeout: 5000,

  /**
   * Verbose output configuration
   * Provides detailed test execution information
   */
  verbose: true,

  /**
   * Error handling configuration
   * Clears mocks between tests to prevent test pollution
   */
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,

  /**
   * Watch mode configuration
   * Optimizes watch mode for development workflow
   */
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],

  /**
   * Notification configuration
   * Disabled by default to avoid interruptions during development
   */
  notify: false,

  /**
   * Bail configuration
   * Continues running all tests even if some fail
   * Set to true in CI for faster feedback
   */
  bail: false,

  /**
   * Max workers configuration
   * Uses 50% of available CPU cores for optimal performance
   * Prevents resource exhaustion on CI servers
   */
  maxWorkers: '50%',

  /**
   * Error on deprecated configuration
   * Ensures configuration stays up-to-date with Jest best practices
   */
  errorOnDeprecated: true,

  /**
   * Detect open handles
   * Helps identify async operations that prevent Jest from exiting
   * Useful for debugging hanging tests
   */
  detectOpenHandles: false,

  /**
   * Force exit configuration
   * Disabled to ensure proper cleanup of resources
   */
  forceExit: false,

  /**
   * Global setup and teardown
   * Uncomment when global test setup is needed
   */
  // globalSetup: '<rootDir>/jest.globalSetup.cjs',
  // globalTeardown: '<rootDir>/jest.globalTeardown.cjs',

  /**
   * Test result processor
   * Can be used to integrate with external reporting tools
   */
  // testResultsProcessor: '<rootDir>/node_modules/jest-sonar-reporter',

  /**
   * Snapshot configuration
   * Stores snapshots alongside test files for better organization
   */
  snapshotSerializers: [],

  /**
   * Resolver configuration
   * Custom module resolution if needed for complex import scenarios
   */
  // resolver: '<rootDir>/jest.resolver.cjs',
};