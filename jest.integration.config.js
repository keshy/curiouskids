// Jest configuration for integration tests
export default {
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/integration/**/*.test.js',
    '**/tests/integration/**/*.test.jsx',
    '**/tests/integration/**/*.test.ts',
    '**/tests/integration/**/*.test.tsx',
  ],
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Setup files that should be loaded before the tests are run
  setupFilesAfterEnv: ['./tests/integration/setup.js'],
  
  // Test timeout in milliseconds
  testTimeout: 30000,
  
  // Indicates whether the coverage information should be collected
  collectCoverage: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage-integration',
};