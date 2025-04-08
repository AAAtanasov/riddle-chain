module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node', // Use Node.js environment
    testMatch: ['**/src/**/*.spec.[jt]s?(x)'], // Test file pattern
    verbose: true, // Show detailed test results
    clearMocks: true, // Clear mocks between tests
    collectCoverage: true, // Enable coverage
    coverageDirectory: 'coverage', // Coverage output directory
};