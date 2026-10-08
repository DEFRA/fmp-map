module.exports = async () => {
  const config = {
    collectCoverage: true,
    coverageThreshold: {
      global: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: -10
      }
    },
    collectCoverageFrom: [
      'client/**/*.{js,jsx}',
      'config/**/*.{js,jsx}',
      'server/**/*.{js,jsx}',
      '*.{js,jsx}',
      '!server/public/**',
      '!**/*.snap'
    ],
    coverageReporters: [
      'lcov',
      'text'
    ],
    testPathIgnorePatterns: [
      '__mocks__',
      '__test-helpers__'
    ],
    coveragePathIgnorePatterns: [
      'eslint.config.js',
      'jest.config.js',
      '/node_modules/',
      '/coverage/',
      '/server/public/',
      '__mocks__',
      '__test-helpers__',
      '\\.snap$'
    ],
    testEnvironment: 'jsdom',
    globals: {
      setImmediate
    },
    setupFiles: ['<rootDir>/.jest/jest.env.js'],
    setupFilesAfterEnv: ['<rootDir>/.jest/setup.js']
  }
  return config
}
