// Jest configuration for the AskMe Buddy project
export default {
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/unit/**/*.test.jsx',
    '**/tests/unit/**/*.test.ts',
    '**/tests/unit/**/*.test.tsx',
  ],
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Indicates whether the coverage information should be collected
  collectCoverage: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
};